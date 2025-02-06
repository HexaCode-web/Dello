import { Text, StyleSheet, TouchableOpacity, View } from "react-native";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { FONTS } from "../../../../theme";

const NetworkItem = ({ item, setActivePage }) => {
  const navigation = useNavigation();

  const [admin, setAdmin] = useState(null);

  const getProfile = async (adminId) => {
    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_PROFILE_API}/${adminId}`
      );
      setAdmin(response.data);
    } catch (error) {
      console.error("Error fetching admin profile:", error.message);
    }
  };

  useEffect(() => {
    if (item.adminId) {
      getProfile(item.adminId); // Fetch profile based on adminId
    }
  }, [item.adminId]);

  // Determine the status of the network
  const getNetworkStatus = () => {
    const endDate = new Date(item.endDate);
    const currentDate = new Date();
    if (item.Deleted) {
      return "Deleted"; // Network is deleted
    } else if (item.Accepted.length >= item.size) {
      return "Full"; // Network is full
    } else if (
      endDate.getFullYear() < currentDate.getFullYear() ||
      (endDate.getFullYear() === currentDate.getFullYear() &&
        endDate.getMonth() < currentDate.getMonth()) ||
      (endDate.getFullYear() === currentDate.getFullYear() &&
        endDate.getMonth() === currentDate.getMonth() &&
        endDate.getDate() < currentDate.getDate())
    ) {
      return "Expired"; // Network is expired
    } else {
      return "Active"; // Network is active
    }
  };

  // Get the color for the status indicator
  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "green";
      case "Expired":
      case "Deleted":
        return "red";
      case "Full":
        return "orange";
      default:
        return "gray";
    }
  };

  const status = getNetworkStatus();
  const statusColor = getStatusColor(status);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        navigation.navigate("NetworkDetails", { network: item, admin: admin });
      }}
    >
      {/* Status Indicator */}
      <View style={[styles.statusIndicator, { backgroundColor: statusColor }]}>
        <Text style={styles.statusText}>{status}</Text>
      </View>

      <Text style={styles.title}>{item.name}</Text>
      {admin ? (
        <Text style={styles.info}>
          Admin Email:
          {
            admin.associatedEmails.find((email) => email.OrgId === item.orgId)
              .email
          }
        </Text>
      ) : (
        <Text style={styles.info}>Loading Admin...</Text>
      )}
      <Text style={styles.info}>Size: {item.size}</Text>
      <Text style={styles.info}>Pending Requests: {item.Pending.length}</Text>
      <Text style={styles.info}>Members: {item.Accepted.length}</Text>
      <Text style={styles.info}>Rejected: {item.Rejected.length}</Text>
      <Text style={styles.info}>Dismissed: {item.Dismissed.length}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "100%", // Full width minus some margin
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    position: "relative", // Needed for absolute positioning of the status indicator
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#0056b3",
  },
  info: {
    fontSize: 14,
    color: "#555",
  },
  statusIndicator: {
    position: "absolute",
    top: 10,
    right: 10,
    borderRadius: 5, // Makes it a circle
    padding: 5,
  },
  statusText: {
    color: "white",
    fontSize: FONTS.small,
    fontWeight: "bold",
  },
});

export default NetworkItem;
