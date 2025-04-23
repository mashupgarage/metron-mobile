import axios from "axios";
import constants from "expo-constants";

// Create an Axios instance with default settings
const axiosClient = axios.create({
  baseURL: "https://www.comic-odyssey.com/api/v1/",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Set the session token
const SESSION_TOKEN = constants.expoConfig?.extra?.sessionToken;
// Add session token to all requests
axiosClient.interceptors.request.use((config) => {
  config.headers["X-Session-Token"] = SESSION_TOKEN;
  return config;
});

// Add request interceptor for any additional request processing
axiosClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    // Handle request error
    return Promise.reject(error);
  }
);

axiosClient.interceptors.response.use(
  (response) => {
    // Do something with response data
    return response;
  },
  (error) => {
    // Handle response error
    return Promise.reject(error);
  }
);

export default axiosClient;
