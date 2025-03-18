import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
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
import { COLORS } from "./theme";
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
import { SocketProvider } from "./components/redux/SocketProvider";
import Toast from "react-native-toast-message";
import { Image, Text, TouchableOpacity } from "react-native";
import * as Location from "expo-location";
import {
  startLocationTracking,
  stopLocationTracking,
} from "./components/redux/slices/locationSlice";
import axios from "axios";
import { logout } from "./components/redux/slices/authSlice";
import NotificationScreen from "./components/Pages/NotificationsScreen/NotificationsScreen";
import NavigationAwareToast from "./components/GeneralComponents/NavigationAwareToast";
import NetworkIcon from "./assets/network.png";
import NetworkActive from "./assets/networkActive.png";
import EditNetwork from "./components/Pages/EditNetwork/EditNetwork";
import ChatRoom from "./components/Pages/ChatRoom/ChatRoom";

export default function Home() {
  const dispatch = useDispatch();
  const User = useSelector((state) => state.auth.user);

  // Load Google Fonts
  let [fontsLoaded] = useFonts({
    Montserrat_500Medium,
    Montserrat_700Bold,
  });
  const { location } = useSelector((state) => state.location);

  useEffect(() => {
    // console.log("Starting location tracking");
    dispatch(
      startLocationTracking({
        accuracy: Location.Accuracy.High,
        timeInterval: 30000, // Update every 30 seconds
      })
    );

    // Cleanup function to stop tracking when component unmounts
    return () => {
      dispatch(stopLocationTracking());
    };
  }, []);

  useEffect(() => {
    const updateLocationToServer = async () => {
      if (location && User) {
        try {
          // Send current location (longitude, latitude) to the server
          await axios.patch(
            `${process.env.EXPO_PUBLIC_PROFILE_API}/updateLocation/${User.user._id}`,
            {
              longitude: location.coords.longitude,
              latitude: location.coords.latitude,
            },
            {
              headers: {
                Authorization: `Bearer ${User.Token}`, // Add the token to the Authorization header
              },
            }
          );
          // console.log("Location updated successfully");
        } catch (error) {
          console.error("Error updating location:", error);
          if (error.status == 401) {
            dispatch(logout());
          }
        }
      }
    };
    updateLocationToServer();
  }, [location, User]);
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
      <StatusBar style="light" />

      {isLoggedIn ? (
        <SocketProvider userId={User.user._id}>
          <Tab.Navigator
            screenOptions={{
              headerShown: false,
              tabBarShowLabel: false,
              tabBarActiveTintColor: "white",
              tabBarInactiveTintColor: "gray",
              tabBarStyle: {
                height: 50, // Set the height of the tab bar
                backgroundColor: COLORS.secondary, // Set the background color
                justifyContent: "center", // Center content vertically
                alignItems: "center", // Center content horizontally
                paddingBottom: 0, // Remove any default padding at the bottom
                paddingTop: 5, // Remove any default padding at the top
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
                    color={focused ? "white" : "gray"}
                  />
                ),
              }}
            />
            <Tab.Screen
              name="Chat Bot"
              component={ChatBot}
              options={{
                tabBarIcon: ({ focused }) => (
                  <AntDesign
                    name="message1"
                    size={24}
                    color={
                      focused
                        ? "white"
                        : User.user.rAInChat[User.user.rAInChat?.length - 1]
                            ?.role === "AI" &&
                          User.user.rAInChat[
                            User.user.rAInChat?.length - 1
                          ].text.includes("Welcome to")
                        ? "green"
                        : "gray"
                    }
                  />
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
                tabBarIcon: ({ focused }) =>
                  focused ? (
                    <Image
                      source={NetworkActive}
                      style={{ width: 25, height: 25 }}
                    />
                  ) : (
                    <Image
                      source={NetworkIcon}
                      style={{ width: 25, height: 25 }}
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
                    color={focused ? "white" : "gray"}
                  />
                ),
              }}
            />

            <Tab.Screen
              name="chatRoom"
              component={ChatRoom}
              options={{ tabBarItemStyle: { display: "none" } }} // Hide item from tabBar
            />
            <Tab.Screen
              name="NetworkDetails"
              component={ManageNetwork}
              options={{ tabBarItemStyle: { display: "none" } }} // Hide item from tabBar
            />
            <Tab.Screen
              name="NotificationsScreen"
              component={NotificationScreen}
              options={{ tabBarItemStyle: { display: "none" } }} // Hide item from tabBar
            />
            <Tab.Screen
              name="EditNetwork"
              component={EditNetwork}
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
          <NavigationAwareToast />
        </SocketProvider>
      ) : (
        <AuthScreen />
      )}
    </NavigationContainer>
  );
}
