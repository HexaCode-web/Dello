import React, { createContext, useEffect, useState } from "react";
import io from "socket.io-client";
import { updateUserData } from "./slices/authSlice";
import { useDispatch } from "react-redux";
import * as Notifications from "expo-notifications";
import { Alert } from "react-native";
console.log(process.env.EXPO_PUBLIC_SERVER_URL);

const SOCKET_URL = process.env.EXPO_PUBLIC_SERVER_URL;
export const SocketContext = createContext(null);

export const SocketProvider = ({ children, userId }) => {
  const [socket, setSocket] = useState(null);

  const dispatch = useDispatch();

  // Configure the notification handler
  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }, []);

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ["websocket"],
    });

    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", userId);
      newSocket.emit("registerUser", userId);
    });

    newSocket.on("newNotification", async (data) => {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: data.type,
          body: data.message,
          data: { senderID: data.senderID }, // Optional: Pass additional data
        },
        trigger: null, // Trigger immediately
      });
    });

    newSocket.on("NetworkJoin", (data) => {
      dispatch(updateUserData(data.user));
    });

    newSocket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [userId]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
