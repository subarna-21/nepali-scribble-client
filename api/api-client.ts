import axios, { AxiosError, AxiosInstance } from "axios";
import * as SecureStorage from "expo-secure-store";

const api: AxiosInstance = axios.create({
  baseURL: "https://nepali-scribble-backend-production.up.railway.app/api",
});

api.interceptors.response.use(
  (res) => {
    return res;
  },
  async (err: AxiosError) => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      await SecureStorage.deleteItemAsync("token");
    }
    return Promise.reject(err);
  }
);

export default api;
