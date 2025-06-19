import { StateCreator } from "zustand";

export type OrderSlice = {
  ordersCount: number;
  setOrdersCount: (count: number) => void;
  orders: any[] | null;
  setOrders: (data: any[]) => void;
};

export const createOrderSlice: StateCreator<OrderSlice> = (set) => ({
  ordersCount: 0,
  setOrdersCount: (count: number) => set({ ordersCount: count }),
  orders: null,
  setOrders: (data: any[]) => set({ orders: data }),
});
