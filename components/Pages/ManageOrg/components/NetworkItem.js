import { Text, StyleSheet, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";

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

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        navigation.navigate("NetworkDetails", { network: item, admin: admin });
      }}
    >
      <Text style={styles.title}>{item.name}</Text>
      {admin ? (
        <Text style={styles.info}>Admin Email: {admin.email}</Text>
      ) : (
        <Text style={styles.info}>Loading Admin...</Text>
      )}
      <Text style={styles.info}>Size: {item.size}</Text>
      {/* <Text style={styles.info}>Type: {item.Type}</Text> */}
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
});

export default NetworkItem;
