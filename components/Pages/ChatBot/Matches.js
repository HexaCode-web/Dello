import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import { COLORS, FONTS } from "../../../theme";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";

const Matches = ({ match }) => {
  const [expanded, setExpanded] = useState(false);
  const [photo, setPhoto] = useState(null);
  // Extract profile data
  const { profile, reasoning, score, networkID } = match;

  const navigation = useNavigation();
  // Parse the score to a number for display
  const scoreValue = parseFloat(score.replace("%", ""));

  // Determine score color based on value
  const getScoreColor = (value) => {
    if (value >= 70) return "#4CAF50"; // Green for high scores
    if (value >= 40) return "#FFC107"; // Amber for medium scores
    return "#F44336"; // Red for low scores
  };

  // Format reasoning by removing markdown and splitting paragraphs
  const formatReasoning = (text) => {
    // Replace markdown formatting
    let formatted = text.replace(/\*\*/g, "");
    // Split into paragraphs for better readability
    return formatted.split(/\d\.\s/).filter(Boolean);
  };
  const checkImage = async (photoUrl) => {
    try {
      await axios.head(photoUrl);
      return true;
    } catch (err) {
      return false;
    }
  };

  const fetchPhoto = async () => {
    try {
      const photoUrl = `${process.env.EXPO_PUBLIC_SERVER_URL}/uploads/${profile.id}.jpeg`;
      const isValidImage = await checkImage(photoUrl);

      if (isValidImage) return setPhoto(photoUrl);
    } catch (error) {
      console.error("Error loading image:", error);
      Alert.alert("Error", error.message);
    }
  };
  useEffect(() => {
    fetchPhoto();
  }, [match]);
  const reasoningParagraphs = formatReasoning(reasoning);

  return (
    <View style={styles.matchContainer}>
      <View style={styles.profileSection}>
        {photo ? (
          <Image
            source={{ uri: photo, cache: "reload" }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{profile.name.charAt(0)}</Text>
          </View>
        )}
        <View style={styles.profileInfo}>
          <Text style={styles.nameText}>{profile.name}</Text>
          <Text style={styles.roleText}>
            {profile.role} at {profile.company}
          </Text>
        </View>
        <View style={styles.scoreContainer}>
          <Text
            style={[styles.scoreText, { color: getScoreColor(scoreValue) }]}
          >
            {score}
          </Text>
          <Text style={styles.matchText}>Match</Text>
        </View>
      </View>

      {/* Reasoning preview */}
      {!expanded && (
        <View style={styles.reasoningPreview}>
          <Text style={styles.reasoningTitle}>Why you should connect:</Text>
          <Text
            style={styles.reasoningPreviewText}
            numberOfLines={expanded ? 0 : 2}
          >
            {reasoningParagraphs[0]}
          </Text>
        </View>
      )}
      {/* Expand/collapse button */}
      <TouchableOpacity
        style={styles.expandButton}
        onPress={() => setExpanded(!expanded)}
      >
        <Text style={styles.expandButtonText}>
          {expanded ? "Show less" : "Show more"}
        </Text>
      </TouchableOpacity>

      {/* Expanded reasoning */}
      {expanded && (
        <ScrollView style={styles.expandedContent} nestedScrollEnabled={true}>
          {reasoningParagraphs.slice(1).map((paragraph, index) => (
            <View key={index} style={styles.reasonPoint}>
              <Text style={styles.reasonNumber}>{index + 1}</Text>
              <Text style={styles.reasonText}>{paragraph}</Text>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Action buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton]}
          onPress={() => {
            navigation.navigate("ViewProfile", {
              ProfileID: profile.id,
              networkId: networkID,
            });
          }}
        >
          <Text style={styles.primaryButtonText}>View Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  matchContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.secondary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  avatarText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  nameText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
  },
  roleText: {
    fontSize: 14,
    color: "#666666",
  },
  scoreContainer: {
    alignItems: "center",
  },
  scoreText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  matchText: {
    fontSize: 12,
    color: "#666666",
  },
  reasoningPreview: {
    marginBottom: 8,
  },
  reasoningTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333333",
  },
  reasoningPreviewText: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },
  expandButton: {
    marginVertical: 8,
  },
  expandButtonText: {
    color: COLORS.secondary,
    fontWeight: "bold",
  },
  expandedContent: {
    maxHeight: 200,
    marginBottom: 12,
  },
  reasonPoint: {
    flexDirection: "row",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  reasonNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.secondary,
    color: "#FFFFFF",
    textAlign: "center",
    marginRight: 8,
    lineHeight: 24,
    fontSize: 14,
    fontWeight: "bold",
  },
  reasonText: {
    flex: 1,
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  actionButton: {
    width: "100%",
    borderRadius: 30,
    height: 40,
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
  actionButtonText: {
    color: "#666666",
    fontWeight: "bold",
  },
  primaryButton: {
    backgroundColor: COLORS.secondary,
    borderWidth: 0,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});

export default Matches;
