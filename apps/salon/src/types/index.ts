export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
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
  availableDays: number[];
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface BlockedSlot {
  professionalId: string;
  date: string;
  time: string;
  reason?: string;
}

export interface Booking {
  id: string;
  service: Service;
  professional: Professional;
  date: string;
  time: string;
  status: "confirmed" | "pending" | "completed" | "cancelled";
  customerName: string;
  customerPhone: string;
  createdAt: string;
}

export interface SalonData {
  blockedSlots: BlockedSlot[];
  bookings: Booking[];
  updatedAt: string;
}
