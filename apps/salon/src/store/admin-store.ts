import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Service, Professional, BlockedSlot, Booking, SalonData } from "@/types";
import { defaultServices } from "@/data/services";
import { defaultProfessionals } from "@/data/professionals";
import { readSalonData, writeSalonData } from "@/lib/github-storage";

interface AdminState {
  services: Service[];
  professionals: Professional[];
  blockedSlots: BlockedSlot[];
  bookings: Booking[];
  githubToken: string;
  isLoading: boolean;
  lastSync: string | null;

  // Service CRUD
  addService: (service: Omit<Service, "id">) => void;
  updateService: (id: string, service: Partial<Service>) => void;
  deleteService: (id: string) => void;

  // Professional CRUD
  addProfessional: (professional: Omit<Professional, "id">) => void;
  updateProfessional: (id: string, professional: Partial<Professional>) => void;
  deleteProfessional: (id: string) => void;

  // Blocked slots
  toggleBlockedSlot: (professionalId: string, date: string, time: string) => void;
  isSlotBlocked: (professionalId: string, date: string, time: string) => boolean;
  blockFullDay: (professionalId: string, date: string, times: string[]) => void;
  unblockFullDay: (professionalId: string, date: string) => void;

  // Bookings
  confirmBooking: (booking: Booking) => void;
  cancelBooking: (id: string) => void;

  // GitHub sync
  setGithubToken: (token: string) => void;
  syncFromGithub: () => Promise<void>;
  syncToGithub: () => Promise<boolean>;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      services: defaultServices,
      professionals: defaultProfessionals,
      blockedSlots: [],
      bookings: [],
      githubToken: "",
      isLoading: false,
      lastSync: null,

      // Services
      addService: (service) =>
        set((s) => ({
          services: [...s.services, { ...service, id: crypto.randomUUID() }],
        })),
      updateService: (id, updates) =>
        set((s) => ({
          services: s.services.map((svc) =>
            svc.id === id ? { ...svc, ...updates } : svc,
          ),
        })),
      deleteService: (id) =>
        set((s) => ({ services: s.services.filter((svc) => svc.id !== id) })),

      // Professionals
      addProfessional: (professional) =>
        set((s) => ({
          professionals: [
            ...s.professionals,
            { ...professional, id: crypto.randomUUID() },
          ],
        })),
      updateProfessional: (id, updates) =>
        set((s) => ({
          professionals: s.professionals.map((pro) =>
            pro.id === id ? { ...pro, ...updates } : pro,
          ),
        })),
      deleteProfessional: (id) =>
        set((s) => ({
          professionals: s.professionals.filter((pro) => pro.id !== id),
        })),

      // Blocked slots
      toggleBlockedSlot: (professionalId, date, time) =>
        set((s) => {
          const exists = s.blockedSlots.some(
            (b) =>
              b.professionalId === professionalId &&
              b.date === date &&
              b.time === time,
          );
          return {
            blockedSlots: exists
              ? s.blockedSlots.filter(
                  (b) =>
                    !(
                      b.professionalId === professionalId &&
                      b.date === date &&
                      b.time === time
                    ),
                )
              : [...s.blockedSlots, { professionalId, date, time }],
          };
        }),

      isSlotBlocked: (professionalId, date, time) =>
        get().blockedSlots.some(
          (b) =>
            b.professionalId === professionalId &&
            b.date === date &&
            b.time === time,
        ) ||
        get().bookings.some(
          (b) =>
            b.professional.id === professionalId &&
            b.date === date &&
            b.time === time &&
            b.status === "confirmed",
        ),

      blockFullDay: (professionalId, date, times) =>
        set((s) => {
          const existing = s.blockedSlots.filter(
            (b) => !(b.professionalId === professionalId && b.date === date),
          );
          const newSlots = times.map((time) => ({ professionalId, date, time }));
          return { blockedSlots: [...existing, ...newSlots] };
        }),

      unblockFullDay: (professionalId, date) =>
        set((s) => ({
          blockedSlots: s.blockedSlots.filter(
            (b) => !(b.professionalId === professionalId && b.date === date),
          ),
        })),

      // Bookings
      confirmBooking: (booking) =>
        set((s) => ({ bookings: [booking, ...s.bookings] })),

      cancelBooking: (id) =>
        set((s) => ({
          bookings: s.bookings.map((b) =>
            b.id === id ? { ...b, status: "cancelled" as const } : b,
          ),
        })),

      // GitHub
      setGithubToken: (token) => set({ githubToken: token }),

      syncFromGithub: async () => {
        set({ isLoading: true });
        try {
          const data = await readSalonData();
          set({
            blockedSlots: data.blockedSlots,
            bookings: data.bookings,
            lastSync: new Date().toISOString(),
          });
        } finally {
          set({ isLoading: false });
        }
      },

      syncToGithub: async () => {
        const state = get();
        if (!state.githubToken) return false;

        set({ isLoading: true });
        try {
          const data: SalonData = {
            blockedSlots: state.blockedSlots,
            bookings: state.bookings,
            updatedAt: new Date().toISOString(),
          };
          const success = await writeSalonData(data, state.githubToken);
          if (success) {
            set({ lastSync: new Date().toISOString() });
          }
          return success;
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "salon-admin",
      partialize: (state) => ({
        services: state.services,
        professionals: state.professionals,
        blockedSlots: state.blockedSlots,
        bookings: state.bookings,
        githubToken: state.githubToken,
        lastSync: state.lastSync,
      }),
    },
  ),
);
