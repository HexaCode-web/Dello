import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import AuthScreen from "./components/Pages/authScreen/AuthScreen";
import HomeScreen from "./components/Pages/HomeScreen/HomeScreen";
import Feather from "@expo/vector-icons/Feather";
import { StatusBar } from "expo-status-bar";
import Profile from "./components/Pages/Profile/Profile";
import Settings from "./components/Pages/Settings/Settings";
import * as SplashScreen from "expo-splash-screen";
const Tab = createBottomTabNavigator();
import {
  useFonts,
  Montserrat_500Medium,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";
import { FONTS } from "./theme";
import Network from "./components/Pages/Network/Network";
import CreateOrg from "./components/Pages/CreateOrg/CreateOrg";
import Organizations from "./components/Pages/ManageOrg/ManageOrg";
import ManageNetwork from "./components/Pages/ManageNetwork/ManageNetwork";
import Octicons from "@expo/vector-icons/Octicons";
import ViewProfile from "./components/Pages/ViewProfile/ViewProfile";
import ChatBot from "./components/Pages/ChatBot/ChatBot";
SplashScreen.preventAutoHideAsync();
import AntDesign from "@expo/vector-icons/AntDesign";
import Security from "./components/Pages/Security/Security";
import Profiles from "./components/Pages/Profiles/Profiles";
export default function Home() {
  // Load Google Fonts
  let [fontsLoaded] = useFonts({
    Montserrat_500Medium,
    Montserrat_700Bold,
  });

  // Check if the user is logged in
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  // Use useEffect to hide the splash screen when fonts are loaded
  useEffect(() => {
    const hideSplashScreen = async () => {
      if (fontsLoaded) {
        await SplashScreen.hideAsync(); // Hide the splash screen
      }
    };

    hideSplashScreen();
  }, [fontsLoaded]);

  // Keep the splash screen visible until fonts are loaded
  if (!fontsLoaded) {
    return null;
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />

      {isLoggedIn ? (
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarShowLabel: false,
            tabBarActiveTintColor: "purple",
            tabBarInactiveTintColor: "gray",
          }}
        >
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{
              tabBarIcon: ({ focused }) => (
                <Feather
                  name="home"
                  size={25}
                  color={focused ? "purple" : "gray"}
                />
              ),
            }}
          />
          <Tab.Screen
            name="Chat Bot"
            component={ChatBot}
            options={{
              tabBarIcon: ({ focused }) => (
                <AntDesign name="message1" size={24} color="black" />
              ),
            }}
          />

          <Tab.Screen
            name="Profile"
            component={Profile}
            options={{ tabBarItemStyle: { display: "none" } }} // Hide item from tabBar
          />
          <Tab.Screen
            name="ViewProfile"
            component={ViewProfile}
            options={{ tabBarItemStyle: { display: "none" } }} // Hide item from
          />
          <Tab.Screen
            name="CreateOrg"
            component={CreateOrg}
            options={{ tabBarItemStyle: { display: "none" } }} // Hide item from tabBar
          />
          <Tab.Screen
            name="Network"
            component={Network}
            options={{
              tabBarIcon: ({ focused }) => (
                <Feather
                  name="search"
                  size={25}
                  color={focused ? "purple" : "gray"}
                />
              ),
            }}
          />
          <Tab.Screen
            name="Organizations"
            component={Organizations}
            options={{
              tabBarIcon: ({ focused }) => (
                <Octicons
                  name="organization"
                  size={25}
                  color={focused ? "purple" : "gray"}
                />
              ),
            }}
          />

          <Tab.Screen
            name="NetworkDetails"
            component={ManageNetwork}
            options={{ tabBarItemStyle: { display: "none" } }} // Hide item from tabBar
          />

          <Tab.Screen
            name="Settings"
            component={Settings}
            options={{ tabBarItemStyle: { display: "none" } }} // Hide item from tabBar
          />
          <Tab.Screen
            name="Security"
            component={Security}
            options={{ tabBarItemStyle: { display: "none" } }} // Hide item from tabBar
          />
          <Tab.Screen
            name="Profiles"
            component={Profiles}
            options={{ tabBarItemStyle: { display: "none" } }} // Hide item from tabBar
          />
        </Tab.Navigator>
      ) : (
        <AuthScreen />
      )}
    </NavigationContainer>
  );
}
