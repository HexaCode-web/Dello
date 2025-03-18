import { View, StyleSheet, Text, TouchableOpacity, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import ChangePassword from "./components/ChangePassword";
import ChangeEmail from "./components/ChangeEmail";
import SettingSection from "../../GeneralComponents/SettingSection";
import TopBar from "../../GeneralComponents/TopBar";
import AddAssociatedEmail from "./components/AddAssociatedEmail";
import { logout } from "../../redux/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import Constants from "expo-constants";

const settingsStack = createStackNavigator();
export default function Security() {
  const navigation = useNavigation();

  return (
    <settingsStack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: styles.return,
        header: () => (
          <TopBar
            returnTarget={"Home"}
            hasReturnButton={true}
            Tabs={[
              { Name: "Profile", Page: "Profile" },
              { Name: "Settings", Page: "Profiles" },
              { Name: "Organisation", Page: "Organizations" },
            ]}
          />
        ),
        cardStyle: styles.container,
      }}
      initialRouteName="Main"
      detachInactiveScreens={true}
    >
      <settingsStack.Screen name="Main" component={Main} />
      <settingsStack.Screen name="Change Password">
        {(props) => <ChangePassword {...props} navigation={navigation} />}
      </settingsStack.Screen>
      <settingsStack.Screen name="Change Email">
        {(props) => <ChangeEmail {...props} navigation={navigation} />}
      </settingsStack.Screen>
      <settingsStack.Screen name="Add Work Email">
        {(props) => <AddAssociatedEmail {...props} navigation={navigation} />}
      </settingsStack.Screen>
    </settingsStack.Navigator>
  );
}
const Main = () => {
  const navigation = useNavigation();
  const User = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel", // This will dismiss the alert
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteAccount();
          },
        },
      ]
    );
  };

  const deleteAccount = async () => {
    try {
      console.log("Deleting account...");

      // Call your API or backend service to delete the account
      const response = await axios.delete(
        `${process.env.EXPO_PUBLIC_PROFILE_API}/delete/${User.user._id}`,
        {
          headers: {
            Authorization: `Bearer ${User.Token}`, // Assuming you have a user token
          },
        }
      );

      // Handle successful deletion
      if (response.status === 200) {
        console.log("Account deleted successfully");
        dispatch(logout());
      } else {
        console.error("Failed to delete account:", response.data.message);
        Alert.alert("Error", "Failed to delete account. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      if (error.status == 401) {
        dispatch(logout());
      }
      // Handle errors
      if (error.response) {
        Alert.alert("Error", error.response.data.message || "Server error");
      } else if (error.request) {
        Alert.alert("Error", "No response from server. Please try again.");
      } else {
        Alert.alert("Error", "An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <View style={styles.settingsContainer}>
      <SettingSection
        title="Change Password"
        onPress={() => navigation.navigate("Change Password")}
      />
      <SettingSection
        title="Change Email"
        onPress={() => navigation.navigate("Change Email")}
      />
      <SettingSection
        title="Add Work Email"
        onPress={() => navigation.navigate("Add Work Email")}
      />
      <SettingSection
        title="Set up MFA"
        onPress={() => navigation.navigate("Change Email")}
      />
      <TouchableOpacity
        style={[styles.section, styles.deleteSection]}
        onPress={handleDeleteAccount}
      >
        <Text style={[styles.sectionText, styles.deleteText]}>
          Delete Account
        </Text>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>
      <Text>version {Constants.expoConfig.version}</Text>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FCFF",

    paddingTop: 0,
    paddingBottom: 20,
    paddingHorizontal: 20,
    justifyContent: "space-between",
    color: "black",
  },

  return: {
    shadowColor: "white",
  },

  sectionText: {
    fontSize: 16,
    color: "#000",
  },
  section: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    margin: 15,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionText: {
    fontSize: 16,
    color: "#000",
  },
  arrow: {
    fontSize: 20,
    color: "#999",
  },

  deleteSection: {
    marginTop: 20,
  },
  deleteText: {
    color: "#FF3B30",
  },
});
