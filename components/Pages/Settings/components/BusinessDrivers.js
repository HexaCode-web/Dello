import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";

import axios from "axios";
import { useSelector } from "react-redux";
import { PROFILE_API } from "@env";
import { COLORS, FONTS } from "../../../../theme";

const BusinessDrivers = ({ data }) => {
  const User = useSelector((state) => state.auth.user);

  const [service, setService] = useState("");
  const [company, setCompany] = useState("");
  const [error, setError] = useState();

  const savePresentRoleDetails = async () => {
    if (service == "" || company == "") {
      setError("All fields are required");
      return;
    }
    setError("");
    const nextId =
      data.length > 0 ? Math.max(...data.map((obj) => obj.id)) + 1 : 1;
    let newData;
    if (data) {
      newData = {
        businessDrivers: [
          ...data,
          { clientName: company, serviceName: service, id: nextId },
        ],
      };
    } else {
      newData = {
        businessDrivers: [
          { clientName: company, serviceName: service, id: nextId },
        ],
      };
    }
    try {
      const response = await axios.post(
        `${PROFILE_API}/business-drivers/save_business_driver_details/${User.ID}`,
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
        setService("");
        setCompany("");
        setError("Saved");
      }
    } catch (error) {
      console.log(error);
      setError(error.message);
    }
  };
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>service/Product</Text>
      <TextInput
        style={styles.input}
        placeholder="service/Product"
        value={service}
        onChangeText={setService}
      />

      <Text style={styles.label}>Client Description</Text>
      <TextInput
        style={styles.input}
        placeholder="Some text here..."
        value={company}
        onChangeText={setCompany}
      />
      {error && <Text style={styles.Error}>{error}</Text>}

      <View style={styles.buttonWrapper}>
        <TouchableOpacity
          onPress={savePresentRoleDetails}
          style={styles.DefaultButton}
        >
          <Text style={styles.buttonText}>Add</Text>
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

export default BusinessDrivers;
