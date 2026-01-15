import { Link, useLocation } from "react-router-dom";
import { cn } from "@/shared/lib/utils";
import { useSidebar } from "@/shared/hooks/use-sidebar";

interface SidebarNavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  badge?: string | number;
  exact?: boolean;
}

export function SidebarNavItem({
  to,
  icon: Icon,
  label,
  badge,
  exact = false,
}: SidebarNavItemProps) {
  const location = useLocation();
  const isCollapsed = useSidebar((s) => s.isCollapsed);

  const isActive = exact
    ? location.pathname === to
    : location.pathname === to || location.pathname.startsWith(to + "/");

  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 rounded-md text-sm font-medium transition-colors",
        isCollapsed ? "justify-center px-2 py-2" : "px-3 py-2",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
      title={isCollapsed ? label : undefined}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!isCollapsed && (
        <>
          <span className="flex-1">{label}</span>
          {badge !== undefined && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
              {badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
}
