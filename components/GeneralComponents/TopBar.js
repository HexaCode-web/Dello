import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  Modal,
} from "react-native";
import react, { useCallback, useContext, useEffect, useState } from "react";
import HamburgerButton from "../Pages/HomeScreen/components/HamburgerButton";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { COLORS, FONTS } from "../../theme";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import AntDesign from "@expo/vector-icons/AntDesign";
import React from "react";
import { Feather } from "@expo/vector-icons";
import { SocketContext } from "../redux/SocketProvider";

export default function TopBar({
  Tabs = [
    { Name: "Security", Page: "Security" },
    { Name: "Profile", Page: "Profile" },
    { Name: "Settings", Page: "Profiles" },
    { Name: "Organisation", Page: "Organizations" },
  ],
  hasReturnButton,
  returnTarget,
  Title,
  returnFunction,
}) {
  const User = useSelector((state) => state.auth.user);
  const socket = useContext(SocketContext);
  const navigation = useNavigation(); // Assuming you are using React Navigation v5 or later
  const [notifications, setNotifications] = useState();
  const [menuShown, setMenuShown] = useState(false);
  const dispatch = useDispatch();
  useEffect(() => {
    if (socket) {
      socket.on("newNotification", async (data) => {
        console.log(data, notifications);

        setNotifications((prev) => [...prev, data]);
      });
      return () => {
        socket.off("newNotification");
      };
    }
  }, [socket]);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        setNotifications([]);
        try {
          // Fetch notifications from an API
          const response = await fetch(
            `${process.env.EXPO_PUBLIC_NOTIFICATIONS_API}/getNotifications/${User.user._id}`,
            {
              headers: {
                "Accept-Language": "en",
                "Content-Type": "application/json",
                Authorization: `Bearer ${User.Token}`, // Add the token to the Authorization header
              },
            }
          );
          const data = await response.json();

          setNotifications(
            data.filter((notification) => notification.seen === false)
          );
        } catch (err) {
          setError(err.message);
        }
      };

      fetchData();
    }, [])
  );

  const RenderTabs = () => {
    return Tabs.map((Tab) => {
      return (
        <View style={styles.signUpPromptBtn} key={Tab.Name}>
          <TouchableOpacity
            onPress={() => {
              setMenuShown(false);
              navigation.navigate(Tab.Page);
            }}
          >
            <Text style={styles.buttonTextEmpty}>{Tab.Name}</Text>
          </TouchableOpacity>
        </View>
      );
    });
  };
  return (
    <View style={styles.topBar}>
      {hasReturnButton ? (
        <TouchableOpacity
          style={styles.return}
          onPress={() => {
            setMenuShown(false);
            if (returnFunction) {
              returnFunction(); // Execute the passed function if it exists
            } else if (returnTarget) {
              navigation.navigate(returnTarget); // Navigate to the specified target if available
            } else {
              navigation.goBack(); // Default to going back if no target or function is provided
            }
          }}
        >
          <AntDesign name="arrowleft" size={30} color="white" />
        </TouchableOpacity>
      ) : (
        <Text style={styles.logo}>D</Text>
      )}
      <Text style={styles.title}>{Title}</Text>
      <View style={styles.iconWrapper}>
        {notifications?.length > 0 && (
          <View style={styles.notificationsCountBox}>
            <Text style={styles.notificationsCountText}>
              {notifications?.length}
            </Text>
          </View>
        )}
        <FontAwesome
          name="bell"
          size={20}
          color="white"
          onPress={() => {
            setMenuShown(false);
            navigation.navigate("NotificationsScreen");
          }}
        />
        <HamburgerButton
          onPress={() => {
            setMenuShown(true);
          }}
        />
      </View>
      {menuShown && (
        <Modal
          visible={menuShown}
          transparent
          animationType="slide"
          onRequestClose={() => setMenuShown(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setMenuShown(false)}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}></Text>
                <TouchableOpacity onPress={() => setMenuShown(false)}>
                  <Feather name="x" size={24} color="black" />
                </TouchableOpacity>
              </View>
              {RenderTabs()}
              <View style={styles.signUpPromptBtn}>
                <TouchableOpacity
                  onPress={() => {
                    setMenuShown(false);
                    dispatch(logout());
                  }}
                >
                  <Text style={styles.buttonTextEmpty}>Logout</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  topBar: {
    position: "relative",
    top: -10,
    display: "flex",
    justifyContent: "space-between",
    width: "115%",
    right: "7.5%",
    height: 90,
    paddingTop: 10,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "flex-end",

    backgroundColor: COLORS.secondary,

    zIndex: 1000,
  },
  iconWrapper: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative", // Needed for absolute positioning of the badge
  },
  notificationsCountBox: {
    position: "absolute", // Position the badge absolutely within the iconWrapper
    top: 5, // Adjust to position the badge above the icon
    right: 75, // Adjust to position the badge to the right of the icon
    backgroundColor: "red", // Badge background color
    borderRadius: 10, // Make it circular
    minWidth: 20, // Minimum width to ensure it's not too small
    height: 20, // Fixed height
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4, // Add some horizontal padding
    zIndex: 1, // Ensure the badge appears above the icon
  },
  notificationsCountText: {
    color: "white", // Text color
    fontSize: 12, // Text size
    fontWeight: "bold", // Make the text bold
  },
  return: {
    marginLeft: 20,
    paddingBottom: 5,
  },
  logo: {
    fontSize: FONTS.large,
    fontFamily: FONTS.familyBold,
    color: "white",
    paddingBottom: 7,
    marginLeft: 20,
  },
  title: {
    fontSize: FONTS.large,
    fontFamily: FONTS.familyBold,
    color: "white",
    paddingBottom: 7,
  },
  image: {
    width: 20,
    objectFit: "contain",
    height: 29,
  },

  signUpPromptBtn: {
    marginVertical: 10, // Adds space between each tab for better readability
  },
  buttonTextEmpty: {
    fontSize: FONTS.medium,
    fontFamily: FONTS.familyBold,
    color: COLORS.secondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#F5FCFF",
    paddingLeft: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "50%",
    paddingBottom: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  modalTitle: {
    fontFamily: FONTS.familyBold,
    fontSize: FONTS.medium,
  },
});
