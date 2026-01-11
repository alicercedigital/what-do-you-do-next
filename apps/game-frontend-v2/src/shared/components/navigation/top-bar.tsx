import { Link, useLocation } from "react-router-dom";
import { Compass, Library, Palette, Menu } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { UserMenu } from "@/shared/components/auth/user-menu";
import { NotificationBell } from "@/shared/components/social/notification-bell";
import { useIsAuthenticated } from "@/store/auth-store";
import { useSidebar } from "@/shared/hooks/use-sidebar";
import { cn } from "@/shared/lib/utils";

interface NavLinkProps {
  to: string;
  icon: React.ElementType;
  label: string;
  isActive?: boolean;
}

function NavLink({ to, icon: Icon, label, isActive }: NavLinkProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      asChild
      className={cn(isActive && "bg-muted")}
    >
      <Link to={to} className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        <span className="hidden sm:inline">{label}</span>
      </Link>
    </Button>
  );
}

interface TopBarProps {
  showMenuButton?: boolean;
}

export function TopBar({ showMenuButton }: TopBarProps) {
  const location = useLocation();
  const isAuthenticated = useIsAuthenticated();
  const toggleMobile = useSidebar((s) => s.toggleMobile);

  const isActive = (path: string) => {
    if (path === "/marketplace") {
      return location.pathname.startsWith("/marketplace");
    }
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-2">
          {showMenuButton && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={toggleMobile}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          )}
          <Link to="/" className="font-semibold text-lg">
            WDYDN
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          <NavLink
            to="/marketplace"
            icon={Compass}
            label="Explore"
            isActive={isActive("/marketplace")}
          />
          {isAuthenticated && (
            <>
              <NavLink
                to="/library"
                icon={Library}
                label="Library"
                isActive={isActive("/library")}
              />
              <NavLink
                to="/studio"
                icon={Palette}
                label="Studio"
                isActive={location.pathname.startsWith("/studio")}
              />
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated && <NotificationBell />}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
