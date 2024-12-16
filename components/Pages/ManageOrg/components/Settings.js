import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { COLORS, FONTS } from "../../../../theme";
import { useSelector } from "react-redux";
import { useState } from "react";
import axios from "axios";
export default function Settings(orgId) {
  const User = useSelector((state) => state.auth.user);
  const [invitedUser, setInvitedUser] = useState(null);
  const [error, setError] = useState();
  const isProfessionalEmail = (email) => {
    const freeEmailProviders = [
      "gmail.com",
      "yahoo.com",
      "hotmail.com",
      "outlook.com",
      "aol.com",
      "icloud.com",
    ];
    const emailDomain = email.split("@")[1];
    return !freeEmailProviders.includes(emailDomain);
  };

  const inviteUser = async () => {
    if (invitedUser == "") {
      setError("Invited User Email is required");
      return;
    }
    if (!isProfessionalEmail(invitedUser)) {
      setError("Please enter a professional email address");
      return;
    }
    // send invitation to invitedUser
    try {
      const url = `/addAssociatedEmail/:userId/${invitedUser}`;
    } catch (error) {
      console.log(error);
      setError(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Settings</Text>
      <View style={styles.listContainer}>
        <Text style={styles.header}>Add Admin</Text>
        <Text style={styles.info}>Add Admin to your Organization</Text>
        <View style={styles.inputArea}>
          <Text style={styles.label}>Invited UserEmail</Text>
          <TextInput
            style={styles.input}
            value={invitedUser}
            onChangeText={setInvitedUser}
          />

          {error && <Text style={styles.Error}>{error}</Text>}

          <View style={styles.buttonWrapper}>
            <TouchableOpacity style={styles.DefaultButton} onPress={inviteUser}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 50,
    justifyContent: "space-between",
    color: "black",
  },
  inputArea: {
    margin: 50,
  },
  header: {
    fontSize: FONTS.large,
    fontFamily: FONTS.familyBold,
    color: COLORS.secondary,
  },
  listContainer: {
    height: 300,
    alignItems: "center", // Centers the cards horizontally
    justifyContent: "space-between",
  },
  info: {
    fontSize: 14,
    color: "#555",
  },
  label: {
    fontSize: FONTS.medium,
    fontFamily: FONTS.familyBold,
    color: "#333",
    marginBottom: 5,
  },
  input: {
    borderWidth: 0,
    borderBottomWidth: 1,
    borderColor: COLORS.borders,
    padding: 10,
    fontSize: FONTS.medium,
    borderRadius: 5,
    marginBottom: 20,
  },
  datePickerContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonWrapper: {
    width: "100%",

    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginBottom: 10,
    gap: 20,
    marginTop: 80,
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
    textAlign: "center",
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
    margin: "auto",
  },
  Error: {
    color: "black",
    textAlign: "center",
    fontSize: FONTS.medium,
    fontFamily: FONTS.familyBold,
  },
});
