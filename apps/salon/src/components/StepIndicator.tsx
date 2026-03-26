import { motion } from "framer-motion";
import { Check } from "lucide-react";

const steps = [
  { label: "Serviço", icon: "✂️" },
  { label: "Profissional", icon: "👤" },
  { label: "Data & Hora", icon: "📅" },
  { label: "Confirmar", icon: "✅" },
];

interface StepIndicatorProps {
  currentStep: number;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-center">
          <div className="flex flex-col items-center gap-1">
            <motion.div
              animate={{
                scale: i === currentStep ? 1.1 : 1,
              }}
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all ${
                i < currentStep
                  ? "border-salon-500 bg-salon-500 text-white"
                  : i === currentStep
                    ? "border-salon-500 bg-salon-500/20 text-salon-400"
                    : "border-white/10 bg-white/5 text-white/30"
              }`}
            >
              {i < currentStep ? <Check className="h-4 w-4" /> : step.icon}
            </motion.div>
            <span
              className={`text-[10px] font-medium ${
                i <= currentStep ? "text-white/70" : "text-white/20"
              }`}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`mx-1 mb-4 h-0.5 w-8 sm:w-16 ${
                i < currentStep ? "bg-salon-500" : "bg-white/10"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
