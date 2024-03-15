import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from "react";
import { Button, Image, Text, TouchableOpacity, View } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { Canvas, Path, useCanvasRef } from "@shopify/react-native-skia";

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
      </View>
    </View>
  );
}
