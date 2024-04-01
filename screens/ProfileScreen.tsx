import {
  ActivityIndicator,
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
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "../api/api-client";
import LoadingScreen from "./LoadingScreen";
import * as ImagePicker from "expo-image-picker";
import { queryClient } from "../navigation/AppNavigation";
import { useEffect, useState } from "react";

type ProfileResponseDto = {
  data: {
    data: {
      id: number;
      name: string;
      email: string;
      image: string | null;
      createdAt: string;
      updatedAt: string;
    };
  };
};

export default function ProfileScreen() {
  const [profile, setProfile] = useState<
    ProfileResponseDto["data"]["data"] | null
  >(null);
  const { data, isPending } = useQuery<ProfileResponseDto>({
    queryKey: ["profile"],
    queryFn: () => api.get("/profile"),
  });

  const handleLogout = async () => {
    await SecureStorage.deleteItemAsync("token");

    notifyMessage("Logged Out Successfully", "success");
  };

  useEffect(() => {
    if (data?.data.data) {
      setProfile(data?.data?.data);
    }
  }, [data]);

  // image uploading
  const imageUploadingQuery = useMutation({
    mutationKey: ["profile/image"],
    mutationFn: (result: ImagePicker.ImagePickerSuccessResult) => {
      const formData = new FormData();
      formData.append("file", {
        name: result.assets[0].uri.split("/").pop() || "image.jpg",
        type: result.assets[0].mimeType,
        uri: result.assets[0].uri,
      } as any);

      return api.put("/profile/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["profile"],
      });
    },
  });

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],

      quality: 1,
    });

    if (result.canceled) return;

    imageUploadingQuery.mutate(result);
  };

  return isPending || !profile ? (
    <LoadingScreen />
  ) : (
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
              {profile?.name}
            </Text>
          </View>
          <View>
            {profile?.image ? (
              <View className="w-32 h-32 rounded-full border-[1px] border-white flex items-center justify-center relative bg-[rgba(229,231,235,1)]">
                <TouchableOpacity
                  onPress={pickImage}
                  className="absolute right-0 bottom-2 w-10 h-10 bg-white flex items-center justify-center z-[1] rounded-full opacity-90"
                >
                  <Text className="text-xl">+</Text>
                </TouchableOpacity>
                <View className="w-[110px] h-[110px] rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                  {imageUploadingQuery.isPending ? (
                    <ActivityIndicator size="large" color="#0000ff" />
                  ) : profile.image ? (
                    <Image
                      src={profile.image}
                      className="w-32 h-32 object-center object-cover"
                      width={128}
                      height={128}
                      progressiveRenderingEnabled
                    />
                  ) : (
                    <Image
                      source={require("../assets/profile.png")}
                      className="w-full h-full"
                    />
                  )}
                </View>
              </View>
            ) : (
              <Image
                source={require("../assets/profile.png")}
                className="w-full h-full"
              />
            )}
          </View>
        </SafeAreaView>
      </View>
      <View className="flex flex-col gap-y-8 px-8">
        <View className="flex flex-col gap-y-4">
          <View className="flex flex-row gap-x-4">
            <Text className="text-gray-700 font-semibold text-lg">Name:</Text>
            <Text className="text-gray-700 text-lg capitalize">
              {profile?.name}
            </Text>
          </View>
          <View className="flex flex-row gap-x-4">
            <Text className="text-gray-700 font-semibold text-lg">Email:</Text>
            <Text className="text-gray-700 text-lg">{profile?.email}</Text>
          </View>
          <View className="flex flex-row gap-x-4">
            <Text className="text-gray-700 font-semibold text-lg">Joined:</Text>
            <Text className="text-gray-700 text-lg">
              {new Date(profile.createdAt).toDateString()}
            </Text>
          </View>
          <View className="flex flex-row gap-x-4">
            <Text className="text-gray-700 font-semibold text-lg">
              Updated:
            </Text>
            <Text className="text-gray-700 text-lg">
              {new Date(profile.updatedAt).toDateString()}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          className="mb-4 p-4 flex items-center justify-center w-full bg-white rounded-xl"
          onPress={handleLogout}
        >
          <Text className="text-gray-700 font-semibold text-lg">Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
