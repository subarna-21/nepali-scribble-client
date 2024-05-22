import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "../api/api-client";
import LoadingScreen from "./LoadingScreen";
import { StatusBar } from "expo-status-bar";
import { queryClient } from "../navigation/AppNavigation";

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

type ProgressResponseDto = {
  data: {
    data: {
      id: string;
      char: string;
      userId: string;
      accuracy: number;
      noOfTry: number;
      input: string;
      completed: boolean;
      createdAt: Date;
      updatedAt: Date;
    }[];
  };
};

export default function DashboardScreen() {
  const [deleteMode, setDeleteMode] = useState(false);
  const onRefresh = React.useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ["progress"],
    });
  }, []);
  const [data, setData] = useState<{
    id: string;
    char: string;
    userId: string;
    accuracy: number;
    noOfTry: number;
    input: string;
    completed: boolean;
    createdAt: Date;
    updatedAt: Date;
  } | null>(null);
  const { data: profileData } = useQuery<ProfileResponseDto>({
    queryKey: ["profile"],
    queryFn: () => api.get("/profile"),
  });
  const {
    data: progressData,
    isPending,
    isRefetching,
  } = useQuery<ProgressResponseDto>({
    queryKey: ["progress"],
    queryFn: () => api.get("/progress"),
  });
  const { mutate } = useMutation({
    mutationKey: ["progress/reset"],
    mutationFn: () => api.delete("/progress"),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["progress"],
      });
      queryClient.invalidateQueries({
        queryKey: ["progress/current"],
      });
    },
  });
  const onResetAllProgress = async () => {
    setDeleteMode(false);
    mutate();
    queryClient.invalidateQueries({
      queryKey: ["progress"],
    });
  };
  return isPending || isRefetching ? (
    <LoadingScreen />
  ) : (
    <>
      <StatusBar backgroundColor="transparent" translucent={true} />
      <View className="p-4 bg-slate-400">
        <View className="flex-row justify-center">
          <Image
            source={require("../assets/images/welcome.png")}
            style={{ width: 120, height: 120 }}
          />
        </View>
        <Text className="text-xl capitalize">
          Welcome {profileData?.data.data.name}
        </Text>
      </View>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
        }
      >
        <View className="mx-4 mt-4">
          <Text className="text-xl font-bold">Progress</Text>
          <View className="flex flex-row justify-between">
            <Text className="font-thin">Click to see the image</Text>
            <TouchableOpacity onPress={() => setDeleteMode(true)}>
              <Text className="text-red-700">Reset All Progress</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View className="flex flex-col gap-y-4 px-4 py-6">
          {progressData?.data.data.map((progress, index) => (
            <View
              key={index}
              className="p-4 bg-slate-200 rounded-xl flex flex-row items-center justify-between"
            >
              <View className="flex flex-col gap-y-4">
                <Text className="">
                  Char: <Text className="font-bold">{progress.char}</Text>
                </Text>
                <Text className="">
                  Created At:{" "}
                  <Text className="font-bold">
                    {new Date(progress.createdAt).toLocaleDateString()}
                  </Text>
                </Text>
                <Text className="">
                  No of Try:{" "}
                  <Text className="font-bold">{progress.noOfTry}</Text>
                </Text>
              </View>
              <View className="flex flex-col gap-y-2">
                <Text className="">Accuracy: {progress.accuracy}%</Text>
                <TouchableOpacity
                  onPress={() => setData(progress)}
                  className="px-2 py-1 bg-slate-700 flex items-center justify-center rounded-md"
                >
                  <Text className="text-slate-100">View</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      {data && (
        <View className="w-full h-screen bg-black/20 absolute top-0 left-0">
          <View className="relative w-full h-full flex items-center justify-center">
            <View className="bg-white w-3/4 absolute rounded-xl p-4 flex flex-col gap-y-2">
              <Text className="text-xl font-bold">Progress</Text>
              <Text className="font-thin">Char: {data.char}</Text>
              <Text className="font-thin">Accuracy: {data.accuracy}%</Text>
              <Text className="font-thin">No of Try: {data.noOfTry}</Text>
              <View className="flex flex-row gap-x-4">
                <Text className="font-thin">Input:</Text>
                <Image
                  source={{
                    uri: data.input,
                  }}
                  style={{ width: 100, height: 100 }}
                />
              </View>
              <Text className="font-thin">
                Completed: {data.completed ? "Yes" : "No"}
              </Text>
              <Text className="font-thin">
                Created At: {new Date(data.createdAt).toLocaleDateString()}
              </Text>
              <Text className="font-thin">
                Updated At: {new Date(data.updatedAt).toLocaleDateString()}
              </Text>
              <TouchableOpacity
                onPress={() => setData(null)}
                className="px-2 py-2 bg-slate-700 flex items-center justify-center rounded-md mt-6"
              >
                <Text className="text-slate-100">Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      {deleteMode && (
        <View className="w-full h-screen bg-black/20 absolute top-0 left-0">
          <View className="relative w-full h-full flex items-center justify-center">
            <View className="bg-white w-3/4 absolute rounded-xl p-4 flex flex-col gap-y-2">
              <Text className="text-xl font-bold">Reset All Progress</Text>
              <Text className="font-thin">
                Are you sure you want to reset all progress?
              </Text>
              <View className="flex flex-row gap-x-2">
                <TouchableOpacity
                  onPress={() => setDeleteMode(false)}
                  className="px-5 py-1 bg-slate-700 flex items-center justify-center rounded-md"
                >
                  <Text className="text-slate-100">No</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={onResetAllProgress}
                  className="px-4 py-1 bg-red-700 flex items-center justify-center rounded-md"
                >
                  <Text className="text-slate-100">Yes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}
    </>
  );
}
