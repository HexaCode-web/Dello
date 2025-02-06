import { View, StyleSheet, FlatList } from "react-native";
import TopBar from "../../GeneralComponents/TopBar";
import Header from "./components/Header";
import { useCallback, useState } from "react";

import { useSelector } from "react-redux";
import PresentRole from "./components/PresentRole";
import { useFocusEffect } from "@react-navigation/native";
import React from "react";
import BusinessDriver from "./components/BusinessDriver";
import HighLights from "./components/HighLights";
import Education from "./components/Education";
import PreviousRole from "./components/PreviousRole";
import Skills from "./components/Skills";
import ImmediateNeeds from "./components/ImmediateNeeds";
import Contact from "./components/Contact";
export default function Profile() {
  const User = useSelector((state) => state.auth.user);
  const tabsAr = [
    { Name: "Security", Page: "Security" },
    { Name: "Profile", Page: "Profile" },
    { Name: "Settings", Page: "Profiles" },
    { Name: "Organisation", Page: "Organizations" },
  ];

  const [data, setData] = useState({
    presentRole: User.user.presentRole,
    businessDriver: User.user.businessDrivers,
    highLight: User.user.highlights,
    education: User.user.education,
    previousRole: User.user.previousRoles,
    skills: User.user.skills,
    ImmediateNeeds: User.user.ImmediateNeeds,
  });
  useFocusEffect(
    useCallback(() => {
      setData({
        presentRole: User.user.presentRole,
        businessDriver: User.user.businessDrivers,
        highLight: User.user.highlights,
        education: User.user.education,
        previousRole: User.user.previousRoles,
        skills: User.user.skills,
        ImmediateNeeds: User.user.ImmediateNeeds,
      });
    }, [User])
  );

  const renderItem = ({ item }) => {
    switch (item.type) {
      case "ImmediateNeeds":
        return <ImmediateNeeds data={item.data} />;
      case "PresentRole":
        return <PresentRole data={item.data} />;
      case "BusinessDriver":
        return <BusinessDriver data={item.data} />;
      case "HighLights":
        return <HighLights data={item.data} />;
      case "Education":
        return <Education data={item.data} />;
      case "PreviousRole":
        return <PreviousRole data={item.data} />;
      case "Skills":
        return <Skills data={item.data} />;
      // case "Contact":
      //   return <Contact data={item.data} />;
      default:
        return null;
    }
  };

  const listData = [
    { type: "PresentRole", data: data?.presentRole },
    { type: "Contact", data: { email: User.user.email } },
    { type: "ImmediateNeeds", data: data?.ImmediateNeeds },
    { type: "BusinessDriver", data: data?.businessDriver },
    { type: "HighLights", data: data?.highLight },
    { type: "Education", data: data?.education },
    { type: "PreviousRole", data: data?.previousRole },
    { type: "Skills", data: data?.skills },
  ].filter((item) => item.data); // Filter out any sections without data

  return (
    <View style={styles.container}>
      <TopBar Title="Profile" hasReturnButton={true} />
      <Header User={User} />
      {data && (
        <FlatList
          data={listData}
          keyExtractor={(item) => item.type}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }} // Add bottom padding to the list
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FCFF",
    paddingTop: 0,
    paddingHorizontal: 20,
    justifyContent: "flex-start",
  },
});
