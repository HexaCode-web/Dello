import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { COLORS, FONTS } from "../../../../theme";
export default function Screen4() {
  return (
    <>
      <Image
        source={require("../../../../assets/Finished.gif")}
        style={styles.gif}
      />
      <View style={styles.textWrapper}>
        <Text style={styles.Header}></Text>
        <Text style={styles.Header}>Organization created</Text>
      </View>
    </>
  );
}
const styles = StyleSheet.create({
  gif: {
    width: 200,
    height: 200,
  },

  Header: {
    fontSize: FONTS.large,
    fontFamily: FONTS.familyBold,

    marginBottom: 10,
    textAlign: "center",
  },
  textWrapper: {
    marginBottom: 20,
    marginLeft: 5,
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    gap: 10,
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
