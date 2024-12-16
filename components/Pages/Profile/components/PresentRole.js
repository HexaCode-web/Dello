import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { COLORS, FONTS } from "../../../../theme";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { setActiveSettingsPage } from "../../../redux/slices/activeSettingsPage";

export default function presentRole({ data }) {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  function getTimeSince(startDate) {
    // Get the current date
    const currentDate = new Date();

    // Convert the startDate to a Date object
    const start = new Date(startDate);

    // Initialize values for years, months, and days
    let years = currentDate.getFullYear() - start.getFullYear();
    let months = currentDate.getMonth() - start.getMonth();
    let days = currentDate.getDate() - start.getDate();

    // Adjust for negative days
    if (days < 0) {
      months--;
      const previousMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        0
      );
      days += previousMonth.getDate();
    }

    // Adjust for negative months
    if (months < 0) {
      years--;
      months += 12;
    }

    // Build the result string
    let result = "";

    if (years > 0) {
      result += `${years} year${years > 1 ? "s" : ""} `;
    }

    if (months > 0) {
      result += `${months} month${months > 1 ? "s" : ""} `;
    }

    return result.trim();
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => {
        dispatch(setActiveSettingsPage("PresentRole"));
        navigation.navigate("Settings");
      }}
    >
      {data.Company ? (
        <>
          <View>
            <Text style={styles.mainText}>{data?.Position}</Text>
            <Text style={styles.mainText}>{data?.Company} </Text>
          </View>
          <View>
            <Text style={styles.subText}>Present</Text>
            <Text>{getTimeSince(data?.StartDate)}</Text>
          </View>
        </>
      ) : (
        <Text style={styles.placeholder}>Present Role</Text>
      )}
    </TouchableOpacity>
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
