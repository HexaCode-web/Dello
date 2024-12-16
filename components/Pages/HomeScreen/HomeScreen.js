import { useSelector } from "react-redux";
import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import TopBar from "../../GeneralComponents/TopBar";
import Header from "./components/Header";
import Body from "./components/Body";
export default function HomeScreen() {
  const tabsAr = [
    { Name: "Profile", Page: "Profile" },
    { Name: "Organizations", Page: "ManageOrg" },
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
