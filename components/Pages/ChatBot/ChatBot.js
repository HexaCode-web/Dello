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
  ScrollView,
} from "react-native";
import TopBar from "../../GeneralComponents/TopBar";
import { useDispatch, useSelector } from "react-redux";
import { SocketContext } from "../../redux/SocketProvider";
import { useFocusEffect } from "@react-navigation/native";
import { COLORS, FONTS } from "../../../theme";
import { updateUserData } from "../../redux/slices/authSlice";
import { Feather } from "@expo/vector-icons";
import axios from "axios";
import Matches from "./Matches";

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
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [showNetworkDropdown, setShowNetworkDropdown] = useState(false);
  const [networkDetails, setNetworkDetails] = useState([]);
  const [matchmakingStatus, setMatchmakingStatus] = useState("");
  const [matches, setMatches] = useState([
    {
      profile: {
        id: "677d6d6573cdbb404f1e3397",
        name: "Marco Khairy",
        role: "Web Developer",
        company: "TechHub",
      },
      score: "60.22%",
      networkID: "67acd2ea693ad20359d276f6",
      reasoning:
        "Okay, let's analyze these two professionals and determine why they might be a good match for networking and collaboration. **Analysis of the Professionals** * **John Doe (Software Engineer):** A focused, technically-oriented professional. He’s actively seeking guidance and mentorship to accelerate his career growth. He’s likely comfortable with technical discussions and seeking advice. * **Marco Khairy (Web Developer):** A more focused on the front-end and visual aspects of web development. He’s showcasing a strong skillset with React.js, suggesting a potential interest in the underlying technologies and architecture. **Similarity Score: 0.60** – This suggests a moderate level of overlap in their areas of expertise, but not a deep connection. They’re both in the tech space, but John is more focused on the technical side, while Marco is more focused on the user experience. **Why They Might Be a Good Match – Reasons for Connection & Collaboration** Here are 2-3 specific reasons why they should connect, based on complementary skills and potential opportunities: 1. **Shared Interest in Modern Web Development Trends:** Marco’s expertise in React.js aligns with John’s likely focus on modern web development practices. John might be looking for Marco to share insights into the latest trends in JavaScript frameworks or UI/UX design. Marco could offer a perspective on how to leverage React.js effectively for scalability and performance. 2. **Mentorship Potential – Focused on Technical Depth:** John is explicitly seeking a mentor for career growth. Marco, with his strong React.js skills, could be a natural mentor for John. He could offer guidance on best practices, architectural decisions, and potential pitfalls in React.js development. This could be a very valuable, mutually beneficial relationship. 3. **Potential for Cross-Pollination of Ideas:** John's experience with software engineering principles could be valuable to Marco, who is deeply involved in the user experience. Marco could offer insights into user-centered design and how to translate those insights into effective web layouts and interactions. This cross-pollination could lead to more innovative solutions. **To further refine this analysis, we'd need more context, such as:** * **Their specific roles within companies:** Knowing the industry and company size would help understand the potential for collaboration. * **The specific areas of focus for John's mentorship:** What kind of guidance is he looking for? Let me know if you'd like me to explore any of these reasons in more detail or consider other potential connections!",
    },
  ]);
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
    if (activeUsers.length == 0) return;
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

      if (socket) {
        socket.emit("GenerateMatches", {
          Profiles: profiles,
          User: { ...User.user, rAInChat: [] },
          selectedNetwork: selectedNetwork,
        });

        setLoading(true);
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

  useEffect(() => {
    socket.on("receiveBotMessage", (data) => {
      setLoading(false);
      dispatch(updateUserData(data));
    });
    socket.on("awaiting_AI_response", () => {
      setLoading(true);
    });
    socket.on("matchmaking_started", () => {
      console.log("🟡 Matchmaking started...");
      setLoading(true);
    });
    socket.on("matchmaking_progress", (Data) => {
      console.log(Data);

      setMatchmakingStatus(Data.status);
      setLoading(true);
    });
    socket.on("matchmaking_complete", (data) => {
      console.log("✅ Matchmaking complete:", data);
      setMatches(data.matches);
      setLoading(false);
    });

    socket.on("matchmaking_error", (error) => {
      console.log("❌ Matchmaking error:", error);
      setLoading(false);
    });

    socket.on("matchMakingTimeout", () => {
      console.log("⏳ Matchmaking timeout...");
      setLoading(false);
    });

    return () => {
      socket.off("receiveBotMessage");
      socket.off("awaiting_AI_response");
      socket.off("matchmaking_started");
      socket.off("matchmaking_complete");
      socket.off("matchmaking_error");
      socket.off("matchMakingTimeout");
    };
  }, []);
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
      {matches.length > 0 && (
        <ScrollView style={styles.matchesContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.matchesTitle}>Your Matches</Text>

            <TouchableOpacity onPress={() => setMatches([])}>
              <Feather name="x" size={24} color="black" />
            </TouchableOpacity>
          </View>
          {matches.map((match, index) => (
            <Matches key={index} match={match} />
          ))}
        </ScrollView>
      )}
      <TouchableOpacity
        style={styles.hallowButton}
        onPress={() => setShowNetworkDropdown(true)}
        disabled={loading}
      >
        <Text style={styles.hallowButtonText}>
          {loading ? matchmakingStatus : "Smart Suggestions"}
        </Text>
      </TouchableOpacity>

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
            editable={!loading}
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
  matchesTitle: {
    fontSize: FONTS.large,
    fontWeight: "bold",
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
/*[
  {
    profile: {
      id: null,
      name: 'Sarah Hassan',
      role: 'Cardiologist',
      company: 'MediClinic'
    },
    score: '8.93%',
    reasoning: "Okay, let's analyze these two professionals and determine why they might be a good match for networking and collaboration. **Analysis of the Professionals** * **John Doe (Software Engineer):** Focuses on technical skills, problem-solving, and career advancement through a technical skillset. He’s actively seeking guidance and mentorship. * **Sarah Hassan (Cardiologist):** Specializes in cardiovascular surgery and patient care. Her expertise likely involves complex medical procedures, data analysis, and a deep 
understanding of the human body – all areas where technical skills can be valuable. **Similarity Score: 0.09** – This suggests a moderate level of overlap in their areas of interest, but not a strong connection. 
**Why They Might Be a Good Match – Reasons for Connection** Here are 2-3 specific reasons why these professionals should connect, based on their profiles: 1. **Complementary Skill Set – Data Analysis & Technical 
Problem Solving:** Sarah's role as a cardiologist likely involves analyzing large datasets (patient records, imaging, etc.) to diagnose and manage cardiovascular conditions. John's expertise in software engineering provides the tools to analyze this data, build models, and potentially contribute to improved patient care. **Collaboration Opportunity:** Sarah could potentially share insights from her data analysis work with John, and John could offer his software engineering skills to help Sarah streamline her data processing 
or build a more robust analytical tool. 2. **Shared Interest in Innovation & Technology:** Both professions are heavily reliant on technology. Sarah’s work involves complex medical technology, while John’s work involves developing and implementing software solutions. **Collaboration Opportunity:** Sarah could potentially share insights into current trends in cardiovascular technology with John, and John could offer his expertise in software development to help Sarah explore new technologies or improve existing systems. 3. **Mentorship Potential – Career Growth Focus:** John is explicitly seeking a mentor. Sarah, with her experience and knowledge of the medical field, could be an excellent mentor for John, offering insights into navigating the complexities of the industry and potentially providing guidance on career paths. **Collaboration Opportunity:** Sarah could offer a structured mentorship program, leveraging her experience to guide John’s professional development. **To further refine this analysis, more information about their specific projects, interests, and professional goals would be helpful.** --- To help me refine this analysis further, 
could you tell me: * **What is the context of this connection?** (e.g., LinkedIn, a mutual acquaintance, a specific event?) * **Are there any specific areas of interest they share?** (e.g., AI in healthcare, cybersecurity, specific programming languages?)"
  },
  {
    profile: {
      id: null,
      name: 'Marco Khairy',
      role: 'Web Developer',
      company: 'TechHub'
    },
    score: '64.18%',
    reasoning: "Okay, let's analyze these two professionals and determine why they might be a good match for networking and collaboration. **Analysis:** * **John Doe (Software Engineer):** He’s focused on career 
growth and actively seeking mentorship. He’s likely looking for guidance on specific technologies and strategies to advance his skills. * **Marco Khairy (Web Developer):** He possesses a strong skillset in React.js, which aligns well with John’s potential career goals. He also has a focus on development, suggesting a collaborative environment. **Similarity Score: 0.64** – This suggests a decent level of potential connection, but it’s not a high score. It indicates they share some common ground, but there’s still room for deeper engagement. **Why They Might Be a Good Match – 2-3 Reasons:** 1. **Shared Interest in Technology & Growth:** Both professionals are deeply invested in technology and career advancement. John’s seeking mentorship, and Marco’s expertise in React.js suggests a shared interest in staying current with industry trends 
and developing new skills. They could benefit from discussing best practices, emerging technologies, and strategies for scaling their careers. 2. **Complementary Skill Sets – React.js:** Marco’s expertise in React.js is a significant overlap with John’s role. Connecting them would allow Marco to offer practical advice and insights into a popular framework, while John can benefit from Marco’s understanding of front-end development and potential solutions to his challenges. 3. **Potential for Collaborative Projects/Knowledge Sharing:** Marco could potentially offer John some insights into his React.js projects, or John could share his experience with specific challenges he’s facing. This could lead to a mutually beneficial knowledge exchange, strengthening their professional relationships. **To further strengthen the connection, consider:** * **LinkedIn Connection:** A direct connection on LinkedIn would be a good starting point. * **Mutual Connections:** Exploring mutual connections could facilitate a more personal introduction. * **Informal Chat:** A brief introductory message on LinkedIn or a casual conversation could establish a foundation for further collaboration. --- To give you even more tailored recommendations, could you tell me: * **What kind 
of collaboration are you envisioning?** (e.g., code reviews, project brainstorming, knowledge sharing, etc.)"
  },
  {
    profile: {
      id: null,
      name: 'Ahmed Youssef',
      role: 'Automotive Engineer',
      company: 'AutoTech'
    },
    score: '23.55%',
    reasoning: "Okay, let's analyze these two professionals and discuss why they might be a good match for networking and collaboration. **Analysis of the Professionals** * **John Doe (Software Engineer):** A software engineer focused on JavaScript – a highly sought-after skill set in today’s tech landscape. He’s proactively seeking mentorship to accelerate his career growth. * **Ahmed Youssef (Automotive Engineer):** An Automotive Engineer with a strong focus on Vehicle Dynamics. This suggests a potential for collaboration 
on projects that require a deep understanding of complex systems, potentially involving simulation or modeling. **Similarity Score: 0.24** – This suggests a moderate level of overlap in their areas of expertise, 
but not a deep connection. It’s a good starting point for exploring potential collaboration. **Why They Might Be a Good Match – 2-3 Reasons** Here are 3 specific reasons why these professionals should connect, based on their profiles: 1. **Shared Interest in Technical Depth & Problem Solving:** Both are deeply involved in technical fields. John’s JavaScript expertise is crucial for building software, while Ahmed’s Vehicle Dynamics knowledge is essential for designing and analyzing vehicle performance. Their work often involves tackling complex problems – and a collaborative approach could help them both refine solutions and share insights. They could discuss best practices for software development, or even collaborate on a small, technical challenge. 2. **Complementary Skill Sets – Simulation & Modeling:** Ahmed’s expertise in Vehicle Dynamics *strongly* aligns with the potential for collaboration with John. Software engineers often need to model and simulate systems (like vehicle performance), and understanding the underlying mechanics is a huge benefit. Connecting them could lead to joint projects, knowledge sharing, or even a mentorship program focused on simulation techniques. 3. **Potential for Cross-Industry Collaboration (Future):** While currently focused on their respective fields, the increasing integration of software into automotive systems (e.g., autonomous driving, advanced driver-assistance systems) creates opportunities for collaboration. John’s software skills could be valuable in helping Ahmed optimize vehicle dynamics simulations, and vice versa. **To further refine this analysis, more information would be helpful, such as:** * **Specific projects they're working on:** What kind of software are they building? What kind of vehicle dynamics are they modeling? * **Their professional organizations/networks:** Are they members of any relevant groups? * **Their communication styles:** Do they seem open to collaboration, or more focused on individual work? Let me know if you'd like me to explore any of these reasons in more detail or consider other potential connections!"  }
]*/
