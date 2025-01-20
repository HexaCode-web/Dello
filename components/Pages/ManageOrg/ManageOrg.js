import { Text, View, StyleSheet } from "react-native";
import OldNetworks from "./components/OldNetworks";
import { useCallback, useEffect, useState } from "react";
import CreateNetwork from "./components/CreateNetwork";
import { COLORS, FONTS } from "../../../theme";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import Settings from "./components/Settings";
import axios from "axios";
import SettingSection from "../../GeneralComponents/SettingSection.js";
import TopBar from "../../GeneralComponents/TopBar.js";
import DropdownSlider from "../../GeneralComponents/DropdownSlider.js";
export default function ManageOrg() {
  const navigation = useNavigation();

  const User = useSelector((state) => state.auth.user);
  const associatedEmails = User.user.associatedEmails;
  const [activePage, setActivePage] = useState(0);

  const [activeOrg, setActiveOrg] = useState(null);
  const [orgData, setOrgData] = useState(null);
  console.log(orgData);

  const getActiveOrg = async (orgId) => {
    try {
      const config = {
        method: "get",
        url: `${process.env.EXPO_PUBLIC_ORG_API}/${orgId}`,
        headers: {
          "Accept-Language": "en",
          "Content-Type": "application/json",
          Authorization: `Bearer ${User.Token}`,
        },
      };
      const response = await axios(config);
      return response.data; // return the organization data
    } catch (error) {
      console.error("Error:", error.response?.status, error.message);
      if (error.response) {
        console.error("Backend Error Response:", error.response.data);
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      const fetchAllOrgs = async () => {
        if (associatedEmails && associatedEmails.length > 0) {
          try {
            // Fetch data for each organization independently
            const orgs = await Promise.all(
              associatedEmails.map((email) => getActiveOrg(email.OrgId))
            );
            setOrgData(orgs); // Set the fetched data to state
          } catch (error) {
            console.error("Error fetching organizations:", error);
          }
        }
      };

      fetchAllOrgs();
    }, [associatedEmails])
  );
  const handleInnerNavigation = () => {
    if (activePage > 0) {
      setActivePage(0);
    } else {
      navigation.navigate("Home");
    }
  };
  return (
    <View style={styles.container}>
      <TopBar hasReturnButton={true} returnFunction={handleInnerNavigation} />
      {activePage == 0 && (
        <View style={styles.buttonWrapper}>
          <SettingSection
            title="Create Organization"
            onPress={() => {
              setActivePage(0);
              navigation.navigate("CreateOrg");
            }}
          />
        </View>
      )}
      {orgData && activePage === 0 && (
        <DropdownSlider
          data={orgData.map((org) => org?.name)}
          placeholder={activeOrg ? activeOrg?.name : "Select Org"}
          onSelect={(item) =>
            setActiveOrg(orgData.find((org) => org?.name === item))
          }
        />
      )}
      {activeOrg ? (
        <View style={styles.buttonWrapper}>
          {activePage == 0 && (
            <SettingSection
              title="Settings"
              onPress={() => {
                setActivePage(3);
              }}
            />
          )}
          {activePage == 0 && (
            <View style={styles.boxWrapper}>
              <Text style={styles.title}>Networks</Text>

              <SettingSection title="Active" onPress={() => setActivePage(1)} />

              <SettingSection title="New" onPress={() => setActivePage(2)} />
            </View>
          )}
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.headerText}>No Organizations Found</Text>
          </View>
        </>
      )}
      {activePage === 1 && (
        <OldNetworks OrgId={activeOrg._id} setActivePage={setActivePage} />
      )}
      {activePage === 2 && (
        <CreateNetwork
          orgId={activeOrg._id}
          setMainActivePage={setActivePage}
        />
      )}
      {activePage === 3 && <Settings org={activeOrg} setOrgData={setOrgData} />}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FCFF",
    alignItems: "center",
    flexDirection: "column",
    paddingTop: 20,
    paddingBottom: 20,
    color: "black",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    width: "90%",
    marginTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  boxWrapper: {
    width: "90%",
    padding: 10,
    backgroundColor: "#F5FCFF",

    gap: 20,
    margin: "auto",
    marginVertical: 30,
    borderWidth: 1,
    borderColor: COLORS.borders,
    borderRadius: 10,
    position: "relative",
  },
  title: {
    position: "absolute",
    top: -25,
    backgroundColor: "#F5FCFF",

    left: 10,
    textAlign: "center",
    color: COLORS.secondary,
    fontSize: FONTS.large,
    fontFamily: FONTS.familyBold,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerText: {
    fontFamily: FONTS.familyBold,
    fontSize: FONTS.medium,
  },
  subtitle: {
    marginBottom: "auto",
  },
  title: {
    fontSize: FONTS.large,
    fontFamily: FONTS.familyBold,
    color: COLORS.secondary,
  },
  return: {
    position: "absolute",
    top: 40,
    left: 10,
    padding: 10,
    backgroundColor: "#F5FCFF",
  },
  buttonWrapper: {
    width: "100%",
  },
  DefaultButton: {
    width: "90%",
    borderRadius: 30,
    height: 60,
    display: "flex",
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: COLORS.secondary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 2,
  },

  buttonText: {
    fontSize: FONTS.medium,
    fontFamily: FONTS.familyBold,
    color: "white",
  },
});
/*
{
  "adminId": 1001,
  "orgId": 2002,
  "networkName": "Corporate Network",
  "size": 150,
  "latitude": 0,
  "longitude": 0,
  "startDate": "2024-11-17T01:20:50.251Z",
  "endDate": "2024-11-17T01:20:50.251Z",
  "type": "Private",
  "joiningCondition": "Invite-only"
}
   */
