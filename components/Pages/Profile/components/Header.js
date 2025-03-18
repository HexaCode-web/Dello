import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from "react-native";
import { useSelector } from "react-redux";
import { FONTS } from "../../../../theme";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Entypo from "@expo/vector-icons/Entypo";
import { useCallback, useState, useRef, useEffect } from "react";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";

export default function Header({ User }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  // Use a timestamp to force image refresh
  const [timestamp, setTimestamp] = useState(new Date().getTime());
  // Keep track of successful uploads
  const uploadCount = useRef(0);

  useFocusEffect(
    useCallback(() => {
      // Generate the URL for the user's photo with timestamp to prevent caching
      const photoUrl = `${process.env.EXPO_PUBLIC_SERVER_URL}/uploads/${User.user._id}.jpeg?t=${timestamp}`;
      setImageUrl(photoUrl);

      // Optional: Verify the image exists before displaying
      const checkImage = async () => {
        try {
          await axios.head(photoUrl);
          setLoading(false);
        } catch (err) {
          console.error("Error loading image:", err);
          setError("Could not load profile image");
          setLoading(false);
        }
      };

      checkImage();

      // Cleanup function (optional)
      return () => {
        setImageUrl(null);
        setLoading(true);
        setError(null);
      };
    }, [User, timestamp]) // Use timestamp in dependencies to trigger refresh
  );

  // Handle the camera icon press
  const handleImageSelection = () => {
    Alert.alert(
      "Profile Photo",
      "Choose an option",
      [
        {
          text: "Take Photo",
          onPress: () => takePhoto(),
        },
        {
          text: "Choose from Gallery",
          onPress: () => pickImage(),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  // Function to upload the image
  const uploadImage = async (imageUri) => {
    if (!imageUri) {
      Alert.alert("Error", "No image selected");
      return;
    }

    setUploading(true);
    setUploadResult(null);

    try {
      // Create form data
      const formData = new FormData();

      // Get file extension from URI
      const filename = imageUri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename);
      const extension = match ? match[1] : "jpg";

      // Use userId for the filename instead of the original filename
      const newFilename = `${User.user._id}.${extension}`;

      // Detect MIME type
      const type = match ? `image/${match[1]}` : "image/jpeg";

      console.log(`Creating file upload with name: ${newFilename}`);

      formData.append("photo", {
        uri:
          Platform.OS === "android"
            ? imageUri
            : imageUri.replace("file://", ""),
        name: newFilename, // Use userId as the filename
        type: type,
      });

      // Send request to your server
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_PROFILE_API}/uploadPhoto`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            authorization: `Bearer ${User.Token}`,
          },
        }
      );

      setUploadResult({
        success: true,
        data: response.data,
      });

      // Increment upload count
      uploadCount.current += 1;

      // Force refresh the image by updating timestamp
      setTimestamp(new Date().getTime());

      // Clear image cache (additional measure)
      if (imageUrl && Image.queryCache) {
        // Only available in newer React Native versions
        Image.queryCache([imageUrl])
          .then((cached) => {
            if (cached) {
              Image.abortPrefetch(imageUrl);
            }
          })
          .catch((err) => console.log("Cache query error:", err));
      }

      setLoading(true); // Temporarily set loading to true to force re-fetch

      // Wait a bit before showing success to allow server to process
      setTimeout(() => {
        setLoading(false);
        Alert.alert("Success", "Profile photo updated successfully");
      }, 1000);
    } catch (error) {
      console.error("Error uploading image:", error);

      // Improved error handling
      let errorMessage = "Unknown error occurred";

      if (error.response) {
        // The server responded with an error
        console.log("Error response data:", error.response.data);
        errorMessage =
          error.response.data.error ||
          error.response.data.message ||
          "Server error";

        if (error.response.data.details) {
          errorMessage += ` (${error.response.data.details})`;
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = "No response from server";
      } else {
        // Something happened in setting up the request
        errorMessage = error.message;
      }

      setUploadResult({
        success: false,
        error: errorMessage,
      });

      Alert.alert("Error", `Failed to upload: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  // Function to handle upload retry in case of "No response from server" error
  useEffect(() => {
    if (uploadResult?.error === "No response from server" && image) {
      uploadImage(image);
    }
  }, [uploadResult]);

  // Function to take a photo with camera
  const takePhoto = async () => {
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please allow camera access to take photos"
        );
        return;
      }

      // Open camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        // Upload directly instead of navigating
        uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo");
    }
  };

  // Function to pick an image from gallery
  const pickImage = async () => {
    try {
      // Request permissions
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission needed",
            "Please allow gallery access to select photos"
          );
          return;
        }
      }

      // Pick the image
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        // Upload directly instead of navigating
        uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to select image");
    }
  };

  // Create a unique key for the Image component to force re-render
  const imageKey = `profile-image-${uploadCount.current}-${timestamp}`;

  return (
    <View style={styles.header}>
      <View style={styles.profilePicContainer}>
        <Image
          key={imageKey}
          source={
            !loading && !error
              ? { uri: imageUrl, cache: "reload" }
              : require("../../../../assets/user.png")
          }
          style={styles.profilePic}
          onError={(e) => {
            console.log("Image error:", e.nativeEvent.error);
            setError("Failed to load image");
          }}
        />
        <TouchableOpacity
          style={styles.cameraIcon}
          onPress={handleImageSelection}
          disabled={uploading}
        >
          {uploading ? (
            <Entypo name="hour-glass" size={24} color="#937393" />
          ) : (
            <Entypo name="camera" size={24} color="#937393" />
          )}
        </TouchableOpacity>
      </View>
      <View>
        <Text style={styles.userName}>
          {User.FirstName || User.user.FirstName}
        </Text>
        <Text style={styles.userName}>
          {User.LastName || User.user.LastName}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  profilePicContainer: {
    position: "relative",
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 20,
    zIndex: 100,
  },
  profilePic: {
    width: 111,
    height: 112,
    borderRadius: 50,
    backgroundColor: "#fff", // Set background color to ensure shadow visibility
    // Shadow properties for iOS
    shadowColor: "#937393", // Color of the shadow
    shadowOffset: {
      width: 0,
      height: 3, // Vertical shadow offset
    },
    shadowOpacity: 0.5, // Opacity of the shadow
    shadowRadius: 6, // Blur radius of the shadow
    // Elevation for Android
    elevation: 5, // Shadow effect for Android
  },
  userName: {
    fontSize: FONTS.largeHeader,
    textAlign: "left",
    color: "black",
    fontFamily: FONTS.familyBold,
  },
  placeHolder: {
    margin: "auto",
    fontSize: FONTS.medium,
    fontFamily: FONTS.familyBold,
  },
  header: {
    height: 160,
    justifyContent: "space-around",
    alignItems: "center",
    flexDirection: "row",
    gap: 50,
    marginBottom: 10,
    marginTop: 30,
    borderRadius: 10,
    width: "100%",
    alignSelf: "center",
  },
});
