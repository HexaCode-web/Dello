import { View, StyleSheet, Text, TouchableOpacity, Image } from "react-native";
import react from "react";
import HamburgerButton from "../Pages/HomeScreen/components/HamburgerButton";
import { useNavigation } from "@react-navigation/native";
import { COLORS, FONTS } from "../../theme";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import AntDesign from "@expo/vector-icons/AntDesign";
export default function TopBar({
  Tabs = [
    { Name: "Security", Page: "Security" },
    { Name: "Profile", Page: "Profile" },
    { Name: "Profiles", Page: "Profiles" },
    { Name: "Organisation", Page: "Organizations" },
  ],
  hasReturnButton,
  returnTarget,
  Title,
  returnFunction,
}) {
  const [showMenu, setShowMenu] = react.useState(false);
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
      {hasReturnButton ? (
        <TouchableOpacity
          style={styles.return}
          onPress={() => {
            if (returnFunction) {
              returnFunction(); // Execute the passed function if it exists
            } else if (returnTarget) {
              navigation.navigate(returnTarget); // Navigate to the specified target if available
            } else {
              navigation.goBack(); // Default to going back if no target or function is provided
            }
          }}
        >
          <AntDesign name="arrowleft" size={36} color={COLORS.secondary} />
        </TouchableOpacity>
      ) : (
        <View style={styles.imageWrapper}>
          <Image
            source={require("../../assets/logodarkblue.png")}
            style={styles.image}
          />
        </View>
      )}
      <Text style={styles.title}>{Title}</Text>
      <HamburgerButton
        onPress={() => {
          setShowMenu((prev) => !prev);
        }}
      />
      {showMenu && (
        <View style={styles.dropDown}>
          {RenderTabs()}

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

    backgroundColor: "#F5FCFF",

    zIndex: 1000,
  },
  title: {
    fontSize: FONTS.large,
    fontFamily: FONTS.familyBold,
    color: COLORS.secondary,
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
