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
import DropdownInput from "../../../GeneralComponents/DropdownInput.js";
import { COLORS, FONTS } from "../../../../theme.js";
import { updateUserData } from "../../../redux/slices/authSlice";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
const Skills = ({ navigation }) => {
  const User = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const [skill, setSkill] = useState("");
  const [level, setLevel] = useState("");
  const [reference, setReference] = useState("");
  const [error, setError] = useState();
  const [saved, setSaved] = useState(false); // State to track saved status
  const [isModalVisible, setModalVisible] = useState(false);
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
    setSaved(false); // Reset saved status before making API call
    if (skill == "" || level == "" || reference == "") {
      setError("All fields are required");
      return;
    }
    setError("");

    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_PROFILE_API}/Skills/add/${User.ID}`,
        {
          skill: {
            Skill: skill,
            Level: level,
            Reference: reference,
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
        setSkill("");
        setLevel("");
        setReference("");
        dispatch(updateUserData(response.data));
        Alert.alert("Saved", "Saved");
        setSaved(true); // Set saved status to true when API call is successful
      }
    } catch (error) {
      console.log(error.message);
      setError(error.message);
    }
  };
  const deleteProperty = async (ID) => {
    try {
      const response = await axios.delete(
        `${process.env.EXPO_PUBLIC_PROFILE_API}/skills/delete/${User.user._id}`,
        {
          headers: {
            Accept: "application/json",
            "Accept-Language": "en",
            "Content-Type": "application/json",
            authorization: `Bearer ${User.Token}`,
          },
          data: { skillId: ID }, // Send the businessDriverId in the body (data field)
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
        `${process.env.EXPO_PUBLIC_PROFILE_API}/skills/update/${User.user._id}`,
        {
          skillId: activeService._id,
          updatedSkill: activeService,
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
        {item.Skill}{" "}
        <Image
          source={require("../../../../assets/sperator.png")}
          style={styles.sperator}
        />{" "}
        {item.Level}{" "}
        <Image
          source={require("../../../../assets/sperator.png")}
          style={styles.sperator}
        />{" "}
        {item.Reference}
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
      {User.user.skills.length > 0 && (
        <View style={styles.container}>
          <Text style={styles.title}>Previously added</Text>
          <FlatList
            data={User.user.skills}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            style={styles.list}
            ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
          />
        </View>
      )}
      <View style={styles.container}>
        <Text style={styles.title}>Add</Text>

        <Text style={styles.label}>Skill</Text>
        <TextInput
          style={[styles.input, saved && { color: COLORS.secondary }]}
          value={skill}
          onChangeText={setSkill}
        />

        <DropdownInput
          data={[
            { label: "Beginner", value: "Beginner" },
            { label: "Intermediate", value: "Intermediate" },
            { label: "Advanced", value: "Advanced" },
          ]}
          value={level}
          setValue={setLevel}
          label={"Level"}
        />
        <Text style={styles.label}>Reference</Text>
        <TextInput
          style={[styles.input, saved && { color: COLORS.secondary }]}
          value={reference}
          onChangeText={setReference}
        />
        {error && <Text style={styles.Error}>{error}</Text>}

        <View style={styles.buttonWrapper}>
          <TouchableOpacity
            onPress={async () => {
              await savePresentRoleDetails();
              navigation.navigate("Settings", { screen: "Previous Roles" });
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
            <Text style={styles.label}>Skill</Text>
            <TextInput
              style={[styles.input, saved && { color: COLORS.secondary }]}
              value={activeService?.Skill}
              onChangeText={(value) => {
                setActiveService((prev) => {
                  return { ...prev, Skill: value };
                });
              }}
            />

            <DropdownInput
              data={[
                { label: "Beginner", value: "beginner" },
                { label: "Intermediate", value: "Intermediate" },
                { label: "Advanced", value: "Advanced" },
              ]}
              value={activeService?.Level}
              setValue={(value) => {
                setActiveService((prev) => {
                  return { ...prev, Level: value };
                });
              }}
              label={"Level"}
            />
            <Text style={styles.label}>Reference</Text>
            <TextInput
              style={[styles.input, saved && { color: COLORS.secondary }]}
              value={activeService?.Reference}
              onChangeText={(value) => {
                setActiveService((prev) => {
                  return { ...prev, Reference: value };
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

export default Skills;
