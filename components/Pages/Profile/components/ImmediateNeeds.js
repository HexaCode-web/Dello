import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { FONTS, COLORS } from "../../../../theme";
import { useNavigation } from "@react-navigation/native";

export default function ImmediateNeeds({ data, clickAble = true }) {
  const navigation = useNavigation();
  const renderItem = ({ item }) => (
    <View>
      <Text style={styles.text}>
        <Image
          source={require("../../../../assets/sperator.png")}
          style={styles.sperator}
        />{" "}
        {item.ImmediateNeed}
      </Text>
    </View>
  );
  return clickAble ? (
    <TouchableOpacity
      style={styles.container}
      onPress={() => {
        navigation.navigate("Settings", { screen: "Immediate Need" });
      }}
    >
      {data && data.length > 0 ? (
        <>
          <Image
            source={require("../../../../assets/IN.png")}
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
        <Text style={styles.placeHolder}>Immediate Needs</Text>
      )}
    </TouchableOpacity>
  ) : (
    <View
      style={styles.container}
      onPress={() => {
        navigation.navigate("Settings", { screen: "Immediate Need" });
      }}
    >
      {data && data.length > 0 ? (
        <>
          <Image
            source={require("../../../../assets/IN.png")}
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
        <Text style={styles.placeHolder}>Immediate Needs</Text>
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
    paddingRight: 50,

    alignContent: "center",
    justifyContent: "flex-start",
  },
  image: {
    width: 40,
    height: 40,
    objectFit: "contain",
  },
  placeHolder: {
    margin: "auto",
    fontSize: FONTS.medium,
    fontFamily: FONTS.familyBold,
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
    width: "100%", // Ensure the text container takes up the available width
  },
});
