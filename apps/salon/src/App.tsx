import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { Header } from "@/components/Header";
import { BookingPage } from "@/pages/BookingPage";
import { BookingsListPage } from "@/pages/BookingsListPage";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0f0f0f]">
        <Header />
        <main className="pb-24">
          <Routes>
            <Route path="/" element={<BookingPage />} />
            <Route path="/bookings" element={<BookingsListPage />} />
          </Routes>
        </main>
        <Toaster
          theme="dark"
          position="top-center"
          toastOptions={{
            style: {
              background: "#1a1a1a",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#fff",
            },
          }}
        />
      </div>
    </BrowserRouter>
  );
}
