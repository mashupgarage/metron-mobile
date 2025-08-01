import axios from "axios"
import axiosClient from "./client"
import constants from "expo-constants"
import { UserT, SearchOptions, SearchResponse } from "../utils/types/common"

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
  return axiosClient.get(`/products/search`, { params: { q: query } })
}

export const fetchProductDetails = (id: number) => {
  return axiosClient.get(`/products/${id}`)
}

/**
 * Fetch available products in the system with pagination support.
 * @param category_id - Optional category ID to filter products
 * @param page - Page number for pagination (default: 1)
 * @param limit - Number of items per page (default: 10)
 * @returns Axios promise resolving to an array of products for that page
 * @example
 * fetchProducts(undefined, 2).then(res => res.data) // fetch page 2 of all products
 */
export const fetchProducts = (
  category_id?: number,
  page: number = 1,
  limit: number = 10
) => {
  const params: Record<string, string | number> = { page, limit }

  if (category_id !== undefined) {
    return axiosClient.get(`/marketplace/catalog_products`, {
      params: {
        c: category_id,
        page,
        limit,
      },
    })
  }
  return axiosClient.get("/marketplace/catalog_products", { params })
}

/**
 * Search for products in the marketplace with pagination support.
 * @param query - The search query to filter products.
 * @param page - Page number for pagination (default: 1)
 * @param limit - Number of items per page (default: 10)
 * @param category_id - Optional category ID to filter products
 */
export const searchMarketplaceProducts = (
  query: string,
  page: number = 1,
  limit: number = 10,
  category_id?: number
) => {
  const params: Record<string, string | number> = {
    q: query,
    page,
    limit,
  }

  if (category_id !== undefined) {
    params.c = category_id
  }

  return axiosClient.get(`/marketplace/catalog_products`, { params })
}

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
      },
    })

    const response = await authClient.post("/api/v1/login", {
      email: email,
      password: password,
      remember_me: 0,
    })

    return response
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Authentication error:", error)
      throw new Error(error.response?.data?.error || "Authentication failed")
    }
    throw error
  }
}

/**
 * Register a new user.
 * @param payload - The user registration payload.
 * @returns Axios promise resolving to the registration response.
 * @throws Error if registration fails.
 * @example
 * registerUser({ email: 'user@email.com', password: 'password' }).then(res => ...)
 */
export const registerUser = async (payload: any) => {
  try {
    const authClient = axios.create({
      baseURL: constants.expoConfig?.extra?.apiUrl,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })

    const response = await authClient.post("/api/v1/users", payload)

    return response
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Authentication error:", error)
      throw new Error(error.response?.data?.error || "Authentication failed")
    }
    throw error
  }
}

/**
 * Fetch the current user's profile information.
 * @returns Axios promise resolving to the user profile data.
 * @example
 * fetchUserProfile().then(res => res.data)
 */
export const fetchUserProfile = (userId: UserT["id"]) => {
  return axiosClient.get(`/users/${userId}`)
}

/**
 * Update the current user's profile information.
 * @param userId - The user ID.
 * @param payload - The user profile update payload.
 * @returns Axios promise resolving to the updated user profile data.
 * @example
 * updateUserProfile(123, { email: 'user@email.com' }).then(res => res.data)
 */
export const updateUserProfile = (userId: UserT["id"], payload: any) => {
  return axiosClient.put(`/users/${userId}`, payload)
}

/**
 * Fetch all cart items for a given user.
 * @param userId - The user ID.
 * @returns Axios promise resolving to the user's cart items.
 * @example
 * fetchCartItems(123).then(res => res.data)
 */
export const fetchCartItems = (userId: UserT["id"]) => {
  return axiosClient.get(`/users/${userId}/cart_items`)
}

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
  })
}

export const removeFromCart = (userId: UserT["id"], cartItemId: number) => {
  return axiosClient.delete(`/users/${userId}/cart_items/${cartItemId}`)
}

export const getCartItems = (userId: UserT["id"]) => {
  return axiosClient.get(`/users/${userId}/cart_items`)
}

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
  return axiosClient.get("/releases?type=all")
}

/**
 * Fetch a single release by its ID.
 * @param id - The release ID.
 * @returns Axios promise resolving to a release object.
 * @example
 * fetchReleaseById(1).then(res => res.data)
 */
export const fetchReleaseById = (id: number) => {
  return axiosClient.get(`/releases/${id}`)
}

/**
 * Fetch all products associated with a specific release.
 * @param id - The release ID.
 * @param page - Page number for pagination (default: 1)
 * @param limit - Number of items per page (default: 10)
 * @returns Axios promise resolving to an array of product objects for the release.
 * @example
 * fetchProductsByReleaseId(1).then(res => res.data)
 */
export const fetchProductsByReleaseId = (
  id: number,
  page: number = 1,
  limit: number = 10
) => {
  return axiosClient.get(`/releases/${id}/products`, {
    params: {
      meta: true,
      page,
      limit,
    },
  })
}

// =========================
// Product-related Endpoints
// =========================

/**
 * Add a product to the authenticated user's want list.
 * @param productId - The product ID to add to the want list.
 * @returns Axios promise resolving to the updated want list response.
 * @example
 * addToWantList(123).then(res => res.data)
 */
export const addToWantList = async (productId: number) => {
  await axiosClient.post(`/want_lists`, {
    product_id: productId,
  })
}

interface GetWantListParams {
  page?: number
  per?: number
  search?: string
  paginated?: boolean
}

