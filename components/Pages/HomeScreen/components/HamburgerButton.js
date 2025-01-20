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
    padding: 10,
  },
  line: {
    width: 25,
    height: 3,
    backgroundColor: "black",
    marginVertical: 2,
    borderRadius: 2,
  },
});

export default HamburgerButton;
