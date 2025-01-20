import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
  Alert,
} from "react-native";

import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { COLORS, FONTS } from "../../../../theme";
import { updateUserData } from "../../../redux/slices/authSlice";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
const BusinessDrivers = ({ navigation }) => {
  const User = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const [isModalVisible, setModalVisible] = useState(false);
  const [service, setService] = useState("");
  const [company, setCompany] = useState("");
  const [error, setError] = useState();
  const [saved, setSaved] = useState(false); // State to track saved status
  const [activeService, setActiveService] = useState(null);

  const hideModal = () => {
    setActiveService(null);
    setModalVisible(false);
  };
  const showModal = (item) => {
    setActiveService(item);
    setModalVisible(true);
  };

  const savePresentRoleDetails = async () => {
    setSaved(false);

    if (service == "" || company == "") {
      setError("All fields are required");
      return;
    }
    setError("");

    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_PROFILE_API}/businessDriver/add/${User.ID}`,
        {
          businessDriver: {
            Client: company,
            Service: service,
          },
        },
        {
          headers: {
            Accept: "application/json",
            "Accept-Language": "en",
            "Content-Type": "application/json",
            Authorization: `Bearer ${User.Token}`,
          },
        }
      );
      if (response.status === 200) {
        setService("");
        setCompany("");
        dispatch(updateUserData(response.data));
        setSaved(true);
        Alert.alert("Saved", "Saved");
      }
    } catch (error) {
      console.log(error);
      setError(error.message);
    }
  };
  const deleteProperty = async (ID) => {
    try {
      const response = await axios.delete(
        `${process.env.EXPO_PUBLIC_PROFILE_API}/businessDriver/delete/${User.user._id}`,
        {
          headers: {
            Accept: "application/json",
            "Accept-Language": "en",
            "Content-Type": "application/json",
            authorization: `Bearer ${User.Token}`,
          },
          data: { businessDriverId: ID }, // Send the businessDriverId in the body (data field)
        }
      );

      if (response.status === 200) {
        setSaved(false);

        dispatch(updateUserData(response.data.user));
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", error.message);
    }
  };
  const editProperty = async () => {
    try {
      const response = await axios.put(
        `${process.env.EXPO_PUBLIC_PROFILE_API}/businessDriver/update/${User.user._id}`,
        {
          businessDriverId: activeService._id,
          updatedBusinessDriver: activeService,
        },
        {
          headers: {
            Accept: "application/json",
            "Accept-Language": "en",
            "Content-Type": "application/json",
            authorization: `Bearer ${User.Token}`,
          },
        }
      );

      if (response.status === 200) {
        setSaved(false);
        setActiveService(null);
        setModalVisible(false);
        dispatch(updateUserData(response.data.user));
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", error.message);
    }
  };
  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.text}>
        <Image
          source={require("../../../../assets/sperator.png")}
          style={styles.sperator}
        />{" "}
        {item.Service}{" "}
        <Image
          source={require("../../../../assets/sperator.png")}
          style={styles.sperator}
        />{" "}
        {item.Client}
      </Text>
      <TouchableOpacity>
        <FontAwesome6
          name="edit"
          size={24}
          color={COLORS.secondary}
          style={styles.icon}
          onPress={() => {
            showModal(item);
          }}
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          deleteProperty(item._id);
        }}
      >
        <Ionicons
          name="trash-outline"
          size={24}
          color={COLORS.secondary}
          style={styles.icon}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView>
      {User.user.businessDrivers.length > 0 && (
        <View style={styles.container}>
          <Text style={styles.title}>Previously added</Text>
          <FlatList
            data={User.user.businessDrivers}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            style={styles.list}
            ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
          />
        </View>
      )}
      <View style={styles.container}>
        <Text style={styles.title}>Add</Text>
        <Text style={styles.label}>Service/Product</Text>
        <TextInput
          style={[styles.input, saved && { color: COLORS.secondary }]}
          value={service}
          onChangeText={setService}
        />

        <Text style={styles.label}>Reference</Text>
        <TextInput
          style={[styles.input, saved && { color: COLORS.secondary }]}
          value={company}
          onChangeText={setCompany}
        />
        {error && <Text style={styles.Error}>{error}</Text>}

        <View style={styles.buttonWrapper}>
          <TouchableOpacity
            onPress={async () => {
              await savePresentRoleDetails();
              navigation.navigate("Settings", { screen: "Highlights" });
            }}
            style={styles.DefaultButton}
          >
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={savePresentRoleDetails}
            style={styles.DefaultButton}
          >
            <Text style={styles.buttonText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={hideModal} // Android back button behavior
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.container}>
            <Text style={styles.label}>Service/Product</Text>
            <TextInput
              style={[styles.input, saved && { color: COLORS.secondary }]}
              value={activeService?.Service}
              onChangeText={(value) => {
                setActiveService((prev) => {
                  return { ...prev, Service: value };
                });
              }}
            />

            <Text style={styles.label}>Reference</Text>
            <TextInput
              style={[styles.input, saved && { color: COLORS.secondary }]}
              value={activeService?.Client}
              onChangeText={(value) => {
                setActiveService((prev) => {
                  return { ...prev, Client: value };
                });
              }}
            />
            <View style={styles.buttonWrapper}>
              <TouchableOpacity
                onPress={editProperty}
                style={styles.DefaultButton}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.DefaultButton}
                onPress={hideModal}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "95%",
    padding: 20,
    backgroundColor: "#F5FCFF",

    gap: 20,
    margin: 10,
    marginVertical: 30,
    borderWidth: 1,
    borderColor: COLORS.borders,
    borderRadius: 10,
    position: "relative",
  },
  title: {
    position: "absolute",
    top: -25,
    backgroundColor: "#F5FCFF",

    left: 10,
    textAlign: "center",
    color: COLORS.secondary,
    fontSize: FONTS.large,
    fontFamily: FONTS.familyBold,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Dark background for the popup
  },
  modalContent: {
    width: "80%",
    padding: 20,
    backgroundColor: "#F5FCFF",

    borderRadius: 10,
    alignItems: "center",
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
  },
  label: {
    fontSize: FONTS.medium,
    fontFamily: FONTS.familyBold,
    color: "#333",
    marginBottom: 5,
  },
  itemContainer: {
    borderWidth: 1,
    borderColor: COLORS.borders,
    borderRadius: 10,
    display: "flex",
    padding: 20,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center", // Add this to vertically align the icon and text
    width: "100%", // Ensure the container takes up full width
  },
  text: {
    flex: 1, // Allow text to take available space
    flexWrap: "wrap", // Wrap text if it overflows
  },
  icon: {
    marginLeft: 10, // Adds space between the text and the icon
  },
  input: {
    borderWidth: 0,
    borderBottomWidth: 1,
    borderColor: COLORS.borders,
    padding: 10,
    fontSize: FONTS.medium,
    borderRadius: 5,
    marginBottom: 20,
  },
  datePickerContainer: {
    flexDirection: "row",
    alignItems: "center",
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

  buttonWrapper: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    marginTop: 80,
  },
  DefaultButton: {
    width: "90%",
    borderRadius: 30,
    height: 60,
    display: "flex",
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: COLORS.secondary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonText: {
    fontSize: FONTS.medium,
    fontFamily: FONTS.familyBold,
    color: "white",
  },
  Error: {
    color: "black",
    textAlign: "center",
    fontSize: FONTS.medium,
    fontFamily: FONTS.familyBold,
  },
});

export default BusinessDrivers;
