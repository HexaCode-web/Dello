import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import CodeInput from "./CodeInput";
import { COLORS, FONTS } from "../../../../theme";

export default function Screen3({ sendOTP, onChangeOTP, finalizeSignUp }) {
  return (
    <>
      <View style={styles.textWrapper}>
        <Text style={styles.Header}>Verification</Text>
        <Text style={styles.signUpPromptText}>
          Please add the OTP Number sent to your email
        </Text>
      </View>
      <View style={styles.inputsWrapper}>
        <CodeInput onCodeChange={onChangeOTP} />
      </View>
      <View style={styles.signUpPrompt}>
        <Text style={styles.signUpPromptText}>Didn't receive code?</Text>
        <TouchableOpacity style={styles.signUpPromptBtn}>
          <Text
            style={styles.buttonTextEmpty}
            onPress={() => {
              sendOTP();
            }}
          >
            Resend now
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.buttonWrapper}>
        <TouchableOpacity
          onPress={() => {
            finalizeSignUp();
          }}
          style={styles.DefaultButton}
        >
          <Text style={styles.buttonText}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
const styles = StyleSheet.create({
  Header: {
    width: "100%",
    fontSize: FONTS.large,
    fontFamily: FONTS.familyBold,
    marginBottom: 10,
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
  signUpPromptBtn: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  inputsWrapper: {
    flex: 1,
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
  buttonTextEmpty: {
    fontSize: FONTS.medium,
    fontFamily: FONTS.familyBold,
    color: COLORS.secondary,
  },
  buttonText: {
    fontSize: FONTS.medium,
    fontFamily: FONTS.familyBold,
    color: "white",
  },
  signUpPrompt: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
});
