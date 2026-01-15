import { Outlet } from "react-router-dom";
import { TopBar } from "@/shared/components/navigation/top-bar";
import { MobileMenu } from "@/shared/components/navigation/mobile-menu";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <MobileMenu />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
