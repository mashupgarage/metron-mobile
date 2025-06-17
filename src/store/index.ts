import { create, StoreApi } from "zustand";
import { persist, PersistOptions, StorageValue } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createGlobalSlice, GlobalSlice } from "./slices/GlobalSlice";
import { createUserSlice, UserSlice } from "./slices/UserSlice";
import { createProductSlice, ProductSlice } from "./slices/ProductsSlice";
import { createOrderSlice, OrderSlice } from "./slices/OrderSlice";
import {
  createCollectionSlice,
  CollectionSlice,
} from "./slices/CollectionSlice";
import {
  createReleaseHistorySlice,
  ReleaseHistorySlice,
} from "./slices/ReleaseHistorySlice";
import { createThemeSlice, ThemeSlice } from "./slices/ThemeSlice";

type BoundState = GlobalSlice &
  UserSlice &
  ProductSlice &
  ReleaseHistorySlice &
  OrderSlice &
  CollectionSlice &
  ThemeSlice;

/**
 * this is the store that will handle the slices
 */

export const useBoundStore = create<BoundState>()(
  persist(
    (...a) => ({
      ...createGlobalSlice(...a),
      ...createUserSlice(...a),
      ...createProductSlice(...a),
      ...createOrderSlice(...a),
      ...createCollectionSlice(...a),
      ...createReleaseHistorySlice(...a),
      ...createThemeSlice(...a),
    }),
    {
      name: "app-bound-store",
      storage: {
        getItem: async (name: string) => {
          const item = await AsyncStorage.getItem(name);
          return item ? JSON.parse(item) : null;
        },
        setItem: async (name: string, value: StorageValue<GlobalSlice>) => {
          await AsyncStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: async (name: string) => {
          await AsyncStorage.removeItem(name);
        },
      },
    }
  )
);
