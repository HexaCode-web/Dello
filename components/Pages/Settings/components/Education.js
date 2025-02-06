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

import DateTimePicker from "@react-native-community/datetimepicker";
import { Feather } from "@expo/vector-icons";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { COLORS, FONTS } from "../../../../theme";
import { updateUserData } from "../../../redux/slices/authSlice";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
const Education = ({ navigation }) => {
  const User = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  const [degreeName, setDegreeName] = useState("");
  const [instituteName, setInstituteName] = useState("");
  const [from, setFrom] = useState(new Date());
  const [to, setTo] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(null);
  const [error, setError] = useState();
  const [saved, setSaved] = useState(false); // State to track saved status
  const [isModalVisible, setModalVisible] = useState(false);
  const [activeEducation, setActiveEducation] = useState(null);

  const hideModal = () => {
    setActiveEducation(null);
    setModalVisible(false);
  };
  const showModal = (item) => {
    setActiveEducation(item);
    setModalVisible(true);
  };
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(null);
    if (selectedDate) {
      setFrom(selectedDate);
    }
  };
  const onDateChangeEdit = (event, selectedDate) => {
    setShowDatePicker(null);
    if (selectedDate) {
      setActiveEducation((prev) => {
        return { ...prev, StartDate: selectedDate };
      });
    }
  };
  const onDateChangeTo = (event, selectedDate) => {
    setShowDatePicker(null);
    if (selectedDate) {
      setTo(selectedDate);
    }
  };
  const onDateChangeEditTo = (event, selectedDate) => {
    setShowDatePicker(null);
    if (selectedDate) {
      setActiveEducation((prev) => {
        return { ...prev, EndDate: selectedDate };
      });
    }
  };

  const savePresentRoleDetails = async () => {
    setSaved(false);

    if (degreeName == "" || instituteName == "" || from == "" || to == "") {
      setError("All fields are required");
      return;
    }
    if (from > to) {
      setError("Start date should be before end date");
      return;
    }
    setError("");
    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_PROFILE_API}/education/add/${User.ID}`,
        {
          education: {
            Degree: degreeName,
            Institution: instituteName,
            StartDate: from,
            EndDate: to,
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
        `${process.env.EXPO_PUBLIC_PROFILE_API}/education/delete/${User.user._id}`,
        {
          headers: {
            Accept: "application/json",
            "Accept-Language": "en",
            "Content-Type": "application/json",
            authorization: `Bearer ${User.Token}`,
          },
          data: { educationId: ID }, // Send the businessDriverId in the body (data field)
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
        `${process.env.EXPO_PUBLIC_PROFILE_API}/education/update/${User.user._id}`,
        {
          educationId: activeEducation._id,
          updatedEducation: activeEducation,
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
        setActiveEducation(null);
        setModalVisible(false);
        dispatch(updateUserData(response.data.user));
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", error.message);
    }
  };
  const renderItem = ({ item }) => {
    const date = new Date(item.StartDate);
    const formattedDate = date.toISOString().split("T")[0];
    return (
      <View style={styles.itemContainer}>
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
          {formattedDate}
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
  };

  return (
    <ScrollView>
      {User.user.education.length > 0 && (
        <View style={styles.container}>
          <Text style={styles.title}>Previously added</Text>
          <FlatList
            data={User.user.education}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            style={styles.list}
            ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
          />
        </View>
      )}
      <View style={styles.container}>
        <Text style={styles.title}>Add</Text>
        <Text style={styles.label}>Degree</Text>
        <TextInput
          style={[styles.input, saved && { color: COLORS.secondary }]}
          value={degreeName}
          onChangeText={setDegreeName}
        />

        <Text style={styles.label}>Institution</Text>
        <TextInput
          style={[styles.input, saved && { color: COLORS.secondary }]}
          value={instituteName}
          onChangeText={setInstituteName}
        />

        <Text style={styles.label}>From</Text>
        <View style={styles.datePickerContainer}>
          <TextInput
            style={[styles.input, saved && { color: COLORS.secondary }]}
            value={from.toDateString()}
            editable={false}
          />
          <TouchableOpacity onPress={() => setShowDatePicker("from")}>
            <Feather name="calendar" size={24} color="gray" />
          </TouchableOpacity>
        </View>
        <Text style={styles.label}>To</Text>
        <View style={styles.datePickerContainer}>
          <TextInput
            style={[styles.input, saved && { color: COLORS.secondary }]}
            value={to.toDateString()}
            editable={false}
          />
          <TouchableOpacity onPress={() => setShowDatePicker("to")}>
            <Feather name="calendar" size={24} color="gray" />
          </TouchableOpacity>
        </View>

        {showDatePicker === "from" && (
          <DateTimePicker
            value={from}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}
        {showDatePicker === "to" && (
          <DateTimePicker
            value={to}
            mode="date"
            display="default"
            onChange={onDateChangeTo}
          />
        )}
        {showDatePicker === "Editfrom" && (
          <DateTimePicker
            value={new Date(activeEducation.StartDate)}
            mode="date"
            display="default"
            onChange={onDateChangeEdit}
          />
        )}
        {showDatePicker === "Editto" && (
          <DateTimePicker
            value={new Date(activeEducation.EndDate)}
            mode="date"
            display="default"
            onChange={onDateChangeEditTo}
          />
        )}
        {error && <Text style={styles.Error}>{error}</Text>}

        <View style={styles.buttonWrapper}>
          <TouchableOpacity
            onPress={async () => {
              await savePresentRoleDetails();
              navigation.navigate("Settings", { screen: "Immediate Need" });
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
            <Text style={styles.label}>Degree</Text>
            <TextInput
              style={[styles.input, saved && { color: COLORS.secondary }]}
              value={activeEducation?.Degree}
              onChangeText={(value) => {
                setActiveEducation((prev) => {
                  return { ...prev, Degree: value };
                });
              }}
            />

            <Text style={styles.label}>institution</Text>
            <TextInput
              style={[styles.input, saved && { color: COLORS.secondary }]}
              value={activeEducation?.Institution}
              onChangeText={(value) => {
                setActiveEducation((prev) => {
                  return { ...prev, Institution: value };
                });
              }}
            />
            <Text style={styles.label}>From</Text>
            <View style={styles.datePickerContainer}>
              <TextInput
                style={[styles.input, saved && { color: COLORS.secondary }]}
                value={activeEducation?.StartDate}
                editable={false}
              />
              <TouchableOpacity onPress={() => setShowDatePicker("Editfrom")}>
                <Feather name="calendar" size={24} color="gray" />
              </TouchableOpacity>
            </View>
            <Text style={styles.label}>To</Text>
            <View style={styles.datePickerContainer}>
              <TextInput
                style={[styles.input, saved && { color: COLORS.secondary }]}
                value={activeEducation?.EndDate}
                editable={false}
              />
              <TouchableOpacity onPress={() => setShowDatePicker("Editto")}>
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

export default Education;
