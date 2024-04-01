import axios, { AxiosError, AxiosInstance } from "axios";
import * as SecureStorage from "expo-secure-store";

const api: AxiosInstance = axios.create({
  baseURL: "http://192.168.1.102:5001/api",
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
