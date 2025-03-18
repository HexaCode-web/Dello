import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import TopBar from "../../GeneralComponents/TopBar";
import Header from "../Profile/components/Header";
import { useDispatch, useSelector } from "react-redux";
import PresentRole from "../Profile/components/PresentRole";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import BusinessDriver from "../Profile/components/BusinessDriver";
import HighLights from "../Profile/components/HighLights";
import Education from "../Profile/components/Education";
import PreviousRole from "../Profile/components/PreviousRole";
import Skills from "../Profile/components/Skills";
import ImmediateNeeds from "../Profile/components/ImmediateNeeds";
import axios from "axios";
import { COLORS, FONTS } from "../../../theme";
import { logout } from "../../redux/slices/authSlice";

export default function ViewProfile({ route }) {
  const {
    ProfileID,
    networkId,
    meetingRequest = null,
    meetRequestID,
  } = route.params;
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [previousMeetingRequest, setPreviousMeetingRequest] = useState(null);
  const [User, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const activeUser = useSelector((state) => state.auth.user);
  const [requestOwner, setRequestOwner] = useState(null);
  const [network, setNetwork] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false); // State for modal visibility
  const [meetingPurpose, setMeetingPurpose] = useState(""); // State for meeting purpose input

  const tabsAr = [
    { Name: "Security", Page: "Security" },
    { Name: "Profile", Page: "Profile" },
    { Name: "Settings", Page: "Profiles" },
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
      if (error.status == 401) {
        dispatch(logout());
      }
      console.error("Error fetching admin profile:", error.message);
    } finally {
      setLoading(false);
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
          },
          headers: {
            Authorization: `Bearer ${activeUser.Token}`,
          },
        }
      );
      const network = await axios.get(
        `${process.env.EXPO_PUBLIC_NETWORK_API}/getNetwork/${networkId}/${activeUser.user._id}`
      );
      setNetwork(network.data);
      console.log(response.data.data);

      setPreviousMeetingRequest(response.data.data);
    } catch (error) {
      if (error.status == 401) {
        dispatch(logout());
      }
      console.error("Error fetching meeting request:", error);
      setPreviousMeetingRequest(null);
    }
  };

  const handleCreateMeetingRequest = () => {
    setIsModalVisible(true); // Show the modal for meeting purpose
  };

  const CreateMeetingRequest = async () => {
    if (!meetingPurpose.trim()) {
      Alert.alert("Error", "Please enter a purpose for the meeting.");
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_MEET_API}/CreateMeetRequest`,
        {
          networkID: networkId,
          userIDA: activeUser.user._id,
          userIDB: ProfileID,
          senderName: `${activeUser?.user.FirstName} ${activeUser?.user.LastName}`,
          purpose: meetingPurpose, // Use the input from the modal
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
      setIsModalVisible(false); // Close the modal
      setMeetingPurpose(""); // Clear the input
    } catch (error) {
      if (error.status == 401) {
        dispatch(logout());
      }
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
      if (error.status == 401) {
        dispatch(logout());
      }
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
      if (error.status == 401) {
        dispatch(logout());
      }
      console.error("Error creating meeting Rejected:", error);
      const errorMessage =
        error.response?.data?.message || "An unknown error occurred";
      Alert.alert("Error", errorMessage);
    }
  };

  const renderItem = ({ item }) => {
    switch (item.type) {
      case "ImmediateNeeds":
        return <ImmediateNeeds data={item.data} clickAble={false} />;
      case "PresentRole":
        return <PresentRole data={item.data} clickAble={false} />;
      case "BusinessDriver":
        return <BusinessDriver data={item.data} clickAble={false} />;
      case "HighLights":
        return <HighLights data={item.data} clickAble={false} />;
      case "Education":
        return <Education data={item.data} clickAble={false} />;
      case "PreviousRole":
        return <PreviousRole data={item.data} clickAble={false} />;
      case "Skills":
        return <Skills data={item.data} clickAble={false} />;
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
  ].filter((item) => item.data);

  useFocusEffect(
    useCallback(() => {
      const fetchApis = async () => {
        try {
          setLoading(true);
          await getProfile(ProfileID);
          await getMeetRequest();
          setLoading(false);
        } catch (error) {
          if (error.status == 401) {
            dispatch(logout());
          }
          console.error("Error fetching data:", error);
        }
      };

      fetchApis();
    }, [ProfileID])
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
            contentContainerStyle={{ paddingBottom: 20 }}
          />
          {previousMeetingRequest ? (
            <View style={styles.buttonWrapper}>
              {requestOwner === "Accepted" && (
                <TouchableOpacity
                  style={styles.emptyBtn}
                  onPress={() => {
                    navigation.navigate("chatRoom", {
                      ProfileID,
                      roomName: `${User.FirstName} ${User.LastName}`,
                      networkId,
                      meetRequest: previousMeetingRequest,
                      meetRequestID:
                        meetRequestID || previousMeetingRequest?._id,
                    });
                  }}
                >
                  <Text style={styles.buttonTextEmpty}>Chat Now </Text>
                </TouchableOpacity>
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
                    through {network.name}
                  </Text>
                  <View style={styles.actionButtonsWrapper}>
                    <TouchableOpacity
                      onPress={AcceptMeetingRequest}
                      style={[styles.DefaultButton, styles.acceptButton]}
                    >
                      <Text style={styles.buttonText}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={rejectMeetingRequest}
                      style={[styles.DefaultButton, styles.rejectButton]}
                    >
                      <Text style={styles.rejectButtonText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {requestOwner === null && (
                <TouchableOpacity
                  onPress={handleCreateMeetingRequest}
                  style={[styles.DefaultButton, { width: "80%" }]}
                >
                  <Text style={styles.buttonText}>Request to meet</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            networkId && (
              <View style={styles.buttonWrapper}>
                <TouchableOpacity
                  onPress={handleCreateMeetingRequest}
                  style={[styles.DefaultButton, { width: "80%" }]}
                >
                  <Text style={styles.buttonText}>Request to meet</Text>
                </TouchableOpacity>
              </View>
            )
          )}
        </>
      )}

      {/* Modal for Meeting Purpose */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Meeting Purpose</Text>
            <TextInput
              style={styles.input}
              placeholder="Purpose of the meeting"
              value={meetingPurpose}
              onChangeText={setMeetingPurpose}
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                style={[styles.modalButton, styles.cancelButton]}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={CreateMeetingRequest}
                style={[styles.modalButton, styles.submitButton]}
              >
                <Text style={styles.modalButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FCFF",
    paddingTop: 0,
    paddingHorizontal: 20,
    justifyContent: "flex-start",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonWrapper: {
    marginVertical: 10,
    alignItems: "center",
  },
  DefaultButton: {
    borderRadius: 30,
    height: 45,
    display: "flex",
    justifyContent: "center",
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
    backgroundColor: COLORS.secondary,
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
    color: "#6C757D",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
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
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    minHeight: 100,
    textAlignVertical: "top",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#CCC",
  },
  submitButton: {
    backgroundColor: COLORS.secondary,
  },
  modalButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
});
