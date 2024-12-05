import React, { useRef, useState } from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { FONTS } from "../../../../../theme";

const CodeInput = ({ onCodeChange }) => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputs = useRef([]);

  const handleChangeText = (text, index) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);
    onCodeChange(newCode.join(""));

    // Automatically focus the next input if a digit is entered
    if (text && index < 5) {
      inputs.current[index + 1].focus();
    }

    // Optionally, you can add logic to go back if the user deletes a digit
    if (!text && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  return (
    <View style={styles.container}>
      {code.map((digit, index) => (
        <TextInput
          key={index}
          ref={(input) => (inputs.current[index] = input)}
          style={styles.input}
          value={digit}
          onChangeText={(text) => handleChangeText(text, index)}
          maxLength={1}
          keyboardType="numeric"
          autoFocus={index === 0}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    padding: 20,
    gap: 20,
  },
  input: {
    width: 50,
    height: 50,
    backgroundColor: "#F5F5F5",
    textAlign: "center",
    fontSize: FONTS.large,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
});

export default CodeInput;
