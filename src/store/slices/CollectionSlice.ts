import { StateCreator } from "zustand";

export type CollectionSlice = {
  collectionCount: number;
  setCollectionCount: (count: number) => void;
};

export const createCollectionSlice: StateCreator<CollectionSlice> = (set) => ({
  collectionCount: 0,
  setCollectionCount: (count: number) => set({ collectionCount: count }),
});
