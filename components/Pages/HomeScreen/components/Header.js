import { Text, StyleSheet, View, TextInput } from "react-native";
import { COLORS, FONTS } from "../../../../theme";
import AntDesign from "@expo/vector-icons/AntDesign";

export default function Header() {
  return (
    <View style={styles.container}>
      <View style={styles.inputsWrapper}>
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    alignItems: "center",
    paddingTop: 40,
    justifyContent: "space-between",
    color: "black",
    width: "100%", // Ensures full width on the header
  },

  icon: {
    position: "absolute", // Changed to absolute positioning
    left: 20, // Positioned closer to the left edge
    top: 25, // Adjusted vertical position for better alignment
    zIndex: 10,
  },
  input: {
    height: 50,
    width: 350,
    margin: 12,

    borderWidth: 1,
    borderColor: COLORS.borders, // Optional: Define border color
    borderRadius: 12,
    paddingLeft: 40, // Added padding for indentation (to accommodate icon)
    fontSize: FONTS.medium,
    fontFamily: FONTS.familyBold,
    backgroundColor: "#F5F8FC",
  },
  inputsWrapper: {
    flexDirection: "row", // Ensure icon and input are in a row
    alignItems: "center", // Center align icon and input vertically
    position: "relative", // Allow for absolute positioning of the icon
  },
});
