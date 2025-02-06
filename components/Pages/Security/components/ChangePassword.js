import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { COLORS, FONTS } from "../../../../theme";
export default function ChangePassword() {
  const dispatch = useDispatch();
  const User = useSelector((state) => state.auth.user);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!oldPassword.trim() || !newPassword.trim()) {
      Alert.alert("Validation Error", "Both Passwords are required");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put(
        `${process.env.EXPO_PUBLIC_PROFILE_API}/updatePassword/${User.user._id}`,
        {
          currentPassword: oldPassword,
          newPassword: newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${User.Token}`, // Add the token to the Authorization header
          },
        }
      );

      setLoading(false);
      Alert.alert("Success", response.data.message);
    } catch (error) {
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
    <View style={styles.container}>
      <View style={styles.inputsWrapper}>
        <TextInput
          style={styles.input}
          placeholder="Enter Old Password"
          value={oldPassword}
          onChangeText={setOldPassword}
          editable={!loading}
          secureTextEntry={true}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter New Password"
          value={newPassword}
          onChangeText={setNewPassword}
          editable={!loading}
          secureTextEntry={true}
        />
      </View>
      <TouchableOpacity
        style={styles.DefaultButton}
        onPress={handleUpdate}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Updating..." : "Update Password"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
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
