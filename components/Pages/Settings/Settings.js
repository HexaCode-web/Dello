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
        headerShown: true,
        headerStyle: styles.return,
        header: () => (
          <TopBar returnTarget={{ name: "Profile" }} hasReturnButton={true} />
        ),
        cardStyle: styles.container,
      }}
      initialRouteName="Main"
      detachInactiveScreens={true}
    >
      <settingsStack.Screen name="Main" component={Main} />

      <settingsStack.Screen name="Present Role">
        {(props) => (
          <PresentRole
            {...props}
            data={data.presentRole}
            navigation={navigation}
          />
        )}
      </settingsStack.Screen>

      <settingsStack.Screen name="Business Drivers">
        {(props) => <BusinessDrivers {...props} navigation={navigation} />}
      </settingsStack.Screen>

      <settingsStack.Screen name="Highlights">
        {(props) => <HighLights {...props} navigation={navigation} />}
      </settingsStack.Screen>

      {/* Skills Screen */}
      <settingsStack.Screen name="Skills">
        {(props) => <Skills {...props} navigation={navigation} />}
      </settingsStack.Screen>

      {/* Previous Roles Screen */}
      <settingsStack.Screen name="Previous Roles">
        {(props) => <PreviousRoles {...props} navigation={navigation} />}
      </settingsStack.Screen>

      {/* Education Screen */}
      <settingsStack.Screen name="Education">
        {(props) => <Education {...props} navigation={navigation} />}
      </settingsStack.Screen>

      {/* Immediate Needs Screen */}
      <settingsStack.Screen name="Immediate Need">
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
    <ScrollView style={styles.settingsContainer}>{renderTabs(Tabs)}</ScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FCFF",
    paddingHorizontal: 18,

    paddingTop: 0,
  },
  settingsContainer: {
    width: "100%",
    display: "flex",

    backgroundColor: "#F5FCFF",
  },
  return: {
    shadowColor: "white",
  },

  deleteText: {
    color: "#FF3B30",
  },
});
