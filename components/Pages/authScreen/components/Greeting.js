import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { COLORS, FONTS } from "../../../../theme";
import Constants from "expo-constants";

export default function Greeting({ navigation }) {
  return (
    <View style={styles.container}>
      <Image
        source={require("../../../../assets/authBG.png")}
        style={styles.image}
      />
      <Text style={styles.Header}>Connect to people now</Text>
      <View style={styles.signUpPrompt}>
        <Text style={styles.signUpPromptText}>Don't have an account?</Text>
        <TouchableOpacity
          style={styles.signUpPromptBtn}
          onPress={() => navigation.navigate("Signup")}
        >
          <Text style={styles.buttonTextEmpty}>Sign Up</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.buttonWrapper}>
        <TouchableOpacity
          style={styles.DefaultButton}
          onPress={() => navigation.navigate("SignIn")}
        >
          <Text style={styles.buttonText}>Login with Email</Text>
        </TouchableOpacity>
      </View>
      <Text>version {Constants.expoConfig.version}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",

    alignItems: "center",
    paddingTop: 0,
    paddingBottom: 20,
    justifyContent: "space-between",
    color: "black",
  },
  Header: {
    width: "60%",
    fontSize: FONTS.smallHeader,
    textAlign: "center",
    marginBottom: 20,
    fontFamily: FONTS.familyBold,
  },
  signUpPrompt: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  signUpPromptText: {
    fontSize: FONTS.medium,
    color: COLORS.textSecondary,
    fontFamily: FONTS.familyBold,
  },
  signUpPromptBtn: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  image: {
    width: "85%",
    height: "50%",
    resizeMode: "contain",
    marginBottom: 20,
  },
  buttonWrapper: {
    width: "100%",

    justifyContent: "center",
    alignItems: "center",
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
  emptyBtn: {
    backgroundColor: "transparent",
    shadowColor: "transparent",
    borderWidth: 2,
    borderColor: COLORS.secondary,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 30,
  },
  buttonTextEmpty: {
    fontSize: FONTS.medium,
    fontFamily: FONTS.familyBold,
    color: COLORS.secondary,
  },
  PhoneIcon: {
    position: "absolute",
    left: 17,
    width: 45,
    height: 45,
    resizeMode: "contain",
    top: 7,
  },
});
