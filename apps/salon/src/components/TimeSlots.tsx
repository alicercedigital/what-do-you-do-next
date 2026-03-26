import { useMemo } from "react";
import { motion } from "framer-motion";
import { parseISO, isSameDay, isAfter, format } from "date-fns";
import { useAdminStore } from "@/store/admin-store";

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
  const blockedSlots = useAdminStore((s) => s.blockedSlots);
  const bookings = useAdminStore((s) => s.bookings);

  const slots = useMemo(() => {
    const date = parseISO(selectedDate);
    const dateStr = format(date, "yyyy-MM-dd");
    const now = new Date();

    return ALL_SLOTS.map((time) => {
      const [hours, minutes] = time.split(":").map(Number);
      const slotDate = new Date(date);
      slotDate.setHours(hours!, minutes, 0, 0);

      const isPast = !isAfter(slotDate, now);

      const isBlocked = blockedSlots.some(
        (b) =>
          b.professionalId === professionalId &&
          b.date === dateStr &&
          b.time === time,
      );

      const isBooked = bookings.some(
        (b) =>
          b.professional.id === professionalId &&
          b.status === "confirmed" &&
          isSameDay(parseISO(b.date), date) &&
          b.time === time,
      );

      return { time, available: !isPast && !isBlocked && !isBooked };
    });
  }, [selectedDate, professionalId, blockedSlots, bookings]);

  const availableCount = slots.filter((s) => s.available).length;

  const morningSlots = slots.filter((s) => parseInt(s.time.split(":")[0]!) < 12);
  const afternoonSlots = slots.filter((s) => {
    const h = parseInt(s.time.split(":")[0]!);
    return h >= 12 && h < 17;
  });
  const eveningSlots = slots.filter((s) => parseInt(s.time.split(":")[0]!) >= 17);

  if (availableCount === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center">
        <p className="text-sm text-white/50">
          Nenhum horário disponível neste dia
        </p>
        <p className="mt-1 text-xs text-white/30">
          Tente selecionar outra data
        </p>
      </div>
    );
  }

  const renderGroup = (label: string, groupSlots: typeof slots) => {
    if (groupSlots.length === 0) return null;
    return (
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
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-salon-400">{availableCount} horários disponíveis</p>
      {renderGroup("Manhã", morningSlots)}
      {renderGroup("Tarde", afternoonSlots)}
      {renderGroup("Noite", eveningSlots)}
    </div>
  );
}
