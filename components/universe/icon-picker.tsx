"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import * as Lucide from "lucide-react";
import { useCallback, useMemo, useState } from "react";

// Curated list of commonly used icons for quick access
export const COMMON_ICONS = [
  "heart",
  "zap",
  "shield",
  "sword",
  "brain",
  "eye",
  "hand",
  "footprints",
  "flame",
  "snowflake",
  "droplet",
  "wind",
  "star",
  "moon",
  "sun",
  "sparkles",
  "target",
  "crosshair",
  "activity",
  "battery",
  "gauge",
  "timer",
  "clock",
  "hourglass",
  "crown",
  "gem",
  "coins",
  "trophy",
  "medal",
  "award",
  "skull",
  "ghost",
  "bug",
  "leaf",
  "tree",
  "mountain",
  "waves",
  "cloud",
  "lightning",
  "circle",
  "square",
  "triangle",
  "hexagon",
  "octagon",
  "pentagon",
];

// Get icon component by name - supports any Lucide icon
export function getIconComponent(name: string): React.ComponentType<any> {
  if (!name) return Lucide.Circle;

  // Try to find the icon in Lucide
  const iconKey = name.charAt(0).toUpperCase() + name.slice(1);
  const IconComponent = (Lucide as any)[iconKey];

  return IconComponent || Lucide.Circle;
}

interface IconPickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function IconPicker({ value, onChange, className }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Get all available Lucide icon names
  const allIconNames = useMemo(() => {
    return Object.keys(Lucide).filter((key) => {
      const value = (Lucide as any)[key];
      return typeof value === "function" && value.displayName;
    });
  }, []);

  const filteredIcons = useMemo(() => {
    const searchLower = search.toLowerCase();

    // If no search, show common icons first, then allow typing any icon name
    if (!searchLower) {
      return COMMON_ICONS;
    }

    // Filter all available icons by search
    const matchingIcons = allIconNames.filter((name) =>
      name.toLowerCase().includes(searchLower)
    );

    // If no matches but user typed something, allow it as a custom icon name
    if (matchingIcons.length === 0 && searchLower.length > 2) {
      return [searchLower];
    }

    return matchingIcons.slice(0, 50); // Limit results
  }, [search, allIconNames]);

  const handleSelect = useCallback(
    (iconName: string) => {
      onChange(iconName);
      setOpen(false);
      setSearch("");
    },
    [onChange]
  );

  const SelectedIcon = getIconComponent(value);

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start gap-2 bg-transparent",
              className
            )}
          >
            <SelectedIcon className="h-4 w-4" />
            <span className="capitalize truncate">
              {value || "Select icon"}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-0" align="start">
          <div className="p-2 border-b">
            <Input
              placeholder="Search icons or type any Lucide icon name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9"
            />
          </div>
          <ScrollArea className="h-64">
            <div className="grid grid-cols-6 gap-1 p-2">
              {filteredIcons.map((name) => {
                const Icon = getIconComponent(name);
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => handleSelect(name)}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded hover:bg-accent transition-colors",
                      value === name && "bg-accent ring-1 ring-primary",
                      !COMMON_ICONS.includes(name) && search && "opacity-70"
                    )}
                    title={name}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
            {filteredIcons.length === 0 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No icons found. Try a different search.
              </div>
            )}
          </ScrollArea>
          <div className="p-2 border-t text-xs text-muted-foreground">
            {search
              ? "Type any Lucide icon name"
              : "Common icons shown. Search for more."}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
