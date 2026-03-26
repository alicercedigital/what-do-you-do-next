import type { Professional } from "@/types";

export const defaultProfessionals: Professional[] = [
  {
    id: "heber",
    name: "Heber Eustáquio",
    avatar: "HE",
    role: "Barbeiro",
    rating: 5.0,
    reviewCount: 0,
    specialties: ["Cortes", "Barba", "Sobrancelha", "Navalha"],
    availableDays: [1, 2, 3, 4, 5, 6], // Seg-Sáb
  },
];
