import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosClient from "./client";

const AUTH_TOKEN_KEY = "auth_token";

export const saveAuthToken = async (token: string) => {
  await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
  axiosClient.defaults.headers["Authorization"] = token;
};

export const removeAuthToken = async () => {
  await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
  delete axiosClient.defaults.headers["Authorization"];
};

export const loadAuthTokenToAxios = async () => {
  const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    axiosClient.defaults.headers["Authorization"] = token;
  } else {
    delete axiosClient.defaults.headers["Authorization"];
  }
};
