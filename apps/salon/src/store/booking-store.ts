import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Service, Professional } from "@/types";

interface BookingState {
  selectedService: Service | null;
  selectedProfessional: Professional | null;
  selectedDate: string | null;
  selectedTime: string | null;
  customerName: string;
  customerPhone: string;

  setService: (service: Service | null) => void;
  setProfessional: (professional: Professional | null) => void;
  setDate: (date: string | null) => void;
  setTime: (time: string | null) => void;
  setCustomerName: (name: string) => void;
  setCustomerPhone: (phone: string) => void;
  resetFlow: () => void;
  currentStep: () => number;
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      selectedService: null,
      selectedProfessional: null,
      selectedDate: null,
      selectedTime: null,
      customerName: "",
      customerPhone: "",

      setService: (service) => set({ selectedService: service }),
      setProfessional: (professional) =>
        set({ selectedProfessional: professional }),
      setDate: (date) => set({ selectedDate: date, selectedTime: null }),
      setTime: (time) => set({ selectedTime: time }),
      setCustomerName: (name) => set({ customerName: name }),
      setCustomerPhone: (phone) => set({ customerPhone: phone }),

      resetFlow: () =>
        set({
          selectedService: null,
          selectedProfessional: null,
          selectedDate: null,
          selectedTime: null,
        }),

      currentStep: () => {
        const state = get();
        if (!state.selectedService) return 0;
        if (!state.selectedProfessional) return 1;
        if (!state.selectedDate || !state.selectedTime) return 2;
        return 3;
      },
    }),
    {
      name: "salon-bookings",
      partialize: (state) => ({
        customerName: state.customerName,
        customerPhone: state.customerPhone,
      }),
    },
  ),
);
