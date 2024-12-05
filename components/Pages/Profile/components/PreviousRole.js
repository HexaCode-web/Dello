import { View, Text, StyleSheet, Image } from "react-native";
import { FONTS, COLORS } from "../../../../theme";
import { FlatList } from "react-native";

export default function PreviousRole({ data }) {
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
  const renderItem = ({ item }) => (
    <View>
      <Text style={styles.text}>
        <Image
          source={require("../../../../assets/sperator.png")}
          style={styles.sperator}
        />{" "}
        {item.positionName}{" "}
        <Image
          source={require("../../../../assets/sperator.png")}
          style={styles.sperator}
        />{" "}
        {item.previousCompanyName}{" "}
        <Image
          source={require("../../../../assets/sperator.png")}
          style={styles.sperator}
        />{" "}
        {item.educationStartDate}{" "}
        {getTimeSince(data.previousCompanyJoiningDate) != "" ? (
          <Image
            source={require("../../../../assets/sperator.png")}
            style={styles.sperator}
          />
        ) : (
          ""
        )}
        {getTimeSince(data.previousCompanyJoiningDate)}
      </Text>
    </View>
  );
  return (
    <View style={styles.container}>
      <Image
        source={require("../../../../assets/PreviousRole.png")}
        style={styles.image}
      />
      {data.previousRole && data.previousRole.length > 0 ? (
        <FlatList
          data={data.previousRole}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          style={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
        />
      ) : (
        <Text>No data available</Text>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  imageWrapper: {
    alignItems: "center", // Center the image in the container
    justifyContent: "center",
  },
  container: {
    padding: 20,
    width: "100%",
    borderColor: COLORS.borders,
    borderBottomWidth: 1,
    marginTop: 20,
    flexDirection: "row",
    alignContent: "center",
    justifyContent: "flex-start",
  },
  image: {
    width: 40,
    height: 40,
    objectFit: "contain",
  },
  sperator: {
    width: 6,
    height: 6,
    objectFit: "contain",
  },

  text: {
    fontSize: FONTS.medium,
    marginLeft: 20,
    color: COLORS.textSecondary,
    fontFamily: FONTS.familyBold,
  },
});
