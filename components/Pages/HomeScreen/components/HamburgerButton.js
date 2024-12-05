import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";

const HamburgerButton = ({ onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View style={styles.line} />
      <View style={styles.line} />
      <View style={styles.line} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10, // Adds spacing around the icon for better touchability
  },
  line: {
    width: 30, // Width of the hamburger lines
    height: 3, // Thickness of the lines
    backgroundColor: "black", // Color of the lines
    marginVertical: 4, // Spacing between the lines
    borderRadius: 2, // Slight rounding on the edges of the lines
  },
});

export default HamburgerButton;
