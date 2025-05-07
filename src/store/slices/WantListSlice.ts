import { create } from 'zustand';

interface WantListState {
  wantlistCount: number;
  setWantlistCount: (count: number) => void;
  incrementWantlistCount: () => void;
}

export const useWantListStore = create<WantListState>((set) => ({
  wantlistCount: 0,
  setWantlistCount: (count: number) => set({ wantlistCount: count }),
  incrementWantlistCount: () => set((state) => ({ wantlistCount: state.wantlistCount + 1 })),
}));
