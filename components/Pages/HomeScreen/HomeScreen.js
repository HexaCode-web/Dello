import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import TopBar from "../../GeneralComponents/TopBar";
import Header from "./components/Header";
import Body from "./components/Body";
export default function HomeScreen() {
  const tabsAr = [
    { Name: "Security", Page: "Security" },
    { Name: "Profile", Page: "Profile" },
    { Name: "Settings", Page: "Profiles" },
    { Name: "Organisation", Page: "Organizations" },
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
    backgroundColor: "#F5FCFF",
    paddingHorizontal: 20,

    paddingTop: 0,
    paddingBottom: 20,
    justifyContent: "space-between",
    color: "black",
  },
});
