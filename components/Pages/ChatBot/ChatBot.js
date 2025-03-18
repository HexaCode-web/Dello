import React, { useCallback, useContext, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import TopBar from "../../GeneralComponents/TopBar";
import Feather from "@expo/vector-icons/Feather";
import { useSelector } from "react-redux";
import { SocketContext } from "../../redux/SocketProvider";
import { useFocusEffect } from "@react-navigation/native";
import { COLORS } from "../../../theme";

const ChatBot = () => {
  const User = useSelector((state) => state.auth.user);
  const socket = useContext(SocketContext);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const tabsAr = [
    { Name: "Security", Page: "Security" },
    { Name: "Profile", Page: "Profile" },
    { Name: "Settings", Page: "Profiles" },
    { Name: "Organisation", Page: "Organizations" },
  ];

  const handleSend = () => {
    if (newMessage.trim()) {
      const messageData = {
        text: newMessage,
        role: "user",
        sender: User.user._id,
        timestamp: new Date(),
      };
      setMessages([...messages, messageData]);
      if (socket) {
        socket.emit("SendMessage", messageData);
      }
      setNewMessage("");
    }
  };
  const handleQuickReply = (reply) => {
    const messageData = {
      text: reply,
      role: "user",
      sender: User.user._id,
      timestamp: new Date(),
    };
    setMessages([...messages, messageData]);
    if (socket) {
      socket.emit("SendMessage", messageData);
    }
  };
  useFocusEffect(
    useCallback(() => {
      setMessages(User.user.rAInChat);
    }, [User])
  );
  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.role === "user"
          ? styles.userMessageContainer
          : styles.botMessageContainer,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          item.role === "user" ? styles.userMessage : styles.botMessage,
        ]}
      >
        <Text
          style={
            item.role === "user"
              ? styles.userMessageText
              : styles.botMessageText
          }
        >
          {item.text}
        </Text>
      </View>
    </View>
  );

  useFocusEffect(
    useCallback(() => {
      setMessages(User.user.rAInChat);
    }, [User])
  );
  return (
    <SafeAreaView style={styles.container}>
      <TopBar hasReturnButton={false} Tabs={tabsAr} />
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        inverted={false}
      />

      {/* Message Input */}
      {messages.length > 0 &&
      messages[messages.length - 1].role === "AI" &&
      messages[messages.length - 1].text.includes("Welcome to") ? (
        <View style={styles.buttonWrapper}>
          <TouchableOpacity
            style={styles.quickReplyButton}
            onPress={() => handleQuickReply("Yes")}
          >
            <Text style={styles.quickReplyButtonText}>Yes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickReplyButton}
            onPress={() => handleQuickReply("No")}
          >
            <Text style={styles.quickReplyButtonText}>No</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.inputContainer}
        >
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type a message..."
              placeholderTextColor="#666"
            />
            <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
              <Text style={styles.sendButtonIcon}>➤</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F5FCFF",
    paddingHorizontal: 20,
    flex: 1,
    paddingTop: 0,
    paddingBottom: 20,
    color: "black",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  backButton: {
    padding: 8,
  },
  menuButton: {
    padding: 8,
  },
  headerIcon: {
    fontSize: 24,
    color: "#333",
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginHorizontal: 16,
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  userMessageContainer: {
    justifyContent: "flex-end",
  },
  botMessageContainer: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
  },
  userMessage: {
    backgroundColor: COLORS.secondary,
  },
  botMessage: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: COLORS.borders,
  },
  userMessageText: {
    color: "white",
  },
  botMessageText: {
    color: "#333",
    fontSize: 16,
  },
  inputContainer: {
    backgroundColor: "#F5FCFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    padding: 16,
  },
  inputWrapper: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    fontSize: 16,
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
  buttonWrapper: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
    backgroundColor: "#F5FCFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  quickReplyButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  quickReplyButtonText: {
    color: "white",
    fontSize: 16,
  },
});

export default ChatBot;
