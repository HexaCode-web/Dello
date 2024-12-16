import React, { useState } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import Header from "./components/Header";
import Navigation from "./components/Navigation";
import NetworkItem from "./components/NetworkItem";

const Network = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const networks = [];

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
