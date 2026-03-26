import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Clock, User, X, Scissors } from "lucide-react";
import { toast } from "sonner";
import { useAdminStore } from "@/store/admin-store";
import { Link } from "react-router-dom";

export function BookingsListPage() {
  const bookings = useAdminStore((s) => s.bookings);
  const cancelBooking = useAdminStore((s) => s.cancelBooking);

  const handleCancel = (id: string) => {
    cancelBooking(id);
    toast.success("Agendamento cancelado");
  };

  const statusLabels = {
    confirmed: { text: "Confirmado", color: "bg-green-500/20 text-green-400" },
    pending: { text: "Pendente", color: "bg-yellow-500/20 text-yellow-400" },
    completed: { text: "Concluído", color: "bg-blue-500/20 text-blue-400" },
    cancelled: { text: "Cancelado", color: "bg-red-500/20 text-red-400" },
  };

  if (bookings.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/5">
          <Scissors className="h-10 w-10 text-white/20" />
        </div>
        <h2 className="mt-4 font-display text-xl font-bold text-white/70">
          Nenhum agendamento
        </h2>
        <p className="mt-2 text-sm text-white/40">
          Os agendamentos confirmados aparecerão aqui
        </p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-xl bg-salon-500 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-salon-600"
        >
          Agendar Agora
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h2 className="font-display text-2xl font-bold">Agendamentos</h2>
      <p className="mt-1 text-sm text-white/50">
        {bookings.filter((b) => b.status === "confirmed").length} agendamento(s) ativo(s)
      </p>

      <div className="mt-6 space-y-3">
        {bookings.map((booking, i) => {
          const status = statusLabels[booking.status];
          return (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`rounded-2xl border p-4 ${
                booking.status === "cancelled"
                  ? "border-white/5 bg-white/[0.02] opacity-50"
                  : "border-white/10 bg-white/5"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{booking.service.icon}</span>
                  <div>
                    <h3 className="font-semibold">{booking.service.name}</h3>
                    <span
                      className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${status.color}`}
                    >
                      {status.text}
                    </span>
                  </div>
                </div>
                {booking.status === "confirmed" && (
                  <button
                    onClick={() => handleCancel(booking.id)}
                    className="rounded-lg p-1.5 text-white/30 transition-colors hover:bg-red-500/10 hover:text-red-400"
                    title="Cancelar"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="mt-3 grid grid-cols-3 gap-3">
                <div className="flex items-center gap-1.5">
                  <User className="h-3 w-3 text-salon-400" />
                  <span className="text-xs text-white/60">{booking.professional.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3 w-3 text-salon-400" />
                  <span className="text-xs text-white/60">
                    {format(parseISO(booking.date), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3 text-salon-400" />
                  <span className="text-xs text-white/60">{booking.time}</span>
                </div>
              </div>

              <div className="mt-2 text-xs text-white/30">
                {booking.customerName} · {booking.customerPhone}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
