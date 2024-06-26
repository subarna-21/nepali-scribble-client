import { View, Text, Image, Touchable, TouchableOpacity } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { themeColors } from "../theme";
import { useNavigation } from "@react-navigation/native";
import { AppScreenNavigationProp } from "../app.d";
import { StatusBar } from "expo-status-bar";

export default function WelcomeScreen() {
  const navigation = useNavigation<AppScreenNavigationProp>();
  return (
    <>
      <StatusBar backgroundColor="transparent" translucent={true} />
      <SafeAreaView
        className="flex-1"
        style={{
          backgroundColor: themeColors.bg,
        }}
      >
        <View className="flex-1 flex justify-around my-4">
          <Text className="text-white font-bold text-4xl text-center">
            Let's get Started!
          </Text>
          <View className="flex-row justify-center">
            <Image
              source={require("../assets/images/welcome.png")}
              style={{ width: 350, height: 350 }}
            />
          </View>
          <View className="space-y-4">
            <TouchableOpacity
              className="py-3 bg-yellow-400 mx-7 rounded-xl"
              onPress={() => navigation.navigate("SignUp")}
            >
              <Text className="text-xl font-bold text-center text-gray-700">
                Sign Up
              </Text>
            </TouchableOpacity>
            <View className="flex-row justify-center space-x-1">
              <Text className="text-white font-semibold">
                Already have an account?
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text className="font-semibold text-yellow-400">Log In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}
