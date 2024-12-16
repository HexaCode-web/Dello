import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import axios from "axios";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useGetLocation } from "../../hooks/getLocation";
import { COLORS, FONTS } from "../../../theme";
import Screen0 from "./Screens/Screen0";
import Screen1 from "./Screens/Screen1";
import Screen2 from "./Screens/Screen2";
import Screen3 from "./Screens/Screen3";
import Screen4 from "./Screens/Screen4";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
export default function CreateOrg() {
  const User = useSelector((state) => state.auth.user);
  const navigation = useNavigation();

  const [activeInnerPage, setActiveInnerPage] = useState(0);
  const [location, error] = useGetLocation();
  const [userInfo, setUserInfo] = useState({
    orgEmailId: "",
    confirmPassword: "",
    orgName: "",
    OTP: "",
    address: "",
  });

  const [errorInForm, setErrorInForm] = useState("");
  const onChangeEmail = (value) => {
    setUserInfo((prev) => {
      return { ...prev, orgEmailId: value };
    });
  };
  const onChangeAddress = (value) => {
    setUserInfo((prev) => {
      return { ...prev, address: value };
    });
  };

  const onChangeOTP = (value) => {
    setUserInfo((prev) => {
      return { ...prev, OTP: value };
    });
  };
  const onChangeOrgName = (value) => {
    setUserInfo((prev) => {
      return { ...prev, orgName: value };
    });
  };

  const sendOTP = async () => {
    const config = {
      method: "post",
      url: `${process.env.EXPO_PUBLIC_AUTH_API}/send-Otp`,
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        email: userInfo.orgEmailId,
      },
    };
    axios(config)
      .then((response) => {
        setErrorInForm("OTP sent ");
      })
      .catch((error) => {
        console.log(error);

        const errorMessage = error.response
          ? error.response.data.message || "OTP verification failed"
          : error.message;
        setErrorInForm(errorMessage);
      });
  };

  const verifyOTP = async () => {
    try {
      const config = {
        method: "post",
        url: `${process.env.EXPO_PUBLIC_AUTH_API}/verify-Otp`,
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          email: userInfo.orgEmailId,
          sentOTP: userInfo.OTP,
        },
      };

      const response = await axios(config);

      // Check for successful OTP verification using the message in the response
      if (
        response.status === 200 &&
        response.data.message === "OTP verified successfully"
      ) {
        return true;
      } else {
        setErrorInForm(
          response.data.message || "Unexpected error during OTP verification"
        );
        return false;
      }
    } catch (error) {
      console.log(error);

      const errorMessage = error.response
        ? error.response.data.message || "OTP verification failed"
        : error.message;

      setErrorInForm(errorMessage);
      return false;
    }
  };

  const signUp = async () => {
    try {
      const config = {
        method: "post",
        url: `${process.env.EXPO_PUBLIC_ORG_API}/add`,
        headers: {
          "Accept-Language": "en",
          "Content-Type": "application/json",
          Authorization: `Bearer ${User.Token}`,
        },
        data: {
          email: userInfo.orgEmailId,
          name: userInfo.orgName,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          address: userInfo.address,
          userId: User.user._id,
        },
      };

      const response = await axios(config);

      if (response.status === 201) {
        return true;
      } else {
        setErrorInForm(
          response.data.message || "Unexpected error during Registration"
        );
        return false;
      }
    } catch (error) {
      setErrorInForm(error.response.data.message);
      return false;
    }
  };
  const finalizeSignUp = async () => {
    const verified = await verifyOTP();
    if (verified) {
      const SignedUp = await signUp();
      if (SignedUp) {
        setActiveInnerPage(4);
        setErrorInForm("");
      }
    }
  };
  useEffect(() => {
    if (activeInnerPage === 3) {
      sendOTP();
    }
  }, [activeInnerPage]);
  const innerNavigation = () => {
    setErrorInForm("");
    if (activeInnerPage === 4 || activeInnerPage === 0) {
      setActiveInnerPage(0);
      navigation.navigate("Home");
    } else {
      activeInnerPage >= 1 && setActiveInnerPage((prev) => prev - 1);
    }
  };
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.return}>
        <AntDesign
          name="arrowleft"
          size={36}
          color={COLORS.secondary}
          onPress={innerNavigation}
        />
      </TouchableOpacity>
      {activeInnerPage === 0 && (
        <Screen2
          userInfo={userInfo}
          setActiveInnerPage={setActiveInnerPage}
          onChangeOrgName={onChangeOrgName}
          setErrorInForm={setErrorInForm}
        />
      )}
      {activeInnerPage === 1 && (
        <Screen1
          userInfo={userInfo}
          setActiveInnerPage={setActiveInnerPage}
          onChangeAddress={onChangeAddress}
          setErrorInForm={setErrorInForm}
        />
      )}
      {activeInnerPage === 2 && (
        <Screen0
          onChangeEmailFunction={onChangeEmail}
          userInfo={userInfo}
          setActiveInnerPage={setActiveInnerPage}
          setErrorInForm={setErrorInForm}
        />
      )}

      {activeInnerPage === 3 &&
        errorInForm != "User is already registered." && (
          <Screen3
            sendOTP={sendOTP}
            finalizeSignUp={finalizeSignUp}
            onChangeOTP={onChangeOTP}
          />
        )}
      {activeInnerPage === 4 && <Screen4 userInfo={userInfo} />}
      {errorInForm && <Text style={styles.Error}>{errorInForm}</Text>}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    paddingTop: 120,
    paddingBottom: 50,
    paddingHorizontal: 10,
    color: "black",
  },
  Error: {
    color: "red",
    textAlign: "center",
    fontSize: FONTS.medium,
    fontFamily: FONTS.familyBold,
  },
  return: {
    position: "absolute",
    top: 40,
    left: 10,
    padding: 10,
    backgroundColor: "white",
  },
  inputWrapper: {
    display: "flex",
    flexDirection: "column",
  },
  inputsWrapper: {
    flex: 1,
  },
  input: {
    height: 50,
    width: 350,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    fontSize: FONTS.medium,
    fontFamily: FONTS.familyBold,
    borderRadius: 30,
  },
  Header: {
    width: "100%",
    fontSize: FONTS.large,
    fontFamily: FONTS.familyBold,
    marginBottom: 10,
  },
  signUpPrompt: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },

  signUpPromptBtn: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },

  buttonWrapper: {
    width: "100%",

    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginBottom: 10,
    gap: 20,
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
    paddingHorizontal: 10,
    backgroundColor: COLORS.secondary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonTextEmpty: {
    fontSize: FONTS.medium,
    fontFamily: FONTS.familyBold,
    color: COLORS.secondary,
  },
  buttonText: {
    fontSize: FONTS.medium,
    fontFamily: FONTS.familyBold,
    color: "white",
  },
});
