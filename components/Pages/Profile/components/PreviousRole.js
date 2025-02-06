import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { FONTS, COLORS } from "../../../../theme";
import { FlatList } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function PreviousRole({ data, clickAble = true }) {
  const navigation = useNavigation();
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

    return result.trim();
  }
  const renderItem = ({ item }) => {
    let formattedDate = "N/A";
    if (item.Duration) {
      const startDate = new Date(item.Duration);
      if (!isNaN(startDate)) {
        const options = { year: "numeric", month: "short" };
        formattedDate = new Intl.DateTimeFormat("en-US", options).format(
          startDate
        );
      }
    }
    return (
      <View>
        <Text style={styles.text}>
          <Image
            source={require("../../../../assets/sperator.png")}
            style={styles.sperator}
          />{" "}
          {item.Position}{" "}
          <Image
            source={require("../../../../assets/sperator.png")}
            style={styles.sperator}
          />{" "}
          {item.Company}{" "}
          <Image
            source={require("../../../../assets/sperator.png")}
            style={styles.sperator}
          />{" "}
          {formattedDate}{" "}
          {getTimeSince(item.Duration) != "" ? (
            <Image
              source={require("../../../../assets/sperator.png")}
              style={styles.sperator}
            />
          ) : (
            ""
          )}{" "}
          {getTimeSince(item.Duration)}
        </Text>
      </View>
    );
  };
  return clickAble ? (
    <TouchableOpacity
      style={styles.container}
      onPress={() => {
        navigation.navigate("Settings", { screen: "Previous Roles" });
      }}
    >
      {data && data.length > 0 ? (
        <>
          <Image
            source={require("../../../../assets/PreviousRole.png")}
            style={styles.image}
          />

          <FlatList
            data={data}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            style={styles.list}
            ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
          />
        </>
      ) : (
        <Text style={styles.placeHolder}>Previous Roles</Text>
      )}
    </TouchableOpacity>
  ) : (
    <View
      style={styles.container}
      onPress={() => {
        navigation.navigate("Settings", { screen: "Previous Roles" });
      }}
    >
      {data && data.length > 0 ? (
        <>
          <Image
            source={require("../../../../assets/PreviousRole.png")}
            style={styles.image}
          />

          <FlatList
            data={data}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            style={styles.list}
            ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
          />
        </>
      ) : (
        <Text style={styles.placeHolder}>Previous Roles</Text>
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
    paddingRight: 50,

    flexDirection: "row",
    alignContent: "center",
    justifyContent: "flex-start",
  },
  placeHolder: {
    margin: "auto",
    fontSize: FONTS.medium,
    fontFamily: FONTS.familyBold,
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
    paddingBottom: 8,
  },

  text: {
    fontSize: FONTS.medium,
    marginLeft: 20,
    color: COLORS.textSecondary,
    fontFamily: FONTS.familyBold,
    flexWrap: "wrap", // Allow text to wrap
    flexShrink: 1, // Allow the text to shrink if necessary
    width: "78%", // Ensure the text container takes up the available width
  },
});
