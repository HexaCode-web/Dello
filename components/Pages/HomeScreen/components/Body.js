import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useContext,
} from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { COLORS, FONTS } from "../../../../theme";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { logout } from "../../../redux/slices/authSlice";
import { SocketContext } from "../../../redux/SocketProvider";

const Body = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState("Meet");
  const [showNetworkDropdown, setShowNetworkDropdown] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [networkDetails, setNetworkDetails] = useState([]);
  const [meetRequests, setMeetRequests] = useState([]);
  const [usersMet, setUsersMet] = useState([]);
  const [availableUsers, setAvailableUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const User = useSelector((state) => state.auth.user);
  const [error, setError] = useState(null);
  const [members, setMembers] = useState([]);
  const { location } = useSelector((state) => state.location);
  const hasRun = useRef(false); // Ref to track if the effect has run
  const socket = useContext(SocketContext);

  const dispatch = useDispatch();
  const fetchMembers = async () => {
    setLoading(true);
    setMeetRequests([]);
    setUsersMet([]);
    const memberPromises = selectedNetwork.Accepted.map(async (member) => {
      const userResponse = await axios.get(
        `${process.env.EXPO_PUBLIC_PROFILE_API}/${member.userId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return {
        ...userResponse.data,
        userId: member.userId,
        Active: member.Active,
        ManualInActive: member.ManualInActive,
      };
    });
    setMembers([]);
    const members = await Promise.all(memberPromises);

    // Save members to state
    setMembers((prevMembers) => [...prevMembers, ...members]);
    setLoading(false);
  };
  const fetchNetworkDetails = async () => {
    // setLoading(true);
    setError(null);
    // setSelectedNetwork(null);
    try {
      if (
        !User?.user?.joinedNetworks ||
        User.user.joinedNetworks.length === 0
      ) {
        setNetworkDetails([]);
        setError("No networks found");
        return;
      }

      if (!location?.coords) {
        setError("Location not available");
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

      updateAvailableUsers(proximityNetworks, networkDetails.length);
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
  useEffect(() => {
    if (networkDetails.length > 0 && !hasRun.current) {
      hasRun.current = true; // Mark the effect as run
      setSelectedNetwork(networkDetails[0]);
    }
  }, [networkDetails]);
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

  const fetchNetwork = async (networkId) => {
    return await axios.get(
      `${process.env.EXPO_PUBLIC_NETWORK_API}/getNetwork/${networkId}/${User.user._id}`,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  };

  const fetchOrganizationDetails = async (orgId, token) => {
    return await axios.get(`${process.env.EXPO_PUBLIC_ORG_API}/${orgId}`, {
      headers: {
        "Accept-Language": "en",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  };

  const updateAvailableUsers = (proximityNetworks, totalNetworks) => {
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
  const fetchMeetRequestsForUser = async (userIDB, networkID, type = "all") => {
    try {
      // Validate inputs
      if (!userIDB || !networkID) {
        throw new Error("Please provide valid userIDB and networkID");
      }

      // Determine the API endpoint based on the type
      const endpoint =
        type === "accepted"
          ? "getAcceptedMeetRequestForUser"
          : "getMeetRequestForUser";

      const apiUrl = `${process.env.EXPO_PUBLIC_MEET_API}/${endpoint}/${userIDB}/${networkID}`;

      const response = await axios.get(apiUrl, {
        headers: {
          "Accept-Language": "en",
          "Content-Type": "application/json",
        },
      });
      // Return the data from the response

      return response.data;
    } catch (error) {
      if (error.status == 401) {
        dispatch(logout());
      }
      console.error("Error fetching meeting requests:", error);

      // Handle errors appropriately
      if (error.response) {
        throw new Error(error.response.data.message || "Server error");
      } else if (error.request) {
        console.error("No response received:", error.request);
        throw new Error("No response from server");
      } else {
        throw new Error(error.message || "Error making request");
      }
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNetworkDetails();
    setRefreshing(false);
  }, []);
  useEffect(() => {
    fetchMembers();
  }, [selectedNetwork]);
  const fetchData = async () => {
    try {
      // Fetch accepted meet requests
      const metUsers = await fetchMeetRequestsForUser(
        User.user._id,
        selectedNetwork._id,
        "accepted"
      );

      // Fetch all meet requests
      const requests = await fetchMeetRequestsForUser(
        User.user._id,
        selectedNetwork._id
      );

      // Initialize variables
      let usersMet = [];
      let meetRequests = [];

      // Extract user IDs from metUsers (accepted requests)
      if (metUsers.data) {
        const userIDAs = metUsers.data
          .map((item) => {
            if (item.userIDA === User.user._id) {
              return {
                userId: item.userIDB,
                meetingID: item._id,
                Conversation: item.Conversation,
                meetRequest: item,
              }; // Include meetingID
            } else if (item.userIDB === User.user._id) {
              return {
                userId: item.userIDA,
                meetingID: item._id,
                Conversation: item.Conversation,
                meetRequest: item,
              };
            } else {
              return null;
            }
          })
          .filter((item) => item !== null); // Remove null values

        // Filter members to find users met and add meetingID
        usersMet = members
          .filter((user) =>
            userIDAs.some((item) => item.userId === user.userId)
          )
          .map((user) => {
            const meetingInfo = userIDAs.find(
              (item) => item.userId === user.userId
            );

            return {
              ...user,
              meetingID: meetingInfo.meetingID,
              meetRequest: meetingInfo.meetRequest,
              conversation: meetingInfo.Conversation,
            }; // Add meetingID to the user object
          });
      }

      // Update usersMet state
      setUsersMet(usersMet);

      // Extract user IDs from requests (all requests)
      if (requests.data) {
        const meetRequestUsers = requests.data
          .map((item) => {
            if (item.userIDA === User.user._id) {
              return item.userIDB;
            } else if (item.userIDB === User.user._id) {
              return item.userIDA;
            } else {
              return null;
            }
          })
          .filter((id) => id !== null); // Remove null values

        // Filter members to find users with meet requests
        meetRequests = members.filter((user) =>
          meetRequestUsers.includes(user.userId)
        );
      }

      // Update meetRequests state
      setMeetRequests(meetRequests);
    } catch (err) {
      console.error("Error in fetchData:", err);
      setError(err.message);
    }
  };
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [User, members])
  );

  useFocusEffect(
    useCallback(() => {
      fetchNetworkDetails();
    }, [location])
  );

  const tabData = [
    {
      id: "2",
      title: "Meet",
      Count: Math.max(0, usersMet?.length),
    },
    { id: "3", title: "Intros", Count: Math.max(0, meetRequests?.length) },
    {
      id: "1",
      title: "All",
      Count: Math.max(
        0,
        selectedNetwork?.Accepted.filter(
          (user) => user.Active === true && user.ManualInActive === false
        ).length - 1
      ),
    },
  ];
  function calculateDistance(lat1, lng1, lat2, lng2) {
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
  }
  const renderMemberItem = async ({ item }) => {
    const photoUrl = `${process.env.EXPO_PUBLIC_SERVER_URL}/uploads/${item.userId}.jpeg`;
    const isValidImage = await checkImage(photoUrl);
    if (
      activeTab !== "Meet" &&
      (item.ManualInActive || !item.Active || item.userId === User.user._id)
    ) {
      return null;
    }
    return (
      <TouchableOpacity
        style={styles.meetingItem}
        onPress={() => {
          navigation.navigate("ViewProfile", {
            ProfileID: item.userId,
            networkId: selectedNetwork.networkId,
            meetRequest: item.meetRequest,
            meetRequestID: item.meetingID,
          });
        }}
      >
        {isValidImage ? (
          <Image
            source={{ uri: photoUrl, cache: "reload" }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{item.FirstName.charAt(0)}</Text>
          </View>
        )}
        <View style={styles.meetingInfo}>
          <Text style={styles.name}>
            {item.FirstName} {item.LastName}
          </Text>
          <Text style={styles.role}>
            {item.presentRole.Position}{" "}
            <Image
              source={require("../../../../assets/sperator.png")}
              style={styles.sperator}
            />{" "}
            {item.presentRole.Company}
          </Text>
        </View>
        {item.time && <Text style={styles.time}>{item.time}</Text>}
      </TouchableOpacity>
    );
  };
  useEffect(() => {
    if (socket) {
      socket.on("newNotification", async (data) => {
        if (data.type === "Message") {
          const newMessage = data.metadata;

          setUsersMet((prevUsersMet) =>
            prevUsersMet.map((user) => {
              if (user.meetingID === newMessage.requestId) {
                return {
                  ...user,
                  conversation: [
                    ...user.conversation,
                    {
                      message: newMessage.message,
                      senderID: newMessage.senderID,
                      timestamp: new Date(),
                      seen: newMessage.seen,
                    },
                  ],
                };
              }
              return user;
            })
          );
        }
      });
      // Cleanup the event listener when the component unmounts
      return () => {
        socket.off("newNotification");
      };
    }
  }, [socket]);
  const checkImage = async (photoUrl) => {
    try {
      await axios.head(photoUrl);
      return true;
    } catch (err) {
      return false;
    }
  };

  const renderMeetingItem = async ({ item }) => {
    const photoUrl = `${process.env.EXPO_PUBLIC_SERVER_URL}/uploads/${item.userId}.jpeg`;
    const isValidImage = await checkImage(photoUrl);

    let isUserActive = true;
    if (activeTab !== "Meet" && item.userId === User.user._id) {
      return null;
    }
    if (!item.Active && item.ManualInActive === false) {
      isUserActive = false;
    }

    const unreadCount = item.conversation.filter(
      (message) => message.seen === false && message.senderID != User.user._id
    ).length;

    return (
      <TouchableOpacity
        style={styles.meetingItem}
        onPress={() => {
          navigation.navigate("chatRoom", {
            ProfileID: item.userId,
            roomName: `${item.FirstName} ${item.LastName}`,
            networkId: selectedNetwork.networkId,
            meetRequest: item.meetRequest,
            meetRequestID: item.meetingID,
          });
        }}
      >
        <View>
          {isValidImage ? (
            <Image
              source={{ uri: photoUrl, cache: "reload" }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{item.FirstName.charAt(0)}</Text>
            </View>
          )}
          {isUserActive && <View style={styles.activeIcon}></View>}
        </View>
        <View style={styles.meetingInfo}>
          <Text style={styles.name}>
            {item.FirstName} {item.LastName}
          </Text>
          <Text style={styles.role}>
            {item.presentRole.Position}{" "}
            <Image
              source={require("../../../../assets/sperator.png")}
              style={styles.sperator}
            />{" "}
            {item.presentRole.Company}
          </Text>
          <Text style={styles.lastMessage}>
            {item.conversation[item.conversation.length - 1]?.senderID ===
            User.user._id
              ? "You: "
              : item.conversation[item.conversation.length - 1]?.senderID ===
                undefined
              ? ""
              : `${item.FirstName} ${item.LastName}: `}
            {item.conversation[item.conversation.length - 1]?.message}
          </Text>
          {unreadCount > 0 && (
            <View style={styles.unSeenCountContainer}>
              <Text style={styles.unSeenCount}>{unreadCount}</Text>
            </View>
          )}
        </View>
        {item.time && <Text style={styles.time}>{item.time}</Text>}
      </TouchableOpacity>
    );
  };

  const renderNetworkItem = ({ item }) => {
    const userIsInvisible = item.Accepted.find(
      (user) => user.userId === User.user._id
    )?.ManualInActive;

    const activeUsers =
      item.Accepted.filter(
        (user) => user.Active === true && user.ManualInActive === false
      ).length - (userIsInvisible ? 0 : 1);

    if (item.Deleted) return;
    return (
      <TouchableOpacity
        style={styles.networkItem}
        onPress={() => {
          setSelectedNetwork(item);
          setShowNetworkDropdown(false);
        }}
      >
        <Text style={styles.networkName}>
          <Text style={{ color: "darkgray" }}>{item?.OrgDetails.name}</Text>{" "}
          <Image
            source={require("../../../../assets/sperator.png")}
            style={styles.sperator}
          />{" "}
          {item.name}{" "}
          <Image
            source={require("../../../../assets/sperator.png")}
            style={styles.sperator}
          />{" "}
          {Math.max(0, activeUsers)}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4B164C" />
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <View style={styles.availableUsersCount}>
        <Text style={styles.availableUsersCountText}>{availableUsers}</Text>
      </View>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setShowNetworkDropdown(true)}
      >
        <Text style={styles.headerText}>
          {selectedNetwork ? (
            <>
              <Text style={{ color: "darkgray" }}>
                {selectedNetwork.OrgDetails.name}
              </Text>{" "}
              <Image
                source={require("../../../../assets/sperator.png")}
                style={styles.sperator}
              />{" "}
              {selectedNetwork.name}
            </>
          ) : (
            "Select Network"
          )}
        </Text>
        <Feather
          name={showNetworkDropdown ? "chevron-up" : "chevron-down"}
          size={24}
          color="black"
        />
      </TouchableOpacity>

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

      {selectedNetwork && (
        <View style={styles.tabContainer}>
          {tabData.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.tab, activeTab === item.title && styles.activeTab]}
              onPress={() => setActiveTab(item.title)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === item.title && styles.activeTabText,
                ]}
              >
                {item.title} - {item.Count}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {members.length > 1 ? (
        <>
          {activeTab === "Meet" && usersMet && (
            <FlatList
              data={usersMet}
              renderItem={renderMeetingItem}
              keyExtractor={(item) => item._id}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            />
          )}
          {activeTab === "All" && (
            <FlatList
              data={members}
              renderItem={renderMemberItem}
              keyExtractor={(item) => item._id}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            />
          )}
          {activeTab === "Intros" && (
            <FlatList
              data={meetRequests}
              renderItem={renderMemberItem}
              keyExtractor={(item) => item._id}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            />
          )}
        </>
      ) : (
        selectedNetwork && (
          <Text style={styles.Result}>No members in this network.</Text>
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "#F5FCFF",
  },
  Result: {
    textAlign: "center",
    fontSize: 20,
    marginTop: 20,
    color: "black",
  },
  availableUsersCount: {
    right: 15,
    top: -15,
    position: "absolute",
    backgroundColor: COLORS.secondary,
    width: 25,
    height: 25,
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignContent: "center",
  },
  availableUsersCountText: {
    fontSize: FONTS.medium,
    textAlign: "center",
    color: "white",
  },
  lastMessage: {
    marginTop: 10,
    fontSize: FONTS.small,
    color: "#666",
    maxHeight: 30,
    maxWidth: "90%",
  },
  activeIcon: {
    position: "absolute",
    right: 10,
    bottom: 0,
    width: 10,
    height: 10,
    backgroundColor: "green",
    borderRadius: 5,
  },
  unSeenCountContainer: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 15,
    height: 15,
    borderRadius: 10,
    backgroundColor: COLORS.secondary,
    display: "flex",
    justifyContent: "center",
    alignContent: "center",
    zIndex: 1,
  },
  unSeenCount: {
    color: "white",
    textAlign: "center",
    fontSize: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerText: {
    fontFamily: FONTS.familyBold,
    fontSize: FONTS.medium,
  },
  tabContainer: {
    flexDirection: "row", // Change to "column" for vertical buttons
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginVertical: 10,
  },
  tab: {
    width: 100,
    height: 40,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    backgroundColor: "#F4F0F4",
    borderRadius: 100,
  },
  activeTab: {
    backgroundColor: "#4B164C",
  },
  tabText: {
    fontFamily: FONTS.familyBold,
    fontSize: FONTS.small,
    color: "#666",
  },
  activeTabText: {
    color: "white",
    fontFamily: FONTS.familyBold,
  },
  meetingItem: {
    maxHeight: 100,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.secondary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  avatarText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  meetingInfo: {
    flex: 1,
  },
  name: {
    fontFamily: FONTS.familyBold,
    fontSize: FONTS.small,
  },
  role: {
    fontSize: FONTS.small,
    color: "#666",
  },
  time: {
    fontSize: FONTS.small,
    color: "#666",
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
export default Body;
