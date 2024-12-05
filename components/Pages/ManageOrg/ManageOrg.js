import { Text, View, StyleSheet } from "react-native";
import OldNetworks from "./components/OldNetworks";
import { TouchableOpacity } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useState } from "react";
import CreateNetwork from "./components/CreateNetwork";
import { COLORS, FONTS } from "../../../theme";
import { useNavigation } from "@react-navigation/native";

export default function ManageOrg() {
  const navigation = useNavigation();
  const [activePage, setActivePage] = useState("Home");
  const handleInnerNavigation = () => {
    if (activePage != "Home") {
      setActivePage("Home");
    } else {
      navigation.navigate("Home");
    }
  };
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.return}>
        <AntDesign
          name="arrowleft"
          size={36}
          color={COLORS.secondary}
          onPress={handleInnerNavigation}
        />
      </TouchableOpacity>
      <Text style={styles.title}>Manage Organization</Text>
      <View style={styles.buttonWrapper}>
        {activePage != "Old" && (
          <TouchableOpacity
            style={styles.DefaultButton}
            onPress={() => {
              setActivePage("Old");
            }}
          >
            <Text style={styles.buttonText}>View Active Networks</Text>
          </TouchableOpacity>
        )}
        {activePage != "Create" && (
          <TouchableOpacity
            style={styles.DefaultButton}
            onPress={() => {
              setActivePage("Create");
            }}
          >
            <Text style={styles.buttonText}>Create New Network</Text>
          </TouchableOpacity>
        )}
      </View>
      {activePage === "Old" && <OldNetworks />}
      {activePage === "Create" && <CreateNetwork />}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    paddingTop: 55,
    paddingBottom: 50,
    justifyContent: "space-between",
    color: "black",
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
    backgroundColor: "white",
  },
  buttonWrapper: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
    gap: 20,
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
