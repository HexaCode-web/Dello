import { View, StyleSheet } from "react-native";
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
        headerShown: true,
        headerStyle: styles.return,
        cardStyle: styles.container,
        header: () => (
          <TopBar
            returnTarget={{ name: "Profiles", params: { screen: "Main" } }}
            hasReturnButton={true}
          />
        ),
      }}
      initialRouteName="Main"
      detachInactiveScreens={true}
    >
      <settingsStack.Screen name="Main" component={Main} />
      <settingsStack.Screen name="Change Username">
        {(props) => <ChangeName {...props} navigation={navigation} />}
      </settingsStack.Screen>
    </settingsStack.Navigator>
  );
}
const Main = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.settingsContainer}>
      <SettingSection
        title="Set Profile : Default"
        onPress={() => navigation.navigate("Change Password")}
      />
      <SettingSection
        title="Change Username"
        onPress={() => navigation.navigate("Change Username")}
      />
      <SettingSection
        title="Edit"
        onPress={() => navigation.navigate("Settings")}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FCFF",
    paddingHorizontal: 20,
    paddingTop: 0,
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
