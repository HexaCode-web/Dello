import axios from "axios"; // Import axios if not already done
import { Alert } from "react-native"; // Import for showing alerts
import { useState } from "react";
import { Text, View, StyleSheet, TextInput } from "react-native";
import { COLORS, FONTS } from "../../../../theme";
import { TouchableOpacity } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

import { useGetLocation } from "../../../hooks/getLocation";

import DropdownInput from "../../../GeneralComponents/DropdownInput";
import { updateUserData } from "../../../redux/slices/authSlice";
import { useNavigation } from "@react-navigation/native";
export default function CreateNetwork({ orgId, setMainActivePage }) {
  const dispatch = useDispatch();
  const User = useSelector((state) => state.auth.user);
  const navigate = useNavigation();
  const [activePage, setActivePage] = useState(0);
  console.log(activePage);

  const [errorInForm, setErrorInForm] = useState("");
  const [location, error] = useGetLocation();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [network, setNetwork] = useState({
    name: "",
    startDate: new Date(),
    endDate: new Date(),
    type: "",
    size: 0,
    adminId: User.user._id,
    orgId: orgId,
    latitude: location?.coords.latitude,
    longitude: location?.coords.longitude,
    radius: 100,
  });

  const handleInputChange = (key, value) => {
    setNetwork((prev) => ({
      ...prev,
      [key]: value,
      latitude: location?.coords.latitude,
      longitude: location?.coords.longitude,
    }));
  };

  const validatePage = () => {
    if (activePage === 0 && !network.name) {
      setErrorInForm("Network name is required.");
      return false;
    }
    if (activePage === 1 && !network.startDate) {
      setErrorInForm("Start date is required.");
      return false;
    }
    if (network.endDate < network.startDate) {
      setErrorInForm("End date cant be before the start date.");
      return false;
    }
    if (activePage === 2 && !network.endDate) {
      setErrorInForm("End date can.");
      return false;
    }
    if (activePage === 3 && !network.type) {
      setErrorInForm("Network type is required.");
      return false;
    }
    if (activePage === 4 && !network.size) {
      setErrorInForm("size condition is required.");
      return false;
    }
    if (activePage === 5 && !network.radius) {
      setErrorInForm("radius condition is required.");
      return false;
    }
    setErrorInForm("");
    return true;
  };

  const Continue = () => {
    if (validatePage()) {
      if (activePage === 5) {
        createNetwork();
        setMainActivePage(0);
      } else {
        setActivePage((prev) => prev + 1);
      }
    }
  };

  const createNetwork = async () => {
    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_NETWORK_API}/addNetwork`,
        network,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${User.Token}`,
          },
        }
      );

      dispatch(updateUserData(response.data.user));

      Alert.alert("Success", "Network created successfully.");
      navigate.navigate("Home");
    } catch (error) {
      console.error(error);
      console.log(error);

      Alert.alert("Error", "Failed to create the network.");
    }
  };
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setNetwork((prev) => ({
        ...prev,
        startDate: selectedDate,
        endDate: selectedDate,
      }));
    }
  };
  const onDateChangeEnd = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setNetwork((prev) => ({ ...prev, endDate: selectedDate }));
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.inputsWrapper}>
        {activePage === 0 && (
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Network Name"
              value={network.name}
              onChangeText={(text) => handleInputChange("name", text)}
              style={styles.input}
            />
          </View>
        )}
        {activePage === 1 && (
          <>
            <Text style={styles.label}>Start Date</Text>
            <View style={styles.datePickerContainer}>
              <TextInput
                style={styles.input}
                value={network.startDate.toDateString()}
                editable={false}
              />
              <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <Feather name="calendar" size={24} color="gray" />
              </TouchableOpacity>
            </View>
            {showDatePicker && (
              <DateTimePicker
                value={network.startDate}
                mode="date"
                display="default"
                onChange={onDateChange}
              />
            )}
          </>
        )}
        {activePage === 2 && (
          <>
            <Text style={styles.label}>End Date</Text>
            <View style={styles.datePickerContainer}>
              <TextInput
                style={styles.input}
                value={network.endDate.toDateString()}
                editable={false}
              />
              <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <Feather name="calendar" size={24} color="gray" />
              </TouchableOpacity>
            </View>
            {showDatePicker && (
              <DateTimePicker
                value={network.endDate}
                mode="date"
                display="default"
                onChange={onDateChangeEnd}
              />
            )}
          </>
        )}
        {activePage === 3 && (
          <View style={styles.inputWrapper}>
            <Text style={styles.signUpPromptText}>Network Type</Text>
            <DropdownInput
              data={[
                { label: "Private", value: "Private" },
                { label: "Public", value: "Public" },
              ]}
              value={network.type}
              setValue={(text) => handleInputChange("type", text)}
            />
          </View>
        )}

        {activePage === 4 && (
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Network size"
              value={network.size}
              onChangeText={(text) => handleInputChange("size", text)}
              style={styles.input}
            />
          </View>
        )}
        {activePage === 5 && (
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Network radius"
              value={network.radius}
              onChangeText={(text) => handleInputChange("radius", text)}
              style={styles.input}
            />
          </View>
        )}
      </View>
      <View style={styles.buttonWrapper}>
        <TouchableOpacity onPress={Continue} style={styles.DefaultButton}>
          <Text style={styles.buttonText}>
            {activePage === 5 ? "Create Network" : "Continue"}
          </Text>
        </TouchableOpacity>
      </View>
      {errorInForm && <Text style={styles.Error}>{errorInForm}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FCFF",

    alignItems: "center",
  },
  Error: {
    color: "red",
    textAlign: "center",
    fontSize: FONTS.medium,
    fontFamily: FONTS.familyBold,
  },

  return: {
    position: "absolute",
    top: 40,
    left: 10,
    padding: 10,
    backgroundColor: "#F5FCFF",
  },
  inputWrapper: {
    display: "flex",
    flexDirection: "column",
  },
  input: {
    height: 50,
    width: 350,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    fontSize: FONTS.medium,
    fontFamily: FONTS.familyBold,
    borderRadius: 30,
  },
  datePickerContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  textWrapper: {
    marginBottom: 20,
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    gap: 10,
    width: "100%",
    paddingLeft: 20,
  },
  Header: {
    fontSize: FONTS.large,
    fontFamily: FONTS.familyBold,
  },
  signUpPrompt: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  signUpPromptText: {
    fontSize: FONTS.medium,
    fontFamily: FONTS.familyLight,

    color: COLORS.textSecondary,
  },
  signUpPromptBtn: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },

  buttonWrapper: {
    justifyContent: "center",
    alignItems: "center",
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
    gap: 20,
  },
  DefaultButton: {
    borderRadius: 30,
    height: 60,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: COLORS.secondary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 2,
    marginTop: "auto",
    minWidth: "90%",
  },

  buttonText: {
    fontSize: FONTS.medium,
    fontFamily: FONTS.familyBold,
    color: "white",
  },
});
