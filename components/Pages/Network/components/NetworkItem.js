import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { FONTS } from "../../../../theme";

const NetworkItem = ({ network }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.networkName}>{network.name}</Text>
          <Text style={styles.networkCode}>
            {network.code} - {network.time}
          </Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity>
            <Feather name="trash-2" size={20} color="#FF3B30" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Feather name="bookmark" size={20} color="#4A0E4E" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tags}>
        {network.tags.map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.dismissButton}>
          <Feather name="user-x" size={20} color="#FF3B30" />
          <Text style={styles.dismissText}>Dismiss</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.actionButton,
            network.status === "Pending"
              ? styles.pendingButton
              : styles.joinButton,
          ]}
        >
          {network.status === "Pending" ? (
            <Feather
              name="clock"
              size={20}
              color="#FFF"
              style={styles.actionIcon}
            />
          ) : (
            <Feather
              name="arrow-right"
              size={20}
              color="#FFF"
              style={styles.actionIcon}
            />
          )}
          <Text style={styles.actionButtonText}>{network.status}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    fontFamily: FONTS.familyBold,

    borderColor: "#E0E0E0",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  networkName: {
    fontSize: 18,
    fontFamily: FONTS.familyBold,
  },
  networkCode: {
    fontSize: FONTS.small,
    color: "#666",
  },
  headerIcons: {
    flexDirection: "row",
    width: 60,
    justifyContent: "space-between",
  },
  tags: {
    flexDirection: "row",
    marginBottom: 12,
  },
  tag: {
    backgroundColor: "#F0F0F0",
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  tagText: {
    fontSize: FONTS.small - 2,
    color: "#333",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dismissButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FF3B30",
    borderRadius: 20,
    height: 38,
    width: 167,
    paddingVertical: 8,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  dismissText: {
    color: "#FF3B30",
    marginLeft: 8,
    fontFamily: FONTS.familyBold,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    height: 38,
    width: 167,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  joinButton: {
    backgroundColor: "#4A0E4E",
    fontFamily: FONTS.familyBold,
  },
  pendingButton: {
    backgroundColor: "#6c757d",
  },
  actionButtonText: {
    color: "#FFF",
    fontFamily: FONTS.familyBold,
    marginLeft: 8,
  },
  actionIcon: {
    marginRight: 4,
  },
});

export default NetworkItem;
