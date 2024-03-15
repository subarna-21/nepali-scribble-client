import {
  NavigationContainer,
  Route,
  getFocusedRouteNameFromRoute,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import WelcomeScreen from "../screens/WelcomeScreen";
import LoginScreen from "../screens/LoginScreen";
import SignUpScreen from "../screens/SignUpScreen";
import { AppNavigatorParamList, TabNavigatorParamList } from "../app.d";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import Toast from "react-native-toast-message";
import { useAuth } from "../contexts/AuthContext";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import ProfileScreen from "../screens/ProfileScreen";
import DrawingScreen from "../screens/DrawingScreen";

const Stack = createNativeStackNavigator<AppNavigatorParamList>();
const Tab = createBottomTabNavigator<TabNavigatorParamList>();
const queryClient = new QueryClient();

export default function AppNavigation() {
  const { authenticated } = useAuth();
  return (
    <React.Fragment>
      <NavigationContainer>
        <QueryClientProvider client={queryClient}>
          {authenticated ? <TabNavigator /> : <StackNavigator />}
          <Toast />
        </QueryClientProvider>
      </NavigationContainer>
    </React.Fragment>
  );
}

export const StackNavigator = () => {
  return (
    <Stack.Navigator initialRouteName={"Welcome"}>
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

      <Stack.Screen
        name="Welcome"
        options={{ headerShown: false }}
        component={WelcomeScreen}
      />
    </Stack.Navigator>
  );
};

export const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: { backgroundColor: "#877dfa" },
        tabBarInactiveTintColor: "#fff",
        tabBarActiveTintColor: "#333",
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={HomeScreen}
        options={({ route }) => ({
          tabBarStyle: {
            display: getTabBarVisibility(route),
            backgroundColor: "#877dfa",
          },
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="dashboard" color={color} size={size} />
          ),
        })}
      ></Tab.Screen>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={({ route }) => ({
          tabBarStyle: {
            display: getTabBarVisibility(route),
            backgroundColor: "#877dfa",
          },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        })}
      ></Tab.Screen>
      <Tab.Screen
        name="Learn"
        component={DrawingScreen}
        options={({ route }) => ({
          tabBarStyle: {
            display: getTabBarVisibility(route),
            backgroundColor: "#877dfa",
          },
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="draw" color={color} size={size} />
          ),
        })}
      ></Tab.Screen>
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={({ route }) => ({
          tabBarStyle: {
            display: getTabBarVisibility(route),
            backgroundColor: "#877dfa",
          },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" color={color} size={size} />
          ),
        })}
      ></Tab.Screen>
    </Tab.Navigator>
  );
};

const getTabBarVisibility = (route: Partial<Route<string>>) => {
  // console.log(route);
  const routeName = getFocusedRouteNameFromRoute(route) ?? "Feed";
  // console.log(routeName);

  if (routeName == "GameDetails") {
    return "none";
  }
  return "flex";
};
