import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Switch,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { COLORS, FONTS } from "../../../../theme";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { logout } from "../../../redux/slices/authSlice";

const NetworkItem = ({ network, onNetworkUpdate }) => {
  const User = useSelector((state) => state.auth.user);
  const [tempNetwork, setTempNetwork] = useState(network);
  const [org, setOrg] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const isPartOfOrg = () => {
    if (!User?.user.associatedEmails) return false;

    return User?.user.associatedEmails.find(
      (email) => email.OrgId === tempNetwork.orgId
    );
  };

  const [isEnabled, setIsEnabled] = useState(
    !network.Accepted.find((user) => user.userId === User.user._id)
      ?.ManualInActive || null
  );

  const [location, setLocation] = useState(false);
  const [activeNetwork, setActiveNetwork] = useState(true);

  const fetchAddress = async () => {
    setLoading(true);
    setLocation(null);
    let latitude = tempNetwork.coordinates.coordinates[1];
    let longitude = tempNetwork.coordinates.coordinates[0];

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

  const isPending = tempNetwork.Pending.some(
    (user) => user.userId === User.user._id
  );
  const isAccepted = tempNetwork.Accepted.some(
    (user) => user.userId === User.user._id
  );
  const isDismissed = tempNetwork.Dismissed.some(
    (user) => user.userId === User.user._id
  );
  const meetsRequirement = tempNetwork.OnlyProfEmails
    ? User.user.associatedEmails.length > 0
      ? true
      : false
    : true;

  const getOrgName = async () => {
    try {
      const config = {
        method: "get",
        url: `${process.env.EXPO_PUBLIC_ORG_API}/${network.orgId}`,
        headers: {
          "Accept-Language": "en",
          "Content-Type": "application/json",
          authorization: `Bearer ${User.Token}`,
        },
      };
      const response = await axios(config);
      setOrg(response.data);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "An error occurred";
      Alert.alert("Error", errorMessage);
    }
  };

  useEffect(() => {
    setIsAdmin(network.adminId === User.user._id);
    setTempNetwork(network);
  }, [network]);

  useEffect(() => {
    getOrgName();
  }, [network]);
  useEffect(() => {
    fetchAddress();

    const endDate = new Date(tempNetwork.endDate);
    const currentDate = new Date();

    // Normalize the dates to compare only the date part
    const isPastDate =
      endDate.getFullYear() < currentDate.getFullYear() ||
      (endDate.getFullYear() === currentDate.getFullYear() &&
        endDate.getMonth() < currentDate.getMonth()) ||
      (endDate.getFullYear() === currentDate.getFullYear() &&
        endDate.getMonth() === currentDate.getMonth() &&
        endDate.getDate() < currentDate.getDate());

    if (isPastDate || tempNetwork.Accepted.length >= tempNetwork.size) {
      setActiveNetwork(false);
    } else {
      setActiveNetwork(true);
    }
  }, [tempNetwork]);
  const addToDismiss = async () => {
    try {
      const config = {
        method: "put",
        url: `${process.env.EXPO_PUBLIC_NETWORK_API}/DismissNetwork/${network._id}/${User.user._id}`,
        headers: {
          "Accept-Language": "en",
          "Content-Type": "application/json",
          authorization: `Bearer ${User.Token}`,
        },
      };
      const response = await axios(config);

      if (response.status === 200) {
        Alert.alert("Network Dismissed", "Network successfully dismissed");
        const updatedNetwork = response.data.network;
        setTempNetwork(updatedNetwork);
        onNetworkUpdate(updatedNetwork); // Notify parent of update
      }
    } catch (error) {
      if (error.status == 401) {
        dispatch(logout());
      }
      const errorMessage =
        error.response?.data?.message || error.message || "An error occurred";
      Alert.alert("Error", errorMessage);
    }
  };

  const joinNetwork = async () => {
    if (!activeNetwork) {
      Alert.alert("error", "network is not available right now ");
      return;
    }
    if (isPending || isAccepted || loading) return;

    setLoading(true);
    try {
      const config = {
        method: "put",
        url: `${process.env.EXPO_PUBLIC_NETWORK_API}/JoinRequest/${network._id}/${User.user._id}`,
        headers: {
          "Accept-Language": "en",
          "Content-Type": "application/json",
          authorization: `Bearer ${User.Token}`,
        },
      };
      const response = await axios(config);

      if (response.status === 200) {
        Alert.alert("Success", "Network join request sent successfully");
        const updatedNetwork = response.data.network;
        setTempNetwork(updatedNetwork);
        onNetworkUpdate(updatedNetwork); // Notify parent of update
      }
    } catch (error) {
      if (error.status == 401) {
        dispatch(logout());
      }
      const errorMessage =
        error.response?.data?.message || error.message || "An error occurred";
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const renderActionButton = () => {
    if (loading) {
      return <ActivityIndicator size="small" color="#FFF" />;
    }

    if (isPending) {
      return (
        <>
          <Feather
            name="clock"
            size={20}
            color="#FFF"
            style={styles.actionIcon}
          />
          <Text style={styles.actionButtonText}>Pending</Text>
        </>
      );
    }

    if (isAccepted) {
      return (
        <>
          <Feather
            name="check"
            size={20}
            color="#FFF"
            style={styles.actionIcon}
          />
          <Text style={styles.actionButtonText}>Joined</Text>
        </>
      );
    }

    return (
      <>
        <Feather
          name="arrow-right"
          size={20}
          color="#FFF"
          style={styles.actionIcon}
        />
        <Text style={styles.actionButtonText}>Join</Text>
      </>
    );
  };

  const toggleNetworkActive = async (value) => {
    setLoading(true);

    try {
      const config = {
        method: "put",
        url: `${process.env.EXPO_PUBLIC_NETWORK_API}/ToggleActivity/${network._id}/${User.user._id}`,
        headers: {
          "Accept-Language": "en",
          "Content-Type": "application/json",
          authorization: `Bearer ${User.Token}`,
        },
        data: { isActive: value },
      };
      const response = await axios(config);

      if (response.status === 200) {
        setIsEnabled(value); // Update switch state
        const updatedNetwork = response.data.network;
        setTempNetwork(updatedNetwork);
        onNetworkUpdate(updatedNetwork); // Notify parent of update
        Alert.alert(
          "Success",
          `Network is now ${value ? "active" : "inactive"}`
        );
      }
    } catch (error) {
      if (error.status == 401) {
        dispatch(logout());
      }
      const errorMessage =
        error.response?.data?.message || error.message || "An error occurred";
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Render the switch for admins
  const renderActivitySwitch = () => {
    if (!isAccepted) return null;
    return (
      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Become Visible:</Text>
        <Switch
          value={isEnabled}
          onValueChange={toggleNetworkActive}
          disabled={loading}
          trackColor={{ false: "#767577", true: COLORS.secondary }}
          thumbColor={isEnabled ? "#FFF" : "#FFF"}
        />
      </View>
    );
  };

  if (!isPartOfOrg() && tempNetwork.type === "Private") {
    return;
  }
  return (
    <View
      style={[styles.container, !activeNetwork && styles.disabledContainer]}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.networkName}>{network.name}</Text>
        </View>
      </View>
      <View style={styles.networkDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Organization:</Text>
          <Text style={styles.detailText}>{org.name}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Organization Type:</Text>
          <Text style={styles.detailText}>{org.type}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Location:</Text>
          <Text style={styles.detailText}>
            {loading ? <ActivityIndicator /> : location}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Size:</Text>
          <Text style={styles.detailText}>{network.size} members</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Duration:</Text>
          <Text style={styles.detailText}>
            {formatDate(network.startDate)} - {formatDate(network.endDate)}
          </Text>
        </View>
        {renderActivitySwitch()}
      </View>
      {isAdmin ? (
        <View style={styles.emptyBtn}>
          <Text style={styles.buttonTextEmpty}>
            {activeNetwork
              ? "You are the admin of this network"
              : "Network expired or full"}
          </Text>
        </View>
      ) : !activeNetwork ? (
        <View style={styles.emptyBtn}>
          <Text style={styles.buttonTextEmpty}>Network expired or full</Text>
        </View>
      ) : isDismissed ? (
        ""
      ) : (
        <View style={styles.actions}>
          {meetsRequirement ? ( // Wrap the entire block in a single condition
            <>
              {!isAccepted && ( // Only show the dismiss button if the user is not accepted
                <TouchableOpacity
                  style={[
                    styles.dismissButton,
                    !activeNetwork && styles.disabledButton,
                  ]}
                  onPress={addToDismiss}
                  disabled={!activeNetwork}
                >
                  <Feather name="user-x" size={20} color="#FF3B30" />
                  <Text style={styles.dismissText}>Dismiss</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  isPending ? styles.pendingButton : styles.joinButton,
                  !activeNetwork && styles.disabledButton,
                ]}
                onPress={joinNetwork}
                disabled={isPending || isAccepted || loading || !activeNetwork}
              >
                {renderActionButton()}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={[styles.detailLabel, { textAlign: "center" }]}>
                you must associate a non-personal email account to join this
                network
              </Text>
            </>
          )}
        </View>
      )}
      {!activeNetwork && <View style={styles.disabledOverlay}></View>}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
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
    position: "relative", // Required for overlay
  },
  disabledContainer: {
    backgroundColor: "#f0f0f0",
    opacity: 0.6,
  },
  disabledOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  disabledText: {
    color: "#fff",
    fontFamily: FONTS.familyBold,
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: "#d3d3d3",
    borderColor: "#d3d3d3",
  },
  detailRow: {
    fontSize: 16,
    marginVertical: 5,
  },

  hide: {
    display: "none",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  networkName: {
    fontSize: 18,
    fontFamily: FONTS.familyBold,
  },
  networkCode: {
    fontSize: FONTS.small,
    color: "#666",
  },
  headerIcons: {
    flexDirection: "row",
    width: 30,
    justifyContent: "space-between",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  switchLabel: {
    fontFamily: FONTS.familyBold,
    color: "#666",
    fontSize: FONTS.medium,
  },
  tags: {
    flexDirection: "row",
    marginBottom: 12,
  },
  tag: {
    backgroundColor: "#F0F0F0",
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  tagText: {
    fontSize: FONTS.small - 2,
    color: "#333",
  },
  actions: {
    gap: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dismissButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FF3B30",
    borderRadius: 20,
    height: 38,
    width: 167,
    paddingVertical: 8,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  dismissText: {
    color: "#FF3B30",
    marginLeft: 8,
    fontFamily: FONTS.familyBold,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    height: 38,
    width: 167,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  joinButton: {
    backgroundColor: "#4A0E4E",
    fontFamily: FONTS.familyBold,
  },
  pendingButton: {
    backgroundColor: "#6c757d",
  },
  actionButtonText: {
    color: "#FFF",
    fontFamily: FONTS.familyBold,
    marginLeft: 8,
  },
  actionIcon: {
    marginRight: 4,
  },
  networkDetails: {
    marginVertical: 12,
    padding: 12,
    borderRadius: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  detailLabel: {
    fontFamily: FONTS.familyBold,
    color: "#666",
    fontSize: FONTS.medium,
  },
  detailText: {
    fontFamily: FONTS.familyLight,
    fontSize: FONTS.medium,
    color: "#333",
  },
  emptyBtn: {
    backgroundColor: "transparent",
    shadowColor: "transparent",
    borderWidth: 2,
    borderColor: COLORS.secondary,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 30,
  },
  buttonTextEmpty: {
    fontSize: FONTS.medium,
    fontFamily: FONTS.familyBold,
    textAlign: "center",
    color: COLORS.secondary,
  },
});

export default NetworkItem;
