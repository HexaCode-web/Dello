import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { COLORS, FONTS } from "../../../../theme";
import { useNavigation } from "@react-navigation/native";

export default function presentRole({ data, clickAble = true }) {
  const navigation = useNavigation();

  return clickAble ? (
    <TouchableOpacity
      style={styles.container}
      onPress={() => {
        navigation.navigate("Security", { screen: "Change Email" });
      }}
    >
      {data ? (
        <>
          <View>
            <Text style={styles.mainText}>Email: {data?.email}</Text>
            <Text style={styles.mainText}>Phone: {data?.phone} </Text>
          </View>
        </>
      ) : (
        <Text style={styles.placeholder}>Contact Info</Text>
      )}
    </TouchableOpacity>
  ) : (
    <View style={styles.container}>
      {data ? (
        <>
          <View>
            <Text style={styles.mainText}>Email: {data?.email}</Text>
            <Text style={styles.mainText}>Phone: {data?.phone} </Text>
          </View>
        </>
      ) : (
        <Text style={styles.placeholder}>Contact Info</Text>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    padding: 16,
    width: "100%",
    paddingHorizontal: 40,
    display: "flex",
    borderColor: COLORS.borders,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    justifyContent: "space-between",
    alignContent: "flex-start",
    flexDirection: "row",
    minHeight: 70,
  },
  placeholder: {
    margin: "auto",
    fontSize: FONTS.medium,
    fontFamily: FONTS.familyBold,
  },
  mainText: {
    fontSize: FONTS.medium,
    color: COLORS.textThird,
    fontFamily: FONTS.familyBold,
    marginBottom: 5,
    marginRight: 20,
  },
  subText: {
    fontFamily: FONTS.familyLight,
    fontSize: FONTS.medium,
  },
});
