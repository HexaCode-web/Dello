import { View, StyleSheet, FlatList } from "react-native";
import TopBar from "../../GeneralComponents/TopBar";
import Header from "./components/Header";
import { useEffect, useState } from "react";
import axios from "axios";
import { PROFILE_API } from "@env";
import { useSelector } from "react-redux";
import PresentRole from "./components/PresentRole";
import { useFocusEffect } from "@react-navigation/native";
import React from "react";
import BusinessDriver from "./components/BusinessDriver";
import HighLights from "./components/HighLights";
import Education from "./components/Education";
import PreviousRole from "./components/PreviousRole";
import Skills from "./components/Skills";

export default function Profile() {
  const User = useSelector((state) => state.auth.user);
  const isOrgLoggedIn = useSelector((state) => state.auth.isOrgLoggedIn);
  const tabsAr = isOrgLoggedIn
    ? [
        { Name: "Home", Page: "Home" },
        { Name: "Configure", Page: "Settings" },
        { Name: "Manage Origination", Page: "ManageOrg" },
      ]
    : [
        { Name: "Home", Page: "Home" },
        { Name: "Configure", Page: "Settings" },
        { Name: "Create Origination", Page: "CreateOrg" },
        {
          Name: "Login Origination",
          Page: "SignInOrg",
        },
      ];
  const [data, setData] = useState(null);

  const fetchPresentRole = async () => {
    try {
      const options = {
        headers: {
          Accept: "application/json",
          "Accept-Language": "en",
          "Content-Type": "application/json",
          Authorization: `Bearer ${User.Token}`,
        },
      };

      const presentRole = axios.get(
        `${PROFILE_API}/present-role/get_present_role_details/${User.ID}`,
        options
      );
      const skills = axios.get(
        `${PROFILE_API}/skill/get_skill_details/${User.ID}`,
        options
      );
      const previousRole = axios.get(
        `${PROFILE_API}/previous-role/get_previous_role_details/${User.ID}`,
        options
      );
      const education = axios.get(
        `${PROFILE_API}/education/get_education_details/${User.ID}`,
        options
      );
      const highLight = axios.get(
        `${PROFILE_API}/highlights/get_highight_details/${User.ID}`,
        options
      );
      const businessDriver = axios.get(
        `${PROFILE_API}/business-drivers/get_business_driver_details/${User.ID}`,
        options
      );

      const [response1, response2, response3, response4, response5, response6] =
        await Promise.all([
          presentRole,
          skills,
          previousRole,
          education,
          highLight,
          businessDriver,
        ]);

      setData({
        presentRole: response1.data,
        skills: response2.data,
        previousRole: response3.data,
        education: response4.data,
        highLight: response5.data,
        businessDriver: response6.data,
      });
    } catch (error) {
      console.log(error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchPresentRole();
    }, [])
  );

  const renderItem = ({ item }) => {
    switch (item.type) {
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
      default:
        return null;
    }
  };

  const listData = [
    { type: "PresentRole", data: data?.presentRole },
    { type: "BusinessDriver", data: data?.businessDriver },
    { type: "HighLights", data: data?.highLight },
    { type: "Education", data: data?.education },
    { type: "PreviousRole", data: data?.previousRole },
    { type: "Skills", data: data?.skills },
  ].filter((item) => item.data); // Filter out any sections without data

  return (
    <View style={styles.container}>
      <TopBar Tabs={tabsAr} />
      <Header />
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
    backgroundColor: "white",
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 50,
    justifyContent: "flex-start",
    color: "black",
  },
});
