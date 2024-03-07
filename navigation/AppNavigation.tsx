import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import WelcomeScreen from "../screens/WelcomeScreen";
import LoginScreen from "../screens/LoginScreen";
import SignUpScreen from "../screens/SignUpScreen";
import { AppNavigatorParamList } from "../app.d";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { Text, View } from "react-native";
import Toast from "react-native-toast-message";

const Stack = createNativeStackNavigator<AppNavigatorParamList>();
const queryClient = new QueryClient();

export default function AppNavigation() {
  return (
    <React.Fragment>
      <NavigationContainer>
        <QueryClientProvider client={queryClient}>
          <Stack.Navigator initialRouteName="Welcome">
            <Stack.Screen
              name="Home"
              options={{ headerShown: false }}
              component={HomeScreen}
            />
            <Stack.Screen
              name="Welcome"
              options={{ headerShown: false }}
              component={WelcomeScreen}
            />
            <Stack.Screen
              name="Login"
              options={{ headerShown: false }}
              component={LoginScreen}
            />
            <Stack.Screen
              name="SignUp"
              options={{ headerShown: false }}
              component={SignUpScreen}
            />
          </Stack.Navigator>
          <Toast />
        </QueryClientProvider>
      </NavigationContainer>
    </React.Fragment>
  );
}
