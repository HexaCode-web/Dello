import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import React, { useState, useEffect } from "react";
import axios from "axios";
import AntDesign from "@expo/vector-icons/AntDesign";
import Screen0 from "./signupScreens/Screen0";
import Screen1 from "./signupScreens/Screen1";
import Screen2 from "./signupScreens/Screen2";
import Screen3 from "./signupScreens/Screen3";
import Screen4 from "./signupScreens/Screen4";
import { useGetLocation } from "../../../hooks/getLocation";
import { COLORS, FONTS } from "../../../../theme";
import { createStackNavigator } from "@react-navigation/stack";
const Stack = createStackNavigator();

export default function Signup({ navigation }) {
  const [location, error] = useGetLocation();

  const [userInfo, setUserInfo] = useState({
    Email: "",
    Password: "",
    ConfirmPassword: "",
    FirstName: "",
    LastName: "",
    OTP: "",
    Address: "",
    DOB: null,
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setUserInfo((prev) => ({ ...prev, DOB: selectedDate }));
    }
  };
  const onChangeEmail = (value) => {
    setUserInfo((prev) => {
      return { ...prev, Email: value };
    });
  };
  const onChangePassword = (value) => {
    setUserInfo((prev) => {
      return { ...prev, Password: value };
    });
  };
  const onChangeOTP = (value) => {
    setUserInfo((prev) => {
      return { ...prev, OTP: value };
    });
  };
  const onChangeConfirmPassword = (value) => {
    setUserInfo((prev) => {
      return { ...prev, ConfirmPassword: value };
    });
  };
  const onChangeFirstName = (value) => {
    setUserInfo((prev) => {
      return { ...prev, FirstName: value };
    });
  };
  const onChangeAddress = (value) => {
    setUserInfo((prev) => {
      return { ...prev, Address: value };
    });
  };
  const onChangeLastName = (value) => {
    setUserInfo((prev) => {
      return { ...prev, LastName: value };
    });
  };

  const sendOTP = async () => {
    const config = {
      method: "post",
      url: `${process.env.EXPO_PUBLIC_AUTH_API}/send-Otp`,
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        email: userInfo.Email,
      },
    };
    axios(config)
      .then((response) => {
        Alert.alert("OTP sent successfully");
      })
      .catch((error) => {
        console.log(error);

        const errorMessage = error.response
          ? error.response.data.message || "OTP verification failed"
          : error.message;
        Alert.alert(errorMessage);
      });
  };

  const verifyOTP = async () => {
    try {
      const config = {
        method: "post",
        url: `${process.env.EXPO_PUBLIC_AUTH_API}/verify-Otp`,
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          email: userInfo.Email,
          sentOTP: userInfo.OTP,
        },
      };

      const response = await axios(config);

      // Check for successful OTP verification using the message in the response
      if (
        response.status === 200 &&
        response.data.message === "OTP verified successfully"
      ) {
        return true;
      } else {
        Alert.alert(
          response.data.message || "Unexpected error during OTP verification"
        );
        return false;
      }
    } catch (error) {
      console.log(error);

      const errorMessage = error.response
        ? error.response.data.message || "OTP verification failed"
        : error.message;

      Alert.alert(errorMessage);
      return false;
    }
  };

  const signUp = async () => {
    try {
      const config = {
        method: "post",
        url: `${process.env.EXPO_PUBLIC_AUTH_API}/register`,
        headers: {
          "Accept-Language": "en",
          "Content-Type": "application/json",
        },
        data: {
          email: userInfo.Email,
          FirstName: userInfo.FirstName,
          LastName: userInfo.LastName,
          password: userInfo.Password,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          DOB: userInfo.DOB,
          Address: userInfo.Address,
        },
      };

      const response = await axios(config);

      if (response.status === 200) {
        return true;
      } else {
        Alert.alert(
          response.data.message || "Unexpected error during Registration"
        );
        return false;
      }
    } catch (error) {
      console.log(error);

      const errorMessage = error.response
        ? error.response.data.message || "Registration failed"
        : error.message;

      Alert.alert(errorMessage);
      return false;
    }
  };
  const finalizeSignUp = async () => {
    const verified = await verifyOTP();

    if (verified) {
      const SignedUp = await signUp();
      if (SignedUp) {
        navigation.navigate("Signup", { screen: "Screen4" });
      } else {
        Alert.alert("Error while signing up");
      }
    } else {
      Alert.alert("OTP verification failed");
    }
  };

  return (
    <Stack.Navigator
      initialRouteName="Screen0"
      screenOptions={{
        headerShown: false,
        headerStyle: styles.return,
        cardStyle: styles.container,
      }}
    >
      <Stack.Screen
        name="Screen0"
        options={({ navigation }) => ({
          headerShown: true,
          title: "",
          headerLeft: () => (
            <TouchableOpacity
              style={styles.return}
              onPress={() => navigation.navigate("Greeting")}
            >
              <AntDesign name="arrowleft" size={34} color="black" />
            </TouchableOpacity>
          ),
        })}
      >
        {(props) => (
          <Screen0
            {...props}
            onChangeEmail={onChangeEmail}
            userInfo={userInfo}
            navigation={navigation}
          />
        )}
      </Stack.Screen>
      <Stack.Screen
        name="Screen1"
        options={({ navigation }) => ({
          headerShown: true,
          title: "",
          headerLeft: () => (
            <TouchableOpacity
              style={styles.return}
              onPress={() =>
                navigation.navigate("Signup", { screen: "Screen0" })
              }
            >
              <AntDesign name="arrowleft" size={34} color="black" />
            </TouchableOpacity>
          ),
        })}
      >
        {(props) => (
          <Screen1
            {...props}
            userInfo={userInfo}
            onChangePassword={onChangePassword}
            onChangeConfirmPassword={onChangeConfirmPassword}
            navigation={navigation}
          />
        )}
      </Stack.Screen>
      <Stack.Screen
        name="Screen2"
        options={({ navigation }) => ({
          headerShown: true,
          title: "",
          headerLeft: () => (
            <TouchableOpacity
              style={styles.return}
              onPress={() =>
                navigation.navigate("Signup", { screen: "Screen1" })
              }
            >
              <AntDesign name="arrowleft" size={34} color="black" />
            </TouchableOpacity>
          ),
        })}
      >
        {(props) => (
          <Screen2
            {...props}
            userInfo={userInfo}
            onChangeFirstName={onChangeFirstName}
            onChangeAddress={onChangeAddress}
            onChangeLastName={onChangeLastName}
            navigation={navigation}
            showDatePicker={showDatePicker}
            onDateChange={onDateChange}
            setShowDatePicker={setShowDatePicker}
            sendOTP={sendOTP}
          />
        )}
      </Stack.Screen>
      <Stack.Screen
        name="Screen3"
        options={({ navigation }) => ({
          headerShown: true,
          title: "",
          headerLeft: () => (
            <TouchableOpacity
              style={styles.return}
              onPress={() =>
                navigation.navigate("Signup", { screen: "Screen2" })
              }
            >
              <AntDesign name="arrowleft" size={34} color="black" />
            </TouchableOpacity>
          ),
        })}
      >
        {(props) => (
          <Screen3
            {...props}
            sendOTP={sendOTP}
            finalizeSignUp={finalizeSignUp}
            onChangeOTP={onChangeOTP}
            navigation={navigation}
          />
        )}
      </Stack.Screen>
      <Stack.Screen
        name="Screen4"
        options={({ navigation }) => ({
          headerShown: true,
          title: "",
          headerLeft: () => (
            <TouchableOpacity
              style={styles.return}
              onPress={() => navigation.navigate("Greeting")}
            >
              <AntDesign name="arrowleft" size={34} color="black" />
            </TouchableOpacity>
          ),
        })}
      >
        {(props) => <Screen4 {...props} userInfo={userInfo} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FCFF",
    paddingTop: 30,
    alignItems: "center",
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
    height: 100,
    shadowColor: "white",
    backgroundColor: "#F5FCFF",
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
