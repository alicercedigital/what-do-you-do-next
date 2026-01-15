import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useSidebar } from "@/shared/hooks/use-sidebar";
import { cn } from "@/shared/lib/utils";

interface SidebarProps {
  children: React.ReactNode;
  title?: string;
}

export function Sidebar({ children, title }: SidebarProps) {
  const { isCollapsed, toggleCollapsed } = useSidebar();

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r bg-background transition-all duration-300",
        isCollapsed ? "w-14" : "w-60"
      )}
    >
      {title && !isCollapsed && (
        <div className="px-4 py-3 border-b">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
            {title}
          </h2>
        </div>
      )}
      <nav className="flex-1 flex flex-col gap-1 p-2">{children}</nav>
      <div className="border-t p-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center"
          onClick={toggleCollapsed}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
          {!isCollapsed && <span className="ml-2">Collapse</span>}
        </Button>
      </div>
    </aside>
  );
}
