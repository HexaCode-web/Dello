import React, { useCallback, useEffect, useState } from "react";
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
import { useSelector } from "react-redux";
import TopBar from "../../GeneralComponents/TopBar";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
const StatusSection = ({ title, data, onAccept, onReject, userProfiles }) => {
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
              {userProfiles[item.userId]?.email}]
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
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};
const ManageNetwork = ({ route }) => {
  const { network, admin } = route.params;
  const [TempNetwork, setTempNetwork] = useState(network);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(false);
  const [userProfiles, setUserProfiles] = useState({});

  const fetchAddress = async () => {
    setLoading(true);
    setLocation(null);
    let latitude = TempNetwork.coordinates.coordinates[1];
    let longitude = TempNetwork.coordinates.coordinates[0];

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
      console.error("Error fetching user profiles:", error);
    }
  };
  const User = useSelector((state) => state.auth.user);
  useEffect(() => {
    setTempNetwork(network);
  }, [network]);
  useFocusEffect(
    useCallback(() => {
      fetchAddress();
      fetchUserProfiles();
    }, [TempNetwork])
  );
  const tabsAr = [
    { Name: "Security", Page: "Security" },
    { Name: "Profile", Page: "Profile" },
    { Name: "Profiles", Page: "Profiles" },
    { Name: "Organisation", Page: "Organizations" },
  ];

  const formatDate = (dateString) => {
    return format(new Date(dateString), "MMM dd, yyyy h:mm a");
  };

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

  return (
    <ScrollView style={styles.container}>
      <TopBar
        Tabs={tabsAr}
        hasReturnButton={true}
        returnTarget={{ name: "Organizations" }}
        Title={TempNetwork.name}
      />

      <View style={styles.header}>
        <Text style={styles.subtitle}>Created by: {admin.email}</Text>
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
        />
        <StatusSection
          title="Members"
          data={TempNetwork.Accepted}
          userProfiles={userProfiles}
        />
        <StatusSection
          title="Rejected"
          data={TempNetwork.Rejected}
          userProfiles={userProfiles}
        />
        <StatusSection
          title="Dismissed"
          data={TempNetwork.Dismissed}
          userProfiles={userProfiles}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
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
});

export default ManageNetwork;
