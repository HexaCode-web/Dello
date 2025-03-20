import { useNavigation } from "@react-navigation/native";
import { View, StyleSheet, Text, TouchableOpacity, Image } from "react-native";
import react from "react";
import HamburgerButton from "../../HomeScreen/components/HamburgerButton";
import AntDesign from "@expo/vector-icons/AntDesign";
import { COLORS, FONTS } from "../../../../theme";
import { useDispatch } from "react-redux";
import { logout } from "../../../redux/slices/authSlice";

export default function TopBar({ title, returnTarget }) {
  const [showMenu, setShowMenu] = react.useState(false);

  const dispatch = useDispatch();

  const navigation = useNavigation();
  const navigate = () => {
    setShowMenu(false), navigation.navigate(returnTarget);
  };
  return (
    <View style={styles.topBar}>
      <TouchableOpacity style={styles.return} onPress={navigate}>
        <AntDesign name="arrowleft" size={36} color={COLORS.secondary} />
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
      <HamburgerButton
        onPress={() => {
          setShowMenu((prev) => !prev);
        }}
      />
      {showMenu && (
        <View style={styles.dropDown}>
          <TouchableOpacity
            style={styles.signUpPromptBtn}
            onPress={() => {
              setShowMenu(false), navigation.navigate("Profile");
            }}
          >
            <Text style={styles.buttonTextEmpty}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.signUpPromptBtn}
            onPress={() => {
              setShowMenu(false), navigation.navigate("ManageOrg");
            }}
          >
            <Text style={styles.buttonTextEmpty}>Organizations</Text>
          </TouchableOpacity>

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
  title: {
    fontSize: FONTS.large,
    fontFamily: FONTS.familyBold,
    color: COLORS.secondary,
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    height: 50,
    flexDirection: "row",
    alignItems: "center",
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
    backgroundColor: "#F5FCFF",

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
