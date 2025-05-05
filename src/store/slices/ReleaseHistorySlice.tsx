/**
 * Represents the user state slice.
 */
import { StateCreator } from "zustand";

/**
 * this will handle the user state changes for the app
 * such as if the user has done the onboarding or not and other misc. user data.
 */
export type ReleaseHistorySlice = {
  releases: any[] | null;
  selectedRelease: any | null;
  setReleases: (payload: any[]) => void;
  setSelectedRelease: (payload: any) => void;
};

export const createReleaseHistorySlice: StateCreator<ReleaseHistorySlice> = (
  set
) => ({
  selectedRelease: null,
  releases: null,
  setReleases: (payload: any[]) => set({ releases: payload }),
  setSelectedRelease: (payload: any) => set({ selectedRelease: payload }),
});
