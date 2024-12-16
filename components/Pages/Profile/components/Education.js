import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { FONTS, COLORS } from "../../../../theme";
import { FlatList } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { setActiveSettingsPage } from "../../../redux/slices/activeSettingsPage";

export default function Education({ data }) {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const renderItem = ({ item }) => {
    const startDate = new Date(item.StartDate);
    const endDate = new Date(item.EndDate);
    const formattedStartDate = startDate.toISOString().split("T")[0];
    const formattedEndDate = endDate.toISOString().split("T")[0];

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
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => {
        dispatch(setActiveSettingsPage("Education"));
        navigation.navigate("Settings");
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
  },
});
