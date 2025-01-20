import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { COLORS, FONTS } from "../../../../theme";
import { useState } from "react";
import axios from "axios";
import DropdownSlider from "../../../GeneralComponents/DropdownSlider";
import { useSelector } from "react-redux";

export default function Settings({ org, setOrgData }) {
  const [loading, setLoading] = useState(false);
  const User = useSelector((state) => state.auth.user);
  const [formData, setFormData] = useState({
    name: org.name || "",
    officeName: org.officeName || "",
    type: org.type || "",
    address: org.address || "",
  });
  const [error, setError] = useState("");

  const typeData = [
    "Financial Services",
    "Software Services",
    "Legal Services",
    "Sports Services",
  ];

  const handleUpdate = async () => {
    // Validate all fields are filled
    if (
      !formData.name ||
      !formData.officeName ||
      !formData.type ||
      !formData.address
    ) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.put(
        `${process.env.EXPO_PUBLIC_ORG_API}/update/${org._id}`,
        {
          newOrg: {
            name: formData.name,
            officeName: formData.officeName,
            type: formData.type,
            address: formData.address,
          },
        },
        {
          headers: {
            "Accept-Language": "en",
            "Content-Type": "application/json",
            Authorization: `Bearer ${User.Token}`,
          },
        }
      );

      if (response.data.organization) {
        Alert.alert("Success", "Organization updated successfully", [
          { text: "OK" },
        ]);
      }
      setOrgData((prevArray) =>
        prevArray.map((item) =>
          item._id === response.data.organization._id
            ? response.data.organization
            : item
        )
      );
    } catch (error) {
      setError(error.response?.data?.message || "Error updating organization");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputArea}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Organization Name</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, name: text }))
            }
            placeholder="Organization Name"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Office Name</Text>
          <TextInput
            style={styles.input}
            value={formData.officeName}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, officeName: text }))
            }
            placeholder="Office Name"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Organization Type</Text>
          <DropdownSlider
            data={typeData}
            placeholder={formData.type || "Select Type"}
            onSelect={(item) =>
              setFormData((prev) => ({ ...prev, type: item }))
            }
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Address</Text>
          <TextInput
            style={styles.input}
            value={formData.address}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, address: text }))
            }
            placeholder="Address"
            placeholderTextColor="#999"
            multiline
          />
        </View>
      </View>

      {error ? <Text style={styles.Error}>{error}</Text> : null}

      <View style={styles.buttonWrapper}>
        <TouchableOpacity
          style={[styles.DefaultButton, loading && styles.disabledButton]}
          onPress={handleUpdate}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Updating..." : "Update Organization"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FCFF",
    alignItems: "center",
    justifyContent: "space-between",
    color: "black",
  },
  inputArea: {
    width: "90%",
    margin: 20,
  },
  header: {
    fontSize: FONTS.large,
    fontFamily: FONTS.familyBold,
    color: COLORS.secondary,
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: FONTS.medium,
    fontFamily: FONTS.familyBold,
    color: "#333",
    marginBottom: 5,
  },
  input: {
    borderWidth: 0,
    borderBottomWidth: 1,
    borderColor: COLORS.borders,
    padding: 10,
    fontSize: FONTS.medium,
    borderRadius: 5,
    color: "#333",
  },
  buttonWrapper: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    gap: 20,
    marginTop: 20,
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
    textAlign: "center",
    paddingHorizontal: 10,
    backgroundColor: COLORS.secondary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 2,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: FONTS.medium,
    fontFamily: FONTS.familyBold,
    color: "white",
    margin: "auto",
  },
  Error: {
    color: "red",
    textAlign: "center",
    fontSize: FONTS.medium,
    fontFamily: FONTS.familyBold,
    marginTop: 10,
  },
});
// const [invitedUser, setInvitedUser] = useState(null);
// const [error, setError] = useState();
// const isProfessionalEmail = (email) => {
//   const freeEmailProviders = [
//     "gmail.com",
//     "yahoo.com",
//     "hotmail.com",
//     "outlook.com",
//     "aol.com",
//     "icloud.com",
//   ];
//   const emailDomain = email.split("@")[1];
//   return !freeEmailProviders.includes(emailDomain);
// };

// const inviteUser = async () => {
//   if (invitedUser == "") {
//     setError("Invited User Email is required");
//     return;
//   }
//   if (!isProfessionalEmail(invitedUser)) {
//     setError("Please enter a professional email address");
//     return;
//   }
//   // send invitation to invitedUser
//   try {
//     const url = `/addAssociatedEmail/:userId/${invitedUser}`;
//   } catch (error) {
//     console.log(error);
//     setError(error.message);
//   }
// };
{
  /* <View style={styles.listContainer}>
        <Text style={styles.header}>Add Admin</Text>
        <Text style={styles.info}>Add Admin to your Organization</Text>
        <View style={styles.inputArea}>
          <Text style={styles.label}>Invited UserEmail</Text>
          <TextInput
            style={styles.input}
            value={invitedUser}
            onChangeText={setInvitedUser}
          />

          {error && <Text style={styles.Error}>{error}</Text>}

          <View style={styles.buttonWrapper}>
            <TouchableOpacity style={styles.DefaultButton} onPress={inviteUser}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View> */
}
