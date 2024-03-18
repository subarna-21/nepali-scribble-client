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
import { api } from "../api/api-client";
import { useMutation } from "@tanstack/react-query";
import { notifyMessage } from "../utils/toast-message";
import { decode as atob, encode as btoa } from "base-64";
import axios from "axios";
import * as SecureStorage from "expo-secure-store";
import ReactNativeBlobUtil from "react-native-blob-util";

interface IPath {
  segments: String[];
  color?: string;
}

interface Memento {
  paths: IPath[];
}

export default function DrawingScreen() {
  const canvasRef = useCanvasRef();
  // const [paths, setPaths] = useState<IPath[]>([]);
  const [currentPath, setCurrentPath] = useState<IPath>({
    segments: [],
    color: "#fff",
  });
  const [allPaths, setAllPaths] = useState<IPath[]>([]);
  const [mementoStack, setMementoStack] = useState<Memento[]>([]);

  const pan = Gesture.Pan()
    .onStart((g) => {
      setCurrentPath({ segments: [`M ${g.x} ${g.y}`], color: "#fff" });
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

  const { mutate, isPending } = useMutation({
    mutationKey: ["create-progress"],
    mutationFn: async () => {
      const image = canvasRef.current?.makeImageSnapshot();

      if (!image) throw new Error("No image");

      try {
        const base64 = image.encodeToBase64(ImageFormat.PNG);

        const token = await SecureStorage.getItemAsync("token");

        const res = await ReactNativeBlobUtil.fetch(
          "POST",
          "http://192.168.1.106:5001/api/progress",
          {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          [
            {
              name: "file",
              filename: "image.png",
              type: "image/png",
              data: base64,
            },
          ]
        );

        console.log(res.data?.message);

        // console.log(response);
      } catch (er) {
        console.log(er);
      }
    },
    onSuccess: async (data: any) => {
      // Handle success
      // console.log(data.data.data);
    },
    onError: (error: any) => {
      // Handle error
      console.log(error);
    },
  });

  const handleSubmit = async () => {
    mutate(); // Trigger the mutation
  };
  return (
    <View className="flex flex-col w-full h-full">
      <Image
        source={require("../assets/background.png")}
        className="w-full z-[-1] h-[200px]"
      />
      <View className="flex mx-8 mt-4">
        <View className="flex h-[380px] rounded-md bg-gray-200">
          <GestureHandlerRootView style={{ flex: 1 }}>
            <GestureDetector gesture={pan}>
              <View style={{ flex: 1 }}>
                <Canvas
                  style={{ flex: 1, backgroundColor: "black" }}
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
        <View className="flex flex-row items-center justify-between mt-4">
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
        <View className="flex flex-row items-center justify-between mt-4">
          <TouchableOpacity
            onPress={handleSubmit}
            className="w-32 rounded-lg flex items-center py-2 bg-primary"
          >
            <Text className="text-gray-200 font-semibold">Submit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
