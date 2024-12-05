import React from "react";
import { View, Text, StyleSheet, Image, FlatList } from "react-native";
import { COLORS, FONTS } from "../../../../theme";

export default function BusinessDriver({ data }) {
  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.text}>
        <Image
          source={require("../../../../assets/sperator.png")}
          style={styles.sperator}
        />{" "}
        {item.serviceName}{" "}
        <Image
          source={require("../../../../assets/sperator.png")}
          style={styles.sperator}
        />{" "}
        {item.clientName}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.imageWrapper}>
        <Image
          source={require("../../../../assets/bussinessDrive.png")}
          style={styles.image}
        />
      </View>

      {data.businessDrivers && data.businessDrivers.length > 0 ? (
        <FlatList
          data={data.businessDrivers}
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
