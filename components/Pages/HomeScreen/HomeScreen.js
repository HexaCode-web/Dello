import { useSelector } from "react-redux";
import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import TopBar from "../../GeneralComponents/TopBar";
import Header from "./components/Header";
import Body from "./components/Body";
export default function HomeScreen() {
  const isOrgLoggedIn = useSelector((state) => state.auth.isOrgLoggedIn);
  const tabsAr = isOrgLoggedIn
    ? [
        { Name: "Go To Profile", Page: "Profile" },
        { Name: "Manage Origination", Page: "ManageOrg" },
      ]
    : [
        { Name: "Go To Profile", Page: "Profile" },
        { Name: "Create Origination", Page: "CreateOrg" },
        {
          Name: "Login Origination",
          Page: "SignInOrg",
        },
      ];
  return (
    <View style={styles.container}>
      <TopBar Tabs={tabsAr} />
      <Header />
      <Body />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 50,
    justifyContent: "space-between",
    color: "black",
  },
});
