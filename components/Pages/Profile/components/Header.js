import { View, StyleSheet, Text, TouchableOpacity, Image } from "react-native";
import { useSelector } from "react-redux";
import { FONTS } from "../../../../theme";

export default function Header() {
  const User = useSelector((state) => state.auth.user);

  return (
    <View style={styles.header}>
      <Image
        source={require("../../../../assets/user.png")}
        style={styles.profilePic}
      />
      <View>
        <Text style={styles.userName}>{User.userName}</Text>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  profilePic: {
    width: 111,
    height: 112,
    borderRadius: 50,
    backgroundColor: "#fff", // Set background color to ensure shadow visibility
    // Shadow properties for iOS
    shadowColor: "#937393", // Color of the shadow
    shadowOffset: {
      width: 0,
      height: 3, // Vertical shadow offset
    },
    shadowOpacity: 0.5, // Opacity of the shadow
    shadowRadius: 6, // Blur radius of the shadow
    // Elevation for Android
    elevation: 5, // Shadow effect for Android
  },

  userName: {
    fontSize: FONTS.largeHeader,

    marginLeft: "auto",
    textAlign: "left",
    color: "black",
    fontFamily: FONTS.familyBold,
  },

  header: {
    height: 160,
    justifyContent: "space-around",
    alignItems: "center",
    flexDirection: "row",
    gap: 50,
    paddingHorizontal: 16,
    marginBottom: 10,
    marginTop: 30,
    borderRadius: 10,
    padding: 10,
    width: "80%",
    alignSelf: "center",
  },
});
