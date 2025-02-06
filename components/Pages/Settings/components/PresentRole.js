import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Feather } from "@expo/vector-icons";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { COLORS, FONTS } from "../../../../theme";
import { updateUserData } from "../../../redux/slices/authSlice";
import { useNavigation } from "@react-navigation/native";

const PresentRole = ({ data }) => {
  const navigation = useNavigation();
  const User = useSelector((state) => state.auth.user);

  const dispatch = useDispatch();
  const [position, setPosition] = useState(data.Position);
  const [company, setCompany] = useState(data.Company);
  const [date, setDate] = useState(
    data.StartDate ? new Date(data.StartDate) : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [error, setError] = useState();
  const [saved, setSaved] = useState(false); // State to track saved status

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };
  const savePresentRoleDetails = async () => {
    setSaved(false);
    if (position == "" || company == "" || date == "") {
      setError("All fields are required");
      return;
    }
    setError("");
    try {
      const response = await axios.put(
        `${process.env.EXPO_PUBLIC_PROFILE_API}/presentRole/update/${User.user._id}`,
        {
          updatedPresentRole: {
            Position: position,
            Company: company,
            StartDate: date,
          },
        },
        {
          headers: {
            Accept: "application/json",
            "Accept-Language": "en",
            "Content-Type": "application/json",
            Authorization: `Bearer ${User.Token}`,
          },
        }
      );
      if (response.status === 200) {
        dispatch(updateUserData(response.data.user));
        Alert.alert("Saved", "Saved");
        setSaved(true);
      }
    } catch (error) {
      console.log(error);
      setError(error.message);
      Alert.alert("Error", error.message);
      return;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Position</Text>
      <TextInput
        style={[styles.input, saved && { color: COLORS.secondary }]}
        placeholder="Add the position"
        value={position}
        onChangeText={setPosition}
      />

      <Text style={styles.label}>Company</Text>
      <TextInput
        style={[styles.input, saved && { color: COLORS.secondary }]}
        placeholder="Company"
        value={company}
        onChangeText={setCompany}
      />

      <Text style={styles.label}>From</Text>
      <View style={styles.datePickerContainer}>
        <TextInput
          style={[styles.input, saved && { color: COLORS.secondary }]}
          placeholder="Some text here..."
          value={date.toDateString()}
          editable={false}
        />
        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
          <Feather name="calendar" size={24} color="gray" />
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      <View style={styles.buttonWrapper}>
        <TouchableOpacity
          onPress={async () => {
            await savePresentRoleDetails();
            navigation.navigate("Settings", { screen: "Business Drivers" });
          }}
          style={styles.DefaultButton}
        >
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>

        {error && <Text style={styles.Error}>{error}</Text>}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "95%",
    marginHorizontal: "auto",
    padding: 20,
    backgroundColor: "#F5FCFF",

    gap: 20,
  },
  label: {
    fontSize: FONTS.medium,
    fontFamily: FONTS.familyBold,
    color: "#333",
    marginBottom: 5,
  },
  input: {
    borderWidth: 0,
    borderBottomWidth: 1,
    borderColor: COLORS.borders,
    padding: 10,
    fontSize: FONTS.medium,
    borderRadius: 5,
    marginBottom: 20,
  },
  datePickerContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonWrapper: {
    width: "100%",

    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginBottom: 10,
    gap: 20,
    marginTop: 80,
  },
  DefaultButton: {
    width: "90%",
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
  },
  buttonText: {
    fontSize: FONTS.medium,
    fontFamily: FONTS.familyBold,
    color: "white",
  },
  Error: {
    color: "black",
    textAlign: "center",
    fontSize: FONTS.medium,
    fontFamily: FONTS.familyBold,
  },
});

export default PresentRole;
