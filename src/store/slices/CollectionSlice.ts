import { StateCreator } from "zustand"

export type CollectionSlice = {
  collectionCount: number
  setCollectionCount: (count: number) => void
  collection: any[] | null
  setCollection: (data: any[]) => void
  series: any[] | null
  setSeries: (data: any[]) => void
}

export const createCollectionSlice: StateCreator<CollectionSlice> = (set) => ({
  collectionCount: 0,
  setCollectionCount: (count: number) => set({ collectionCount: count }),
  collection: null,
  setCollection: (data: any[]) => set({ collection: data }),
  series: null,
  setSeries: (data: any[]) => set({ series: data }),
})
