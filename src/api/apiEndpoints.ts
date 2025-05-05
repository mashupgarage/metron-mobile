import axios from "axios";
import axiosClient from "./client";
import constants from "expo-constants";
import { UserT } from "../utils/types/common";

// =========================
// Product-related Endpoints
// =========================

/**
 * Search for products based on a query string.
 * @param query - The search query to filter products.
 * @returns Axios promise resolving to an array of matching products.
 * @example
 * searchProduct('batman').then(res => res.data)
 */
export const searchProduct = (query: string) => {
  return axiosClient.get(`/products/search`, { params: { q: query } });
};

/**
 * Fetch all available products in the system.
 * @returns Axios promise resolving to an array of all products.
 * @example
 * fetchProducts().then(res => res.data)
 */
export const fetchProducts = () => {
  return axiosClient.get("/products");
};

// =========================
// User-related Endpoints
// =========================

/**
 * Authenticate a user with their email and password.
 * @param email - The user's email address.
 * @param password - The user's password.
 * @returns Axios promise resolving to the authentication response (user info, session, etc).
 * @throws Error if authentication fails.
 * @example
 * authenticateUser('user@email.com', 'password').then(res => ...)
 */
export const authenticateUser = async (email: string, password: string) => {
  try {
    const authClient = axios.create({
      baseURL: constants.expoConfig?.extra?.apiUrl,
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
      console.error("Authentication error:", error);
      throw new Error(error.response?.data?.error || "Authentication failed");
    }
    throw error;
  }
};

/**
 * Fetch the current user's profile information.
 * @returns Axios promise resolving to the user profile data.
 * @example
 * fetchUserProfile().then(res => res.data)
 */
export const fetchUserProfile = () => {
  return axiosClient.get("/users.json");
};

/**
 * Fetch all cart items for a given user.
 * @param userId - The user ID.
 * @returns Axios promise resolving to the user's cart items.
 * @example
 * fetchCartItems(123).then(res => res.data)
 */
export const fetchCartItems = (userId: UserT["id"]) => {
  return axiosClient.get(`/users/${userId}/cart_items`);
};

/**
 * Add a product to a user's cart.
 * @param userId - The user ID.
 * @param productId - The product ID.
 * @param product_item_id - The product item ID.
 * @returns Axios promise resolving to the updated cart.
 * @example
 * addToCart(123, 456, 789).then(res => res.data)
 */
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

// =========================
// Release-related Endpoints
// =========================

/**
 * Fetch all releases.
 * Each release contains: id, title, release_date, status, products_count, reservations_total, customers_count.
 * @returns Axios promise resolving to an array of release objects.
 * @example
 * fetchReleases().then(res => res.data)
 */
export const fetchReleases = () => {
  return axiosClient.get("/releases?type=all");
};

/**
 * Fetch a single release by its ID.
 * @param id - The release ID.
 * @returns Axios promise resolving to a release object.
 * @example
 * fetchReleaseById(1).then(res => res.data)
 */
export const fetchReleaseById = (id: number) => {
  return axiosClient.get(`/releases/${id}`);
};

/**
 * Fetch all products associated with a specific release.
 * @param id - The release ID.
 * @returns Axios promise resolving to an array of product objects for the release.
 * @example
 * fetchProductsByReleaseId(1).then(res => res.data)
 */
export const fetchProductsByReleaseId = (id: number) => {
  return axiosClient.get(`/releases/${id}/products`);
};

// =========================
// Product-related Endpoints
// =========================

/**
 * Add a product to a user's want list.
 * @param productId - The product ID.
 * @returns Axios promise resolving to the updated want list.
 * @example
 * addToWantList(123).then(res => res.data)
 */
export const addToWantList = (productId: number) => {
  return axiosClient.post(`/want`, {
    product_id: productId,
  });
};

export const addToReservation = (productId: number) => {
  return axiosClient.post(`/reservations`, {
    product_id: productId,
  });
};
