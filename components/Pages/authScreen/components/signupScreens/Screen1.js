import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { COLORS, FONTS } from "../../../../../theme";
export default function Screen1({
  userInfo,
  onChangePassword,
  onChangeConfirmPassword,
  setActiveInnerPage,
  setErrorInForm,
}) {
  return (
    <>
      <View style={styles.textWrapper}>
        <Text style={styles.Header}>Create Password</Text>
      </View>
      <View style={styles.inputsWrapper}>
        <View style={styles.inputWrapper}>
          <Text style={styles.signUpPromptText}>Password</Text>
          <TextInput
            placeholder="Password"
            returnKeyType="go"
            secureTextEntry
            autoCorrect={false}
            style={styles.input}
            onChangeText={(value) => onChangePassword(value)}
            value={userInfo.Password}
          />
        </View>
        <View style={styles.inputWrapper}>
          <Text style={styles.signUpPromptText}>Confirm Password</Text>
          <TextInput
            placeholder="Password"
            returnKeyType="go"
            secureTextEntry
            autoCorrect={false}
            style={styles.input}
            onChangeText={(value) => onChangeConfirmPassword(value)}
            value={userInfo.ConfirmPassword}
          />
        </View>
      </View>
      <View style={styles.buttonWrapper}>
        <TouchableOpacity
          onPress={() => {
            if (userInfo.Password.length < 8) {
              setErrorInForm("Password must be at least 8 characters long");
              return;
            }
            if (userInfo.ConfirmPassword === userInfo.Password) {
              setActiveInnerPage(2);
              setErrorInForm("");
            } else {
              setErrorInForm("passwords do not match");
            }
          }}
          style={styles.DefaultButton}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
const styles = StyleSheet.create({
  inputWrapper: {
    display: "flex",
    flexDirection: "column",
  },
  inputsWrapper: {
    flex: 1,
  },
  input: {
    height: 50,
    width: 350,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    fontSize: FONTS.medium,
    fontFamily: FONTS.familyBold,
    borderRadius: 30,
  },
  Header: {
    fontSize: FONTS.large,
    fontFamily: FONTS.familyBold,
  },

  signUpPromptText: {
    fontSize: FONTS.medium,
    fontFamily: FONTS.familyLight,
    color: COLORS.textSecondary,
  },
  textWrapper: {
    marginBottom: 20,
    marginLeft: 40,
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    width: "100%",
    gap: 10,
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
});
