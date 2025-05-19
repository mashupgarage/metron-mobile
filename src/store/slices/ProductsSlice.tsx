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
  products_list: {
    products: ProductT[];
    total_count: number;
    total_pages: number;
    current_page: number;
    loading: boolean;
  };
  comics_list: {
    products: ProductT[];
    total_count: number;
    total_pages: number;
    current_page: number;
    loading: boolean;
  };
  novels_list: {
    products: ProductT[];
    total_count: number;
    total_pages: number;
    current_page: number;
    loading: boolean;
  };
  setProduct: (product: ProductT) => void;
  setProducts: (products: {
    products: ProductT[];
    total_count: number;
    total_pages: number;
  }) => void;
  appendProducts: (products: {
    products: ProductT[];
    total_count: number;
    total_pages: number;
    page: number;
  }) => void;
  setProductsLoading: (loading: boolean) => void;
  setComics: (comics: {
    products: ProductT[];
    total_count: number;
    total_pages: number;
  }) => void;
  setNovels: (novels: {
    products: ProductT[];
    total_count: number;
    total_pages: number;
  }) => void;
};

export const createProductSlice: StateCreator<ProductSlice> = (set) => ({
  product: null,
  products_list: {
    products: [],
    total_count: 0,
    total_pages: 0,
    current_page: 1,
    loading: false,
  },
  comics_list: {
    products: [],
    total_count: 0,
    total_pages: 0,
    current_page: 1,
    loading: false,
  },
  novels_list: {
    products: [],
    total_count: 0,
    total_pages: 0,
    current_page: 1,
    loading: false,
  },
  setProduct: (product: ProductT) => set({ product: product }),
  setProducts: (products: {
    products: ProductT[];
    total_count: number;
    total_pages: number;
  }) =>
    set({
      products_list: {
        products: products.products,
        total_count: products.total_count,
        total_pages: products.total_pages,
        current_page: 1,
        loading: false,
      },
    }),
  appendProducts: (products: {
    products: ProductT[];
    total_count: number;
    total_pages: number;
    page: number;
  }) =>
    set((state) => ({
      products_list: {
        products: [...state.products_list.products, ...products.products],
        total_count: products.total_count,
        total_pages: products.total_pages,
        current_page: products.page,
        loading: false,
      },
    })),
  setProductsLoading: (loading: boolean) =>
    set((state) => ({
      products_list: {
        ...state.products_list,
        loading,
      },
    })),
  setComics: (comics: {
    products: ProductT[];
    total_count: number;
    total_pages: number;
  }) =>
    set({
      comics_list: {
        products: comics.products,
        total_count: comics.total_count,
        total_pages: comics.total_pages,
        current_page: 1,
        loading: false,
      },
    }),
  setNovels: (novels: {
    products: ProductT[];
    total_count: number;
    total_pages: number;
  }) =>
    set({
      novels_list: {
        products: novels.products,
        total_count: novels.total_count,
        total_pages: novels.total_pages,
        current_page: 1,
        loading: false,
      },
    }),
});
