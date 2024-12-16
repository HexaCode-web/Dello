import { View, StyleSheet, Text, TouchableOpacity, Image } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import TopBar from "./components/TopBar";
import react, { useCallback, useEffect, useState } from "react";
import PresentRole from "./components/PresentRole";
import BusinessDrivers from "./components/BusinessDrivers";
import HighLights from "./components/HighLights";
import Skills from "./components/Skills";
import PreviousRoles from "./components/PreviousRoles";
import Education from "./components/Education";
import { COLORS, FONTS } from "../../../theme";
import { useSelector } from "react-redux";
import { useFocusEffect } from "@react-navigation/native";
import ImmediateNeeds from "./components/ImmediateNeeds";
export default function Settings() {
  const activeSettingsPage = useSelector((state) => state.activeSettingsPage);

  const [showMenu, setShowMenu] = react.useState(false);
  const [activePage, setActivePage] = react.useState(
    activeSettingsPage.activePage
  );
  useEffect(() => {
    setActivePage(activeSettingsPage.activePage);
  }, [activeSettingsPage.activePage]);

  const User = useSelector((state) => state.auth.user);
  const [data, setData] = useState({
    presentRole: User.user.presentRole,
    businessDriver: User.user.businessDriver,
    highLight: User.user.highlights,
    education: User.user.education,
    previousRole: User.user.previousRole,
    skills: User.user.skills,
  });

  useFocusEffect(
    useCallback(() => {
      setData({
        presentRole: User.user.presentRole,
        businessDriver: User.user.businessDriver,
        highLight: User.user.highlights,
        education: User.user.education,
        previousRole: User.user.previousRole,
        skills: User.user.skills,
      });
    }, [User])
  );

  const Tabs = [
    { name: "Present Role", Page: "PresentRole" },
    { name: "Business Drivers", Page: "BusinessDrivers" },
    { name: "Highlights ", Page: "Highlights" },
    { name: "Skills", Page: "Skills" },
    { name: "Previous Roles", Page: "PreviousRoles" },
    { name: "Education ", Page: "Education" },
    { name: "Immediate Need ", Page: "ImmediateNeeds" },
  ];

  const renderTabs = Tabs.map((Tab) => {
    return (
      <TouchableOpacity
        style={styles.signUpPromptBtn}
        onPress={() => {
          setShowMenu(false), setActivePage(Tab.Page);
        }}
      >
        <Text style={styles.buttonTextEmpty}>{Tab.name}</Text>
      </TouchableOpacity>
    );
  });
  return (
    <View style={styles.container}>
      <TopBar activePage={activePage} setActivePage={setActivePage} />
      <View style={styles.settings}>
        <View style={styles.addButtonStyles}>
          <TouchableOpacity
            onPress={() => {
              setShowMenu((prev) => !prev);
            }}
          >
            <Ionicons
              name="add-circle-outline"
              size={60}
              color={COLORS.secondary}
            />
          </TouchableOpacity>
          <Text style={styles.currentTab}>
            {Tabs.find((tab) => tab.Page === activePage)?.name}
          </Text>
          {showMenu && <View style={styles.dropDown}>{renderTabs}</View>}
        </View>
      </View>
      {activePage === "PresentRole" && (
        <PresentRole data={data.presentRole} setActivePage={setActivePage} />
      )}
      {activePage === "BusinessDrivers" && (
        <BusinessDrivers setActivePage={setActivePage} />
      )}
      {activePage === "Highlights" && (
        <HighLights setActivePage={setActivePage} />
      )}
      {activePage === "Skills" && <Skills setActivePage={setActivePage} />}
      {activePage === "PreviousRoles" && (
        <PreviousRoles setActivePage={setActivePage} />
      )}
      {activePage === "Education" && (
        <Education setActivePage={setActivePage} />
      )}
      {activePage === "ImmediateNeeds" && (
        <ImmediateNeeds setActivePage={setActivePage} />
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
  settings: {
    padding: 30,
    width: "100%",
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  currentTab: {
    fontSize: FONTS.largeHeader,
    textAlign: "left",
    width: "90%",
    fontFamily: FONTS.familyBold,
    color: COLORS.secondary,
  },
  addButtonStyles: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  dropDown: {
    zIndex: 9990,
    position: "absolute",
    top: 60,
    left: 30,
    padding: 30,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 5,
    display: "flex",
    gap: 30,
    backgroundColor: "white",
  },
  signUpPromptBtn: {
    display: "flex",

    textAlign: "left",
  },
  buttonTextEmpty: {
    fontSize: FONTS.medium,
    textAlign: "left",
    fontFamily: FONTS.familyBold,
    color: COLORS.secondary,
  },
});
