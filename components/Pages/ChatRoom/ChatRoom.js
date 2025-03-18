import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
  useContext,
} from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import io from "socket.io-client";
import { COLORS, FONTS } from "../../../theme";
import { useSelector } from "react-redux";
import TopBar from "../../GeneralComponents/TopBar";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import axios from "axios";
import { SocketContext } from "../../redux/SocketProvider";

const ChatRoom = ({ route }) => {
  const socket = useContext(SocketContext);

  const [message, setMessage] = useState("");
  const navigation = useNavigation();
  const User = useSelector((state) => state.auth.user);
  const [messages, setMessages] = useState([]);
  const { ProfileID, networkId, meetRequest, roomName, meetRequestID } =
    route.params;

  // Create a ref for the FlatList
  const flatListRef = useRef(null);

  const fetchConversation = async () => {
    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_MEET_API}/getConversation/${meetRequestID}`,
        {
          headers: {
            Authorization: `Bearer ${User.Token}`,
          },
        }
      );
      const data = response.data;
      setMessages(data);

      // Scroll to the bottom after fetching the conversation
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error(
        "Error fetching conversation:",
        error.response?.data || error.message
      );
    }
  };
  useFocusEffect(
    useCallback(() => {
      // Emit "joinRoom" when the screen is focused
      socket.emit(
        "joinRoom",
        meetRequestID,
        User.user._id === meetRequest.userIDA ? "UserIDA" : "UserIDB"
      );

      fetchConversation();

      return () => {
        // Emit "leaveRoom" when the screen is unfocused
        socket.emit(
          "leaveRoom",
          meetRequestID,
          User.user._id === meetRequest.userIDA ? "UserIDA" : "UserIDB"
        );
      };
    }, [meetRequestID])
  );

  useEffect(() => {
    socket.on("receiveMessage", (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);

      // Scroll to the bottom when a new message is received
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    return () => {
      socket.off("receiveMessage");
      socket.disconnect(); // Clean up the socket connection
    };
  }, []);

  const sendMessage = async () => {
    if (!message.trim()) return;

    try {
      socket.emit("sendMessage", {
        meetRequestID,
        senderID: User.user._id,
        message,
      });

      setMessage("");
    } catch (error) {
      console.error(
        "Error sending message:",
        error.response?.data || error.message
      );
    }
  };
  const getMessageDate = (timestamp) => {
    const messageDate = new Date(timestamp);

    return messageDate.toLocaleDateString();
  };
  const renderMessage = (item) => {
    let showDate = true;
    const previousMessage = messages[messages.indexOf(item) - 1];

    if (
      getMessageDate(previousMessage?.timestamp) ===
      getMessageDate(item.timestamp)
    ) {
      showDate = false;
    }

    return (
      <View
        style={[
          styles.messageContainer,
          item.senderID == User.user._id
            ? styles.userMessageContainer
            : styles.otherMessageContainer,
        ]}
      >
        {showDate && (
          <View style={styles.timestampContainer}>
            <View style={styles.timestampText}>
              <Text>{getMessageDate(item.timestamp)}</Text>
            </View>
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            item.senderID == User.user._id
              ? styles.userMessage
              : styles.otherMessage,
          ]}
        >
          <Text
            style={
              item.senderID == User.user._id
                ? styles.userMessageText
                : styles.otherMessageText
            }
          >
            {item.message}
          </Text>
          <Text
            style={[
              styles.timestamp,
              item.senderID == User.user._id
                ? styles.userTimestamp
                : styles.otherTimestamp,
            ]}
          >
            {new Date(item.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      </View>
    );
  };
  return (
    <View style={styles.container}>
      <TopBar hasReturnButton={true} />
      <TouchableOpacity
        style={styles.header}
        onPress={() => {
          navigation.navigate("ViewProfile", {
            ProfileID,
            networkId,
            meetRequest,
            meetRequestID,
          });
        }}
      >
        <Text style={styles.headerTitle}>{roomName}</Text>
      </TouchableOpacity>
      <FlatList
        ref={flatListRef} // Attach the ref to the FlatList
        style={styles.messagesList}
        data={messages}
        renderItem={({ item }) => renderMessage(item)}
        keyExtractor={(item, index) => index.toString()}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message"
          placeholderTextColor="#999"
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonIcon}>➤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: "#F5FCFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.secondary,
    position: "relative",
    top: -30,
    width: "115%",
    right: "7.5%",
    paddingHorizontal: 8,
  },

  headerTitle: {
    flex: 1,
    fontSize: FONTS.large,
    fontWeight: "bold",
    margin: 16,
    color: "white",
  },
  messagesList: {
    flex: 1,
  },
  messageContainer: {
    flexDirection: "column",
    marginBottom: 12,
  },
  userMessageContainer: {
    justifyContent: "flex-end",
    alignItems: "flex-end",
  },
  otherMessageContainer: {
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
  },
  timestampContainer: {
    margin: "auto",
    width: "100%",
    borderBottomWidth: 1,
    borderColor: COLORS.borders,
    marginVertical: 8,
    marginBottom: 16,
  },
  timestampText: {
    color: COLORS.secondary,
    position: "absolute",
    backgroundColor: "#F5FCFF",
    top: -9,
    left: "50%", // Center the text horizontally
    transform: [{ translateX: "-50%" }], // Shift back by 50% of its own width
  },
  userMessage: {
    backgroundColor: COLORS.secondary,
  },
  otherMessage: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: COLORS.borders,
  },
  userMessageText: {
    color: "white",
    fontSize: 16,
    justifyContent: "flex-end",
  },
  otherMessageText: {
    color: "#333",
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.borders,
  },
  input: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    fontSize: 16,
    color: "#333",
  },
  sendButton: {
    backgroundColor: COLORS.secondary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonIcon: {
    fontSize: 20,
    color: "white",
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
  },
  userTimestamp: {
    color: "rgba(255, 255, 255, 0.7)", // Light white for user messages
    textAlign: "right",
  },
  otherTimestamp: {
    color: "rgba(0, 0, 0, 0.5)", // Light black for other messages
    textAlign: "left",
  },
});

export default ChatRoom;
