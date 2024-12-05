import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { FONTS, COLORS } from "../../theme";

const DropdownInput = ({ data, value, setValue, label }) => {
  const [isFocus, setIsFocus] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, isFocus && { color: "black" }]}>{label}</Text>
      <Dropdown
        style={[styles.dropdown, isFocus && { borderColor: "blue" }]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        iconStyle={styles.iconStyle}
        data={data}
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder={!isFocus ? "Select item" : "..."}
        value={value}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={(item) => {
          setValue(item.value);
          setIsFocus(false);
        }}
      />
    </View>
  );
};

export default DropdownInput;

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  dropdown: {
    borderWidth: 0,
    borderBottomWidth: 1,
    borderColor: COLORS.borders,
    padding: 10,
    fontSize: FONTS.medium,
    borderRadius: 5,
    marginBottom: 20,
  },

  label: {
    position: "absolute",
    left: 0, // Adjust this to fit your layout
    top: -20, // Adjust the top to move it above the dropdown
    zIndex: 1,
    fontSize: FONTS.medium,
    fontFamily: FONTS.familyBold,

    color: "#333",
    marginBottom: 5,
  },
  placeholderStyle: {
    fontSize: FONTS.medium,
  },

  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: FONTS.medium,
  },
});
