import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { FONTS } from "../../../../theme";

const Body = () => {
  const [activeTab, setActiveTab] = useState("Meet");

  const meetingData = [
    { id: "1", name: "Jane Cooper", role: "HR Manager", time: "17:10" },
    { id: "2", name: "Esther Howard", role: "HR Manager", time: "18:00" },
    { id: "3", name: "Wade Warren", role: "HR Manager", time: "" },
  ];

  const tabData = [
    { id: "meet", title: "Meet" },
    { id: "intros", title: "Intros" },
    { id: "all", title: "All" },
  ];

  const renderMeetingItem = ({ item }) => (
    <View style={styles.meetingItem}>
      <Image
        source={{ uri: "https://via.placeholder.com/50" }}
        style={styles.avatar}
      />
      <View style={styles.meetingInfo}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.role}>{item.role}</Text>
      </View>
      {item.time && <Text style={styles.time}>{item.time}</Text>}
    </View>
  );

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
      <View style={styles.header}>
        <Text style={styles.headerText}>HSBC London</Text>
        <Feather name="chevron-down" size={24} color="black" />
      </View>
      <FlatList
        data={tabData}
        renderItem={renderTabItem}
        keyExtractor={(item) => item.id}
        horizontal
        style={styles.tabContainer}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 10, gap: 30 }}
      />
      <FlatList
        data={meetingData}
        renderItem={renderMeetingItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerText: {
    fontFamily: FONTS.familyBold,
    fontSize: FONTS.medium,
  },
  tabContainer: {
    maxHeight: 70,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tab: {
    width: 140,
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
    fontFamily: FONTS.familyBold,
    fontSize: FONTS.small,
    color: "#666",
  },
  activeTabText: {
    color: "white",
    fontFamily: FONTS.familyBold,
  },
  meetingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  meetingInfo: {
    flex: 1,
  },
  name: {
    fontFamily: FONTS.familyBold,
    fontSize: FONTS.small,
  },
  role: {
    fontSize: FONTS.small,
    color: "#666",
  },
  time: {
    fontSize: FONTS.small,
    color: "#666",
  },
});

export default Body;
