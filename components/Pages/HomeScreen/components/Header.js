import {
  Text,
  StyleSheet,
  View,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { COLORS, FONTS } from "../../../../theme";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../../redux/slices/authSlice";
export default function Header() {
  const { location, error } = useSelector((state) => state.location);
  const dispatch = useDispatch();

  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [addressLoaded, setAddressLoaded] = useState(false);
  const fetchAddress = async () => {
    setLoading(true);
    const { latitude, longitude } = location.coords;

    try {
      const [osmResponse, firestoreResponse] = await Promise.all([
        fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
          { headers: { "User-Agent": "Delllo/1.5 (marcomark5050@gmail.com)" } }
        ),
        fetch(
          `https://firestore.googleapis.com/v1/projects/myawesomeapp-1f97d/databases/(default)/documents/Cities/Cities`
        ),
      ]);
      if (!osmResponse.ok || !firestoreResponse.ok) {
        throw new Error(`API error: OSM=${osmResponse.status}`);
      }
      const [osmData, firestoreData] = await Promise.all([
        osmResponse.json(),
        firestoreResponse.json(),
      ]);

      if (!firestoreResponse.ok)
        throw new Error(`Firestore error! Status: ${firestoreResponse.status}`);

      const formattedAddress = osmData.display_name
        ? `${osmData.address.city}, ${osmData.address.postcode}, ${osmData.address.road}`
        : "Address not found";

      setAddress(formattedAddress);
      setAddressLoaded(firestoreData.fields.Data.booleanValue);
    } catch (error) {
      console.error("Error:", error);
      setAddress("Error fetching data");
      if (error.status === 401) dispatch(logout());
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAddress();
    }, [location])
  );

  return (
    <View style={styles.container}>
      <View style={styles.inputsWrapper}>
        <AntDesign
          name="search1"
          size={24}
          color="#D5D5D5"
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          placeholder="Search Network"
          placeholderTextColor={COLORS.placeholder} // Optional: Change color for placeholder text
        />
      </View>
      <View style={styles.addressContainer}>
        {addressLoaded ? (
          <Text style={styles.address}>{address}</Text>
        ) : (
          <View style={styles.address}>{address}</View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F5FCFF",

    alignItems: "center",
    paddingTop: 0,
    justifyContent: "space-between",
    color: "black",
    width: "100%", // Ensures full width on the header
  },

  icon: {
    position: "absolute", // Changed to absolute positioning
    left: 20, // Positioned closer to the left edge
    top: 25, // Adjusted vertical position for better alignment
    zIndex: 10,
  },
  addressContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingTop: 0,
    paddingLeft: 15,
  },
  address: {
    fontSize: FONTS.small,
    fontFamily: FONTS.familyBold,
    textAlign: "left",
  },
  input: {
    height: 50,
    width: 350,
    margin: 12,

    borderWidth: 1,
    borderColor: COLORS.borders,
    borderRadius: 12,
    paddingLeft: 40,
    fontSize: FONTS.medium,
    fontFamily: FONTS.familyBold,
    backgroundColor: "#F5F8FC",
  },
  inputsWrapper: {
    flexDirection: "row", // Ensure icon and input are in a row
    alignItems: "center", // Center align icon and input vertically
    position: "relative", // Allow for absolute positioning of the icon
  },
});
