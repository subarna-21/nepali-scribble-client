/// <reference types="nativewind/types" />

import type { NativeStackScreenProps } from "@react-navigation/native-stack";

export type AppNavigatorParamList = {
  Home: undefined;
  Login: undefined;
  SignUp: undefined;
  Welcome: undefined;
};

export type AppScreenNavigationProp = NativeStackScreenProps<
  HomeStackNavigatorParamList,
  Home,
  Login,
  SignUp,
  Welcome
>;
