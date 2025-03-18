import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { COLORS, FONTS } from "../../../../theme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const Navigation = ({ activeTab, setActiveTab }) => {
  const [tabTracker, setTabTracker] = useState(0);
  const flatListRef = useRef(null);
  const tabWidth = 131; // Approximate width of each tab
  const gap = 30; // The gap between items
  const scrollAmount = tabWidth + gap; // Account for both tab width & gap
  const scrollOffset = useRef(0); // Track current scroll position

  const tabData = [
    { id: "1", title: "Available" },
    { id: "2", title: "Member" },
    { id: "3", title: "Pending" },
    { id: "4", title: "Dismissed" },
    { id: "5", title: "Expired" },
  ];

  const scroll = (direction) => {
    const newOffset =
      direction === "left"
        ? Math.max(scrollOffset.current - scrollAmount, 0)
        : Math.min(
            scrollOffset.current + scrollAmount,
            (tabData.length - 1) * scrollAmount
          );

    scrollOffset.current = newOffset;
    setTabTracker(newOffset);
    flatListRef.current?.scrollToOffset({ offset: newOffset, animated: true });
  };

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
    <View style={styles.container}>
      {tabTracker !== 0 && (
        <TouchableOpacity onPress={() => scroll("left")}>
          <MaterialIcons name="arrow-left" size={26} color={COLORS.secondary} />
        </TouchableOpacity>
      )}

      <FlatList
        ref={flatListRef}
        data={tabData}
        renderItem={renderTabItem}
        keyExtractor={(item) => item.id}
        horizontal
        style={styles.tabContainer}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 10, gap }}
        scrollEnabled={false}
      />

      {tabTracker < 465 && (
        <TouchableOpacity onPress={() => scroll("right")}>
          <MaterialIcons
            name="arrow-right"
            size={26}
            color={COLORS.secondary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  tabContainer: {
    maxHeight: 70,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tab: {
    height: 46,
    paddingVertical: 12,
    width: 131,
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
