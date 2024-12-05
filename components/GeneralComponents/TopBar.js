import { View, StyleSheet, Text, TouchableOpacity, Image } from "react-native";
import react from "react";
import HamburgerButton from "../Pages/HomeScreen/components/HamburgerButton";
import { useNavigation } from "@react-navigation/native";
import { COLORS, FONTS } from "../../theme";
import { useDispatch, useSelector } from "react-redux";
import { logout, logoutOrg } from "../redux/slices/authSlice";

export default function TopBar({ Tabs }) {
  const [showMenu, setShowMenu] = react.useState(false);
  const isOrgLoggedIn = useSelector((state) => state.auth.isOrgLoggedIn);
  const dispatch = useDispatch();
  const navigation = useNavigation(); // Assuming you are using React Navigation v5 or later
  const RenderTabs = () => {
    return Tabs.map((Tab) => {
      return (
        <View style={styles.signUpPromptBtn} key={Tab.Name}>
          <TouchableOpacity
            onPress={() => {
              setShowMenu(false);
              navigation.navigate(Tab.Page);
            }}
          >
            <Text style={styles.buttonTextEmpty}>{Tab.Name}</Text>
          </TouchableOpacity>
        </View>
      );
    });
  };
  return (
    <View style={styles.topBar}>
      <View style={styles.imageWrapper}>
        <Image
          source={require("../../assets/logodarkblue.png")}
          style={styles.image}
        />
      </View>
      <HamburgerButton
        onPress={() => {
          setShowMenu((prev) => !prev);
        }}
      />
      {showMenu && (
        <View style={styles.dropDown}>
          {RenderTabs()}
          {isOrgLoggedIn && (
            <View style={styles.signUpPromptBtn}>
              <TouchableOpacity
                onPress={() => {
                  setShowMenu(false);
                  dispatch(logoutOrg());
                }}
              >
                <Text style={styles.buttonTextEmpty}>
                  Logout from organization
                </Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.signUpPromptBtn}>
            <TouchableOpacity
              onPress={() => {
                setShowMenu(false);
                dispatch(logout());
              }}
            >
              <Text style={styles.buttonTextEmpty}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    zIndex: 1000,
  },

  image: {
    width: 20,
    objectFit: "contain",
    height: 29,
  },
  dropDown: {
    zIndex: 1000,
    position: "absolute",
    top: 50,
    right: 30,
    padding: 15,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 5,
    backgroundColor: "white",
    flexDirection: "column", // Ensures vertical stacking of tabs
    alignItems: "flex-start", // Align tabs to the start
    width: "auto", // Adjust width as needed
  },

  signUpPromptBtn: {
    marginVertical: 10, // Adds space between each tab for better readability
  },
  buttonTextEmpty: {
    fontSize: FONTS.medium,
    fontFamily: FONTS.familyBold,
    color: COLORS.secondary,
  },
});
