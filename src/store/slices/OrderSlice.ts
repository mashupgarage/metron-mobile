import { StateCreator } from "zustand";

export type OrderSlice = {
  ordersCount: number;
  setOrdersCount: (count: number) => void;
};

export const createOrderSlice: StateCreator<OrderSlice> = (set) => ({
  ordersCount: 0,
  setOrdersCount: (count: number) => set({ ordersCount: count }),
});
