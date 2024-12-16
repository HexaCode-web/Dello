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
import * as SplashScreen from "expo-splash-screen"; // Import splash screen

const Tab = createBottomTabNavigator();

import {
  useFonts,
  Montserrat_500Medium,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";
import { FONTS } from "./theme";
import Network from "./components/Pages/Network/Network";
import CreateOrg from "./components/Pages/CreateOrg/CreateOrg";
import ManageOrg from "./components/Pages/ManageOrg/ManageOrg";

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function Home() {
  // Load Google Fonts
  let [fontsLoaded] = useFonts({
    Montserrat_500Medium,
    Montserrat_700Bold,
  });
  console.log(User);

  // Check if the user is logged in
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const User = useSelector((state) => state.auth.user);
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
            headerShown: false, // Hides headers for all screens
            tabBarActiveTintColor: "tomato",
            tabBarInactiveTintColor: "gray",
            tabBarLabelStyle: {
              fontSize: FONTS.small,
            },
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
                  color={focused ? "tomato" : "gray"}
                />
              ),
            }}
          />
          <Tab.Screen
            name="Network"
            component={Network}
            options={{
              tabBarIcon: ({ focused }) => (
                <Feather
                  name="search"
                  size={25}
                  color={focused ? "tomato" : "gray"}
                />
              ),
            }}
          />
          <Tab.Screen
            name="Profile"
            component={Profile}
            options={{
              tabBarIcon: ({ focused }) => (
                <Feather
                  name="user"
                  size={25}
                  color={focused ? "tomato" : "gray"}
                />
              ),
            }}
          />
          <Tab.Screen
            name="CreateOrg"
            component={CreateOrg}
            options={{ tabBarItemStyle: { display: "none" } }} // Hide item from tabBar
          />

          <Tab.Screen
            name="ManageOrg"
            component={ManageOrg}
            options={{ tabBarItemStyle: { display: "none" } }} // Hide item from tabBar
          />

          <Tab.Screen
            name="Settings"
            component={Settings}
            options={{
              tabBarIcon: ({ focused }) => (
                <Feather
                  name="settings"
                  size={25}
                  color={focused ? "tomato" : "gray"}
                />
              ),
            }}
          />
        </Tab.Navigator>
      ) : (
        <AuthScreen />
      )}
    </NavigationContainer>
  );
}
