import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { FONTS } from "../../../../theme";

const Navigation = ({ activeTab, setActiveTab }) => {
  const tabData = [
    { id: "1", title: "Available" },
    { id: "2", title: "Member" },
    { id: "3", title: "Pending" },
    { id: "4", title: "Dismissed" },
  ];

  const renderTabItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.tab, activeTab === item.title && styles.activeTab]}
      onPress={() => setActiveTab(item.title)}
    >
      <Text
        style={[
          styles.tabText,
          activeTab === item.title && styles.activeTabText,
        ]}
      >
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={tabData}
      renderItem={renderTabItem}
      keyExtractor={(item) => item.id}
      horizontal
      style={styles.tabContainer}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingVertical: 10, gap: 30 }}
    />
  );
};
const styles = StyleSheet.create({
  tabContainer: {
    maxHeight: 70,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tab: {
    minWidth: 150,
    height: 46,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    backgroundColor: "#F4F0F4",
    borderRadius: 100,
  },
  activeTab: {
    backgroundColor: "#4B164C",
  },
  tabText: {
    fontSize: FONTS.medium,
    color: "#666",
  },
  activeTabText: {
    color: "white",
    fontFamily: FONTS.familyBold,
  },
});

export default Navigation;
