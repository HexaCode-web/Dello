import React from "react";
import { Text, View } from "react-native";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import { COLORS } from "../../theme";
const NavigationAwareToast = () => {
  const navigation = useNavigation();

  return (
    <Toast
      config={{
        info: (props) => (
          <View
            style={{
              backgroundColor: "white",
              borderLeftWidth: 6,
              borderLeftColor: COLORS.secondary,
              padding: 15,
              borderRadius: 10,
              marginTop: 50,
              width: "95%",
            }}
            onPress={() => {
              Toast.hide();

              navigation.navigate("ViewProfile", {
                ProfileID: props.props.senderID,
              });
            }}
          >
            <Text style={{ color: "black", fontSize: 16, fontWeight: "bold" }}>
              {props.text1}
            </Text>
            <Text style={{ color: "black", fontSize: 14 }}>{props.text2}</Text>
          </View>
        ),
      }}
    />
  );
};

export default NavigationAwareToast;
