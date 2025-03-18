import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";

import React, { useState } from "react";
import { COLORS, FONTS } from "../../../../theme";
import { useSelector } from "react-redux";
import DropdownSlider from "../../../GeneralComponents/DropdownSlider";

export default function Screen2({
  onChangeEmailFunction,
  userInfo,
  setActiveInnerPage,
  setErrorInForm,
}) {
  const [isValidEmail, setIsValidEmail] = useState(true);
  const User = useSelector((state) => state.auth.user);
  const unusedEmails = User.user.associatedEmails.filter(
    (email) => email.OrgId === ""
  );

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
      {unusedEmails.length > 0 && (
        <View style={styles.textWrapper}>
          <Text style={styles.text}>
            we found associated Email{unusedEmails.length > 1 ? "s" : ""} that
            aren't attached to any Organization.
          </Text>
          <Text style={styles.text}>
            Please choose one of them or add a new one
          </Text>
        </View>
      )}
      {unusedEmails.length > 0 && (
        <DropdownSlider
          data={unusedEmails.map((email) => email.email)}
          placeholder="Select Email"
          onSelect={(item) => handleEmailChange(item)}
        />
      )}
      <View style={styles.inputsWrapper}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            onChangeText={(value) => handleEmailChange(value)}
            value={userInfo.orgEmailId}
            placeholder="Add a new Organization Email"
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
  },
  inputsWrapper: {
    flex: 1,
  },
  input: {
    height: 50,

    margin: 12,
    borderWidth: 1,
    padding: 10,
    fontSize: FONTS.medium,
    fontFamily: FONTS.familyBold,
    borderRadius: 30,
  },
  Header: {
    fontSize: FONTS.large,
    fontFamily: FONTS.familyBold,
  },
  text: {
    textAlign: "left",
    fontSize: FONTS.medium,
    fontFamily: FONTS.familyBold,
  },
  signUpPromptText: {
    fontSize: FONTS.medium,
    fontFamily: FONTS.familyLight,
    color: COLORS.textSecondary,
  },
  textWrapper: {
    display: "flex",
    padding: 20,
    gap: 10,
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
