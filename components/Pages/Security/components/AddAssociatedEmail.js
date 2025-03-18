import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { logout, updateUserData } from "../../../redux/slices/authSlice";
import { COLORS, FONTS } from "../../../../theme";
import { createStackNavigator } from "@react-navigation/stack";
import CodeInput from "../../authScreen/components/signupScreens/CodeInput";
import { useNavigation } from "@react-navigation/native";
const Stack = createStackNavigator();
import Ionicons from "@expo/vector-icons/Ionicons";

export default function AddAssociatedEmail() {
  const navigate = useNavigation();
  const dispatch = useDispatch();
  const User = useSelector((state) => state.auth.user);
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(null);
  const [isValidEmail, setIsValidEmail] = useState(true);
  const PreviousWorkEmails = User.user.associatedEmails.filter(
    (email) => email.OrgId === ""
  );
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
      Alert.alert("Error", "Please enter your email");
      return;
    }
    if (!email.includes("@")) {
      Alert.alert("Error", "Please enter a valid email");
      return;
    }
    if (!isValidEmail) {
      Alert.alert("Error", "Please enter a valid work email");
      return;
    }
    setLoading(true);
    const otpSent = await sendOTP();
    if (!otpSent) {
      setLoading(false);
      return;
    }

    navigate.navigate("Add Work Email", { screen: "OTP" });
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

      if (
        response.status === 200 &&
        response.data.message === "OTP verified successfully"
      ) {
        return true;
      } else {
        Alert.alert(
          "Error",
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

      Alert.alert("Error", errorMessage);
      return false;
    }
  };
  const finalizeSignUp = async () => {
    const verified = await verifyOTP();

    if (verified) {
      const EmailChanged = await handleUpdate();
      if (EmailChanged) {
        navigate.navigate("Add Work Email", { screen: "Main" });
      }
    } else {
      Alert.alert("Error", "OTP verification failed");
    }
  };
  const handleUpdate = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_PROFILE_API}/manualAddWorkEmail/${User.user._id}`,
        {
          associatedEmail: {
            email: email,
            OrgId: "",
          },
        },
        {
          headers: {
            Authorization: `Bearer ${User.Token}`, // Add the token to the Authorization header
          },
        }
      );

      setLoading(false);
      dispatch(updateUserData(response.data));
      Alert.alert("Success", response.data.message);
      return true;
    } catch (error) {
      setLoading(false);
      if (error.status == 401) {
        dispatch(logout());
      }
      console.error("Error updating profile:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "An error occurred while updating the profile"
      );
    }
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

  return (
    <Stack.Navigator
      initialRouteName="Main"
      screenOptions={{
        headerShown: false,
        headerStyle: styles.return,
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
            setIsValidEmail={setIsValidEmail}
            validateEmail={validateEmail}
            PreviousWorkEmails={PreviousWorkEmails}
            User={User}
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
const Main = ({
  email,
  setEmail,
  loading,
  handleUpdate,
  setIsValidEmail,
  validateEmail,
  PreviousWorkEmails,
  User,
}) => {
  const dispatch = useDispatch();

  const deleteWorkEmail = async (ID) => {
    try {
      const response = await axios.delete(
        `${process.env.EXPO_PUBLIC_PROFILE_API}/deleteWorkEmail/${User.user._id}`,
        {
          headers: {
            Accept: "application/json",
            "Accept-Language": "en",
            "Content-Type": "application/json",
            authorization: `Bearer ${User.Token}`,
          },
          data: { workEmailId: ID },
        }
      );

      if (response.status === 200) {
        dispatch(updateUserData(response.data.user));
      }
    } catch (error) {
      if (error.status == 401) {
        dispatch(logout());
      }
      console.log(error);
      Alert.alert("Error", error.message);
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.inputsWrapper}>
        <TextInput
          style={styles.input}
          placeholder="Enter Work Email"
          value={email}
          onChangeText={(value) => {
            setEmail(value);
            setIsValidEmail(validateEmail(value));
          }}
          editable={!loading}
        />
      </View>
      <ScrollView style={styles.PreviousWorkEmails}>
        <Text style={styles.Header}>Previous Work Emails</Text>
        <Text>emails associated with an Organization can not be deleted</Text>
        {PreviousWorkEmails?.map((email, index) => (
          <View key={index} style={styles.emailCard}>
            <Text> {email.email}</Text>
            <TouchableOpacity
              onPress={() => {
                deleteWorkEmail(email._id);
              }}
            >
              <Ionicons
                name="trash-outline"
                size={24}
                color={COLORS.secondary}
                style={styles.icon}
              />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
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
    paddingHorizontal: 10,
  },
  screenContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 0,
  },
  Error: {
    color: "red",
    textAlign: "center",
    fontSize: FONTS.medium,
    fontFamily: FONTS.familyBold,
  },
  PreviousWorkEmails: {
    marginTop: 20,
    marginBottom: 20,
    display: "flex",
    flexDirection: "column",

    gap: 10,
    width: "100%",
    paddingLeft: 20,
    flex: 2,
  },
  emailCard: {
    borderWidth: 1,
    borderColor: COLORS.borders,
    borderRadius: 10,
    display: "flex",
    padding: 20,
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center", // Add this to vertically align the icon and text
    width: "95%", // Ensure the container takes up full width
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
