import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
  Alert,
  FlatList,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Feather } from "@expo/vector-icons";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { COLORS, FONTS } from "../../../../theme";
import { updateUserData } from "../../../redux/slices/authSlice";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

const HighLights = ({ navigation }) => {
  const User = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  const [highLight, setHighLight] = useState("");
  const [reference, setReference] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDatePickerForEdit, setShowDatePickerForEdit] = useState(false);
  const [error, setError] = useState();
  const [saved, setSaved] = useState(false); // State to track saved status
  const [activeHighlight, setActiveHighlight] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  function getTimeSince(startDate) {
    // Get the current date
    const currentDate = new Date();

    // Convert the startDate to a Date object
    const start = new Date(startDate);

    // Initialize values for years, months, and days
    let years = currentDate.getFullYear() - start.getFullYear();
    let months = currentDate.getMonth() - start.getMonth();
    let days = currentDate.getDate() - start.getDate();

    // Adjust for negative days
    if (days < 0) {
      months--;
      const previousMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        0
      );
      days += previousMonth.getDate();
    }

    // Adjust for negative months
    if (months < 0) {
      years--;
      months += 12;
    }

    // Build the result string
    let result = "";

    if (years > 0) {
      result += `${years} Yr${years > 1 ? "s" : ""} `;
    }

    if (months > 0) {
      result += `${months} Mth${months > 1 ? "s" : ""} `;
    }

    return result.trim();
  }

  const hideModal = () => {
    setActiveHighlight(null);
    setModalVisible(false);
  };
  const showModal = (item) => {
    setActiveHighlight(item);
    setModalVisible(true);
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.text}>
        <Image
          source={require("../../../../assets/sperator.png")}
          style={styles.sperator}
        />{" "}
        {item.Highlight}{" "}
        <Image
          source={require("../../../../assets/sperator.png")}
          style={styles.sperator}
        />{" "}
        {item.Reference}{" "}
        {getTimeSince(item.Date) != "" ? (
          <Image
            source={require("../../../../assets/sperator.png")}
            style={styles.sperator}
          />
        ) : (
          ""
        )}
        {getTimeSince(item.Date)}
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
  const onDateChange = (event, selectedDate) => {
    setDate(selectedDate);

    setShowDatePicker(false);
  };
  const onDateChangeForEdit = (event, selectedDate) => {
    setActiveHighlight((prev) => {
      return { ...prev, Date: selectedDate };
    });
    setShowDatePickerForEdit(false);
  };
  const saveHighLightDetails = async () => {
    setSaved(false); // Reset saved status before saving
    if (highLight == "") {
      setError("highLight is required");
      return;
    }
    setError("");

    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_PROFILE_API}/highLights/add/${User.ID}`,
        {
          highLight: {
            Highlight: highLight,
            Reference: reference,
            Date: date,
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
        Alert.alert("Saved", "Saved");
        dispatch(updateUserData(response.data));
        setSaved(true); // Set saved status after saving
      }
    } catch (error) {
      console.log(error);
      setError(error.message);
    }
  };
  const deleteProperty = async (ID) => {
    try {
      const response = await axios.delete(
        `${process.env.EXPO_PUBLIC_PROFILE_API}/highLights/delete/${User.user._id}`,
        {
          headers: {
            Accept: "application/json",
            "Accept-Language": "en",
            "Content-Type": "application/json",
            authorization: `Bearer ${User.Token}`,
          },
          data: { highLightId: ID },
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
        `${process.env.EXPO_PUBLIC_PROFILE_API}/highLights/update/${User.user._id}`,
        {
          highLightId: activeHighlight._id,
          updatedHighLight: activeHighlight,
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
        setActiveHighlight(null);
        setModalVisible(false);
        dispatch(updateUserData(response.data.user));
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", error.message);
    }
  };

  return (
    <ScrollView>
      {User.user.highlights.length > 0 && (
        <View style={styles.container}>
          <Text style={styles.title}>Previously added</Text>
          <FlatList
            data={User.user.highlights}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            style={styles.list}
            ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
          />
        </View>
      )}
      <View style={styles.container}>
        <Text style={styles.title}>Add</Text>

        <Text style={styles.label}>Highlight</Text>
        <TextInput
          style={[styles.input, saved && { color: COLORS.secondary }]}
          placeholder="Add the highLight"
          value={highLight}
          onChangeText={setHighLight}
        />
        <Text style={styles.label}>Reference (optional)</Text>
        <TextInput
          style={[styles.input, saved && { color: COLORS.secondary }]}
          placeholder="Some text here..."
          value={reference}
          onChangeText={setReference}
        />

        <Text style={styles.label}>date (optional)</Text>
        <View style={styles.datePickerContainer}>
          <TextInput
            style={[styles.input, saved && { color: COLORS.secondary }]}
            placeholder="Some text here..."
            value={date.toDateString()}
            editable={false}
          />
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <Feather name="calendar" size={24} color="gray" />
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}

        {showDatePickerForEdit && (
          <DateTimePicker
            value={new Date(activeHighlight.Date)}
            mode="date"
            display="default"
            onChange={onDateChangeForEdit}
          />
        )}
        {error && <Text style={styles.Error}>{error}</Text>}

        <View style={styles.buttonWrapper}>
          <TouchableOpacity
            onPress={async () => {
              await saveHighLightDetails();
              navigation.navigate("Settings", { screen: "Skills" });
            }}
            style={styles.DefaultButton}
          >
            <Text style={styles.buttonText}>Next</Text>
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
            <Text style={styles.label}>Highlight</Text>
            <TextInput
              style={[styles.input, saved && { color: COLORS.secondary }]}
              placeholder="Add the highLight"
              value={activeHighlight?.Highlight}
              onChangeText={(value) => {
                setActiveHighlight((prev) => {
                  return { ...prev, Highlight: value };
                });
              }}
            />
            <Text style={styles.label}>Reference (optional)</Text>
            <TextInput
              style={[styles.input, saved && { color: COLORS.secondary }]}
              placeholder="Some text here..."
              value={activeHighlight?.Reference}
              onChangeText={(value) => {
                setActiveHighlight((prev) => {
                  return { ...prev, Reference: value };
                });
              }}
            />

            <Text style={styles.label}>date (optional)</Text>
            <View style={styles.datePickerContainer}>
              <TextInput
                style={[styles.input, saved && { color: COLORS.secondary }]}
                value={activeHighlight?.Date}
                editable={false}
              />
              <TouchableOpacity onPress={() => setShowDatePickerForEdit(true)}>
                <Feather name="calendar" size={24} color="gray" />
              </TouchableOpacity>
            </View>
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

export default HighLights;