/**
 * Fetch the authenticated user's want list with pagination and search.
 * @param params - Optional parameters for pagination and search
 * @returns Axios promise with want lists and pagination metadata
 * @example
 * // Basic usage without pagination
 * getWantList().then(res => res.data.want_lists)
 *
 * // With pagination and search
 * getWantList({
 *   page: 1,
 *   per: 20,
 *   search: 'spiderman',
 *   paginated: true
 * }).then(res => {
 *   const { want_lists, meta } = res.data;
 *   return { items: want_lists, pagination: meta };
 * });
 */
export const getWantList = async (params: GetWantListParams = {}) => {
  // Always include paginated=true for consistent API behavior
  const queryParams = { ...params, paginated: true }
  return axiosClient.get(`/want_lists`, { params: queryParams })
}

/**
 * Fetch the reservation box (reservations) for a specific user, paginated.
 * @param userId - The user ID whose reservation box to fetch.
 * @param page - Page number (default: 1)
 * @param limit - Number of items per page (default: 10)
 * @returns Axios promise resolving to the user's reservation list and metadata.
 * @example
 * getReservationList(123, 2, 10).then(res => res.data)
 */
export const getReservationList = async (
  userId: number,
  page: number = 1,
  limit: number = 20,
  searchTerm?: string
) => {
  const params: Record<string, string | number> = {
    page,
    limit,
  }
  if (searchTerm) {
    params["search[product]"] = searchTerm
  }
  return axiosClient.get(`/reservation_box/${userId}/reservations`, {
    params,
  })
}

/**
 * Check if a reservation entry exists for the current user and release.
 * @param releaseId - The release ID to check for.
 * @returns { exists: boolean, reservation_list_id?: number }
 */
export const checkReservationEntry = async (releaseId: number) => {
  return axiosClient.get(`/mobile_reservations/check`, {
    params: { release_id: releaseId },
  })
}

/**
 * Create a reservation entry for the user and release if not already present.
 * @param releaseId - The release ID to create for.
 * @returns { reservation_list_id: number }
 */
export const createReservationEntry = async (releaseId: number) => {
  return axiosClient.post(`/mobile_reservations/create`, {
    release_id: releaseId,
  })
}

/**
 * Add or update products in the reservation entry.
 * @param reservationListId - The reservation list ID
 * @param productIds - Array of product IDs
 * @param quantities - Array of quantities (same order as productIds)
 * @returns { success: boolean, reservations: [...] }
 */
export const addProductsToReservation = async (
  reservationListId: number,
  productIds: number[],
  quantities: number[]
) => {
  const items = productIds.map((productId, index) => ({
    product_id: productId,
    quantity: quantities[index],
  }))
  return axiosClient.post(
    `/mobile_reservations/${reservationListId}/add_products`,
    {
      items: items,
    }
  )
}

/**
 * Submit the reservation entry.
 * @param reservationListId - The reservation list ID
 * @returns { success: boolean, reservation_list_id: number }
 */
export const submitReservation = async (reservationListId: number) => {
  return axiosClient.post(
    `/mobile_reservations/${reservationListId}/submit`,
    {}
  )
}

/**
 * Fetch products in a reservation entry.
 * @param reservationListId - The reservation list ID
 * @returns Array of products in the reservation
 */
export const fetchReservationProducts = async (reservationListId: number) => {
  return axiosClient.get(`/mobile_reservations/${reservationListId}/products`)
}

/**
 * Fetch the authenticated user's collection (orders).
 * @param userId - The user ID whose collection to fetch.
 * @returns Axios promise resolving to the user's collection array.
 * @example
 * getOrders(123).then(res => res.data)
 */
export const getOrders = async (userId: number) => {
  return axiosClient.get(`/orders/collection`, {
    params: {
      user_id: userId,
    },
  })
}

export const getOrderDetails = async (orderId: number) => {
  return axiosClient.get(`/orders/${orderId}`)
}

export const getUserCollection = async (payload?: {
  page?: number
  per_page?: number
}) => {
  const params: Record<string, string | number> = {}
  if (payload?.page !== undefined) params.page = payload.page
  if (payload?.per_page !== undefined) params.per_page = payload.per_page
  const res = await axiosClient.get(`/user_collection`, { params })
  console.log(res)
  return res
}

export const getCollectionSeriesStatus = async (seriesId: number) => {
  return axiosClient.get(`/user_collection/${seriesId}`)
}

/**
 * Search for products in reservations with optional filters.
 * @param productName - The product name to search for
 * @param options - Optional search parameters
 * @returns Promise with search results
 */
export const searchReservationProducts = (
  productName: string,
  options: SearchOptions = {}
): Promise<{ data: SearchResponse }> => {
  const searchParams = new URLSearchParams()
  searchParams.append("search[product]", productName)

  Object.entries(options).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.append(`search[${key}]`, String(value))
    }
  })

  return axiosClient.get("/search/reservations", {
    params: searchParams,
  })
}

export const fetchAvailableBranches = async () => {
  return axiosClient.get(`/locations`)
}

export const fetchIsOwned = async (productId: number) => {
  return axiosClient.get(`/products/${productId}/is_owned`)
}

export const fetchProductSeriesStatus = async (productId: number) => {
  return axiosClient.get(`/products/${productId}/series_status`)
}

export const fetchProductRecommendations = async (productId: number) => {
  return axiosClient.get(`/products/${productId}/recommendations`)
}

// =========================
// Cart Endpoints
// =========================

export const checkoutCartItems = async (
  userId: number,
  payload: {
    order: {
      notes: string
      branch: number | string // branch id
      phone_number: string
      shipping_address: string
      shipping_region: string
      total_price: number
      delivery_option: "store" | "shipping"
      transaction_source: "paypal" | "bank_deposit" | "cod" | "pay_at_store"
      status: "pending"
    }
  }
) => {
  return axiosClient.post(`users/${userId}/checkout`, payload)
}
