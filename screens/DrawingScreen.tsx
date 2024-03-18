import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from "react";
import { Button, Image, Text, TouchableOpacity, View } from "react-native";
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
import { decode as atob } from "base-64";
import axios from "axios";

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

  const { mutate, isPending } = useMutation({
    mutationKey: ["create-progress"],
    mutationFn: async () => {
      const image = canvasRef.current?.makeImageSnapshot();

      if (!image) throw new Error("No image");

      try {
        const file = b64toBlob(
          image.encodeToBase64(ImageFormat.PNG),
          "image/png"
        );

        const formData = new FormData();
        formData.append("file", file);

        console.log(formData);

        const res = await api.post("/progress", formData);

        console.log(res);
      } catch (err) {
        console.log(err);
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

  const b64toBlob = (b64Data: string, contentType = "", sliceSize = 512) => {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    console.log(blob, "1");
    return blob;
  };

  const handleSubmit = async () => {
    // mutate(); // Trigger the mutation
    const image = canvasRef.current?.makeImageSnapshot();

    if (!image) throw new Error("No image");

    try {
      const base64 = image.encodeToBase64(ImageFormat.PNG);

      const res = await fetch("data:image/png;base64," + base64);

      console.log(res);

      const blob = await res.blob();

      const fd = new FormData();
      const file = new File([blob], "filename.png", { type: "image/png" });
      fd.append("file", file);
    } catch (er) {
      console.log(er);
    }
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
                <Canvas style={{ flex: 8 }} ref={canvasRef}>
                  {allPaths.map((p, index) => (
                    <Path
                      key={index}
                      path={p.segments.join(" ")}
                      strokeWidth={5}
                      style="stroke"
                      color={p.color}
                    />
                  ))}
                  <Path
                    path={currentPath.segments.join(" ")}
                    strokeWidth={5}
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
