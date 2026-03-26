import type { Professional } from "@/types";

export const professionals: Professional[] = [
  {
    id: "carlos",
    name: "Carlos Silva",
    avatar: "CS",
    role: "Barbeiro Master",
    rating: 4.9,
    reviewCount: 347,
    specialties: ["Degradê", "Corte Clássico", "Barba"],
    availableDays: [1, 2, 3, 4, 5, 6], // Seg-Sáb
  },
  {
    id: "rafael",
    name: "Rafael Santos",
    avatar: "RS",
    role: "Barbeiro Senior",
    rating: 4.8,
    reviewCount: 256,
    specialties: ["Corte Moderno", "Pigmentação", "Tratamentos"],
    availableDays: [1, 2, 3, 4, 5], // Seg-Sex
  },
  {
    id: "lucas",
    name: "Lucas Oliveira",
    avatar: "LO",
    role: "Barbeiro",
    rating: 4.7,
    reviewCount: 182,
    specialties: ["Degradê", "Corte Infantil", "Barba na Navalha"],
    availableDays: [1, 2, 3, 4, 5, 6], // Seg-Sáb
  },
  {
    id: "pedro",
    name: "Pedro Costa",
    avatar: "PC",
    role: "Barbeiro Senior",
    rating: 4.9,
    reviewCount: 421,
    specialties: ["Combo VIP", "Hidratação", "Barba Completa"],
    availableDays: [2, 3, 4, 5, 6], // Ter-Sáb
  },
];
