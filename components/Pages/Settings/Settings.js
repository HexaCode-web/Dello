import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { useCallback, useState } from "react";
import PresentRole from "./components/PresentRole";
import BusinessDrivers from "./components/BusinessDrivers";
import HighLights from "./components/HighLights";
import Skills from "./components/Skills";
import PreviousRoles from "./components/PreviousRoles";
import Education from "./components/Education";
import { useSelector } from "react-redux";
import { useFocusEffect } from "@react-navigation/native";
import ImmediateNeeds from "./components/ImmediateNeeds";
import { createStackNavigator } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import ChangeName from "./components/ChangeName";
import SettingSection from "../../GeneralComponents/SettingSection";
import TopBar from "../../GeneralComponents/TopBar";
const settingsStack = createStackNavigator();
export default function Settings() {
  const navigation = useNavigation();

  const User = useSelector((state) => state.auth.user);
  const [data, setData] = useState({
    presentRole: User.user.presentRole,
    businessDriver: User.user.businessDriver,
    highLight: User.user.highlights,
    education: User.user.education,
    previousRole: User.user.previousRole,
    skills: User.user.skills,
  });

  useFocusEffect(
    useCallback(() => {
      setData({
        presentRole: User.user.presentRole,
        businessDriver: User.user.businessDriver,
        highLight: User.user.highlights,
        education: User.user.education,
        previousRole: User.user.previousRole,
        skills: User.user.skills,
      });
    }, [User])
  );

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
      {/* Main Settings Screen */}
      <settingsStack.Screen name="Main" component={Main} />

      {/* <settingsStack.Screen
        name="Change Email"
        options={({ navigation, route }) => ({
          headerShown: true,
          title: "",
          headerLeft: () => <TopBar title={route.name} />, // Dynamic title based on screen name
        })}
      >
        {(props) => <ChangeEmail {...props} navigation={navigation} />}
      </settingsStack.Screen> */}
      {/* Present Role Screen */}
      <settingsStack.Screen
        name="Present Role"
        options={({ navigation, route }) => ({
          headerShown: true,
          title: "",
          headerLeft: () => (
            <TopBar
              Title={route.name}
              returnTarget={{ name: "Profile" }}
              hasReturnButton={true}
            />
          ),
        })}
      >
        {(props) => (
          <PresentRole
            {...props}
            data={data.presentRole}
            navigation={navigation}
          />
        )}
      </settingsStack.Screen>

      {/* Business Drivers Screen */}
      <settingsStack.Screen
        name="Business Drivers"
        options={({ navigation, route }) => ({
          headerShown: true,
          title: "",
          headerLeft: () => (
            <TopBar
              Title={route.name}
              returnTarget={{ name: "Profile" }}
              hasReturnButton={true}
            />
          ), // Dynamic title
        })}
      >
        {(props) => <BusinessDrivers {...props} navigation={navigation} />}
      </settingsStack.Screen>

      {/* Highlights Screen */}
      <settingsStack.Screen
        name="Highlights"
        options={({ navigation, route }) => ({
          headerShown: true,
          title: "",
          headerLeft: () => (
            <TopBar
              Title={route.name}
              returnTarget={{ name: "Profile" }}
              hasReturnButton={true}
            />
          ), // Dynamic title
        })}
      >
        {(props) => <HighLights {...props} navigation={navigation} />}
      </settingsStack.Screen>

      {/* Skills Screen */}
      <settingsStack.Screen
        name="Skills"
        options={({ navigation, route }) => ({
          headerShown: true,
          title: "",
          headerLeft: () => (
            <TopBar
              Title={route.name}
              returnTarget={{ name: "Profile" }}
              hasReturnButton={true}
            />
          ), // Dynamic title
        })}
      >
        {(props) => <Skills {...props} navigation={navigation} />}
      </settingsStack.Screen>

      {/* Previous Roles Screen */}
      <settingsStack.Screen
        name="Previous Roles"
        options={({ navigation, route }) => ({
          headerShown: true,
          title: "",
          headerLeft: () => (
            <TopBar
              Title={route.name}
              returnTarget={{ name: "Profile" }}
              hasReturnButton={true}
            />
          ), // Dynamic title
        })}
      >
        {(props) => <PreviousRoles {...props} navigation={navigation} />}
      </settingsStack.Screen>

      {/* Education Screen */}
      <settingsStack.Screen
        name="Education"
        options={({ navigation, route }) => ({
          headerShown: true,
          title: "",
          headerLeft: () => (
            <TopBar
              Title={route.name}
              returnTarget={{ name: "Profile" }}
              hasReturnButton={true}
            />
          ), // Dynamic title
        })}
      >
        {(props) => <Education {...props} navigation={navigation} />}
      </settingsStack.Screen>

      {/* Immediate Needs Screen */}
      <settingsStack.Screen
        name="Immediate Need"
        options={({ navigation, route }) => ({
          headerShown: true,
          title: "",
          headerLeft: () => (
            <TopBar
              Title={route.name}
              returnTarget={{ name: "Profile" }}
              hasReturnButton={true}
            />
          ), // Dynamic title
        })}
      >
        {(props) => <ImmediateNeeds {...props} navigation={navigation} />}
      </settingsStack.Screen>
    </settingsStack.Navigator>
  );
}
const Main = () => {
  const navigation = useNavigation();

  const Tabs = [
    "Present Role",
    "Business Drivers",
    "Highlights",
    "Skills",
    "Previous Roles",
    "Education",
    "Immediate Need",
  ];

  const renderTabs = (Tabs) => {
    return Tabs.map((tab, index) => {
      const onPress = () => {
        navigation.navigate(tab);
      };
      return (
        <SettingSection
          key={index}
          title={tab === "Present Role" ? `Edit ${tab}` : `Configure ${tab}`}
          onPress={onPress}
        />
      );
    });
  };

  return (
    <ScrollView style={styles.settingsContainer}>
      <TopBar
        Title="Settings"
        returnTarget={{ name: "Profiles" }}
        hasReturnButton={true}
      />

      {renderTabs(Tabs)}
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
    width: "100%", // Ensure full width of the parent container
    display: "flex",

    backgroundColor: "#F5FCFF",
    // Ensure consistent background
  },
  return: {
    shadowColor: "white",
  },

  deleteText: {
    color: "#FF3B30",
  },
});
