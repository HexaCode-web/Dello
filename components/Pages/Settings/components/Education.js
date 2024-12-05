import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Feather } from "@expo/vector-icons";
import axios from "axios";
import { useSelector } from "react-redux";
import { PROFILE_API } from "@env";
import { COLORS, FONTS } from "../../../../theme";

const Education = (data) => {
  const User = useSelector((state) => state.auth.user);
  const Data = data.data;

  const [degreeName, setDegreeName] = useState("");
  const [instituteName, setInstituteName] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [error, setError] = useState();
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };
  const savePresentRoleDetails = async () => {
    if (degreeName == "" || instituteName == "" || date == "") {
      setError("All fields are required");
      return;
    }

    const nextId =
      Data.length > 0 ? Math.max(...Data.map((obj) => obj.id)) + 1 : 1;

    const newData = {
      educationDTO: [
        ...Data,
        {
          degreeName: degreeName,
          instituteName: instituteName,
          educationStartDate: date,
          id: nextId,
        },
      ],
    };

    setError("");
    try {
      const response = await axios.post(
        `${PROFILE_API}/education/save_education_details/${User.ID}`,
        newData,
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
        setError("Saved");
      }
    } catch (error) {
      console.log(error);
      setError(error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Degree</Text>
      <TextInput
        style={styles.input}
        value={degreeName}
        onChangeText={setDegreeName}
      />

      <Text style={styles.label}>institution</Text>
      <TextInput
        style={styles.input}
        value={instituteName}
        onChangeText={setInstituteName}
      />

      <Text style={styles.label}>When</Text>
      <View style={styles.datePickerContainer}>
        <TextInput
          style={styles.input}
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
      {error && <Text style={styles.Error}>{error}</Text>}

      <View style={styles.buttonWrapper}>
        <TouchableOpacity
          onPress={savePresentRoleDetails}
          style={styles.DefaultButton}
        >
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "95%",
    marginHorizontal: "auto",
    padding: 20,
    backgroundColor: "white",
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

export default Education;
