export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // minutes
  price: number;
  category: "corte" | "barba" | "combo" | "tratamento";
  icon: string;
}

export interface Professional {
  id: string;
  name: string;
  avatar: string;
  role: string;
  rating: number;
  reviewCount: number;
  specialties: string[];
  availableDays: number[]; // 0=Sunday, 6=Saturday
}

export interface TimeSlot {
  time: string; // "HH:mm"
  available: boolean;
}

export interface Booking {
  id: string;
  service: Service;
  professional: Professional;
  date: string; // ISO date string
  time: string;
  status: "confirmed" | "pending" | "completed" | "cancelled";
  customerName: string;
  customerPhone: string;
  createdAt: string;
}
