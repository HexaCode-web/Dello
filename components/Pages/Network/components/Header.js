import { Text, StyleSheet, View, TextInput } from "react-native";
import { COLORS, FONTS } from "../../../../theme";
import AntDesign from "@expo/vector-icons/AntDesign";
import HamburgerButton from "../../HomeScreen/components/HamburgerButton";
import react from "react";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity } from "react-native";
import TopBar from "../../../GeneralComponents/TopBar";
export default function Header() {
  const [showMenu, setShowMenu] = react.useState(false);
  const navigation = useNavigation(); // Assuming you are using React Navigation v5 or later

  return (
    <View style={styles.container}>
      {/* <View style={styles.inputsWrapper}>
        <AntDesign
          name="search1"
          size={24}
          color="#D5D5D5"
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          placeholder="Search Contacts"
          placeholderTextColor={COLORS.placeholder} // Optional: Change color for placeholder text
        />
      </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    zIndex: 1000,
    paddingBottom: 40,
    flex: 0.1,
  },
  imageWrapper: {
    alignItems: "center", // Center the image in the container
    justifyContent: "center",
  },
  icon: {
    position: "absolute",
    left: 20,
    top: 25,
    zIndex: 10,
  },
  input: {
    height: 50,
    width: 300,
    margin: 12,
    borderWidth: 1,
    borderColor: COLORS.borders, // Optional: Define border color
    borderRadius: 12,
    paddingLeft: 40,
    fontSize: FONTS.medium,
    fontFamily: FONTS.familyBold,
    backgroundColor: "#F5F8FC",
  },
  inputsWrapper: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  dropDown: {
    zIndex: 1000,
    position: "absolute",
    top: 100,
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
