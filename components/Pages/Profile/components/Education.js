import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { FONTS, COLORS } from "../../../../theme";
import { FlatList } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function Education({ data, clickAble = true }) {
  const navigation = useNavigation();
  const renderItem = ({ item }) => {
    const startDate = new Date(item.StartDate);
    const endDate = new Date(item.EndDate);
    let formattedStartDate = "N/A";
    let formattedEndDate = "N/A";
    if (item.StartDate) {
      const startDate = new Date(item.StartDate);
      if (!isNaN(startDate)) {
        const options = { year: "numeric", month: "short" };
        formattedStartDate = new Intl.DateTimeFormat("en-US", options).format(
          startDate
        );
      }
    }

    if (item.EndDate) {
      const endDate = new Date(item.EndDate);
      if (!isNaN(endDate)) {
        const options = { year: "numeric", month: "short" };
        formattedEndDate = new Intl.DateTimeFormat("en-US", options).format(
          endDate
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
          {item.Degree}{" "}
          <Image
            source={require("../../../../assets/sperator.png")}
            style={styles.sperator}
          />{" "}
          {item.Institution}{" "}
          <Image
            source={require("../../../../assets/sperator.png")}
            style={styles.sperator}
          />{" "}
          {formattedStartDate}{" "}
          <Image
            source={require("../../../../assets/sperator.png")}
            style={styles.sperator}
          />{" "}
          {formattedEndDate}
        </Text>
      </View>
    );
  };
  return clickAble ? (
    <TouchableOpacity
      style={styles.container}
      onPress={() => {
        navigation.navigate("Settings", { screen: "Education" });
      }}
    >
      {data && data.length > 0 ? (
        <>
          <Image
            source={require("../../../../assets/Education.png")}
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
        <Text style={styles.placeHolder}>Education</Text>
      )}
    </TouchableOpacity>
  ) : (
    <View
      style={styles.container}
      onPress={() => {
        navigation.navigate("Settings", { screen: "Education" });
      }}
    >
      {data && data.length > 0 ? (
        <>
          <Image
            source={require("../../../../assets/Education.png")}
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
        <Text style={styles.placeHolder}>Education</Text>
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
    flexDirection: "row",
    alignContent: "center",
    paddingRight: 50,

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
    width: "60%", // Ensure the text container takes up the available width
  },
});
