import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from "react-native";
import Navigation from "./components/Navigation";
import NetworkItem from "./components/NetworkItem";
import axios from "axios";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import TopBar from "../../GeneralComponents/TopBar";
import { useDispatch, useSelector } from "react-redux";
import sortBy from "sort-by";
import { COLORS, FONTS } from "../../../theme";
import { logout } from "../../redux/slices/authSlice";

const Network = () => {
  const User = useSelector((state) => state.auth.user);
  const navigation = useNavigation();
  const tabsAr = [
    { Name: "Security", Page: "Security" },
    { Name: "Profile", Page: "Profile" },
    { Name: "Settings", Page: "Profiles" },
    { Name: "Organisation", Page: "Organizations" },
  ];
  const dispatch = useDispatch();

  const { location, error } = useSelector((state) => state.location);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [networks, setNetworks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [acceptedNetworks, setAcceptedNetworks] = useState([]);
  const [dismissedNetworks, setDismissedNetworks] = useState([]);
  const [pendingNetworks, setPendingNetworks] = useState([]);
  const [expiredNetworks, setExpiredNetworks] = useState([]);
  const [availableNetworks, setAvailableNetworks] = useState([]);
  const [activeTab, setActiveTab] = useState("Available");

  function checkProfile() {
    const { user } = User;

    // Check if presentRole has valid information
    const isPresentRoleValid =
      user.presentRole &&
      user.presentRole.Company &&
      user.presentRole.Position &&
      user.presentRole.StartDate;

    // Check if all required fields have at least one entry
    const hasPreviousRoles =
      user.previousRoles && user.previousRoles.length > 0;
    const hasEducation = user.education && user.education.length > 0;
    const hasBusinessDrivers =
      user.businessDrivers && user.businessDrivers.length > 0;
    const hasImmediateNeeds =
      user.ImmediateNeeds && user.ImmediateNeeds.length > 0;
    const hasSkills = user.skills && user.skills.length > 0;

    // Return true only if all conditions are met
    return (
      isPresentRoleValid &&
      hasPreviousRoles &&
      hasEducation &&
      hasBusinessDrivers &&
      hasImmediateNeeds &&
      hasSkills
    );
  }
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
      if (error.status == 401) {
        dispatch(logout());
      }
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
    const expired = [];
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
    networks.forEach((network) => {
      const distance = calculateDistance(
        location.coords.latitude,
        location.coords.longitude,
        network.coordinates.coordinates[1],
        network.coordinates.coordinates[0]
      );
      const endDate = new Date(network.endDate);
      const currentDate = new Date();
      const isPastDate =
        endDate.getFullYear() < currentDate.getFullYear() ||
        (endDate.getFullYear() === currentDate.getFullYear() &&
          endDate.getMonth() < currentDate.getMonth()) ||
        (endDate.getFullYear() === currentDate.getFullYear() &&
          endDate.getMonth() === currentDate.getMonth() &&
          endDate.getDate() < currentDate.getDate());
      (network.Active = !isPastDate), (network.distance = distance);
    });
    networks.sort(sortBy("-Active", "distance", "Accepted"));

    networks.forEach((network) => {
      const distance = calculateDistance(
        location.coords.latitude,
        location.coords.longitude,
        network.coordinates.coordinates[1],
        network.coordinates.coordinates[0]
      );
      const endDate = new Date(network.endDate);
      const currentDate = new Date();
      const isPastDate =
        endDate.getFullYear() < currentDate.getFullYear() ||
        (endDate.getFullYear() === currentDate.getFullYear() &&
          endDate.getMonth() < currentDate.getMonth()) ||
        (endDate.getFullYear() === currentDate.getFullYear() &&
          endDate.getMonth() === currentDate.getMonth() &&
          endDate.getDate() < currentDate.getDate());
      (network.Active = isPastDate ? 1 : 0), (network.distance = distance);
      if (network.Deleted) return;

      if (isPastDate) {
        expired.push(network);
      } else if (
        network.Dismissed.find((user) => user.userId === User.user._id)
      ) {
        dismissed.push(network);
      } else if (
        network.Pending.find((user) => user.userId === User.user._id)
      ) {
        pending.push(network);
      } else if (
        network.Accepted.find((user) => user.userId === User.user._id)
      ) {
        accepted.push(network);
      } else {
        available.push(network);
      }
    });

    setAcceptedNetworks(accepted);
    setDismissedNetworks(dismissed);
    setPendingNetworks(pending);
    setAvailableNetworks(available);
    setExpiredNetworks(expired);
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
      setIsProfileComplete(checkProfile);
      // setIsProfileComplete(true);
    }, [location, activeTab])
  );

  useFocusEffect(
    useCallback(() => {
      updateNetworkCategories();
    }, [networks, updateNetworkCategories])
  );
  useEffect(() => {
    const interval = setInterval(() => {
      getNetworks();
    }, 5 * 60 * 1000);

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
      case "Expired":
        return expiredNetworks;
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
      <TopBar Tabs={tabsAr} hasReturnButton={false} />
      {isProfileComplete ? (
        <>
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
            <Text style={styles.ResultText}>No networks found</Text>
          )}
        </>
      ) : (
        <View style={styles.Result}>
          <Text style={styles.ResultText}>
            Please complete your profile to view and join networks
          </Text>
          <TouchableOpacity
            style={styles.DefaultButton}
            onPress={() => navigation.navigate("Profile")}
          >
            <Text style={styles.buttonText}>go to Profile</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FCFF",
    paddingHorizontal: 20,

    paddingTop: 0,
    color: "black",
    backgroundColor: "#F5FCFF",
  },

  networkList: {
    flex: 1,
  },
  Result: {
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    marginTop: 20,
    color: "black",
  },
  ResultText: {
    fontSize: FONTS.medium,
    color: COLORS.textSecondary,
    textAlign: "center",
    fontFamily: FONTS.familyBold,
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  DefaultButton: {
    borderRadius: 30,
    height: 60,
    display: "flex",
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
    marginTop: 60,
  },
  buttonText: {
    fontSize: FONTS.medium,
    fontFamily: FONTS.familyBold,
    color: "white",
  },
});

export default Network;
