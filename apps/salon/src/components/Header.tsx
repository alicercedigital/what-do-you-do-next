import { Link, useLocation } from "react-router-dom";
import { Scissors, Calendar, Clock, Settings } from "lucide-react";
import { useBookingStore } from "@/store/booking-store";

export function Header() {
  const location = useLocation();
  const bookings = useBookingStore((s) => s.bookings);
  const activeBookings = bookings.filter((b) => b.status === "confirmed").length;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-salon-500 to-salon-700">
            <Scissors className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold leading-tight">Barbearia</h1>
            <p className="text-[10px] uppercase tracking-widest text-salon-400">
              Heber Eustáquio
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            to="/"
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              location.pathname === "/"
                ? "bg-white/10 text-white"
                : "text-white/60 hover:text-white"
            }`}
          >
            <span className="hidden sm:inline">Agendar</span>
            <Calendar className="h-5 w-5 sm:hidden" />
          </Link>
          <Link
            to="/bookings"
            className={`relative rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              location.pathname === "/bookings"
                ? "bg-white/10 text-white"
                : "text-white/60 hover:text-white"
            }`}
          >
            <span className="hidden sm:inline">Meus Agendamentos</span>
            <Clock className="h-5 w-5 sm:hidden" />
            {activeBookings > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-salon-500 text-[10px] font-bold">
                {activeBookings}
              </span>
            )}
          </Link>
          <Link
            to="/admin"
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              location.pathname === "/admin"
                ? "bg-white/10 text-white"
                : "text-white/60 hover:text-white"
            }`}
          >
            <span className="hidden sm:inline">Admin</span>
            <Settings className="h-5 w-5 sm:hidden" />
          </Link>
        </nav>
      </div>
    </header>
  );
}
