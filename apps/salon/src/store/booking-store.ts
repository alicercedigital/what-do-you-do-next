import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Service, Professional, Booking } from "@/types";

interface BookingState {
  // Current booking flow
  selectedService: Service | null;
  selectedProfessional: Professional | null;
  selectedDate: string | null;
  selectedTime: string | null;
  customerName: string;
  customerPhone: string;

  // Booking history
  bookings: Booking[];

  // Actions
  setService: (service: Service | null) => void;
  setProfessional: (professional: Professional | null) => void;
  setDate: (date: string | null) => void;
  setTime: (time: string | null) => void;
  setCustomerName: (name: string) => void;
  setCustomerPhone: (phone: string) => void;
  confirmBooking: () => Booking | null;
  cancelBooking: (id: string) => void;
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
      bookings: [],

      setService: (service) => set({ selectedService: service }),
      setProfessional: (professional) => set({ selectedProfessional: professional }),
      setDate: (date) => set({ selectedDate: date, selectedTime: null }),
      setTime: (time) => set({ selectedTime: time }),
      setCustomerName: (name) => set({ customerName: name }),
      setCustomerPhone: (phone) => set({ customerPhone: phone }),

      confirmBooking: () => {
        const state = get();
        if (
          !state.selectedService ||
          !state.selectedProfessional ||
          !state.selectedDate ||
          !state.selectedTime ||
          !state.customerName ||
          !state.customerPhone
        ) {
          return null;
        }

        const booking: Booking = {
          id: crypto.randomUUID(),
          service: state.selectedService,
          professional: state.selectedProfessional,
          date: state.selectedDate,
          time: state.selectedTime,
          status: "confirmed",
          customerName: state.customerName,
          customerPhone: state.customerPhone,
          createdAt: new Date().toISOString(),
        };

        set((s) => ({
          bookings: [booking, ...s.bookings],
          selectedService: null,
          selectedProfessional: null,
          selectedDate: null,
          selectedTime: null,
        }));

        return booking;
      },

      cancelBooking: (id) =>
        set((s) => ({
          bookings: s.bookings.map((b) =>
            b.id === id ? { ...b, status: "cancelled" as const } : b,
          ),
        })),

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
        bookings: state.bookings,
        customerName: state.customerName,
        customerPhone: state.customerPhone,
      }),
    },
  ),
);
