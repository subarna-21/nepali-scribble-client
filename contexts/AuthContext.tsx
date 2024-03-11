import { createContext, useContext, useEffect, useState } from "react";
import * as SecureStorage from "expo-secure-store";
import axios from "axios";
import { api } from "../api/api-client";

interface AuthStateProps {
  token: string | null;
  authenticated: boolean | null;
}

const AuthContext = createContext<AuthStateProps>({
  token: null,
  authenticated: null,
});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }: any) => {
  const [authState, setAuthState] = useState<AuthStateProps>({
    token: null,
    authenticated: null,
  });

  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await SecureStorage.getItemAsync("token");

        if (token && token !== "") {
          setAuthState({
            token,
            authenticated: true,
          });
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        } else {
          setAuthState({
            token: null,
            authenticated: false,
          });
        }
      } catch (error) {
        setAuthState({
          token: null,
          authenticated: false,
        });
      }
    };

    loadToken();
  });

  const value = {
    ...authState,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
