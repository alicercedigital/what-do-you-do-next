import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Compass, Library, Palette, Home } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import { useSidebar } from "@/shared/hooks/use-sidebar";
import { useIsAuthenticated } from "@/store/auth-store";
import { cn } from "@/shared/lib/utils";

interface MobileNavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
}

function MobileNavItem({ to, icon: Icon, label, onClick }: MobileNavItemProps) {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(to + "/");

  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Icon className="h-5 w-5" />
      {label}
    </Link>
  );
}

export function MobileMenu() {
  const location = useLocation();
  const isAuthenticated = useIsAuthenticated();
  const { isMobileOpen, setMobileOpen } = useSidebar();

  // Close menu on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, setMobileOpen]);

  return (
    <Sheet open={isMobileOpen} onOpenChange={setMobileOpen}>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="border-b px-4 py-3">
          <SheetTitle className="text-left">Menu</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 p-4">
          <MobileNavItem to="/" icon={Home} label="Home" />
          <MobileNavItem to="/marketplace" icon={Compass} label="Explore" />
          {isAuthenticated && (
            <>
              <MobileNavItem to="/library" icon={Library} label="Library" />
              <MobileNavItem to="/studio" icon={Palette} label="Studio" />
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
