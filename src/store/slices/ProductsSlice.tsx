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
  comics: ProductT[] | [];
  novels: ProductT[] | [];
  setProduct: (product: ProductT) => void;
  setProducts: (products: ProductT[]) => void;
  setComics: (comics: ProductT[]) => void;
  setNovels: (novels: ProductT[]) => void;
};

export const createProductSlice: StateCreator<ProductSlice> = (set) => ({
  product: null,
  products: [],
  comics: [],
  novels: [],
  setProduct: (product: ProductT) => set({ product: product }),
  setProducts: (products: ProductT[]) => set({ products: products }),
  setComics: (comics: ProductT[]) => set({ comics: comics }),
  setNovels: (novels: ProductT[]) => set({ novels: novels }),
});
