import { View, StyleSheet, Text, TouchableOpacity, Image } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import TopBar from "./components/TopBar";
import react, { useCallback, useEffect } from "react";
import PresentRole from "./components/PresentRole";
import BusinessDrivers from "./components/BusinessDrivers";
import HighLights from "./components/HighLights";
import Skills from "./components/Skills";
import PreviousRoles from "./components/PreviousRoles";
import Education from "./components/Education";
import { COLORS, FONTS } from "../../../theme";
import { useSelector } from "react-redux";
import axios from "axios";
import { PROFILE_API } from "@env";
import { useFocusEffect } from "@react-navigation/native";

export default function Settings() {
  const [showMenu, setShowMenu] = react.useState(false);
  const [activePage, setActivePage] = react.useState("main");
  const User = useSelector((state) => state.auth.user);
  const [data, setData] = react.useState(null);

  const Tabs = [
    { name: "Present Role", Page: "PresentRole" },
    { name: "Business Drivers", Page: "BusinessDrivers" },
    { name: "Highlights  bug", Page: "Highlights" },
    { name: "Skills", Page: "Skills" },
    { name: "Previous Roles", Page: "PreviousRoles" },
    { name: "Education  bug", Page: "Education" },
  ];
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
        `${PROFILE_API}/business-drivers/get_business_driver_details//${User.ID}`,
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
        skills: response2.data.skillData,
        previousRole: response3.data.previousRole,
        education: response4.data.education,
        highLight: response5.data.highlights,
        businessDriver: response6.data.businessDrivers,
      });
    } catch (error) {
      console.log(error);
    }
  };
  useFocusEffect(
    useCallback(() => {
      fetchPresentRole();
    }, [activePage])
  );

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
      {activePage === "PresentRole" && <PresentRole data={data.presentRole} />}
      {activePage === "BusinessDrivers" && (
        <BusinessDrivers data={data.businessDriver} />
      )}
      {activePage === "Highlights" && <HighLights data={data.highLight} />}
      {activePage === "Skills" && <Skills data={data.skills} />}
      {activePage === "PreviousRoles" && (
        <PreviousRoles data={data.previousRole} />
      )}
      {activePage === "Education" && <Education data={data.education} />}
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
    top: 90,
    left: 60,
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
