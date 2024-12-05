import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import axios from "axios";
import { useSelector } from "react-redux";
import { PROFILE_API } from "@env";
import DropdownInput from "../../../GeneralComponents/DropdownInput.js";
import { COLORS, FONTS } from "../../../../theme.js";
import { ScrollView } from "react-native";

const Skills = ({ data }) => {
  const User = useSelector((state) => state.auth.user);

  const [skill, setSkill] = useState("");
  const [level, setLevel] = useState("");
  const [reference, setReference] = useState("");
  const [error, setError] = useState();

  const savePresentRoleDetails = async () => {
    if (skill == "" || level == "" || reference == "") {
      setError("All fields are required");
      return;
    }
    setError("");
    const nextId =
      data.length > 0 ? Math.max(...data.map((obj) => obj.id)) + 1 : 1;
    let newData;
    if (data) {
      newData = {
        skillDTO: [
          ...data,
          {
            skillName: skill,
            skillLevel: level,
            skillReferenceName: reference,
            id: nextId,
          },
        ],
      };
    } else {
      newData = {
        skillDTO: [
          {
            skillName: skill,
            skillLevel: level,
            skillReferenceName: reference,
            id: nextId,
          },
        ],
      };
    }
    try {
      const response = await axios.post(
        `${PROFILE_API}/skill/save_skill_details/${User.ID}`,
        newData,
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
        setError("Saved");
      }
    } catch (error) {
      console.log(error);
      setError(error.message);
    }
  };
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Skill</Text>
      <TextInput style={styles.input} value={skill} onChangeText={setSkill} />

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
        style={styles.input}
        value={reference}
        onChangeText={setReference}
      />
      {error && <Text style={styles.Error}>{error}</Text>}

      <View style={styles.buttonWrapper}>
        <TouchableOpacity
          onPress={savePresentRoleDetails}
          style={styles.DefaultButton}
        >
          <Text style={styles.buttonText}>Add</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "95%",
    marginHorizontal: "auto",
    padding: 20,
    backgroundColor: "white",
    gap: 20,
  },
  label: {
    fontSize: FONTS.medium,
    fontFamily: FONTS.familyBold,
    color: "#333",
    marginBottom: 5,
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
  buttonWrapper: {
    width: "100%",

    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginBottom: 10,
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
