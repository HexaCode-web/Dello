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
import SettingSection from "../../GeneralComponents/SettingSection";
import TopBar from "../../GeneralComponents/TopBar";

const settingsStack = createStackNavigator();
export default function Security() {
  const navigation = useNavigation();

  return (
    <settingsStack.Navigator
      screenOptions={{
        headerShown: false,
        headerStyle: styles.return,
        cardStyle: styles.container,
      }}
      initialRouteName="Main"
      detachInactiveScreens={true}
    >
      <settingsStack.Screen name="Main" component={Main} />
      <settingsStack.Screen
        name="Change Password"
        options={({ navigation, route }) => ({
          headerShown: true,
          title: "",
          headerLeft: () => (
            <TopBar
              Title={route.name}
              returnTarget={{ name: "Security", params: { screen: "Main" } }}
              hasReturnButton={true}
            />
          ), // Dynamic title based on screen name
        })}
      >
        {(props) => <ChangePassword {...props} navigation={navigation} />}
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
    <ScrollView style={styles.settingsContainer}>
      <TopBar
        Title="Security"
        returnTarget={{ name: "Home" }}
        hasReturnButton={true}
      />

      <SettingSection
        title="Change Password"
        onPress={() => navigation.navigate("Change Password")}
      />
      <SettingSection
        title="Change Email"
        onPress={() => navigation.navigate("Change Email")}
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
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FCFF",

    paddingTop: 20,
  },
  settingsContainer: {
    flex: 1,
    backgroundColor: "#F5FCFF",

    paddingBottom: 20,
    color: "black",
    backgroundColor: "#F5FCFF",
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
