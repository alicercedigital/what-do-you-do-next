import { LayoutDashboard, BarChart3, Coins, FileText } from "lucide-react";
import { Sidebar } from "./sidebar";
import { SidebarNavItem } from "./sidebar-nav-item";

export function StudioSidebar() {
  return (
    <Sidebar title="Creator Studio">
      <SidebarNavItem
        to="/studio"
        icon={LayoutDashboard}
        label="Overview"
        exact
      />
      <SidebarNavItem
        to="/studio/analytics"
        icon={BarChart3}
        label="Analytics"
      />
      <SidebarNavItem
        to="/studio/earnings"
        icon={Coins}
        label="Earnings"
      />
      <div className="my-2 border-t" />
      <SidebarNavItem
        to="/universes"
        icon={FileText}
        label="My Universes"
      />
    </Sidebar>
  );
}
