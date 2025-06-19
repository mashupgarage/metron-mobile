import { StateCreator } from "zustand"

export type WantListSlice = {
  wantlistCount: number
  setWantlistCount: (count: number) => void
  incrementWantlistCount: () => void
  wantlist: any[] | null
  setWantlist: (data: any[]) => void
}

export const createWantListSlice: StateCreator<WantListSlice> = (set) => ({
  wantlistCount: 0,
  setWantlistCount: (count: number) => set({ wantlistCount: count }),
  incrementWantlistCount: () =>
    set((state) => ({ wantlistCount: state.wantlistCount + 1 })),
  wantlist: null,
  setWantlist: (data: any[]) => set({ wantlist: data }),
})
