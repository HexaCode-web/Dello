import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { FONTS, COLORS } from "../../../../theme";
import { FlatList } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { setActiveSettingsPage } from "../../../redux/slices/activeSettingsPage";

export default function HighLights({ data }) {
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
      result += `${years} Yr${years > 1 ? "s" : ""} `;
    }

    if (months > 0) {
      result += `${months} Mth${months > 1 ? "s" : ""} `;
    }



    return result.trim();
  }
  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.text}>
        <Image
          source={require("../../../../assets/sperator.png")}
          style={styles.sperator}
        />{" "}
        {item.Highlight}{" "}
        <Image
          source={require("../../../../assets/sperator.png")}
          style={styles.sperator}
        />{" "}
        {item.Reference}{" "}
        {getTimeSince(data.Date) != "" ? (
          <Image
            source={require("../../../../assets/sperator.png")}
            style={styles.sperator}
          />
        ) : (
          ""
        )}
        {getTimeSince(data.Date)}
      </Text>
    </View>
  );

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => {
        dispatch(setActiveSettingsPage("Highlights"));
        navigation.navigate("Settings");
      }}
    >
      {data && data.length > 0 ? (
        <>
          <View style={styles.imageWrapper}>
            <Image
              source={require("../../../../assets/Hightlights.png")}
              style={styles.image}
            />
          </View>

          <FlatList
            data={data}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            style={styles.list}
            ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
          />
        </>
      ) : (
        <Text style={styles.placeHolder}>High Lights</Text>
      )}
    </TouchableOpacity>
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
    paddingRight: 50,
    borderColor: COLORS.borders,
    borderBottomWidth: 1,
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
  },
});
