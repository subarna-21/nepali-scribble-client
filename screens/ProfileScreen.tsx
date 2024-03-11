import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SecureStorage from "expo-secure-store";
import { notifyMessage } from "../utils/toast-message";

export default function ProfileScreen() {
  const handleLogout = async () => {
    await SecureStorage.deleteItemAsync("token");

    notifyMessage("Logged Out Successfully", "success");
  };
  return (
    <View className="h-full flex flex-col justify-between">
      <SafeAreaView className="flex flex-col">
        <View className="flex items-center">
          <Image
            source={require("../assets/images/login.png")}
            width={100}
            height={100}
            className="h-80"
          />
        </View>
      </SafeAreaView>
      <View className="mx-7">
        <TouchableOpacity
          className="mb-4 p-4 flex items-center justify-center w-full bg-white rounded-xl"
          onPress={handleLogout}
        >
          <Text className="text-gray-700 font-semibold">Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
