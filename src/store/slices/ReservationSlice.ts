import { StateCreator } from "zustand";

export type ReservationSlice = {
  reservations: any[] | null;
  setReservations: (data: any[]) => void;
};

export const createReservationSlice: StateCreator<ReservationSlice> = (set) => ({
  reservations: null,
  setReservations: (data: any[]) => set({ reservations: data }),
});
