import axios from "axios";
import axiosClient from "./client";

/**
 * Search for products based on a query string
 * @param query - The search query to filter products
 * @returns A promise that resolves to the search results
 */
export const searchProduct = (query: string) => {
  const url = `marketplace/products`;
  const params = { q: query };
  
  return axiosClient.get(url, { params })
    .then(response => {
      return response;
    })
    .catch(error => {
      throw error;
    });
};

/**
 * Fetch all available products
 * @returns A promise that resolves to the list of products
 */
export const fetchProducts = () => {
  const url = "products";
  
  return axiosClient.get(url)
    .then(response => {
      return response;
    })
    .catch(error => {
      throw error;
    });
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
      },
    });

    const response = await authClient.post("/users/sign_in", {
      user: {
        email: email,
        password: password,
      },
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
