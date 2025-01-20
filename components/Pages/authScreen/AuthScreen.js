import React, { useState } from "react";
import Greeting from "./components/Greeting";
import Signup from "./components/Signup";

import { createStackNavigator } from "@react-navigation/stack";
import SignIn from "./components/SingIn";
const Stack = createStackNavigator();

export default function authScreen() {
  return (
    <Stack.Navigator
      initialRouteName="Greeting"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Greeting" component={Greeting} />
      <Stack.Screen name="Signup" component={Signup} />
      <Stack.Screen name="SignIn" component={SignIn} />
    </Stack.Navigator>
  );
}
