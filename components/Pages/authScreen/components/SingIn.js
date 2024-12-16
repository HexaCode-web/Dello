import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { AUTH_API } from "@env";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useGetLocation } from "../../../hooks/getLocation";
import { useDispatch } from "react-redux";
import { login } from "../../../redux/slices/authSlice";
import { COLORS, FONTS } from "../../../../theme";
export default function SignIn({ setActivePage }) {
  const dispatch = useDispatch();
  const [location, error] = useGetLocation();

  const [activeInnerPage, setActiveInnerPage] = useState(0);
  const [userInfo, setUserInfo] = useState({
    Email: "",
    userName: "abc",
    Password: "",
  });
  useEffect(() => {}, [userInfo]);
  const [errorInForm, setErrorInForm] = useState("");
  const onChangeEmail = (value) => {
    const username = value.split("@")[0]; // Get the part before '@'
    setUserInfo((prev) => {
      return { ...prev, Email: value, userName: username }; // Set both Email and userName
    });
  };

  const onChangePassword = (value) => {
    setUserInfo((prev) => {
      return { ...prev, Password: value };
    });
  };

  const navigation = () => {
    if (activeInnerPage === 0) {
      setActivePage("main");
    } else {
      setActiveInnerPage((prev) => prev - 1);
    }
    setErrorInForm("");
  };
  const Login = async () => {
    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_AUTH_API}/login`,
        {
          email: userInfo.Email,
          password: userInfo.Password,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201) {
        const UserData = {
          Token: response.data.token,
          ID: response.data.user._id,
          userName: response.data.user.name,
          user: { ...response.data.user },
        };
        dispatch(login(UserData));
        return true;
      } else {
        setErrorInForm(
          response.data.message || "Unexpected error during Login"
        );
        return false;
      }
    } catch (error) {
      console.log(error);

      const errorMessage = error.response
        ? error.response.data.message || "Login failed"
        : error.message;

      setErrorInForm(errorMessage);
      return false;
    }
  };
  const Continue = () => {
    if (activeInnerPage === 1) {
      setErrorInForm("");
      Login();
      return;
    }
    setActiveInnerPage((prev) => prev + 1);
  };
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.return}>
        <AntDesign
          name="arrowleft"
          size={36}
          color={COLORS.secondary}
          onPress={navigation}
        />
      </TouchableOpacity>
      <View style={styles.textWrapper}>
        <Text style={styles.Header}>Sign In</Text>
      </View>
      <View style={styles.inputsWrapper}>
        {activeInnerPage == 0 && (
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              onChangeText={onChangeEmail}
              placeholder="Email"
              value={userInfo.Email}
            />
          </View>
        )}
        {activeInnerPage === 1 && (
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Password"
              returnKeyType="go"
              secureTextEntry
              autoCorrect={false}
              style={styles.input}
              onChangeText={onChangePassword}
              value={userInfo.Password}
            />
          </View>
        )}
      </View>
      <View style={styles.buttonWrapper}>
        <TouchableOpacity onPress={Continue} style={styles.DefaultButton}>
          <Text style={styles.buttonText}>
            {activeInnerPage === 2 ? "Sign in" : "Continue"}
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
    backgroundColor: "white",
    alignItems: "center",
    paddingTop: 120,
    paddingBottom: 50,
    paddingHorizontal: 10,
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
  input: {
    height: 50,
    width: 300,
    margin: 12,
    borderWidth: 1,
    fontSize: FONTS.medium,
    fontFamily: FONTS.familyBold,
    borderRadius: 30,
    paddingLeft: 20,
  },
  inputsWrapper: {
    flex: 1,
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
    paddingLeft: 20,
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
