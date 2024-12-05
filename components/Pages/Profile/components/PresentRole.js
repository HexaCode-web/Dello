import { View, Text, StyleSheet } from "react-native";
import { COLORS, FONTS } from "../../../../theme";
export default function presentRole({ data }) {
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
      result += `${years} Yr${years > 1 ? "s" : ""} `;
    }

    if (months > 0) {
      result += `${months} Mth${months > 1 ? "s" : ""} `;
    }

    if (days > 0) {
      result += `${days} day${days > 1 ? "s" : ""}`;
    }

    return result.trim();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.mainText}>
        {data?.positioName} • {data?.presentRoleCompanyName}
      </Text>
      <View>
        <Text style={styles.subText}>Present</Text>
        <Text>{getTimeSince(data?.presentRoleStartedDate)}</Text>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    padding: 16,
    width: "100%",
    display: "flex",
    borderColor: COLORS.borders,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    justifyContent: "space-between",
    alignContent: "flex-start",
    flexDirection: "row",
    height: 70,
  },
  mainText: {
    fontSize: FONTS.medium,
    color: COLORS.textThird,
    fontFamily: FONTS.familyBold,
    marginBottom: 5,
    marginLeft: 10,
  },
  subText: {
    fontFamily: FONTS.familyLight,
    fontSize: FONTS.medium,
  },
});
