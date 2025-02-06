import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import React, { useEffect, useState } from "react";
import axios from "axios";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useGetLocation } from "../../../hooks/getLocation";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../../redux/slices/authSlice";
import { COLORS, FONTS } from "../../../../theme";
import { useNavigation } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
const LoginStack = createStackNavigator();
import * as SecureStore from "expo-secure-store";
import Fontisto from "@expo/vector-icons/Fontisto";

// Add this function for saving data
async function saveToSecureStore(key, value) {
  await SecureStore.setItemAsync(key, value);
}

// Add this function for retrieving data
async function getFromSecureStore(key) {
  return await SecureStore.getItemAsync(key);
}

export default function SignIn() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { location, error, loading } = useSelector((state) => state.location);

  const [userInfo, setUserInfo] = useState({
    Email: "",
    userName: "",
    Password: "",
  });

  const [rememberMe, setRememberMe] = useState(false);
  const [savedCredentials, setSavedCredentials] = useState(null);
  const [errorInForm, setErrorInForm] = useState("");

  useEffect(() => {
    // Load saved credentials when the screen loads
    const loadCredentials = async () => {
      const email = await getFromSecureStore("email");
      const password = await getFromSecureStore("password");
      if (email && password) {
        setSavedCredentials({ email, password });
      }
    };
    loadCredentials();
  }, []);

  const onChangeEmail = (value) => {
    const username = value.split("@")[0]; // Get the part before '@'
    setUserInfo((prev) => {
      return { ...prev, Email: value, userName: username }; // Set both Email and userName
    });
  };

  const onChangePassword = (value) => {
    setUserInfo((prev) => {
      return { ...prev, Password: value };
    });
  };

  const handleReturn = () => {
    navigation.goBack();
  };

  const handleQuickLogin = async () => {
    if (savedCredentials) {
      setUserInfo({
        Email: savedCredentials.email,
        Password: savedCredentials.password,
      });
      await Login(savedCredentials.email, savedCredentials.password);
    }
  };

  const Login = async (
    email = userInfo.Email,
    password = userInfo.Password
  ) => {
    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_AUTH_API}/login`,
        {
          email,
          password,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201) {
        if (rememberMe) {
          await saveToSecureStore("email", email);
          await saveToSecureStore("password", password);
        }
        const UserData = {
          Token: response.data.token,
          ID: response.data.user._id,
          userName: response.data.user.name,
          user: { ...response.data.user },
        };
        dispatch(login(UserData));

        return true;
      } else {
        setErrorInForm(
          response.data.message || "Unexpected error during Login"
        );
        return false;
      }
    } catch (error) {
      const errorMessage = error.response
        ? error.response.data.message || "Login failed"
        : error.message;

      setErrorInForm(errorMessage);
      return false;
    }
  };

  return (
    <LoginStack.Navigator
      initialRouteName="Email"
      screenOptions={{
        headerShown: false,
      }}
    >
      <LoginStack.Screen name="Email">
        {(props) => (
          <EmailScreen
            {...props}
            onChangeEmail={onChangeEmail}
            userInfo={userInfo}
            errorInForm={errorInForm}
            handleReturn={handleReturn}
            setErrorInForm={setErrorInForm}
            savedCredentials={savedCredentials}
            handleQuickLogin={handleQuickLogin}
            loading={loading}
          />
        )}
      </LoginStack.Screen>
      <LoginStack.Screen name="Password">
        {(props) => (
          <PasswordScreen
            {...props}
            onChangePassword={onChangePassword}
            userInfo={userInfo}
            errorInForm={errorInForm}
            setErrorInForm={setErrorInForm}
            Login={Login}
            navigation={navigation}
            rememberMe={rememberMe}
            setRememberMe={setRememberMe}
          />
        )}
      </LoginStack.Screen>
    </LoginStack.Navigator>
  );
}

const EmailScreen = ({
  userInfo,
  onChangeEmail,
  navigation,
  errorInForm,
  handleReturn,
  setErrorInForm,
  savedCredentials,
  handleQuickLogin,
  loading,
}) => {
  const handleContinue = () => {
    if (!userInfo.Email) {
      alert("Please enter your email");
      return;
    }
    if (!userInfo.Email.includes("@")) {
      alert("Please enter a valid email");
      return;
    }
    navigation.navigate("Password");
    setErrorInForm("");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.return}>
        <AntDesign
          name="arrowleft"
          size={36}
          color="black"
          onPress={handleReturn}
        />
      </TouchableOpacity>
      <View style={styles.textWrapper}>
        <Text style={styles.Header}>Sign In</Text>
      </View>
      <View style={styles.inputsWrapper}>
        <TextInput
          style={styles.input}
          onChangeText={onChangeEmail}
          placeholder="Email"
          value={userInfo.Email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {savedCredentials && !loading && (
        <TouchableOpacity
          onPress={handleQuickLogin}
          style={styles.DefaultButton}
        >
          <Text style={styles.buttonText}>
            Quick Login as {savedCredentials.email}
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.buttonWrapper}>
        <TouchableOpacity onPress={handleContinue} style={styles.DefaultButton}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
      {errorInForm && <Text style={styles.Error}>{errorInForm}</Text>}
    </View>
  );
};

const PasswordScreen = ({
  userInfo,
  onChangePassword,
  errorInForm,
  setErrorInForm,
  Login,
  navigation,
  rememberMe,
  setRememberMe,
}) => {
  const handleContinue = async () => {
    if (!userInfo.Email) {
      alert("Please enter your email");
      return;
    }
    if (!userInfo.Email.includes("@")) {
      alert("Please enter a valid email");
      return;
    }

    setErrorInForm("");
    await Login();
  };
  const handleReturn = () => {
    navigation.navigate("SignIn", { screen: "Email" });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.return} onPress={handleReturn}>
        <AntDesign name="arrowleft" size={36} color="black" />
      </TouchableOpacity>
      <View style={styles.inputsWrapper}>
        <TextInput
          placeholder="Password"
          returnKeyType="go"
          secureTextEntry
          autoCorrect={false}
          style={styles.input}
          onChangeText={onChangePassword}
          value={userInfo.Password}
        />
      </View>
      <View style={styles.rememberMeWrapper}>
        <TouchableOpacity onPress={() => setRememberMe(!rememberMe)}>
          <Fontisto
            name={rememberMe ? "checkbox-active" : "checkbox-passive"}
            size={24}
            color={COLORS.secondary}
          />
        </TouchableOpacity>
        <Text>Remember Me</Text>
      </View>
      {errorInForm ? <Text style={styles.Error}>{errorInForm}</Text> : null}
      <View style={styles.buttonWrapper}>
        <TouchableOpacity onPress={handleContinue} style={styles.DefaultButton}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FCFF",

    alignItems: "center",
    paddingTop: 120,
    paddingBottom: 20,
    paddingHorizontal: 10,
  },
  screenContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 0,
  },
  rememberMeWrapper: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    gap: 10,
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
    backgroundColor: "#F5FCFF",
  },
  inputWrapper: {
    display: "flex",
    flexDirection: "column",
  },
  input: {
    height: 50,
    width: 300,
    margin: 12,
    borderWidth: 1,
    fontSize: FONTS.medium,
    fontFamily: FONTS.familyBold,
    borderRadius: 30,
    paddingLeft: 20,
  },
  inputsWrapper: {
    flex: 1,
  },
  textWrapper: {
    marginBottom: 20,
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    gap: 10,
    width: "100%",
    paddingLeft: 20,
  },
  Header: {
    fontSize: FONTS.large,
    fontFamily: FONTS.familyBold,
  },
  signUpPrompt: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  signUpPromptText: {
    fontSize: FONTS.medium,
    fontFamily: FONTS.familyLight,
    paddingLeft: 20,
    color: COLORS.textSecondary,
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
