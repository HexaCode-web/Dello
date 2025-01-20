import { StyleSheet, Text, TouchableOpacity } from "react-native";

const SettingSection = ({ title, onPress }) => (
  <TouchableOpacity style={styles.section} onPress={onPress}>
    <Text style={styles.sectionText}>{title}</Text>
    <Text style={styles.arrow}>›</Text>
  </TouchableOpacity>
);
export default SettingSection;
const styles = StyleSheet.create({
  section: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    margin: 15,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionText: {
    fontSize: 16,
    color: "#000",
  },
  arrow: {
    fontSize: 20,
    color: "#999",
  },
});
