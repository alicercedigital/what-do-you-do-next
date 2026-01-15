import { cn } from "@/shared/lib/utils";
import {
  Wand2,
  Settings,
  BarChart3,
  Users,
  MapPin,
  Package,
  Swords,
  BookOpen,
} from "lucide-react";

import { useUniverseEditorStore, type EditorTab } from "../store/universe-editor-store";

interface TabItem {
  id: EditorTab;
  label: string;
  icon: React.ElementType;
  count?: number;
}

export function EditorTabs() {
  const { universe, activeTab, setActiveTab } = useUniverseEditorStore();

  if (!universe) return null;

  const tabs: TabItem[] = [
    { id: "helper", label: "Helper", icon: Wand2 },
    { id: "overview", label: "Overview", icon: Settings },
    { id: "stats", label: "Stats", icon: BarChart3, count: universe.stats.length },
    { id: "characters", label: "Characters", icon: Users, count: universe.characters.length },
    { id: "locations", label: "Locations", icon: MapPin, count: universe.locations.length },
    { id: "items", label: "Items", icon: Package, count: universe.items.length },
    { id: "challenges", label: "Challenges", icon: Swords, count: universe.challenges.length },
    { id: "moments", label: "Moments", icon: BookOpen, count: universe.moments.length },
  ];

  return (
    <nav className="flex border-b bg-card/50">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
              isActive
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={cn(
                  "ml-1 rounded-full px-1.5 py-0.5 text-xs",
                  isActive
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
