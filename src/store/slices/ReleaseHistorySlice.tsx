/**
 * Represents the user state slice.
 */
import { ProductT } from "@/src/utils/types/common";
import { StateCreator } from "zustand";

/**
 * this will handle the user state changes for the app
 * such as if the user has done the onboarding or not and other misc. user data.
 */
export type ReleaseHistorySlice = {
  releases: { products: ProductT[]; total_count: number; total_pages: number };
  selectedRelease: any | null;
  setReleases: (payload: {
    products: ProductT[];
    total_count: number;
    total_pages: number;
  }) => void;
  setSelectedRelease: (payload: any) => void;
};

export const createReleaseHistorySlice: StateCreator<ReleaseHistorySlice> = (
  set
) => ({
  selectedRelease: null,
  releases: { products: [], total_count: 0, total_pages: 0 },
  setReleases: (payload: {
    products: ProductT[];
    total_count: number;
    total_pages: number;
  }) => set({ releases: payload }),
  setSelectedRelease: (payload: any) => set({ selectedRelease: payload }),
});
