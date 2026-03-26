import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  DollarSign,
  User,
  Phone,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { useBookingStore } from "@/store/booking-store";
import { services } from "@/data/services";
import { professionals } from "@/data/professionals";
import { ServiceCard } from "@/components/ServiceCard";
import { ProfessionalCard } from "@/components/ProfessionalCard";
import { DatePicker } from "@/components/DatePicker";
import { TimeSlots } from "@/components/TimeSlots";
import { StepIndicator } from "@/components/StepIndicator";
import type { Service } from "@/types";

const categories = [
  { key: "corte", label: "Cortes" },
  { key: "barba", label: "Barba" },
  { key: "combo", label: "Combos" },
  { key: "tratamento", label: "Tratamentos" },
] as const;

export function BookingPage() {
  const navigate = useNavigate();
  const store = useBookingStore();
  const step = store.currentStep();
  const [activeCategory, setActiveCategory] = useState<Service["category"]>("corte");

  const filteredServices = services.filter((s) => s.category === activeCategory);

  const handleConfirm = () => {
    if (!store.customerName.trim() || !store.customerPhone.trim()) {
      toast.error("Preencha seu nome e telefone");
      return;
    }
    const booking = store.confirmBooking();
    if (booking) {
      toast.success("Agendamento confirmado!", {
        description: `${booking.service.name} com ${booking.professional.name}`,
      });
      navigate("/bookings");
    }
  };

  const goBack = () => {
    if (step === 1) store.setService(null);
    else if (step === 2) store.setProfessional(null);
    else if (step === 3) {
      store.setDate(null);
      store.setTime(null);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-8">
        <StepIndicator currentStep={step} />
      </div>

      <AnimatePresence mode="wait">
        {/* Step 0: Choose Service */}
        {step === 0 && (
          <motion.div
            key="step-0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="font-display text-2xl font-bold">Escolha o Serviço</h2>
            <p className="mt-1 text-sm text-white/50">
              Selecione o serviço que deseja agendar
            </p>

            {/* Category tabs */}
            <div className="mt-4 flex gap-2 overflow-x-auto scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                    activeCategory === cat.key
                      ? "bg-salon-500 text-white"
                      : "bg-white/5 text-white/50 hover:bg-white/10"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="mt-4 space-y-3">
              {filteredServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  selected={store.selectedService?.id === service.id}
                  onSelect={(s) => store.setService(s)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 1: Choose Professional */}
        {step === 1 && (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <button
              onClick={goBack}
              className="mb-4 flex items-center gap-1 text-sm text-white/50 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" /> Voltar
            </button>
            <h2 className="font-display text-2xl font-bold">Escolha o Profissional</h2>
            <p className="mt-1 text-sm text-white/50">
              Quem você gostaria que realizasse o serviço?
            </p>

            <div className="mt-4 space-y-3">
              {professionals.map((pro) => (
                <ProfessionalCard
                  key={pro.id}
                  professional={pro}
                  selected={store.selectedProfessional?.id === pro.id}
                  onSelect={(p) => store.setProfessional(p)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 2: Choose Date & Time */}
        {step === 2 && store.selectedProfessional && (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <button
              onClick={goBack}
              className="mb-4 flex items-center gap-1 text-sm text-white/50 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" /> Voltar
            </button>
            <h2 className="font-display text-2xl font-bold">Data & Horário</h2>
            <p className="mt-1 text-sm text-white/50">
              Escolha o melhor dia e horário para você
            </p>

            <div className="mt-4">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-white/70">
                <Calendar className="h-4 w-4 text-salon-400" /> Selecione a data
              </h3>
              <DatePicker
                professional={store.selectedProfessional}
                selectedDate={store.selectedDate}
                onSelect={(date) => store.setDate(date)}
              />
            </div>

            {store.selectedDate && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
              >
                <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-white/70">
                  <Clock className="h-4 w-4 text-salon-400" /> Horários disponíveis
                </h3>
                <TimeSlots
                  selectedDate={store.selectedDate}
                  professionalId={store.selectedProfessional.id}
                  selectedTime={store.selectedTime}
                  onSelect={(time) => store.setTime(time)}
                />
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 &&
          store.selectedService &&
          store.selectedProfessional &&
          store.selectedDate &&
          store.selectedTime && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <button
                onClick={goBack}
                className="mb-4 flex items-center gap-1 text-sm text-white/50 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" /> Voltar
              </button>
              <h2 className="font-display text-2xl font-bold">Confirmar Agendamento</h2>
              <p className="mt-1 text-sm text-white/50">
                Revise os detalhes e confirme
              </p>

              {/* Summary card */}
              <div className="mt-6 space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <span className="text-3xl">{store.selectedService.icon}</span>
                  <div>
                    <h3 className="font-semibold">{store.selectedService.name}</h3>
                    <p className="text-sm text-white/50">
                      {store.selectedService.description}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-salon-400" />
                    <div>
                      <p className="text-[10px] uppercase text-white/30">Profissional</p>
                      <p className="text-sm font-medium">
                        {store.selectedProfessional.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-salon-400" />
                    <div>
                      <p className="text-[10px] uppercase text-white/30">Data</p>
                      <p className="text-sm font-medium">
                        {format(parseISO(store.selectedDate), "dd 'de' MMMM", {
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-salon-400" />
                    <div>
                      <p className="text-[10px] uppercase text-white/30">Horário</p>
                      <p className="text-sm font-medium">{store.selectedTime}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gold-400" />
                    <div>
                      <p className="text-[10px] uppercase text-white/30">Valor</p>
                      <p className="text-sm font-semibold text-gold-400">
                        R$ {store.selectedService.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer info */}
              <div className="mt-6 space-y-3">
                <h3 className="text-sm font-medium text-white/70">Seus dados</h3>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                  <input
                    type="text"
                    placeholder="Seu nome"
                    value={store.customerName}
                    onChange={(e) => store.setCustomerName(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:border-salon-500 focus:outline-none focus:ring-1 focus:ring-salon-500"
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                  <input
                    type="tel"
                    placeholder="(00) 00000-0000"
                    value={store.customerPhone}
                    onChange={(e) => store.setCustomerPhone(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:border-salon-500 focus:outline-none focus:ring-1 focus:ring-salon-500"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleConfirm}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-salon-600 to-salon-500 py-4 text-sm font-bold text-white shadow-lg shadow-salon-500/30 transition-all hover:shadow-xl hover:shadow-salon-500/40"
              >
                <CheckCircle2 className="h-5 w-5" />
                Confirmar Agendamento
              </motion.button>
            </motion.div>
          )}
      </AnimatePresence>

      {/* Floating next button for steps 0-1 */}
      {step === 0 && store.selectedService && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed inset-x-0 bottom-0 border-t border-white/10 bg-black/90 p-4 backdrop-blur-xl"
        >
          <div className="mx-auto flex max-w-3xl items-center justify-between">
            <div>
              <p className="text-sm font-medium">{store.selectedService.name}</p>
              <p className="text-xs text-gold-400">
                R$ {store.selectedService.price.toFixed(2)} &middot;{" "}
                {store.selectedService.duration} min
              </p>
            </div>
            <button
              onClick={() => {}}
              className="flex items-center gap-1 rounded-xl bg-salon-500 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-salon-600"
            >
              Próximo <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
