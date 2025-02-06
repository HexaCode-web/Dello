import React, { useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import TopBar from "../../GeneralComponents/TopBar";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";

const NotificationScreen = () => {
  const User = useSelector((state) => state.auth.user);
  const navigation = useNavigation();

  const [notifications, setNotifications] = React.useState([]);
  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        setNotifications([]);
        try {
          // Fetch notifications from an API
          const response = await fetch(
            `${process.env.EXPO_PUBLIC_NOTIFICATIONS_API}/getNotifications/${User.user._id}`,
            {
              headers: {
                "Accept-Language": "en",
                "Content-Type": "application/json",
                Authorization: `Bearer ${User.Token}`, // Add the token to the Authorization header
              },
            }
          );
          const data = await response.json();

          setNotifications(data);
        } catch (err) {
          setError(err.message);
        }
      };

      fetchData();
    }, [])
  );
  const renderNotification = ({ item }) => {
    const getTimeAgo = (timestamp) => {
      const now = new Date();
      const past = new Date(timestamp);
      const seconds = Math.floor((now - past) / 1000);

      if (seconds < 60) return `${seconds} seconds ago`;
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes} minutes ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours} hours ago`;
      const days = Math.floor(hours / 24);
      if (days < 30) return `${days} days ago`;
      const months = Math.floor(days / 30);
      if (months < 12) return `${months} months ago`;
      const years = Math.floor(months / 12);
      return `${years} years ago`;
    };

    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          !item.seen && styles.unreadNotification,
        ]}
        onPress={() => {
          navigation.navigate("ViewProfile", {
            ProfileID: item.senderID,
          });
        }}
      >
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>Meet Request</Text>
          <Text style={styles.notificationDescription}>{item.message}</Text>
          <Text style={styles.timestamp}>{getTimeAgo(item.createdAt)}</Text>
        </View>
      </TouchableOpacity>
    );
  };
  const tabsAr = [
    { Name: "Security", Page: "Security" },
    { Name: "Profile", Page: "Profile" },
    { Name: "Settings", Page: "Profiles" },
    { Name: "Organisation", Page: "Organizations" },
  ];
  return (
    <SafeAreaView style={styles.container}>
      <TopBar Tabs={tabsAr} hasReturnButton={true} returnTarget={"Home"} />

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FCFF",
    paddingHorizontal: 20,

    paddingTop: 0,
    paddingBottom: 20,
    justifyContent: "space-between",
    color: "black",
  },
  header: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000000",
  },
  listContainer: {
    padding: 16,
  },
  notificationItem: {
    minWidth: "100%",
    backgroundColor: "#ffffff",
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  unreadNotification: {
    backgroundColor: "#f0f7ff",
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: "#000000",
  },
  notificationDescription: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 12,
    color: "#999999",
  },
});

export default NotificationScreen;
