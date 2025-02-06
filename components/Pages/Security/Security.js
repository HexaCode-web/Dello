import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import react, { useCallback, useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import ChangePassword from "./components/ChangePassword";
import ChangeEmail from "./components/ChangeEmail";
import SettingSection from "../../GeneralComponents/SettingSection";
import TopBar from "../../GeneralComponents/TopBar";
import AddAssociatedEmail from "./components/AddAssociatedEmail";

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
            returnTarget={{ name: "Security", params: { screen: "Main" } }}
            hasReturnButton={true}
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

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
        },
      ]
    );
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
