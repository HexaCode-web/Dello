import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import TopBar from "../../GeneralComponents/TopBar";
import { COLORS, FONTS } from "../../../theme";
import { logout } from "../../redux/slices/authSlice";

const EditNetwork = ({ route }) => {
  const { network } = route.params;

  const dispatch = useDispatch();

  const [admin, setAdmin] = useState(null);
  const User = useSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(false);
  const [networkData, setNetworkData] = useState(null);

  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);
  const [showRenewalDate, setShowRenewalDate] = useState(false);

  const getProfile = async (adminId) => {
    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_PROFILE_API}/${adminId}`
      );
      setAdmin(response.data);
    } catch (error) {
      if (error.status == 401) {
        dispatch(logout());
      }
      console.error("Error fetching admin profile:", error.message);
    }
  };

  useEffect(() => {
    if (network.adminId) {
      getProfile(network.adminId); // Fetch profile based on adminId
    }
  }, [network.adminId]);
  useFocusEffect(
    useCallback(() => {
      setNetworkData({
        name: network.name,
        licenseID: network.licenseID || "",
        licenseType: network.licenseType || "",
        startDate: new Date(network.startDate),
        endDate: new Date(network.endDate),
        renewalPoint: network.renewalPoint
          ? new Date(network.renewalPoint)
          : null,
        type: network.type,
        size: network.size.toString(),
        radius: network.radius.toString(),
        coordinates: network.coordinates,
        OnlyProfEmails: network?.OnlyProfEmails,
      });
    }, [network]) // Add `network` as a dependency
  );
  const toggleSwitch = () => {
    setNetworkData((prev) => ({
      ...prev,
      OnlyProfEmails: !prev.OnlyProfEmails,
    }));
  };
  const handleDateChange = (event, selectedDate, dateType) => {
    if (event.type === "set") {
      const currentDate = selectedDate;
      switch (dateType) {
        case "start":
          setShowStartDate(false);
          setNetworkData((prev) => ({ ...prev, startDate: currentDate }));
          break;
        case "end":
          setShowEndDate(false);
          setNetworkData((prev) => ({ ...prev, endDate: currentDate }));
          break;
        case "renewal":
          setShowRenewalDate(false);
          setNetworkData((prev) => ({ ...prev, renewalPoint: currentDate }));
          break;
      }
    } else {
      setShowStartDate(false);
      setShowEndDate(false);
      setShowRenewalDate(false);
    }
  };

  const validateForm = () => {
    if (!networkData.name.trim()) {
      Alert.alert("Error", "Network name is required");
      return false;
    }
    if (isNaN(parseInt(networkData.size)) || parseInt(networkData.size) <= 0) {
      Alert.alert("Error", "Size must be a positive number");
      return false;
    }
    if (
      isNaN(parseFloat(networkData.radius)) ||
      parseFloat(networkData.radius) <= 0
    ) {
      Alert.alert("Error", "Radius must be a positive number");
      return false;
    }
    if (networkData.endDate < networkData.startDate) {
      Alert.alert("Error", "End date must be after start date");
      return false;
    }
    return true;
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const config = {
        method: "patch",
        url: `${process.env.EXPO_PUBLIC_NETWORK_API}/updateNetwork/${network._id}`,
        headers: {
          "Accept-Language": "en",
          "Content-Type": "application/json",
          authorization: `Bearer ${User.Token}`,
        },
        data: {
          updatedNetwork: {
            ...networkData,
            size: parseInt(networkData.size),
            radius: parseFloat(networkData.radius),
          },
        },
      };

      const response = await axios(config);
      if (response.status === 200) {
        Alert.alert("Success", "Network updated successfully");
      }
    } catch (error) {
      if (error.status == 401) {
        dispatch(logout());
      }
      const errorMessage =
        error.response?.data?.message ||
        "An error occurred while updating the network";
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <TopBar
        hasReturnButton={true}
        returnTarget={{
          name: "NetworkDetails",
          params: { network: network, admin: admin },
        }}
      />
      <View style={styles.form}>
        <Text style={styles.label}>Network Name</Text>
        <TextInput
          style={styles.input}
          value={networkData?.name}
          onChangeText={(text) =>
            setNetworkData((prev) => ({ ...prev, name: text }))
          }
          placeholder="Network Name"
        />

        <Text style={styles.label}>Network Type</Text>
        <View style={styles.typeContainer}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              networkData?.type === "Public" && styles.selectedType,
            ]}
            onPress={() =>
              setNetworkData((prev) => ({ ...prev, type: "Public" }))
            }
          >
            <Text
              style={
                networkData?.type === "Public"
                  ? styles.selectedTypeText
                  : styles.typeText
              }
            >
              Public
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.typeButton,
              networkData?.type === "Private" && styles.selectedType,
            ]}
            onPress={() =>
              setNetworkData((prev) => ({ ...prev, type: "Private" }))
            }
          >
            <Text
              style={
                networkData?.type === "Private"
                  ? styles.selectedTypeText
                  : styles.typeText
              }
            >
              Private
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Only Professional Emails:</Text>
          <Switch
            value={networkData?.OnlyProfEmails}
            onValueChange={toggleSwitch}
            trackColor={{ false: "#767577", true: COLORS.secondary }}
            thumbColor={networkData?.OnlyProfEmails ? "#FFF" : "#FFF"}
          />
        </View>
        <Text style={styles.label}>Size</Text>
        <TextInput
          style={styles.input}
          value={networkData?.size}
          onChangeText={(text) =>
            setNetworkData((prev) => ({ ...prev, size: text }))
          }
          keyboardType="numeric"
          placeholder="Network Size"
        />

        <Text style={styles.label}>Radius (meters)</Text>
        <TextInput
          style={styles.input}
          value={networkData?.radius}
          onChangeText={(text) =>
            setNetworkData((prev) => ({ ...prev, radius: text }))
          }
          keyboardType="numeric"
          placeholder="Network Radius"
        />

        <Text style={styles.label}>Start Date</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowStartDate(true)}
        >
          <Text>{networkData?.startDate.toLocaleDateString()}</Text>
        </TouchableOpacity>

        <Text style={styles.label}>End Date</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowEndDate(true)}
        >
          <Text>{networkData?.endDate.toLocaleDateString()}</Text>
        </TouchableOpacity>

        {(showStartDate || showEndDate || showRenewalDate) && (
          <DateTimePicker
            value={
              showStartDate
                ? networkData?.startDate
                : showEndDate
                ? networkData?.endDate
                : networkData?.renewalPoint || new Date()
            }
            mode="date"
            onChange={(event, date) => {
              if (showStartDate) handleDateChange(event, date, "start");
              if (showEndDate) handleDateChange(event, date, "end");
              if (showRenewalDate) handleDateChange(event, date, "renewal");
            }}
          />
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.DefaultButton}
            onPress={handleUpdate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Update Network</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FCFF",
    paddingHorizontal: 20,
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  typeContainer: {
    flexDirection: "row",
    marginBottom: 15,
  },
  typeButton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  selectedType: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  typeText: {
    color: "#000",
  },
  selectedTypeText: {
    color: "#fff",
  },
  dateButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  buttonContainer: {
    marginTop: 20,
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
});

export default EditNetwork;
