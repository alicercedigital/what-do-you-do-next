import { useMemo } from "react";
import { motion } from "framer-motion";
import { parseISO, isSameDay, isAfter } from "date-fns";
import type { Booking } from "@/types";
import { useBookingStore } from "@/store/booking-store";

interface TimeSlotsProps {
  selectedDate: string;
  professionalId: string;
  selectedTime: string | null;
  onSelect: (time: string) => void;
}

const ALL_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
  "19:00", "19:30",
];

export function TimeSlots({
  selectedDate,
  professionalId,
  selectedTime,
  onSelect,
}: TimeSlotsProps) {
  const bookings = useBookingStore((s) => s.bookings);

  const slots = useMemo(() => {
    const date = parseISO(selectedDate);
    const now = new Date();

    return ALL_SLOTS.map((time) => {
      const [hours, minutes] = time.split(":").map(Number);
      const slotDate = new Date(date);
      slotDate.setHours(hours!, minutes, 0, 0);

      const isPast = !isAfter(slotDate, now);
      const isBooked = bookings.some(
        (b: Booking) =>
          b.professional.id === professionalId &&
          b.status === "confirmed" &&
          isSameDay(parseISO(b.date), date) &&
          b.time === time,
      );

      return { time, available: !isPast && !isBooked };
    });
  }, [selectedDate, professionalId, bookings]);

  const morningSlots = slots.filter((s) => {
    const hour = parseInt(s.time.split(":")[0]!);
    return hour < 12;
  });
  const afternoonSlots = slots.filter((s) => {
    const hour = parseInt(s.time.split(":")[0]!);
    return hour >= 12 && hour < 17;
  });
  const eveningSlots = slots.filter((s) => {
    const hour = parseInt(s.time.split(":")[0]!);
    return hour >= 17;
  });

  const renderGroup = (label: string, groupSlots: typeof slots) => (
    <div>
      <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-white/30">
        {label}
      </h4>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
        {groupSlots.map(({ time, available }) => (
          <motion.button
            key={time}
            whileHover={available ? { scale: 1.05 } : {}}
            whileTap={available ? { scale: 0.95 } : {}}
            disabled={!available}
            onClick={() => onSelect(time)}
            className={`rounded-lg border px-2 py-2 text-sm font-medium transition-all ${
              selectedTime === time
                ? "border-salon-500 bg-salon-500/20 text-white shadow-lg shadow-salon-500/20"
                : available
                  ? "border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:bg-white/10"
                  : "cursor-not-allowed border-white/5 bg-white/[0.02] text-white/20 line-through"
            }`}
          >
            {time}
          </motion.button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {morningSlots.length > 0 && renderGroup("Manhã", morningSlots)}
      {afternoonSlots.length > 0 && renderGroup("Tarde", afternoonSlots)}
      {eveningSlots.length > 0 && renderGroup("Noite", eveningSlots)}
    </div>
  );
}
