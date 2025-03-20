import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
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
  ActivityIndicator,
  Alert,
  Modal,
  Image,
} from "react-native";
import TopBar from "../../GeneralComponents/TopBar";
import { useDispatch, useSelector } from "react-redux";
import { SocketContext } from "../../redux/SocketProvider";
import { useFocusEffect } from "@react-navigation/native";
import { COLORS, FONTS } from "../../../theme";
import { updateUserData } from "../../redux/slices/authSlice";
import { Feather } from "@expo/vector-icons";
import axios from "axios";

// =============== UTILITY FUNCTIONS ===============
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const toRad = (value) => (value * Math.PI) / 180;

  const R = 6371e3; // Earth's radius in meters
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lng2 - lng1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

// =============== MAIN COMPONENT ===============
const ChatBot = () => {
  // =============== STATE AND REFS ===============
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [counter, setCounter] = useState(0);
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [showNetworkDropdown, setShowNetworkDropdown] = useState(false);
  const [networkDetails, setNetworkDetails] = useState([]);
  const [availableUsers, setAvailableUsers] = useState(0);
  const flatListRef = useRef(null);
  const hasRun = useRef(false); // Ref to track if the effect has run

  // =============== SELECTORS AND CONTEXT ===============
  const User = useSelector((state) => state.auth.user);
  const socket = useContext(SocketContext);
  const dispatch = useDispatch();
  const { location } = useSelector((state) => state.location);

  // =============== CONSTANTS ===============
  const tabsAr = [
    { Name: "Security", Page: "Security" },
    { Name: "Profile", Page: "Profile" },
    { Name: "Settings", Page: "Profiles" },
    { Name: "Organisation", Page: "Organizations" },
  ];

  // =============== API FUNCTIONS ===============
  const fetchOrganizationDetails = async (orgId, token) => {
    return await axios.get(`${process.env.EXPO_PUBLIC_ORG_API}/${orgId}`, {
      headers: {
        "Accept-Language": "en",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  };

  const fetchNetwork = async (networkId) => {
    return await axios.get(
      `${process.env.EXPO_PUBLIC_NETWORK_API}/getNetwork/${networkId}/${User.user._id}`,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  };

  const fetchAllNetworkDetails = async (networks, coords) => {
    const networkPromises = networks.map(async (network) => {
      try {
        const networkResponse = await fetchNetwork(network.networkId);
        const orgDetails = await fetchOrganizationDetails(
          networkResponse.data.orgId,
          User.Token
        );

        const distance = calculateDistance(
          coords.latitude,
          coords.longitude,
          networkResponse.data.coordinates.coordinates[1],
          networkResponse.data.coordinates.coordinates[0]
        );

        const endDate = new Date(networkResponse.data.endDate);
        const currentDate = new Date();
        const isPastDate =
          endDate.getFullYear() < currentDate.getFullYear() ||
          (endDate.getFullYear() === currentDate.getFullYear() &&
            endDate.getMonth() < currentDate.getMonth()) ||
          (endDate.getFullYear() === currentDate.getFullYear() &&
            endDate.getMonth() === currentDate.getMonth() &&
            endDate.getDate() < currentDate.getDate());

        return {
          _id: network._id,
          OrgDetails: orgDetails.data,
          networkId: network.networkId,
          name: networkResponse.data.name,
          isInProximity: distance < networkResponse.data.radius,
          distance: distance.toFixed(0),
          Active: !isPastDate,
          ...networkResponse.data,
        };
      } catch (networkError) {
        if (networkError.status != 404) {
          console.log(
            `Error fetching network ${network.networkId}:`,
            networkError
          );
        }
        return null;
      }
    });

    const details = await Promise.all(networkPromises);
    return details.filter((network) => network !== null);
  };

  // =============== HELPER FUNCTIONS ===============
  const updateAvailableUsers = (proximityNetworks) => {
    // Use a Set to store unique user IDs
    const uniqueUserIds = new Set();

    // Iterate through each network and add unique user IDs to the Set
    proximityNetworks.forEach((network) => {
      if (network.Accepted && network.Accepted.length > 0) {
        network.Accepted.forEach((user) => {
          // Assuming each user object has a unique `_id` property
          if (user.userId && user.Active && user.ManualInActive === false) {
            uniqueUserIds.add(user.userId);
          }
        });
      }
    });

    // Calculate the total number of unique users
    const totalAvailableUsers = uniqueUserIds.size;

    // Update the available users, ensuring it doesn't go below 0
    setAvailableUsers(Math.max(0, totalAvailableUsers - 1));
  };

  const handleError = (error) => {
    console.error("Error fetching network details:", error);
    setError(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch network details"
    );
  };

  // =============== DATA FETCHING ===============
  const fetchNetworkDetails = async () => {
    try {
      if (
        !User?.user?.joinedNetworks ||
        User.user.joinedNetworks.length === 0
      ) {
        setNetworkDetails([]);
        Alert.alert("Error", "No networks found");
        return;
      }

      if (!location?.coords) {
        Alert.alert("Error", "Location not available");
        return;
      }

      const networkDetails = await fetchAllNetworkDetails(
        User.user.joinedNetworks,
        location.coords
      );

      const activeNetworks = networkDetails.filter((network) => network.Active);
      const proximityNetworks = activeNetworks.filter(
        (network) => network.isInProximity
      );

      updateAvailableUsers(proximityNetworks);

      // Stable sort by distance, then by a secondary key (e.g., network name or ID)
      const sortedNetworks = proximityNetworks.sort((a, b) => {
        if (a.distance === b.distance) {
          return a.name.localeCompare(b.name);
        }
        return a.distance - b.distance; // Sort by distance
      });

      if (networkDetails.length > 0 && hasRun.current) {
        setSelectedNetwork(
          sortedNetworks.find((network) => network._id === selectedNetwork._id)
        );
      }

      setNetworkDetails(sortedNetworks.filter((network) => !network.Deleted));
    } catch (error) {
      if (error.status == 401) {
        dispatch(logout());
      }
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  // =============== MESSAGE HANDLING ===============
  const handleSend = () => {
    if (newMessage.trim()) {
      const messageData = {
        text: newMessage,
        role: "user",
        sender: User.user._id,
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, messageData]);
      setNewMessage("");

      if (socket) {
        socket.emit("SendMessageToBot", messageData);
        setLoading(true);
        let interval = setInterval(() => {
          setCounter((prev) => {
            if (prev >= 120) {
              // 120 seconds = 2 minutes
              clearInterval(interval);
              setLoading(false);
              Alert.alert(
                "Error",
                "The servers are busy, please try again later"
              );
              return 0; // Stop at 120
            }
            return prev + 1;
          });
        }, 1000); // Increment every second

        return () => clearInterval(interval);
      }
    }
  };
  const matchMakingPhase = async (item) => {
    const activeUsers = item.Accepted.filter(
      (user) =>
        user.Active === true &&
        user.ManualInActive === false &&
        user.userId !== User.user._id
    );

    const UserIDs = activeUsers.map((user) => user.userId);

    try {
      const userPromises = UserIDs.map((userId) =>
        axios.get(`${process.env.EXPO_PUBLIC_PROFILE_API}/${userId}`)
      );

      const responses = await Promise.all(userPromises);

      // Create array of profiles instead of an object
      const profiles = responses.map((response, index) => {
        // Clone the response data to avoid modifying the original
        const profileData = { ...response.data };
        // Remove rAInChat property if it exists
        if (profileData.rAInChat) {
          delete profileData.rAInChat;
        }
        // Add userId for reference if needed
        profileData.userId = UserIDs[index];
        return profileData;
      });

      console.log(profiles);

      if (socket) {
        socket.emit("GenerateMatches", {
          Profiles: profiles,
          User: { ...User.user, rAInChat: [] },
        });
        setLoading(true);
        let interval = setInterval(() => {
          setCounter((prev) => {
            if (prev >= 120) {
              clearInterval(interval);
              setLoading(false);
              Alert.alert(
                "Error",
                "The servers are busy, please try again later"
              );
              return 0;
            }
            return prev + 1;
          });
        }, 1000);

        return () => clearInterval(interval);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        dispatch(logout());
      }
      console.error("Error fetching user profiles:", error);
      return []; // Return empty array in case of error
    }
  };

  const handleQuickReply = (reply) => {
    const messageData = {
      text: reply,
      role: "user",
      sender: User.user._id,
      timestamp: new Date(),
    };
    setMessages((prevMessages) => [...prevMessages, messageData]);
    if (socket) {
      socket.emit("SendMessageToBot", messageData);
      setLoading(true);
      let interval = setInterval(() => {
        setCounter((prev) => {
          if (prev >= 120) {
            clearInterval(interval);
            setLoading(false);
            Alert.alert("Error", "Loading is taking too long!");
            return 0;
          }
          return prev + 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  };

  // =============== UI HELPERS ===============
  const scrollToEnd = () => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  // =============== RENDER FUNCTIONS ===============
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

  const renderNetworkItem = ({ item }) => {
    const userIsInvisible = item.Accepted.find(
      (user) => user.userId === User.user._id
    )?.ManualInActive;

    const activeUsers =
      item.Accepted.filter(
        (user) => user.Active === true && user.ManualInActive === false
      ).length - (userIsInvisible ? 0 : 1);

    if (item.Deleted) return null;

    return (
      <TouchableOpacity
        style={styles.networkItem}
        onPress={() => {
          matchMakingPhase(item, activeUsers);
          setSelectedNetwork(item);
          setShowNetworkDropdown(false);
        }}
      >
        <Text style={styles.networkName}>
          <Text style={{ color: "darkgray" }}>{item?.OrgDetails.name}</Text>{" "}
          <Image
            source={require("../../../assets/sperator.png")}
            style={styles.sperator}
          />{" "}
          {item.name}{" "}
          <Image
            source={require("../../../assets/sperator.png")}
            style={styles.sperator}
          />{" "}
          {Math.max(0, activeUsers)}
        </Text>
      </TouchableOpacity>
    );
  };

  // =============== EFFECTS ===============
  useFocusEffect(
    useCallback(() => {
      fetchNetworkDetails();
    }, [location])
  );

  // Scroll to bottom when messages change
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      // Adding a small delay can help ensure the FlatList has rendered
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: true });
      }, 200);
    }
  }, [messages]);

  // Scroll to bottom when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (flatListRef.current && messages.length > 0) {
        setTimeout(() => {
          flatListRef.current.scrollToEnd({ animated: true });
        }, 200);
      }
    }, [messages])
  );

  // Update messages when User data changes
  useFocusEffect(
    useCallback(() => {
      if (User?.user?.rAInChat) {
        setMessages(User.user.rAInChat);
      }
    }, [User])
  );

  // =============== SOCKET LISTENERS ===============
  socket.on("receiveBotMessage", (data) => {
    setLoading(false);
    dispatch(updateUserData(data));
  });

  // =============== RENDER ===============
  return (
    <SafeAreaView style={styles.container}>
      <TopBar hasReturnButton={false} Tabs={tabsAr} />

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => `msg-${index}-${item.timestamp}`}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesListContent}
        onContentSizeChange={scrollToEnd}
        onLayout={scrollToEnd}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
        }}
      />

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.secondary} />
      ) : (
        <TouchableOpacity
          style={styles.hallowButton}
          onPress={() => setShowNetworkDropdown(true)}
        >
          <Text style={styles.hallowButtonText}>Smart Suggestions</Text>
        </TouchableOpacity>
      )}

      {/* Quick Reply Buttons or Input Container */}
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
          <TextInput
            style={styles.input}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            placeholderTextColor="#666"
          />
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.secondary} />
          ) : (
            <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
              <Text style={styles.sendButtonIcon}>➤</Text>
            </TouchableOpacity>
          )}
        </KeyboardAvoidingView>
      )}

      {/* Network Selection Modal */}
      <Modal
        visible={showNetworkDropdown}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNetworkDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowNetworkDropdown(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Network</Text>
              <TouchableOpacity onPress={() => setShowNetworkDropdown(false)}>
                <Feather name="x" size={24} color="black" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={networkDetails}
              renderItem={renderNetworkItem}
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.networkList}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
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
  messagesListContent: {
    paddingVertical: 10,
  },
  messageContainer: {
    flexDirection: "column",
    marginBottom: 12,
  },
  userMessageContainer: {
    justifyContent: "flex-end",
    alignItems: "flex-end",
  },
  botMessageContainer: {
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
    left: "50%",
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
    fontSize: 16,
    justifyContent: "flex-end",
  },
  botMessageText: {
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
  buttonWrapper: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
  },
  quickReplyButton: {
    backgroundColor: COLORS.secondary,
    padding: 10,
    borderRadius: 20,
    minWidth: 100,
    alignItems: "center",
  },
  quickReplyButtonText: {
    color: "white",
    fontSize: 16,
  },
  hallowButton: {
    backgroundColor: "transparent",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",

    height: 40,
    margin: 10,
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  hallowButtonText: {
    color: COLORS.secondary,
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#F5FCFF",

    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "50%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontFamily: FONTS.familyBold,
    fontSize: FONTS.medium,
  },
  networkList: {
    paddingHorizontal: 16,
  },
  networkItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  networkName: {
    fontFamily: FONTS.familyBold,
    fontSize: FONTS.small,
  },
  image: {
    width: 40,
    height: 40,
    objectFit: "contain",
  },
  sperator: {
    width: 6,
    height: 6,
    objectFit: "contain",
    paddingBottom: 8,
  },
});

export default ChatBot;
