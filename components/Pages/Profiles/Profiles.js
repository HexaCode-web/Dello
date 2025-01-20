import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import SettingSection from "../../GeneralComponents/SettingSection";
import ChangeName from "../Settings/components/ChangeName";
import TopBar from "../../GeneralComponents/TopBar";

const settingsStack = createStackNavigator();
export default function Profiles() {
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
        name="Change Username"
        options={({ navigation, route }) => ({
          headerShown: true,
          title: "",
          headerLeft: () => (
            <TopBar
              Title={route.name}
              returnTarget={{ name: "Profiles", params: { screen: "Main" } }}
              hasReturnButton={true}
            />
          ), // Dynamic title based on screen name
        })}
      >
        {(props) => <ChangeName {...props} navigation={navigation} />}
      </settingsStack.Screen>
    </settingsStack.Navigator>
  );
}
const Main = () => {
  const navigation = useNavigation();

  return (
    <ScrollView style={styles.settingsContainer}>
      <TopBar
        Title="Profiles"
        returnTarget={{ name: "Home" }}
        hasReturnButton={true}
      />
      <SettingSection
        title="Set Default"
        onPress={() => navigation.navigate("Change Password")}
      />
      <SettingSection
        title="Change Username"
        onPress={() => navigation.navigate("Change Username")}
      />
      <SettingSection
        title="Configure"
        onPress={() => navigation.navigate("Settings")}
      />
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

  deleteText: {
    color: "#FF3B30",
  },
});
