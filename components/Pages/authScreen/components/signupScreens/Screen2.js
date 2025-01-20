import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Feather } from "@expo/vector-icons";

import { COLORS, FONTS } from "../../../../../theme";
export default function Screen2({
  userInfo,
  onChangeFirstName,
  onChangeLastName,
  onDateChange,
  onChangeAddress,
  showDatePicker,
  navigation,
  setShowDatePicker,
  sendOTP,
}) {
  return (
    <ScrollView>
      <Text style={styles.Header}>Personal information</Text>

      <View style={styles.inputsWrapper}>
        <View style={styles.inputWrapper}>
          <TextInput
            placeholder="First Name"
            style={styles.input}
            onChangeText={(value) => onChangeFirstName(value)}
            value={userInfo.FirstName}
          />
        </View>
        <View style={styles.inputWrapper}>
          <TextInput
            placeholder="Last name"
            style={styles.input}
            onChangeText={(value) => onChangeLastName(value)}
            value={userInfo.LastName}
          />
        </View>
        <View style={styles.inputWrapper}>
          <TextInput
            placeholder="Address"
            style={styles.input}
            onChangeText={(value) => onChangeAddress(value)}
            value={userInfo.Address}
          />
        </View>
        <>
          <View style={styles.datePickerContainer}>
            <TextInput
              style={[styles.input, { width: 310 }]}
              value={userInfo.DOB ? userInfo.DOB.toDateString() : ""} // Handle empty value
              editable={false}
              placeholder="Date of Birth"
            />
            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <Feather name="calendar" size={24} color="gray" />
            </TouchableOpacity>
          </View>
          {showDatePicker && (
            <DateTimePicker
              value={userInfo.DOB || new Date()} // Fallback to current date if DOB is null
              mode="date"
              display="default"
              onChange={onDateChange}
            />
          )}
        </>
      </View>
      <View style={styles.buttonWrapper}>
        <TouchableOpacity
          onPress={async () => {
            navigation.navigate("Signup", { screen: "Screen3" });
            await sendOTP();
          }}
          style={styles.DefaultButton}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  inputWrapper: {
    display: "flex",
    flexDirection: "column",
  },
  inputsWrapper: {
    flex: 1,
  },
  input: {
    height: 50,
    width: 350,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    fontSize: FONTS.medium,
    fontFamily: FONTS.familyBold,

    borderRadius: 30,
  },
  Header: {
    fontSize: FONTS.large,
    fontFamily: FONTS.familyBold,
    marginBottom: 20,
    marginLeft: 40,
  },
  textWrapper: {
    marginBottom: 20,
    marginLeft: 40,
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    width: "100%",
    gap: 10,
  },
  signUpPromptText: {
    fontSize: FONTS.medium,
    fontFamily: FONTS.familyLight,

    color: COLORS.textSecondary,
  },
  buttonWrapper: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginBottom: 10,
    gap: 20,
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
  datePickerContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonText: {
    fontSize: FONTS.medium,
    fontFamily: FONTS.familyBold,
    color: "white",
  },
});
