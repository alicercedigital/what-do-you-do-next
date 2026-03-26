import { Link, useLocation } from "react-router-dom";
import { Calendar, Clock, Settings } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useAdminStore } from "@/store/admin-store";

export function Header() {
  const location = useLocation();
  const bookings = useAdminStore((s) => s.bookings);
  const activeBookings = bookings.filter((b) => b.status === "confirmed").length;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <Logo className="h-10 w-10" />
          <div>
            <h1 className="font-display text-base font-bold leading-tight sm:text-lg">
              Heber Salão e Barbearia
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-salon-400">
              Agendamento Online
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
            <span className="hidden sm:inline">Agendamentos</span>
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
