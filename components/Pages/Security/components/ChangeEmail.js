import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { logout, updateUserData } from "../../../redux/slices/authSlice";
import { COLORS, FONTS } from "../../../../theme";
import { createStackNavigator } from "@react-navigation/stack";
import CodeInput from "../../authScreen/components/signupScreens/CodeInput";
import { useNavigation } from "@react-navigation/native";
const Stack = createStackNavigator();

export default function ChangeEmail() {
  const navigate = useNavigation();
  const dispatch = useDispatch();
  const User = useSelector((state) => state.auth.user);
  const [email, setEmail] = useState(User.user.email);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(null);
  const sendOTP = async () => {
    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_AUTH_API}/send-Otp`,
        { email },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      Alert.alert("OTP sent successfully");
      return true; // Indicate success
    } catch (error) {
      if (error.status == 401) {
        dispatch(logout());
      }
      const errorMessage = error.response
        ? error.response.data.message || "OTP verification failed"
        : error.message;
      Alert.alert(errorMessage);
      return false; // Indicate failure
    }
  };
  const onChangeOTP = (value) => {
    setOtp(value);
  };
  const moveToSecondScreen = async () => {
    if (!email) {
      Alert.alert("Please enter your email");
      return;
    }
    if (!email.includes("@")) {
      Alert.alert("Please enter a valid email");
      return;
    }

    setLoading(true);
    const otpSent = await sendOTP();
    if (!otpSent) {
      setLoading(false);
      return;
    }

    navigate.navigate("Change Email", { screen: "OTP" });
    setLoading(false);
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
          email: email,
          sentOTP: otp,
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
      if (error.status == 401) {
        dispatch(logout());
      }
      const errorMessage = error.response
        ? error.response.data.message || "OTP verification failed"
        : error.message;

      Alert.alert(errorMessage);
      return false;
    }
  };
  const finalizeSignUp = async () => {
    const verified = await verifyOTP();

    if (verified) {
      const EmailChanged = await handleUpdate();
      if (EmailChanged) {
        navigate.navigate("Change Email", { screen: "Main" });
      }
    } else {
      Alert.alert("OTP verification failed");
    }
  };
  const handleUpdate = async () => {
    setLoading(true);
    try {
      const response = await axios.put(
        `${process.env.EXPO_PUBLIC_PROFILE_API}/updateProfile/${User.user._id}`,
        {
          updatedProfile: {
            email: email,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${User.Token}`, // Add the token to the Authorization header
          },
        }
      );

      setLoading(false);
      dispatch(updateUserData(response.data.user));
      Alert.alert("Success", response.data.message);
      return true;
    } catch (error) {
      if (error.status == 401) {
        dispatch(logout());
      }
      setLoading(false);
      console.error("Error updating profile:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "An error occurred while updating the profile"
      );
    }
  };
  return (
    <Stack.Navigator
      initialRouteName="Main"
      screenOptions={{
        headerShown: false,

        cardStyle: styles.container,
      }}
    >
      <Stack.Screen name="Main">
        {(props) => (
          <Main
            {...props}
            email={email}
            setEmail={setEmail}
            loading={loading}
            handleUpdate={moveToSecondScreen}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="OTP">
        {(props) => (
          <OTPVerification
            {...props}
            sendOTP={sendOTP}
            onChangeOTP={onChangeOTP}
            finalizeSignUp={finalizeSignUp}
            loading={loading}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
const Main = ({ email, setEmail, loading, handleUpdate }) => {
  return (
    <View style={styles.container}>
      <View style={styles.inputsWrapper}>
        <TextInput
          style={styles.input}
          placeholder="Enter Email"
          value={email}
          onChangeText={setEmail}
          editable={!loading}
        />
      </View>
      <TouchableOpacity
        style={styles.DefaultButton}
        onPress={handleUpdate}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Sending..." : "Send OTP"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
const OTPVerification = ({ sendOTP, onChangeOTP, finalizeSignUp, loading }) => {
  return (
    <>
      <View style={styles.textWrapper}>
        <Text style={styles.Header}>Verification</Text>
        <Text style={styles.signUpPromptText}>
          Please add the OTP Number sent to your email
        </Text>
      </View>
      <View style={styles.inputsWrapper}>
        <CodeInput onCodeChange={onChangeOTP} />
      </View>
      <View style={styles.signUpPrompt}>
        <Text style={styles.signUpPromptText}>Didn't receive code?</Text>
        <TouchableOpacity style={styles.signUpPromptBtn}>
          <Text
            style={styles.buttonTextEmpty}
            onPress={() => {
              sendOTP();
            }}
          >
            Resend now
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.buttonWrapper}>
        <TouchableOpacity
          onPress={() => {
            finalizeSignUp();
          }}
          style={styles.DefaultButton}
        >
          <Text style={styles.buttonText}>
            {loading ? "Updating..." : "Update Email"}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FCFF",
    alignItems: "center",
    paddingTop: 0,
    paddingBottom: 20,
  },
  screenContainer: {
    flex: 1,
    paddingTop: 0,
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
    backgroundColor: "#F5FCFF",
  },
  inputWrapper: {
    display: "flex",
    flexDirection: "column",
  },
  input: {
    height: 50,
    width: 350,
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
