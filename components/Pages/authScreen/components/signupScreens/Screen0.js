import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { COLORS, FONTS } from "../../../../../theme";
import React, { useState } from "react";

export default function Screen0({
  onChangeEmailFunction,
  userInfo,
  setActiveScreen,
  setActiveInnerPage,
  setErrorInForm,
}) {
  const [isValidEmail, setIsValidEmail] = useState(true);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  const handleEmailChange = (input) => {
    onChangeEmailFunction(input);
    setIsValidEmail(validateEmail(input)); // Update validation status
  };
  return (
    <>
      <View style={styles.textWrapper}>
        <Text style={styles.Header}>Sign up</Text>
        <Text style={styles.signUpPromptText}>
          enter your email and password to sign up
        </Text>
      </View>
      <View style={styles.inputsWrapper}>
        <View style={styles.inputWrapper}>
          <Text style={styles.signUpPromptText}>Email</Text>
          <TextInput
            style={styles.input}
            onChangeText={(value) => handleEmailChange(value)}
            value={userInfo.Email}
          />
        </View>
      </View>
      <View style={styles.buttonWrapper}>
        <View style={styles.signUpPrompt}>
          <Text style={styles.signUpPromptText}>already have an account?</Text>
          <TouchableOpacity style={styles.signUpPromptBtn}>
            <Text
              style={styles.buttonTextEmpty}
              onPress={() => {
                setActiveScreen("SignIn");
              }}
            >
              Sign in
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={() => {
            if (isValidEmail && userInfo.Email != "") {
              setActiveInnerPage(1);
              setErrorInForm("");
            } else {
              setErrorInForm("must be a valid email address");
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
  inputsWrapper: {
    flex: 1,
  },
  textWrapper: {
    marginBottom: 20,
    marginLeft: 5,
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    gap: 10,
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
