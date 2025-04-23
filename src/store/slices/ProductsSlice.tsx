/**
 * Represents the user state slice.
 */
import { ProductT } from "@/src/utils/types/common";
import { StateCreator } from "zustand";

/**
 * this will handle the user state changes for the app
 * such as if the user has done the onboarding or not and other misc. user data.
 */
export type ProductSlice = {
  product: ProductT | null;
  products: ProductT[] | [];
  setProduct: (product: ProductT) => void;
  setProducts: (products: ProductT[]) => void;
};

export const createProductSlice: StateCreator<ProductSlice> = (set) => ({
  product: null,
  products: [],
  setProduct: (product: ProductT) => set({ product: product }),
  setProducts: (products: ProductT[]) => set({ products: products }),
});
