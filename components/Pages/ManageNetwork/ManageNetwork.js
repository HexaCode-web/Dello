import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { format } from "date-fns";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Entypo from "@expo/vector-icons/Entypo";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import TopBar from "../../GeneralComponents/TopBar";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { COLORS, FONTS } from "../../../theme";
import { logout } from "../../redux/slices/authSlice";

const StatusSection = ({
  title,
  data,
  onAccept,
  onReject,
  userProfiles,
  orgId,
}) => {
  const User = useSelector((state) => state.auth.user);
  const navigation = useNavigation();
  if (data.length === 0) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {title} ({data.length})
        </Text>
        <Text style={styles.emptyText}>
          {title === "Dismissed"
            ? "No users have dismissed this network"
            : `No ${title.toLowerCase()} requests`}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {title} ({data.length})
      </Text>
      {data.map((item, index) => (
        <View key={item._id || index} style={styles.card}>
          <TouchableOpacity
            style={styles.cardContent}
            onPress={() => {
              navigation.navigate("ViewProfile", {
                ProfileID: item.userId,
                meetingRequest: false,
              });
            }}
          >
            <Text style={styles.userId}>
              [ {userProfiles[item.userId]?.FirstName}{" "}
              {userProfiles[item.userId]?.LastName} -{" "}
              {userProfiles[item.userId]?.associatedEmails.find(
                (email) => email.OrgId === orgId
              )?.email ||
                userProfiles[item.userId]?.associatedEmails[0]?.email ||
                userProfiles[item.userId]?.email}
              ]
            </Text>
            {title === "Pending" && (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.iconButton, styles.acceptButton]}
                  onPress={() => onAccept(item)}
                >
                  <Entypo name="check" size={24} color="black" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.iconButton, styles.rejectButton]}
                  onPress={() => onReject(item)}
                >
                  <FontAwesome name="remove" size={24} color="black" />
                </TouchableOpacity>
              </View>
            )}
            {title === "Members" && User.user._id != item.userId && (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.iconButton, styles.rejectButton]}
                  onPress={() => onReject(item)}
                >
                  <FontAwesome name="remove" size={24} color="black" />
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};
const ManageNetwork = ({ route }) => {
  const dispatch = useDispatch();

  const navigation = useNavigation();
  const { network, admin } = route.params;

  const [TempNetwork, setTempNetwork] = useState(network);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [userProfiles, setUserProfiles] = useState({});
  const User = useSelector((state) => state.auth.user);
  const tabsAr = [
    { Name: "Security", Page: "Security" },
    { Name: "Profile", Page: "Profile" },
    { Name: "Settings", Page: "Profiles" },
    { Name: "Organisation", Page: "Organizations" },
  ];
  const fetchAddress = async () => {
    setLoading(true);
    let latitude = network.coordinates.coordinates[1];
    let longitude = network.coordinates.coordinates[0];

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
        {
          headers: {
            "User-Agent": "Delllo/1.5 (marcomark5050@gmail.com)", // Replace with your app info
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Received non-JSON response");
      }

      const data = await response.json();
      if (data && data.display_name) {
        const { city, postcode } = data.address;
        const formattedAddress = `${city}, ${postcode}`;

        setLocation(formattedAddress); // Excludes postcode
      } else {
        setLocation("Address not found");
      }
    } catch (error) {
      if (error.status == 401) {
        dispatch(logout());
      }
      console.error("Error fetching address:", error);
      setLocation("Error fetching address");
    } finally {
      setLoading(false);
    }
  };
  const fetchUserProfiles = async () => {
    const userIds = [
      ...TempNetwork.Pending,
      ...TempNetwork.Accepted,
      ...TempNetwork.Rejected,
      ...TempNetwork.Dismissed,
    ].map((item) => item.userId);

    const uniqueUserIds = [...new Set(userIds)]; // Remove duplicate IDs

    try {
      const userPromises = uniqueUserIds.map((userId) =>
        axios.get(`${process.env.EXPO_PUBLIC_PROFILE_API}/${userId}`)
      );

      const responses = await Promise.all(userPromises);
      const profiles = responses.reduce((acc, response, index) => {
        acc[uniqueUserIds[index]] = response.data; // Map userId to profile data
        return acc;
      }, {});

      setUserProfiles(profiles);
    } catch (error) {
      if (error.status == 401) {
        dispatch(logout());
      }
      console.error("Error fetching user profiles:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setTempNetwork(network);
      fetchAddress();
    }, [network])
  );

  useFocusEffect(
    useCallback(() => {
      fetchUserProfiles();
    }, [TempNetwork])
  );

  const formatDate = (dateString) => {
    return format(new Date(dateString), "MMM dd, yyyy h:mm a");
  };
  console.log(TempNetwork.OnlyProfEmails);

  const handleAccept = async (user) => {
    try {
      const config = {
        method: "put",
        url: `${process.env.EXPO_PUBLIC_NETWORK_API}/ApproveRequest/${network._id}/${user.userId}`,
        headers: {
          "Accept-Language": "en",
          "Content-Type": "application/json",
          authorization: `Bearer ${User.Token}`,
        },
      };
      const response = await axios(config);

      if (response.status === 200) {
        Alert.alert("success", "user accepted successfully ");
        setTempNetwork(response.data.network);
      }
    } catch (error) {
      if (error.status == 401) {
        dispatch(logout());
      }
      if (error.response) {
        // Extract error message from the response
        const errorMessage = error.response.data.message || "An error occurred";
        Alert.alert("Error", errorMessage);
      } else {
        // Handle the case where no response is returned (e.g., network error)
        Alert.alert("Error", error.message || "Network error");
      }
    }
  };

  const handleReject = async (user) => {
    try {
      const config = {
        method: "put",
        url: `${process.env.EXPO_PUBLIC_NETWORK_API}/RejectRequest/${network._id}/${user.userId}`,
        headers: {
          "Accept-Language": "en",
          "Content-Type": "application/json",
          authorization: `Bearer ${User.Token}`,
        },
      };
      const response = await axios(config);

      if (response.status === 200) {
        Alert.alert("success", "Network rejected successfully ");
        setTempNetwork(response.data.network);
      }
      e;
    } catch (error) {
      if (error.status == 401) {
        dispatch(logout());
      }
      if (error.response) {
        // Extract error message from the response
        const errorMessage = error.response.data.message || "An error occurred";
        Alert.alert("Error", errorMessage);
      } else {
        // Handle the case where no response is returned (e.g., network error)
        Alert.alert("Error", error.message || "Network error");
      }
    }
  };

  const DeleteNetwork = () => {
    Alert.alert(
      "Delete Network",
      "Are you sure you want to delete this network? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              const config = {
                method: "patch",
                url: `${process.env.EXPO_PUBLIC_NETWORK_API}/deleteNetwork/${network._id}`,
                headers: {
                  "Accept-Language": "en",
                  "Content-Type": "application/json",
                  authorization: `Bearer ${User.Token}`,
                },
              };
              const response = await axios(config);

              if (response.status === 200) {
                Alert.alert("success", "Network deleted successfully ");
                navigation.navigate("Organizations");
              }
            } catch (error) {
              if (error.status == 401) {
                dispatch(logout());
              }
              if (error.response) {
                // Extract error message from the response
                const errorMessage =
                  error.response.data.message || "An error occurred";
                Alert.alert("Error", errorMessage);
              } else {
                // Handle the case where no response is returned (e.g., network error)
                Alert.alert("Error", error.message || "Network error");
              }
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };
  const removeUser = async (user) => {
    Alert.alert(
      "Remove User",
      "Are you sure you want to remove this user from the network?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              const config = {
                method: "put",
                url: `${process.env.EXPO_PUBLIC_NETWORK_API}/RemoveUser/${network._id}/${user.userId}`,
                headers: {
                  "Accept-Language": "en",
                  "Content-Type": "application/json",
                  authorization: `Bearer ${User.Token}`,
                },
              };
              const response = await axios(config);
              if (response.status === 200) {
                Alert.alert("Success", "User removed successfully");
                setTempNetwork(response.data.network);
              }
            } catch (error) {
              const errorMessage =
                error.response?.data?.message || "An error occurred";
              Alert.alert("Error", errorMessage);
            } finally {
              setLoading(false); // Reset loading state
            }
          },
        },
      ]
    );
  };
  return (
    <ScrollView style={styles.container}>
      <TopBar
        Tabs={tabsAr}
        hasReturnButton={true}
        returnTarget={{ name: "Organizations" }}
        Title="Network Details"
      />

      <View style={styles.header}>
        <Text style={styles.title}>{TempNetwork.name}</Text>
        <Text style={styles.subtitle}>
          Created by:
          {
            admin.associatedEmails.find(
              (email) => email.OrgId === TempNetwork.orgId
            )?.email
          }
        </Text>
      </View>

      <View style={styles.detailsCard}>
        <Text style={styles.detailItem}>Size: {TempNetwork.size} people</Text>
        <Text style={styles.detailItem}>
          Start Date: {formatDate(TempNetwork.startDate)}
        </Text>
        <Text style={styles.detailItem}>
          End Date: {formatDate(TempNetwork.endDate)}
        </Text>
        {loading ? (
          <ActivityIndicator />
        ) : (
          <Text style={styles.detailItem}>Location: {location}</Text>
        )}
      </View>

      <View style={styles.statusContainer}>
        <StatusSection
          title="Pending"
          data={TempNetwork.Pending}
          onAccept={handleAccept}
          onReject={handleReject}
          userProfiles={userProfiles}
          orgId={TempNetwork.orgId}
        />
        <StatusSection
          title="Members"
          data={TempNetwork.Accepted}
          userProfiles={userProfiles}
          onReject={removeUser}
          orgId={TempNetwork.orgId}
        />
        <StatusSection
          title="Rejected"
          data={TempNetwork.Rejected}
          userProfiles={userProfiles}
          orgId={TempNetwork.orgId}
        />
        <StatusSection
          title="Dismissed"
          data={TempNetwork.Dismissed}
          userProfiles={userProfiles}
          orgId={TempNetwork.orgId}
        />
      </View>

      <TouchableOpacity
        style={styles.DefaultButton}
        onPress={() => {
          navigation.navigate("EditNetwork", { network: TempNetwork });
        }}
      >
        <Text style={styles.buttonText}>Settings</Text>
      </TouchableOpacity>
      {!TempNetwork.Deleted && (
        <TouchableOpacity
          style={[styles.DefaultButton, { backgroundColor: "#dc3545" }]}
          onPress={() => {
            DeleteNetwork();
          }}
        >
          <Text style={styles.buttonText}>Delete Network</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,

    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 20,
    color: "black",
    backgroundColor: "#F5FCFF",
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  detailsCard: {
    margin: 15,
    padding: 15,

    backgroundColor: "#fff",
    borderRadius: 10,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  detailItem: {
    fontSize: 16,
    marginVertical: 5,
  },
  statusContainer: {
    padding: 15,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  card: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userId: {
    flex: 1,
    fontSize: 16,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 10,
  },
  iconButton: {
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyText: {
    color: "#666",
    fontStyle: "italic",
  },
  DefaultButton: {
    borderRadius: 30,
    height: 60,
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: COLORS.secondary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 2,
  },

  buttonText: {
    fontSize: FONTS.medium,
    fontFamily: FONTS.familyBold,
    color: "white",
  },
});

export default ManageNetwork;
