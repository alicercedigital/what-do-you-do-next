import { motion } from "framer-motion";
import { Clock, DollarSign } from "lucide-react";
import type { Service } from "@/types";

interface ServiceCardProps {
  service: Service;
  selected: boolean;
  onSelect: (service: Service) => void;
}

export function ServiceCard({ service, selected, onSelect }: ServiceCardProps) {
  return (
    <motion.button
      layout
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(service)}
      className={`group relative w-full overflow-hidden rounded-2xl border p-4 text-left transition-all ${
        selected
          ? "border-salon-500 bg-salon-500/10 shadow-lg shadow-salon-500/20"
          : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{service.icon}</span>
        <div className="flex-1">
          <h3 className="font-semibold text-white">{service.name}</h3>
          <p className="mt-0.5 text-sm text-white/50">{service.description}</p>
          <div className="mt-2 flex items-center gap-3">
            <span className="flex items-center gap-1 text-xs text-white/40">
              <Clock className="h-3 w-3" />
              {service.duration} min
            </span>
            <span className="flex items-center gap-1 text-sm font-semibold text-gold-400">
              <DollarSign className="h-3 w-3" />
              R$ {service.price.toFixed(2)}
            </span>
          </div>
        </div>
        <div
          className={`h-5 w-5 rounded-full border-2 transition-all ${
            selected
              ? "border-salon-500 bg-salon-500"
              : "border-white/20 group-hover:border-white/40"
          }`}
        >
          {selected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex h-full w-full items-center justify-center"
            >
              <div className="h-2 w-2 rounded-full bg-white" />
            </motion.div>
          )}
        </div>
      </div>
    </motion.button>
  );
}
