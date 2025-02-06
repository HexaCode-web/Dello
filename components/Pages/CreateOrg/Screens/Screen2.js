import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";

import React, { useState } from "react";
import { COLORS, FONTS } from "../../../../theme";

export default function Screen2({
  onChangeEmailFunction,
  userInfo,
  setActiveInnerPage,
  setErrorInForm,
}) {
  const [isValidEmail, setIsValidEmail] = useState(true);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // List of common free email domains
    const freeEmailDomains = [
      "gmail.com",
      "yahoo.com",
      "outlook.com",
      "hotmail.com",
      "aol.com",
      "icloud.com",
      "mail.com",
      "protonmail.com",
    ];

    // Extract the domain part of the email
    const domain = email.split("@")[1];

    // Check if the email is valid and not from a free domain
    return emailRegex.test(email) && !freeEmailDomains.includes(domain);
  };

  const handleEmailChange = (input) => {
    onChangeEmailFunction(input);
    setIsValidEmail(validateEmail(input)); // Update validation status
  };
  return (
    <>
      <View style={styles.textWrapper}></View>
      <View style={styles.inputsWrapper}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            onChangeText={(value) => handleEmailChange(value)}
            value={userInfo.orgEmailId}
            placeholder="Organization Email"
          />
        </View>
      </View>

      <View style={styles.buttonWrapper}>
        <TouchableOpacity
          onPress={() => {
            if (isValidEmail && userInfo.orgEmailId != "") {
              setActiveInnerPage(3);
              setErrorInForm("");
            } else {
              setErrorInForm("must be a professional email address");
            }
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
  inputsWrapper: {
    flex: 1,
    width: "90%",
  },
  textWrapper: {
    marginBottom: 20,
    marginLeft: 5,
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    gap: 10,
    width: "90%",
  },
  Header: {
    fontSize: FONTS.large,
    fontFamily: FONTS.familyBold,
    marginRight: "auto",
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
    width: "90%",
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
  buttonTextEmpty: {
    fontSize: FONTS.medium,
    fontFamily: FONTS.familyBold,
    color: COLORS.secondary,
  },
  buttonText: {
    fontSize: FONTS.medium,
    fontFamily: FONTS.familyBold,
    color: "white",
  },
});
