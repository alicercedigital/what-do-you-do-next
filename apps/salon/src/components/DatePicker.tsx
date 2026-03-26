import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  format,
  addDays,
  startOfDay,
  isEqual,
  getDay,
  parseISO,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Professional } from "@/types";

interface DatePickerProps {
  professional: Professional;
  selectedDate: string | null;
  onSelect: (date: string) => void;
}

export function DatePicker({
  professional,
  selectedDate,
  onSelect,
}: DatePickerProps) {
  const availableDates = useMemo(() => {
    const dates: Date[] = [];
    const today = startOfDay(new Date());
    for (let i = 0; i < 30; i++) {
      const date = addDays(today, i);
      if (professional.availableDays.includes(getDay(date))) {
        dates.push(date);
      }
    }
    return dates;
  }, [professional.availableDays]);

  const selected = selectedDate ? startOfDay(parseISO(selectedDate)) : null;

  return (
    <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
      {availableDates.map((date) => {
        const isSelected = selected ? isEqual(startOfDay(date), selected) : false;
        const dayName = format(date, "EEE", { locale: ptBR });
        const dayNum = format(date, "dd");
        const monthName = format(date, "MMM", { locale: ptBR });

        return (
          <motion.button
            key={date.toISOString()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(date.toISOString())}
            className={`flex min-w-[72px] flex-col items-center gap-0.5 rounded-xl border px-3 py-3 transition-all ${
              isSelected
                ? "border-salon-500 bg-salon-500/20 text-white shadow-lg shadow-salon-500/20"
                : "border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:bg-white/10"
            }`}
          >
            <span className="text-[10px] uppercase tracking-wider">{dayName}</span>
            <span className="text-xl font-bold">{dayNum}</span>
            <span className="text-[10px] uppercase">{monthName}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
