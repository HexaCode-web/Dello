import { useFocusEffect } from "@react-navigation/native";
import { Text, View, FlatList, StyleSheet, Dimensions } from "react-native";
import { useSelector } from "react-redux";
import { NETWORK_API } from "@env";
import axios from "axios";
import { useCallback, useState } from "react";
import { COLORS, FONTS } from "../../../../theme";

const { width } = Dimensions.get("window"); // Get screen width

export default function OldNetworks() {
  const Org = useSelector((state) => state.auth.org);
  const [oldNetworks, setOldNetworks] = useState([]);

  const getAllNetworks = async () => {
    try {
      const config = {
        method: "get",
        url: `${NETWORK_API}/network/get_all_network_by_organization/${Org.organizationId}`,
        headers: {
          "Accept-Language": "en",
          "Content-Type": "application/json",
          Authorization: `Bearer ${Org.token}`,
        },
      };
      const response = await axios(config);
      setOldNetworks(response.data.dataList);
    } catch (error) {
      if (error.message === "Request failed with status code 400") {
        console.log("No Old Networks Found");
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
    }, [Org])
  );

  const renderNetwork = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.networkName}</Text>
      <Text style={styles.info}>Admin ID: {item.adminId}</Text>
      <Text style={styles.info}>Size: {item.size}</Text>
      <Text style={styles.info}>Type: {item.type}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}> Networks</Text>
      {oldNetworks.length > 0 ? (
        <FlatList
          data={oldNetworks}
          renderItem={renderNetwork}
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
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 50,
    justifyContent: "space-between",
    color: "black",
  },
  header: {
    fontSize: FONTS.large,
    fontFamily: FONTS.familyBold,
    color: COLORS.secondary,
  },
  listContainer: {
    flexGrow: 1, // Ensures the list stretches fully
    alignItems: "center", // Centers the cards horizontally
  },
  card: {
    width: width - 40, // Full width minus some margin
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#0056b3",
  },
  info: {
    fontSize: 14,
    color: "#555",
  },
  noData: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginTop: 20,
  },
});
