import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import React, { useState, useEffect } from "react";
import axios from "axios";
import AntDesign from "@expo/vector-icons/AntDesign";

import { COLORS, FONTS } from "../../../theme";
import { useNavigation } from "@react-navigation/native";
import { ORG_API } from "@env";
import { useDispatch } from "react-redux";
import { loginOrg } from "../../redux/slices/authSlice";

export default function SignInOrg() {
  const navigation = useNavigation();
  const [isValidEmail, setIsValidEmail] = useState(true);

  const dispatch = useDispatch();
  const [activePage, setActivePage] = useState(1);
  const [userInfo, setUserInfo] = useState({
    orgEmailId: "",
    password: "",
  });

  const [errorInForm, setErrorInForm] = useState("");

  const onChangeEmail = (value) => {
    setIsValidEmail(validateEmail(value)); // Update validation status
    setUserInfo((prev) => {
      return { ...prev, orgEmailId: value };
    });
  };
  const onChangePassword = (value) => {
    setUserInfo((prev) => {
      return { ...prev, password: value };
    });
  };
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
  const handleInnerNavigation = () => {
    if (activePage > 1) {
      setActivePage((prev) => prev - 1);
    } else {
      navigation.navigate("Home");
    }
  };
  const handleNextAction = async () => {
    switch (activePage) {
      case 1:
        if (isValidEmail && userInfo.orgEmailId != "") {
          setActivePage((prev) => prev + 1);
          setErrorInForm("");
        } else {
          setErrorInForm("must be a professional email address");
        }
        break;
      case 2:
        if (userInfo.password.length >= 8) {
          const loggedIn = await ORGLogin();
          if (!loggedIn) {
            return;
          }
          navigation.navigate("Home");
          setActivePage(1);
        } else {
          setErrorInForm("Password must be at least 8 characters long");
        }
      default:
        break;
    }
  };
  const ORGLogin = async () => {
    // axios request to login organization
    try {
      const config = {
        method: "post",
        url: `${ORG_API}/auth/login`,
        headers: {
          "Accept-Language": "en",
          "Content-Type": "application/json",
        },
        data: {
          orgEmailId: userInfo.orgEmailId,
          adminEmailId: userInfo.orgEmailId,
          password: userInfo.password,
        },
      };
      const response = await axios(config);

      dispatch(
        loginOrg({
          organizationId: response.data.organizationId,
          token: response.data.token,
          userId: response.data.userId,
        })
      );
      if (response.data.message === "Organization login successful") {
        return true;
      }
    } catch (error) {
      const errorMessage = error.response
        ? error.response.data.message || "error while trying to log in"
        : error.message;
      setErrorInForm(errorMessage);
      return false;
    }
  };
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.return}>
        <AntDesign
          name="arrowleft"
          size={36}
          color={COLORS.secondary}
          onPress={handleInnerNavigation}
        />
      </TouchableOpacity>
      {activePage == 1 && (
        <View style={styles.inputsWrapper}>
          <View style={styles.inputWrapper}>
            <Text style={styles.signUpPromptText}> Organization Email:</Text>
            <TextInput
              style={styles.input}
              onChangeText={(value) => onChangeEmail(value)}
              value={userInfo.orgEmailId}
            />
          </View>
        </View>
      )}
      {activePage === 2 && (
        <View style={styles.inputsWrapper}>
          <View style={styles.inputWrapper}>
            <Text style={styles.signUpPromptText}>Password</Text>
            <TextInput
              placeholder="Password"
              returnKeyType="go"
              secureTextEntry
              autoCorrect={false}
              style={styles.input}
              onChangeText={(value) => onChangePassword(value)}
              value={userInfo.password}
            />
          </View>
        </View>
      )}
      <View style={styles.buttonWrapper}>
        <TouchableOpacity
          onPress={handleNextAction}
          style={styles.DefaultButton}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
      {errorInForm && <Text style={styles.Error}>{errorInForm}</Text>}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    paddingTop: 120,
    paddingBottom: 50,
    paddingHorizontal: 10,
    color: "black",
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
    backgroundColor: "white",
  },
  inputWrapper: {
    display: "flex",
    flexDirection: "column",
  },
  inputsWrapper: {
    flex: 1,
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
  Header: {
    width: "100%",
    fontSize: FONTS.large,
    fontFamily: FONTS.familyBold,
    marginBottom: 10,
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
