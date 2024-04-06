import { View, Text, TouchableOpacity, Image, TextInput } from "react-native";
import React from "react";
import { themeColors } from "../theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeftIcon } from "react-native-heroicons/solid";
import { useNavigation } from "@react-navigation/native";
import { AppScreenNavigationProp } from "../app.d";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginUserInput, loginUserSchema } from "../schema/auth/login.schema";
import { useMutation } from "@tanstack/react-query";
import { notifyMessage } from "../utils/toast-message";
import api from "../api/api-client";
import * as SecureStorage from "expo-secure-store";
import { StatusBar } from "expo-status-bar";

export default function LoginScreen() {
  const navigation = useNavigation<AppScreenNavigationProp>();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginUserInput>({
    resolver: zodResolver(loginUserSchema),
    mode: "all",
  });

  const { mutate, isPending } = useMutation({
    mutationKey: ["login-user"],
    mutationFn: (data: LoginUserInput) => api.post("/auth/login", data),
    onSuccess: async (data: any) => {
      notifyMessage(data?.data?.message || "Logged In Successfully", "success");
      reset();
      await SecureStorage.setItemAsync("token", data?.data?.data);
    },
    onError: (error: any) => {
      notifyMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Something Went Wrong",
        "error"
      );
    },
  });

  const onSubmit: SubmitHandler<LoginUserInput> = (data) => {
    mutate(data);
  };

  return (
    <>
      <StatusBar backgroundColor="transparent" translucent={true} />

      <View
        className="flex-1 bg-white"
        style={{ backgroundColor: themeColors.bg }}
      >
        <SafeAreaView className="flex">
          <View className="flex-row justify-start">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="bg-yellow-400 p-2 rounded-tr-2xl rounded-bl-2xl ml-4"
            >
              <ArrowLeftIcon size="20" color="black" />
            </TouchableOpacity>
          </View>
          <View className="flex-row justify-center">
            <Image
              source={require("../assets/images/login.png")}
              style={{ width: 200, height: 200 }}
            />
          </View>
        </SafeAreaView>
        <View
          className="flex-1 bg-white px-8 pt-8"
          style={{ borderTopLeftRadius: 50, borderTopRightRadius: 50 }}
        >
          <View className="form space-y-2">
            <Text className="text-gray-700 mx-4 font-semibold">
              Email Address
            </Text>
            <View className="mx-4 mb-1">
              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="p-4 bg-gray-100 text-gray-700 rounded-2xl mb-1"
                    placeholder="Enter your email"
                    onChangeText={onChange}
                    value={value}
                    onBlur={onBlur}
                  ></TextInput>
                )}
                name="email"
                rules={{ required: true }}
              />
              <Text className="text-red-500 text-[12px]">
                {errors.email?.message}
              </Text>
            </View>
            <Text className="text-gray-700 mx-4 font-semibold">Password</Text>
            <View className="mx-4 mb-1">
              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="p-4 bg-gray-100 text-gray-700 rounded-2xl mb-1"
                    placeholder="Enter your Password"
                    onChangeText={onChange}
                    value={value}
                    onBlur={onBlur}
                    secureTextEntry
                  ></TextInput>
                )}
                name="password"
                rules={{ required: true }}
              />
              <Text className="text-red-500 text-[12px]">
                {errors.password?.message}
              </Text>
            </View>
            <TouchableOpacity className="flex items-end mx-3 mb-6">
              <Text className="text-gray-700">Forget Password?</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`mx-3 py-3 bg-yellow-400 rounded-xl ${
                isPending ? "opacity-50" : "opacity-100"
              }`}
              onPress={handleSubmit(onSubmit)}
              disabled={isPending}
            >
              <Text className="text-xl font-bold text-center text-gray-700">
                Login
              </Text>
            </TouchableOpacity>
          </View>
          <Text className="text-xl text-gray-700 font-bold py-5 text-center">
            Or
          </Text>
          <View className="flex-row justify-center space-x-12">
            <TouchableOpacity className="p-2 bg-gray-100 rounded-xl">
              <Image
                source={require("../assets/icons/google.png")}
                className="w-10 h-10"
              />
            </TouchableOpacity>
            <TouchableOpacity className="p-2 bg-gray-100 rounded-xl">
              <Image
                source={require("../assets/icons/apple.png")}
                className="w-10 h-10"
              />
            </TouchableOpacity>
            <TouchableOpacity className="p-2 bg-gray-100 rounded-xl">
              <Image
                source={require("../assets/icons/facebook.png")}
                className="w-10 h-10"
              />
            </TouchableOpacity>
          </View>
          <View className="flex-row justify-center space-x-1 mt-10">
            <Text className="text-gray-500 font-semibold">
              Don't have an account?
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
              <Text className="font-semibold text-yellow-500">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  );
}
