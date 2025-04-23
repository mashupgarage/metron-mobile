/**
 * Represents the global state slice.
 */
import { ProductT } from "@/src/utils/types/common";
import { StateCreator } from "zustand";

/**
 * this will handle global state changes for the app
 * such as loading and toggling between dark and light mode.
 */
export type GlobalSlice = {
  isDarkMode: boolean;
  isLoading: boolean;
  cartCount: number;
  cartItems: ProductT[] | [];
  setLoading: (value: boolean) => void;
  setDarkMode: (value: boolean) => void;
  setCartCount: (value: number) => void;
  setCartItems: (value: []) => void;
};

export const createGlobalSlice: StateCreator<GlobalSlice> = (set) => ({
  isDarkMode: false,
  isLoading: false,
  cartCount: 0,
  cartItems: [],
  setLoading: (value: boolean) => set(() => ({ isLoading: value })),
  setDarkMode: (value: boolean) => set(() => ({ isDarkMode: value })),
  setCartCount: (value: number) => set(() => ({ cartCount: value })),
  setCartItems: (value: ProductT[]) => set(() => ({ cartItems: value })),
});
