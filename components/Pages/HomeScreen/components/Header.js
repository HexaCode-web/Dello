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
import { useSelector } from "react-redux";
export default function Header() {
  const { location, error } = useSelector((state) => state.location);

  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchAddress = async () => {
    setLoading(true);
    setAddress(null);
    let latitude = location.coords.latitude;
    let longitude = location.coords.longitude;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
        {
          headers: {
            "User-Agent": "Delllo/1.5 (marcomark5050@gmail.com)", // Replace with your app info
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Received non-JSON response");
      }

      const data = await response.json();
      if (data && data.display_name) {
        const { city, postcode, road } = data.address;
        const formattedAddress = `${city}, ${postcode}, ${road}`;

        setAddress(formattedAddress); // Excludes postcode
      } else {
        setAddress("Address not found");
      }
    } catch (error) {
      console.log("Error fetching address:", error);
      setAddress("Error fetching address");
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
        {loading ? (
          <ActivityIndicator size="large" color="#4B164C" />
        ) : (
          <>
            {/* <EvilIcons name="location" size={30} color={COLORS.primary} /> */}
            <Text style={styles.address}>{address}</Text>
          </>
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
