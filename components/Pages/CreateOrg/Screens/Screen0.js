import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import DropdownSlider from "../../../GeneralComponents/DropdownSlider";
import { COLORS, FONTS } from "../../../../theme";

export default function Screen0({
  userInfo,
  onChangeOrgName,
  setActiveInnerPage,
  setErrorInForm,
  setOrgType,
  onChangeOrgOfficeName,
}) {
  const typeData = [
    "Financial Services",
    "Software Services",
    "Legal Services",
    "Sports Services",
  ];

  return (
    <>
      <View style={styles.inputsWrapper}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            onChangeText={(value) => onChangeOrgName(value)}
            value={userInfo.orgName}
            placeholder="Organization name"
          />
        </View>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            onChangeText={(value) => onChangeOrgOfficeName(value)}
            value={userInfo.officeName}
            placeholder="Organization Office Name"
          />
        </View>
        <DropdownSlider
          data={typeData}
          placeholder={userInfo.type ? userInfo.type : "Select Type"}
          onSelect={(item) => setOrgType(item)}
        />
      </View>
      <View style={styles.buttonWrapper}>
        <TouchableOpacity
          onPress={() => {
            if (userInfo.orgName.length === 0) {
              setErrorInForm("Organization name is required");
              return;
            }
            setActiveInnerPage(1);
            setErrorInForm("");
          }}
          style={styles.DefaultButton}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  inputWrapper: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  inputsWrapper: {
    flex: 1,
  },
  input: {
    height: 50,
    width: "95%",
    margin: 12,
    borderWidth: 1,
    padding: 10,
    fontSize: FONTS.medium,
    fontFamily: FONTS.familyBold,

    borderRadius: 30,
  },
  Header: {
    width: "100%",
    fontSize: FONTS.large,
    fontFamily: FONTS.familyBold,
    marginBottom: 10,
  },
  textWrapper: {
    marginBottom: 20,
    marginLeft: 40,
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    width: "100%",
    gap: 10,
  },
  signUpPromptText: {
    fontSize: FONTS.medium,
    fontFamily: FONTS.familyLight,

    color: COLORS.textSecondary,
  },
  buttonWrapper: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginBottom: 10,
    gap: 20,
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
});
