import React, { useState, useEffect, useCallback } from "react";
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
import { useSelector } from "react-redux";
import axios from "axios";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

const Body = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState("Meet");
  const [showNetworkDropdown, setShowNetworkDropdown] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [networkDetails, setNetworkDetails] = useState([]);
  const [intros, setIntros] = useState([]);
  const [meetRequests, setMeetRequests] = useState([]);
  const [meetRequestsUsers, setMeetRequestsUsers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const User = useSelector((state) => state.auth.user);
  const [error, setError] = useState(null);
  const [members, setMembers] = useState([]);
  const { location } = useSelector((state) => state.location);
  console.log(meetRequestsUsers);

  const fetchMembers = async () => {
    setMeetRequests([]);
    setMeetRequestsUsers([]);
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
  };
  const fetchNetworkDetails = async () => {
    setLoading(true);
    setError(null);
    setSelectedNetwork(null);
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
          // Use a secondary key to ensure stable sorting
          return a.name.localeCompare(b.name); // Sort by name if distance is the same
        }
        return a.distance - b.distance; // Sort by distance
      });

      setNetworkDetails(sortedNetworks);

      if (sortedNetworks.length > 0) {
        const networkToSelect = sortedNetworks[0];
        setSelectedNetwork(networkToSelect);
      } else {
        setSelectedNetwork(null);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
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
        console.log(
          `Error fetching network ${network.networkId}:`,
          networkError
        );
        return null;
      }
    });

    const details = await Promise.all(networkPromises);
    return details.filter((network) => network !== null);
  };

  const fetchNetwork = async (networkId) => {
    return await axios.get(
      `${process.env.EXPO_PUBLIC_NETWORK_API}/getNetwork/${networkId}`,
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
          if (user.userId) {
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
  const fetchMeetRequestsForUser = async (userIDB, networkID) => {
    try {
      // Validate inputs
      if (!userIDB || !networkID) {
        throw new Error("Please provide valid userIDB and networkID");
      }

      const apiUrl = `${process.env.EXPO_PUBLIC_MEET_API}/getMeetRequestForUser/${userIDB}/${networkID}`;

      const response = await axios.get(apiUrl, {
        headers: {
          "Accept-Language": "en",
          "Content-Type": "application/json",
        },
      });

      // Return the data from the response
      return response.data;
    } catch (error) {
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
  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          const result = await fetchMeetRequestsForUser(
            User.user._id,
            selectedNetwork._id
          );

          const userIDAs = result.data.map((item) => item.userIDA);

          setMeetRequestsUsers(
            members.filter((user) => userIDAs.includes(user.userId))
          );
          setMeetRequests(result.data);
        } catch (err) {
          setError(err.message);
        }
      };

      fetchData();
    }, [User, selectedNetwork, members])
  );
  useFocusEffect(
    useCallback(() => {
      fetchNetworkDetails();
    }, [location])
  );

  const tabData = [
    { id: "2", title: "Meet", Count: meetRequests?.length },
    { id: "3", title: "Intros", Count: 0 },
    {
      id: "1",
      title: "All",
      Count: selectedNetwork?.Accepted.filter(
        (user) => user.Active === true && user.ManualInActive === false
      ).length,
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
  const renderMeetingItem = ({ item }) => {
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
            meetRequest: true,
          });
        }}
      >
        <Image
          source={{ uri: "https://via.placeholder.com/50" }}
          style={styles.avatar}
        />
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

  const renderNetworkItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.networkItem}
        onPress={() => {
          setSelectedNetwork(item);
          setShowNetworkDropdown(false);
        }}
      >
        <Text style={styles.networkName}>
          <Text style={{ color: "darkgray" }}>
            {selectedNetwork.OrgDetails.name}
          </Text>{" "}
          <Image
            source={require("../../../../assets/sperator.png")}
            style={styles.sperator}
          />{" "}
          {item.name}{" "}
          <Image
            source={require("../../../../assets/sperator.png")}
            style={styles.sperator}
          />{" "}
          {item.Accepted.length - 1}
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
          {activeTab === "Meet" && meetRequestsUsers && (
            <FlatList
              data={meetRequestsUsers}
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
              renderItem={renderMeetingItem}
              keyExtractor={(item) => item._id}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            />
          )}
          {activeTab === "Intros" && (
            <FlatList
              data={intros}
              renderItem={renderMeetingItem}
              keyExtractor={(item) => item._id}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            />
          )}
        </>
      ) : (
        selectedNetwork && (
          <Text style={styles.Result}>
            no members in this network other than you
          </Text>
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
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
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
