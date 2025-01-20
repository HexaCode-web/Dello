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
import { useGetLocation } from "../../../hooks/getLocation";
export default function Header() {
  const [coords, error] = useGetLocation();

  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchAddress = async () => {
    setLoading(true);
    setLocation(null);
    let latitude = coords.coords.latitude;
    let longitude = coords.coords.longitude;

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
        const { city, postcode } = data.address;
        const formattedAddress = `${city}, ${postcode}`;

        setLocation(formattedAddress); // Excludes postcode
      } else {
        setLocation("Address not found");
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      setLocation("Error fetching address");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (coords) {
        fetchAddress();
      }
    }, [coords])
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
            <Text style={styles.address}>{location}</Text>
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
    paddingTop: 20,
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
    paddingTop: 20,
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
