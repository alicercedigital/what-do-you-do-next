import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Service, Professional } from "@/types";
import { defaultServices } from "@/data/services";
import { defaultProfessionals } from "@/data/professionals";

interface AdminState {
  services: Service[];
  professionals: Professional[];

  // Service CRUD
  addService: (service: Omit<Service, "id">) => void;
  updateService: (id: string, service: Partial<Service>) => void;
  deleteService: (id: string) => void;

  // Professional CRUD
  addProfessional: (professional: Omit<Professional, "id">) => void;
  updateProfessional: (id: string, professional: Partial<Professional>) => void;
  deleteProfessional: (id: string) => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      services: defaultServices,
      professionals: defaultProfessionals,

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
        set((s) => ({
          services: s.services.filter((svc) => svc.id !== id),
        })),

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
    }),
    {
      name: "salon-admin",
    },
  ),
);
