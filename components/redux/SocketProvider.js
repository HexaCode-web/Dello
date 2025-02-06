import React, { createContext, useEffect, useState } from "react";
import io from "socket.io-client";
import Toast from "react-native-toast-message";

const SOCKET_URL = process.env.EXPO_PUBLIC_SERVER_URL; // Ensure this matches your server URL
export const SocketContext = createContext(null);

export const SocketProvider = ({ children, userId }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize the socket connection
    const newSocket = io(SOCKET_URL, {
      transports: ["websocket"], // Use WebSocket transport
    });
    // Handle connection event
    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", userId);

      // Register the user with the server
      newSocket.emit("registerUser", userId);
    });
    newSocket.on("newNotification", (data) => {
      console.log("Received new notification:", data);

      Toast.show({
        type: "info",
        text1: "Meeting Request",
        props: {
          senderID: data.senderID,
        },
        text2: data.message, // Show the notification message
        position: "top", // Show at the top
        visibilityTime: 10000,
        autoHide: true,
      });
    });

    // Handle connection errors
    newSocket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
    });

    // Handle disconnection event
    newSocket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });

    // Set the socket in state
    setSocket(newSocket);

    // Cleanup function to disconnect the socket when the component unmounts
    return () => {
      newSocket.disconnect();
    };
  }, [userId]); // Reconnect if userId changes

  // Provide the socket to the rest of the app via context
  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
