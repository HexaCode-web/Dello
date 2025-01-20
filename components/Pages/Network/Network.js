import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Text,
} from "react-native";
import Navigation from "./components/Navigation";
import NetworkItem from "./components/NetworkItem";
import { useGetLocation } from "../../hooks/getLocation";
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";
import TopBar from "../../GeneralComponents/TopBar";
import { useSelector } from "react-redux";

const Network = () => {
  const User = useSelector((state) => state.auth.user);
  const [location] = useGetLocation();
  const tabsAr = [
    { Name: "Security", Page: "Security" },
    { Name: "Profile", Page: "Profile" },
    { Name: "Profiles", Page: "Profiles" },
    { Name: "Organisation", Page: "Organizations" },
  ];
  const [networks, setNetworks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [acceptedNetworks, setAcceptedNetworks] = useState([]);
  const [dismissedNetworks, setDismissedNetworks] = useState([]);
  const [pendingNetworks, setPendingNetworks] = useState([]);
  const [availableNetworks, setAvailableNetworks] = useState([]);
  const [activeTab, setActiveTab] = useState("Available");

  const getNetworks = async () => {
    setLoading(true);
    setNetworks([]);
    let latitude;
    let longitude;

    if (location.coords) {
      latitude = location.coords.latitude;
      longitude = location.coords.longitude;
    }

    try {
      const nearbyNetworks = await axios.get(
        `${process.env.EXPO_PUBLIC_NETWORK_API}/nearby`,
        {
          params: {
            latitude,
            longitude,
          },
        }
      );
      setNetworks(nearbyNetworks.data);
    } catch (error) {
      console.error("Error fetching networks:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateNetworkCategories = useCallback(() => {
    const accepted = [];
    const dismissed = [];
    const pending = [];
    const available = [];

    networks.forEach((network) => {
      if (network.Accepted.find((user) => user.userId === User.user._id)) {
        accepted.push(network);
      } else if (
        network.Dismissed.find((user) => user.userId === User.user._id)
      ) {
        dismissed.push(network);
      } else if (
        network.Pending.find((user) => user.userId === User.user._id)
      ) {
        pending.push(network);
      } else {
        available.push(network);
      }
    });

    setAcceptedNetworks(accepted);
    setDismissedNetworks(dismissed);
    setPendingNetworks(pending);
    setAvailableNetworks(available);
  }, [networks, User.user._id]);

  // Handle network updates from child component
  const handleNetworkUpdate = useCallback((updatedNetwork) => {
    setNetworks((prevNetworks) =>
      prevNetworks.map((network) =>
        network._id === updatedNetwork._id ? updatedNetwork : network
      )
    );
  }, []);

  useFocusEffect(
    useCallback(() => {
      getNetworks();
    }, [location, activeTab])
  );

  useFocusEffect(
    useCallback(() => {
      updateNetworkCategories();
    }, [networks, updateNetworkCategories])
  );
  // Run getNetworks every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      getNetworks();
    }, 5 * 60 * 1000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [location]);
  const getTabData = () => {
    switch (activeTab) {
      case "Member":
        return acceptedNetworks;
      case "Pending":
        return pendingNetworks;
      case "Dismissed":
        return dismissedNetworks;
      case "Available":
      default:
        return availableNetworks;
    }
  };

  const renderNetworkItem = ({ item }) => (
    <NetworkItem network={item} onNetworkUpdate={handleNetworkUpdate} />
  );

  return (
    <View style={styles.container}>
      <TopBar Tabs={tabsAr} />
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#4B164C"
          style={styles.loadingIndicator}
        />
      ) : getTabData().length > 0 ? (
        <FlatList
          data={getTabData()}
          renderItem={renderNetworkItem}
          keyExtractor={(item) => item._id}
          style={styles.networkList}
        />
      ) : (
        <Text style={styles.Result}>No networks found</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FCFF",

    paddingTop: 20,
    color: "black",
    backgroundColor: "#F5FCFF",
  },
  networkList: {
    flex: 1,
  },
  Result: {
    textAlign: "center",
    fontSize: 20,
    marginTop: 20,
    color: "black",
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Network;
