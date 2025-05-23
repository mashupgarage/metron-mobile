/**
 * Represents the user state slice.
 */
import { UserT } from "@/src/utils/types/common";
import { StateCreator } from "zustand";

/**
 * this will handle the user state changes for the app
 * such as if the user has done the onboarding or not and other misc. user data.
 */
export type UserSlice = {
  user: UserT | null;
  isOnboardingDone: boolean;
  setOnboardingDone: (isDone: boolean) => void;
  setUser: (payload: UserT) => void;
};

export const createUserSlice: StateCreator<UserSlice> = (set) => ({
  user: null,
  isOnboardingDone: true,
  setOnboardingDone: (isDone: boolean) => set({ isOnboardingDone: isDone }),
  setUser: (payload: UserT) => set({ user: payload }),
});
