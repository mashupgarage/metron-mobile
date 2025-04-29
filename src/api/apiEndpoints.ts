import axios from "axios";
import axiosClient from "./client";
import constants from "expo-constants";
import { UserT } from "../utils/types/common";

/**
 * Search for products based on a query string
 * @param query - The search query to filter products
 * @returns A promise that resolves to the search results
 */
export const searchProduct = (query: string) => {
  return axiosClient.get(`/products/search`, { params: { q: query } });
};

/**
 * Fetch all available products
 * @returns A promise that resolves to the list of products
 */
export const fetchProducts = () => {
  return axiosClient.get("/products");
};

/**
 * Authenticate a user with their email and password
 * @param email - The user's email address
 * @param password - The user's password
 * @returns A promise that resolves to the authentication response
 */
export const authenticateUser = async (email: string, password: string) => {
  try {
    const authClient = axios.create({
      baseURL: "https://www.comic-odyssey.com/",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${constants.expoConfig?.extra?.sessionToken}`,
      },
    });

    const response = await authClient.post("/users/sign_in", {
      email: email,
      password: password,
      remember_me: 0,
    });

    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.error || "Authentication failed";
      console.error("Authentication error:", error);
      throw new Error(errorMessage);
    }
    throw error;
  }
};

export const fetchCartItems = (userId: UserT["id"]) => {
  return axiosClient.get(`/users/${userId}/cart_items`);
};

export const addToCart = (
  userId: UserT["id"],
  productId: number,
  product_item_id: number
) => {
  return axiosClient.post(`/users/${userId}/cart_items`, {
    product_id: productId,
    product_item_id: product_item_id,
  });
};

export const fetchReleases = () => {
  return axiosClient.get("/releases.json");
};

export const fetchUserProfile = () => {
  return axiosClient.get("/users.json");
};

export const fetchReservations = () => {};
