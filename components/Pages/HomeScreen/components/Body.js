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
      return { ...userResponse.data, userId: member.userId };
    });
    setMembers([]);
    const members = await Promise.all(memberPromises);

    // Save members to state
    setMembers((prevMembers) => [...prevMembers, ...members]);
  };
  const fetchNetworkDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!User?.user?.joinedNetworks) {
        setNetworkDetails([]);
        setError("No networks found");
        return;
      }

      const networkPromises = User.user.joinedNetworks.map(async (network) => {
        const response = await axios.get(
          `${process.env.EXPO_PUBLIC_NETWORK_API}/getNetwork/${network.networkId}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const orgDetails = await axios.get(
          `${process.env.EXPO_PUBLIC_ORG_API}/${response.data.orgId}`,
          {
            headers: {
              "Accept-Language": "en",
              "Content-Type": "application/json",
              Authorization: `Bearer ${User.Token}`,
            },
          }
        );
        return {
          _id: network._id,
          OrgDetails: orgDetails.data,
          networkId: network.networkId,
          name: response.data.name,
          ...response.data,
        };
      });

      const details = await Promise.all(networkPromises);
      setAvailableUsers(0);
      details.forEach((network) => {
        setAvailableUsers((prev) => prev + network.Accepted.length);
      });
      setAvailableUsers((prev) => prev - networkPromises.length);
      setNetworkDetails(details);

      if (!selectedNetwork && details.length > 0) {
        setSelectedNetwork(details[0]);
      }
    } catch (error) {
      console.error("Error fetching network details:", error);
      setError(
        error.response?.data?.message || "Failed to fetch network details"
      );
    } finally {
      setLoading(false);
    }
  };
  const fetchMeetRequestsForUser = async (userIDB, networkID) => {
    try {
      // Validate inputs
      if (!userIDB || !networkID) {
        throw new Error("Please provide valid userIDB and networkID");
      }

      const apiUrl = `${process.env.EXPO_PUBLIC_MEET_API}/getMeetRequestForUser/${userIDB}/${networkID}`;

      const response = await axios.get(apiUrl);

      // Return the data from the response
      return response.data;
    } catch (error) {
      console.error("Error fetching meeting requests:", error);

      // Handle errors appropriately
      if (error.response) {
        console.error("Server response:", error.response.data);
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
    }, [])
  );

  const tabData = [
    { id: "2", title: "Meet", Count: meetRequests?.length },
    { id: "3", title: "Intros", Count: 0 },
    { id: "1", title: "All", Count: selectedNetwork?.Accepted.length },
  ];

  const renderMeetingItem = ({ item }) => {
    if (item.userId === User.user._id) return null;
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
          {item.name}
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
        <Text style={styles.Result}>
          no members in this network other than you
        </Text>
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
    top: -25,
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
