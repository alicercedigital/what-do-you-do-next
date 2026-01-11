import { Outlet } from "react-router-dom";
import { TopBar } from "@/shared/components/navigation/top-bar";
import { MobileMenu } from "@/shared/components/navigation/mobile-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import { useSidebar } from "@/shared/hooks/use-sidebar";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

interface SidebarLayoutProps {
  sidebar: React.ReactNode;
  mobileSidebar?: React.ReactNode;
}

export function SidebarLayout({ sidebar, mobileSidebar }: SidebarLayoutProps) {
  const location = useLocation();
  const { isMobileOpen, setMobileOpen } = useSidebar();

  // Close mobile sidebar on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, setMobileOpen]);

  return (
    <div className="min-h-screen bg-background">
      <TopBar showMenuButton />

      {/* Mobile sidebar sheet */}
      <Sheet open={isMobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="border-b px-4 py-3">
            <SheetTitle className="text-left">Menu</SheetTitle>
          </SheetHeader>
          <div className="py-2">
            {mobileSidebar || sidebar}
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex">
        {/* Desktop sidebar */}
        {sidebar}

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
