import { useFocusEffect } from "@react-navigation/native";
import { Text, View, FlatList, StyleSheet, Dimensions } from "react-native";
import { useSelector } from "react-redux";
import { useCallback, useState } from "react";
import axios from "axios";
import { COLORS, FONTS } from "../../../../theme";
import NetworkItem from "./NetworkItem"; // Import the separated component

export default function OldNetworks({ OrgId, setActivePage, activePage }) {
  console.log(OrgId);

  const User = useSelector((state) => state.auth.user);
  const [oldNetworks, setOldNetworks] = useState([]);

  const getAllNetworks = async () => {
    try {
      const config = {
        method: "get",
        url: `${process.env.EXPO_PUBLIC_NETWORK_API}/getOrgNetworks/${OrgId}`,
        headers: {
          "Accept-Language": "en",
          "Content-Type": "application/json",
          Authorization: `Bearer ${User.token}`,
        },
      };
      const response = await axios(config);
      setOldNetworks(response.data);
    } catch (error) {
      if (error.message === "Request failed with status code 400") {
        setOldNetworks([]);
      }
      console.error(error.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getAllNetworks();

      // Optional: Clear data when component is unmounted
      return () => {
        setOldNetworks([]);
      };
    }, [User, OrgId])
  );

  return (
    <View style={styles.container}>
      {oldNetworks.length > 0 ? (
        <FlatList
          data={oldNetworks}
          renderItem={({ item }) => (
            <NetworkItem item={item} setActivePage={setActivePage} />
          )}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <Text style={styles.noData}>No Networks Found</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F5FCFF",
    width: "100%",
    color: "black",
  },
  header: {
    fontSize: FONTS.large,
    fontFamily: FONTS.familyBold,
    color: COLORS.secondary,
    marginBottom: 10,
  },
  listContainer: {
    width: "100%",
    paddingHorizontal: 20,
  },
  noData: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginTop: 20,
  },
});
