import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SecureStorage from "expo-secure-store";
import { notifyMessage } from "../utils/toast-message";

export default function ProfileScreen() {
  const handleLogout = async () => {
    await SecureStorage.deleteItemAsync("token");

    notifyMessage("Logged Out Successfully", "success");
  };
  return (
    <View className="flex flex-col w-full">
      <View className="relative h-[400px]">
        <Image
          source={require("../assets/background.png")}
          className="w-full absolute z-[-1] h-full"
        />
        <SafeAreaView className="flex flex-row items-center justify-between w-full h-full px-8">
          <View className="flex flex-col items-start">
            <Text className="text-gray-800 font-semibold text-2xl text-center">
              Welcome
            </Text>
            <Text className="font-semibold text-2xl text-center text-white capitalize">
              Rojan Rana Magar
            </Text>
          </View>
          <View>
            <Image
              source={require("../assets/profile.png")}
              className="w-32 h-32"
            />
          </View>
        </SafeAreaView>
      </View>
      <TouchableOpacity
        className="mb-4 p-4 flex items-center justify-center w-full bg-white rounded-xl"
        onPress={handleLogout}
      >
        <Text className="text-gray-700 font-semibold">Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
