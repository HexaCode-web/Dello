import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  Alert,
} from "react-native";
import TopBar from "../../GeneralComponents/TopBar";
import Header from "../Profile/components/Header";
import { useCallback, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import PresentRole from "../Profile/components/PresentRole";
import { useFocusEffect } from "@react-navigation/native";
import React from "react";
import BusinessDriver from "../Profile/components/BusinessDriver";
import HighLights from "../Profile/components/HighLights";
import Education from "../Profile/components/Education";
import PreviousRole from "../Profile/components/PreviousRole";
import Skills from "../Profile/components/Skills";
import ImmediateNeeds from "../Profile/components/ImmediateNeeds";
import axios from "axios";
import { COLORS, FONTS } from "../../../theme";

export default function ViewProfile({ route }) {
  const { ProfileID, networkId, meetingRequest } = route.params;
  const [previousMeetingRequest, setPreviousMeetingRequest] = useState(null);
  const [User, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state
  const activeUser = useSelector((state) => state.auth.user);
  const [requestOwner, setRequestOwner] = useState(null);
  const tabsAr = [
    { Name: "Security", Page: "Security" },
    { Name: "Profile", Page: "Profile" },
    { Name: "Profiles", Page: "Profiles" },
    { Name: "Organisation", Page: "Organizations" },
  ];

  const [data, setData] = useState({
    presentRole: null,
    businessDriver: null,
    highLight: null,
    education: null,
    previousRole: null,
    skills: null,
    ImmediateNeeds: null,
  });

  const getProfile = async (ProfileID) => {
    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_PROFILE_API}/${ProfileID}`
      );
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching admin profile:", error.message);
    } finally {
      setLoading(false); // Stop loading once data is fetched
    }
  };
  const getMeetRequest = async () => {
    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_MEET_API}/getMeetRequest`,
        {
          params: {
            userIDA: ProfileID,
            userIDB: activeUser.user._id,
            networkID: networkId,
          },
          headers: {
            Authorization: `Bearer ${activeUser.Token}`, // Replace with your actual token
          },
        }
      );
      setPreviousMeetingRequest(response.data.data);
    } catch (error) {
      console.error("Error fetching meeting request:", error);
    }
  };
  const CreateMeetingRequest = async () => {
    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_MEET_API}/CreateMeetRequest`,
        {
          networkID: networkId,
          userIDA: activeUser.user._id,
          userIDB: ProfileID,
          purpose: "Discuss project updates",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${activeUser.Token}`,
          },
        }
      );

      Alert.alert("Success", "Meeting request created successfully");
      setPreviousMeetingRequest(response.data.data);
    } catch (error) {
      console.error("Error creating meeting request:", error);

      const errorMessage =
        error.response?.data?.message || "An unknown error occurred";

      Alert.alert("Error", errorMessage);
    }
  };
  const AcceptMeetingRequest = async () => {
    try {
      const response = await axios.put(
        `${process.env.EXPO_PUBLIC_MEET_API}/AcceptMeetRequest/${previousMeetingRequest._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${activeUser.Token}`,
          },
        }
      );

      Alert.alert("Success", "Meeting request accepted");
      setPreviousMeetingRequest(response.data.data);
    } catch (error) {
      console.error("Error creating meeting request:", error);

      const errorMessage =
        error.response?.data?.message || "An unknown error occurred";

      Alert.alert("Error", errorMessage);
    }
  };
  const rejectMeetingRequest = async () => {
    try {
      const response = await axios.put(
        `${process.env.EXPO_PUBLIC_MEET_API}/rejectMeetRequest/${previousMeetingRequest._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${activeUser.Token}`,
          },
        }
      );

      Alert.alert("Success", "Meeting request Rejected");
      setPreviousMeetingRequest(null);
    } catch (error) {
      console.error("Error creating meeting Rejected:", error);

      const errorMessage =
        error.response?.data?.message || "An unknown error occurred";

      Alert.alert("Error", errorMessage);
    }
  };
  const renderItem = ({ item }) => {
    switch (item.type) {
      case "ImmediateNeeds":
        return <ImmediateNeeds data={item.data} />;
      case "PresentRole":
        return <PresentRole data={item.data} />;
      case "BusinessDriver":
        return <BusinessDriver data={item.data} />;
      case "HighLights":
        return <HighLights data={item.data} />;
      case "Education":
        return <Education data={item.data} />;
      case "PreviousRole":
        return <PreviousRole data={item.data} />;
      case "Skills":
        return <Skills data={item.data} />;
      default:
        return null;
    }
  };
  const listData = [
    { type: "PresentRole", data: data?.presentRole },
    { type: "ImmediateNeeds", data: data?.ImmediateNeeds },
    { type: "BusinessDriver", data: data?.businessDriver },
    { type: "HighLights", data: data?.highLight },
    { type: "Education", data: data?.education },
    { type: "PreviousRole", data: data?.previousRole },
    { type: "Skills", data: data?.skills },
  ].filter((item) => item.data); // Filter out any sections without data
  useFocusEffect(
    useCallback(() => {
      const fetchApis = async () => {
        try {
          setLoading(true); // Start loading
          await getProfile(ProfileID);
          await getMeetRequest();
          setLoading(false);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };

      fetchApis();

      // No cleanup required, so we return nothing
    }, [ProfileID]) // Ensure this dependency is correct
  );

  useEffect(() => {
    if (previousMeetingRequest) {
      if (previousMeetingRequest.meetResponse === "accepted") {
        setRequestOwner("Accepted");
        return;
      }
      if (previousMeetingRequest.meetResponse === "rejected") {
        setRequestOwner(null);
        return;
      }
      if (previousMeetingRequest?.userIDA === activeUser.user._id) {
        setRequestOwner("A");
      } else {
        setRequestOwner("B");
      }
    } else {
      setRequestOwner(null);
    }
  }, [previousMeetingRequest]);

  useFocusEffect(
    useCallback(() => {
      if (User) {
        setData({
          presentRole: User?.presentRole,
          businessDriver: User?.businessDrivers,
          highLight: User?.highlights,
          education: User?.education,
          previousRole: User?.previousRoles,
          skills: User?.skills,
          ImmediateNeeds: User?.ImmediateNeeds,
        });
      }
    }, [User])
  );
  return (
    <View style={styles.container}>
      <TopBar Tabs={tabsAr} hasReturnButton={true} />
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <>
          <Header User={User} />
          <FlatList
            data={listData}
            keyExtractor={(item) => item.type}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 20 }} // Add bottom padding to the list
          />
          {meetingRequest && (
            <View style={styles.buttonWrapper}>
              {requestOwner === "Accepted" && (
                // Active user made the request
                <View style={styles.emptyBtn}>
                  <Text style={styles.buttonTextEmpty}>
                    Meeting request already accepted
                  </Text>
                </View>
              )}
              {requestOwner === "A" && (
                <View style={styles.emptyBtn}>
                  <Text style={styles.buttonTextEmpty}>
                    Meeting request already sent
                  </Text>
                </View>
              )}

              {requestOwner === "B" && (
                <>
                  <Text style={styles.indicatorText}>
                    {User.FirstName} {User.LastName} wants to meet with you
                  </Text>
                  <View style={styles.actionButtonsWrapper}>
                    <TouchableOpacity
                      onPress={AcceptMeetingRequest}
                      style={[styles.DefaultButton, styles.acceptButton]}
                    >
                      <Text style={styles.buttonText}>
                        Accept their request
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={rejectMeetingRequest}
                      style={[styles.DefaultButton, styles.rejectButton]}
                    >
                      <Text style={styles.rejectButtonText}>
                        Reject their request
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {requestOwner === null && (
                // No previous meeting request
                <TouchableOpacity
                  onPress={CreateMeetingRequest}
                  style={[styles.DefaultButton, { width: "80%" }]}
                >
                  <Text style={styles.buttonText}>Request to meet</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FCFF",

    paddingTop: 20,
    paddingBottom: 20,
    justifyContent: "flex-start",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonWrapper: {
    marginVertical: 20,
    alignItems: "center",
  },
  DefaultButton: {
    borderRadius: 30,
    height: 60,
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
  acceptButton: {
    backgroundColor: COLORS.secondary, // Green for Accept
  },
  rejectButton: {
    backgroundColor: "transparent",
    shadowColor: "transparent",
    borderWidth: 2,
    borderColor: COLORS.secondary,
  },
  rejectButtonText: {
    fontSize: FONTS.medium,
    fontFamily: FONTS.familyBold,
    color: COLORS.secondary,
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  indicatorText: {
    color: "#6C757D", // Grey text
    fontSize: 16,
    fontWeight: "bold",
  },
  actionButtonsWrapper: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    gap: 10,
  },
  emptyBtn: {
    backgroundColor: "transparent",
    shadowColor: "transparent",
    borderWidth: 2,
    borderColor: COLORS.secondary,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 30,
  },
  buttonTextEmpty: {
    fontSize: FONTS.medium,
    fontFamily: FONTS.familyBold,
    textAlign: "center",
    color: COLORS.secondary,
  },
});
