import { StateCreator } from "zustand"

export type CollectionSlice = {
  collectionCount: number
  setCollectionCount: (count: number) => void
  collection: any[] | null
  setCollection: (data: any[]) => void
  collectionStats: any[] | null
  setCollectionStats: (data: any[]) => void
}

export const createCollectionSlice: StateCreator<CollectionSlice> = (set) => ({
  collectionCount: 0,
  setCollectionCount: (count: number) => set({ collectionCount: count }),
  collection: null,
  setCollection: (data: any[]) => set({ collection: data }),
  collectionStats: null,
  setCollectionStats: (data: any[]) => set({ collectionStats: data }),
})
