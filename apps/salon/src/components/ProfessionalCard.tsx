import { motion } from "framer-motion";
import { Star } from "lucide-react";
import type { Professional } from "@/types";

interface ProfessionalCardProps {
  professional: Professional;
  selected: boolean;
  onSelect: (professional: Professional) => void;
}

export function ProfessionalCard({
  professional,
  selected,
  onSelect,
}: ProfessionalCardProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(professional)}
      className={`group w-full overflow-hidden rounded-2xl border p-4 text-left transition-all ${
        selected
          ? "border-salon-500 bg-salon-500/10 shadow-lg shadow-salon-500/20"
          : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold transition-all ${
            selected
              ? "bg-gradient-to-br from-salon-500 to-salon-700 text-white"
              : "bg-white/10 text-white/60 group-hover:bg-white/20"
          }`}
        >
          {professional.avatar}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-white">{professional.name}</h3>
          <p className="text-sm text-salon-400">{professional.role}</p>
          <div className="mt-1 flex items-center gap-1">
            <Star className="h-3 w-3 fill-gold-400 text-gold-400" />
            <span className="text-xs font-medium text-gold-400">
              {professional.rating}
            </span>
            <span className="text-xs text-white/30">
              ({professional.reviewCount} avaliações)
            </span>
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1">
        {professional.specialties.map((s) => (
          <span
            key={s}
            className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-white/50"
          >
            {s}
          </span>
        ))}
      </div>
    </motion.button>
  );
}
