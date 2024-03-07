import { View, Text, TouchableOpacity, Image, TextInput } from "react-native";
import React from "react";
import { themeColors } from "../theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeftIcon } from "react-native-heroicons/solid";
import { useNavigation } from "@react-navigation/native";
import { AppScreenNavigationProp } from "../app.d";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  RegisterUserInput,
  registerUserSchema,
} from "../schema/auth/register.schema";

export default function SignUpScreen() {
  const navigation = useNavigation<AppScreenNavigationProp>();
  const {
    register,
    setValue,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<RegisterUserInput>({
    resolver: zodResolver(registerUserSchema),
    mode: "all",
  });
  return (
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
            source={require("../assets/images/signup.png")}
            style={{ width: 200, height: 110 }}
          />
        </View>
      </SafeAreaView>
      <View
        className="flex-1 bg-white px-8 pt-8"
        style={{ borderTopLeftRadius: 50, borderTopRightRadius: 50 }}
      >
        <View className="form space-y-2">
          <Text className="text-gray-700 mx-4 font-semibold">Full Name</Text>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="p-4 bg-gray-100 text-gray-700 rounded-2xl mx-3 mb-4"
                placeholder="Enter Name"
                onChangeText={onChange}
                value={value}
                onBlur={onBlur}
              ></TextInput>
            )}
            name="email"
            rules={{ required: true }}
          />
          <Text className="text-gray-700 mx-4 font-semibold">
            Email Address
          </Text>
          <TextInput
            className="p-4 bg-gray-100 text-gray-700 rounded-2xl mx-3 mb-4"
            // value="john@gmail.com"
            placeholder="Enter Email"
          ></TextInput>
          <Text className="text-gray-700 mx-4 font-semibold">Password</Text>
          <TextInput
            className="p-4 bg-gray-100 text-gray-700 rounded-2xl mx-3 mb-2"
            secureTextEntry
            // value="test12345"
            placeholder="Enter Password"
          ></TextInput>
          <TouchableOpacity className="flex items-end mx-3 mb-6">
            <Text className="text-gray-700">Forget Password?</Text>
          </TouchableOpacity>
          <TouchableOpacity className="mx-3 py-3 bg-yellow-400 rounded-xl">
            <Text className="text-xl font-bold text-center text-gray-700">
              Sign Up
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
            Already have an account?
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text className="font-semibold text-yellow-500">Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
