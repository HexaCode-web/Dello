import { View, Text, StyleSheet, Image } from "react-native";
import { FONTS, COLORS } from "../../../../theme";
import { FlatList } from "react-native";

export default function Education({ data }) {
  const renderItem = ({ item }) => (
    <View>
      <Text style={styles.text}>
        <Image
          source={require("../../../../assets/sperator.png")}
          style={styles.sperator}
        />{" "}
        {item.degreeName}{" "}
        <Image
          source={require("../../../../assets/sperator.png")}
          style={styles.sperator}
        />{" "}
        {item.instituteName}{" "}
        <Image
          source={require("../../../../assets/sperator.png")}
          style={styles.sperator}
        />{" "}
        {item.educationStartDate}
      </Text>
    </View>
  );
  return (
    <View style={styles.container}>
      <Image
        source={require("../../../../assets/Education.png")}
        style={styles.image}
      />
      {data.education && data.education.length > 0 ? (
        <FlatList
          data={data.education}
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
