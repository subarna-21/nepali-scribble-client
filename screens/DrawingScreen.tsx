import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from "react";
import {
  Button,
  Image,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import {
  Canvas,
  ImageFormat,
  Path,
  SkImage,
  useCanvasRef,
} from "@shopify/react-native-skia";
import api from "../api/api-client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { notifyMessage } from "../utils/toast-message";
import * as SecureStorage from "expo-secure-store";
import ReactNativeBlobUtil from "react-native-blob-util";
import LoadingScreen from "./LoadingScreen";
import { queryClient } from "../navigation/AppNavigation";

interface IPath {
  segments: String[];
  color?: string;
}

interface Memento {
  paths: IPath[];
}

type ProgressResponseDto = {
  data: {
    data: {
      id?: number;
      char: string;
      completed?: string;
      input?: string;
      image?: string | null;
      accuracy?: number;
      createdAt?: string;
      updatedAt?: string;
    };
  };
};

export default function DrawingScreen() {
  const canvasRef = useCanvasRef();
  // const [paths, setPaths] = useState<IPath[]>([]);
  const [currentPath, setCurrentPath] = useState<IPath>({
    segments: [],
    color: "#000",
  });
  const [allPaths, setAllPaths] = useState<IPath[]>([]);
  const [mementoStack, setMementoStack] = useState<Memento[]>([]);

  const pan = Gesture.Pan()
    .onStart((g) => {
      setCurrentPath({ segments: [`M ${g.x} ${g.y}`], color: "#000" });
    })
    .onUpdate((g) => {
      setCurrentPath((prevPath) => {
        const updatedPath = { ...prevPath };
        updatedPath.segments.push(`L ${g.x} ${g.y}`);
        return updatedPath;
      });
    })
    .onEnd(() => {
      saveToMemento();
      if (currentPath.segments.length > 0) {
        setAllPaths((prevPaths) => [...prevPaths, currentPath]);
        setCurrentPath({ segments: [], color: "#000" }); // Reset current path
      }
    })
    .minDistance(1);

  const handleClearPaths = () => {
    setAllPaths([]);

    saveToMemento();
  };

  const saveToMemento = () => {
    const snapshot: Memento = {
      paths: [...allPaths],
    };
    setMementoStack((prevStack) => [...prevStack, snapshot]);
  };

  const restoreFromMemento = () => {
    if (mementoStack.length > 0) {
      const lastSnapshot = mementoStack.pop();
      if (lastSnapshot) {
        setAllPaths(lastSnapshot.paths);
      }
    }
  };

  const progressQuery = useQuery<ProgressResponseDto>({
    queryKey: ["progress/current"],
    queryFn: () => api.get("/progress/current"),
    staleTime: 60 * 1000,
  });

  const { mutate, isPending } = useMutation({
    mutationKey: ["create-progress"],
    mutationFn: () => {
      const image = canvasRef.current?.makeImageSnapshot();

      if (!image) throw new Error("No image");

      try {
        const base64 = image.encodeToBase64(ImageFormat.PNG);

        const formData = new FormData();
        formData.append("file", {
          name: "image.png",
          type: "image/png",
          uri: `data:image/png;base64,${base64}`,
        } as any);

        return api.put("/progress", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } catch (er) {
        notifyMessage("Something Went Wrong", "error");
        queryClient.invalidateQueries({
          queryKey: ["progress/current"],
        });

        return Promise.reject(er);
      }
    },
    onSuccess: async (data: any) => {
      notifyMessage(data?.data?.message || "Submitted Successfully", "success");
      queryClient.invalidateQueries({
        queryKey: ["progress/current"],
      });
    },
    onError: (error: any) => {
      notifyMessage("Something Went Wrong", "error");
    },
  });

  // const { mutate, isPending } = useMutation({
  //   mutationKey: ["create-progress"],
  //   mutationFn: async () => {
  //     const image = canvasRef.current?.makeImageSnapshot();

  //     if (!image) throw new Error("No image");

  //     try {
  //       const base64 = image.encodeToBase64(ImageFormat.PNG);

  //       const token = SecureStorage.getItem("token");

  //       const res = await ReactNativeBlobUtil.fetch(
  //         "POST",
  //         "http://192.168.1.102:5001/api/progress",
  //         {
  //           "Content-Type": "multipart/form-data",
  //           Authorization: `Bearer ${token}`,
  //         },
  //         [
  //           {
  //             name: "file",
  //             filename: "image.png",
  //             type: "image/png",
  //             data: base64,
  //           },
  //         ]
  //       );

  //       const data = await res.json();

  //       if (!data?.status) {
  //         notifyMessage(data?.message || "Something Went Wrong", "error");
  //         queryClient.invalidateQueries({
  //           queryKey: ["progress/current"],
  //         });
  //         return;
  //       }

  //       notifyMessage(
  //         "You have successfully submitted the drawing with accuracy: " +
  //           data?.data?.accuracy || "0%",
  //         "success"
  //       );
  //       handleClearPaths();
  //       queryClient.invalidateQueries({
  //         queryKey: ["progress/current"],
  //       });
  //     } catch (er) {
  //       notifyMessage("Something Went Wrong", "error");
  //       queryClient.invalidateQueries({
  //         queryKey: ["progress/current"],
  //       });
  //     }
  //   },
  // onSuccess: async (data: any) => {
  //   console.log(data.data.status);
  //   notifyMessage(data?.data?.message || "Submitted Successfully", "success");
  //   queryClient.invalidateQueries({
  //     queryKey: ["progress/current"],
  //   });
  // },
  // onError: (error: any) => {
  //   // Handle error
  //   console.log(error);
  // },
  // });

  const progress = progressQuery.data?.data.data;

  const handleSubmit = async () => {
    mutate(); // Trigger the mutation
  };
  return progressQuery.isPending ? (
    <LoadingScreen />
  ) : (
    <View className="flex flex-col w-full h-full">
      <View className="w-full h-[200px] bg-primary">
        <SafeAreaView className="flex flex-col gap-y-8">
          <Text className="text-3xl font-semibold text-gray-200 text-center mt-8">
            Learning
          </Text>
          <View className="px-8 flex-col gap-y-2">
            <Text className="text-xl font-semibold text-gray-200">
              Draw{"    "}
              <Text className="text-yellow-400 text-4xl">
                "{progress?.char}"
              </Text>
            </Text>
            {progress?.accuracy && (
              <Text className="text-xl font-semibold text-gray-200">
                Accuracy:{"   "}
                <Text className="text-yellow-400 text-4xl">
                  "{progress?.accuracy}"
                </Text>
              </Text>
            )}
            {progress?.updatedAt && (
              <Text className="text-xl font-semibold text-gray-200">
                Last Attempt At:{"   "}
                <Text className="text-yellow-400 text-4xl">
                  "{new Date(progress.updatedAt).toDateString()}"
                </Text>
              </Text>
            )}
          </View>
        </SafeAreaView>
      </View>
      <View className="flex mx-8 mt-4">
        <Text className="text-3xl font-semibold text-gray-800 mb-2">
          Draw Here!
        </Text>
        <View className="flex h-[380px] bg-gray-200 rounded-xl overflow-hidden">
          <GestureHandlerRootView style={{ flex: 1 }}>
            <GestureDetector gesture={pan}>
              <View style={{ flex: 1 }}>
                <Canvas
                  style={{ flex: 1, backgroundColor: "white" }}
                  ref={canvasRef}
                >
                  {allPaths.map((p, index) => (
                    <Path
                      key={index}
                      path={p.segments.join(" ")}
                      strokeWidth={8}
                      style="stroke"
                      color={p.color}
                    />
                  ))}
                  <Path
                    path={currentPath.segments.join(" ")}
                    strokeWidth={8}
                    style="stroke"
                    color={currentPath.color}
                  />
                </Canvas>
              </View>
            </GestureDetector>
          </GestureHandlerRootView>
        </View>
        <View className="flex flex-row items-center gap-x-2 mt-4">
          <TouchableOpacity
            onPress={handleClearPaths}
            className="w-32 rounded-lg flex items-center py-2 bg-primary"
          >
            <Text className="text-gray-200 font-semibold">Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={restoreFromMemento}
            className="w-32 rounded-lg flex items-center py-2 bg-primary"
          >
            <Text className="text-gray-200 font-semibold">Undo</Text>
          </TouchableOpacity>
        </View>
        <View className="flex flex-row items-center justify-center mt-8">
          <TouchableOpacity
            onPress={handleSubmit}
            className="px-12 py-4 rounded-lg flex items-center bg-slate-700"
          >
            <Text className="text-gray-200 font-semibold" disabled={isPending}>
              Submit
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
