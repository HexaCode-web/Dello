import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Header from "./components/Header";
import Navigation from "./components/Navigation";
import NetworkItem from "./components/NetworkItem";
import { FONTS } from "../../../theme";

const Network = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const networks = [
    {
      id: "1",
      name: "Example Network",
      code: "EXAMPLE",
      status: "Join",
      tags: ["Private Corporate", "BoE Cyber"],
    },
    {
      id: "2",
      name: "Example Network",
      code: "EXAMPLE",
      status: "Pending",
      tags: ["Private Corporate", "BoE Cyber"],
    },
  ];

  const renderNetworkItem = ({ item }) => <NetworkItem network={item} />;

  return (
    <View style={styles.container}>
      <Header />
      <Navigation />
      <FlatList
        data={networks}
        renderItem={renderNetworkItem}
        keyExtractor={(item) => item.id}
        style={styles.networkList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: 40,
    paddingBottom: 50,
    color: "black",
  },

  networkList: {
    flex: 1,
  },
});

export default Network;
