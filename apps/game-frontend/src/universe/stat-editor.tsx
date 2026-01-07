import { useState } from "react";
import type { Stat } from "@wdydn/shared";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Switch } from "@/shared/components/ui/switch";
import { cn } from "@/shared/lib/utils";
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Settings2,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible";
import { CalculationBuilder } from "@/universe/calculation-builder";

interface Props {
  stats: Stat[];
  onChange: (stats: Stat[]) => void;
}

const DEFAULT_STAT: Omit<Stat, "id"> = {
  name: "",
  description: "",
  type: "core",
  display: {
    icon: "circle",
    color: "text-gray-500",
    style: "number",
    showInCreator: true,
    showInSheet: true,
    order: 0,
  },
  range: { min: 1, max: 20 },
};

const ICON_OPTIONS = [
  "sword",
  "shield",
  "heart",
  "brain",
  "zap",
  "eye",
  "hand",
  "footprints",
  "flame",
  "droplet",
  "wind",
  "leaf",
  "star",
  "moon",
  "sun",
  "skull",
  "target",
  "crosshair",
  "activity",
  "cpu",
  "smile",
  "frown",
];

const COLOR_OPTIONS = [
  { value: "text-red-500", label: "Red" },
  { value: "text-orange-500", label: "Orange" },
  { value: "text-yellow-500", label: "Yellow" },
  { value: "text-green-500", label: "Green" },
  { value: "text-cyan-500", label: "Cyan" },
  { value: "text-blue-500", label: "Blue" },
  { value: "text-purple-500", label: "Purple" },
  { value: "text-pink-500", label: "Pink" },
  { value: "text-gray-500", label: "Gray" },
];

export function StatEditor({ stats, onChange }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const coreStats = stats.filter((s) => s.type === "core");
  const computedStats = stats.filter((s) => s.type === "computed");

  const addStat = (type: "core" | "computed") => {
    const newStat: Stat = {
      ...DEFAULT_STAT,
      id: crypto.randomUUID(),
      name: type === "core" ? "New Stat" : "New Computed",
      type,
      display: {
        ...DEFAULT_STAT.display,
        order: stats.length,
      },
      calculation: type === "computed" ? [] : undefined,
    };
    onChange([...stats, newStat]);
    setExpandedId(newStat.id);
  };

  const updateStat = (id: string, updates: Partial<Stat>) => {
    onChange(stats.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const deleteStat = (id: string) => {
    onChange(stats.filter((s) => s.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  return (
    <div className="space-y-6">
      {/* Core Stats */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            Core Stats
            <span className="text-xs bg-muted px-2 py-0.5 rounded">
              {coreStats.length}
            </span>
          </h3>
          <Button variant="outline" size="sm" onClick={() => addStat("core")}>
            <Plus className="h-3 w-3 mr-1" />
            Add Core
          </Button>
        </div>

        <div className="space-y-2">
          {coreStats.map((stat) => (
            <StatCard
              key={stat.id}
              stat={stat}
              allStats={stats}
              expanded={expandedId === stat.id}
              onToggle={() =>
                setExpandedId(expandedId === stat.id ? null : stat.id)
              }
              onChange={(updates) => updateStat(stat.id, updates)}
              onDelete={() => deleteStat(stat.id)}
            />
          ))}
          {coreStats.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No core stats defined yet
            </p>
          )}
        </div>
      </div>

      {/* Computed Stats */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Computed Stats
            <span className="text-xs bg-muted px-2 py-0.5 rounded">
              {computedStats.length}
            </span>
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addStat("computed")}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Computed
          </Button>
        </div>

        <div className="space-y-2">
          {computedStats.map((stat) => (
            <StatCard
              key={stat.id}
              stat={stat}
              allStats={stats}
              expanded={expandedId === stat.id}
              onToggle={() =>
                setExpandedId(expandedId === stat.id ? null : stat.id)
              }
              onChange={(updates) => updateStat(stat.id, updates)}
              onDelete={() => deleteStat(stat.id)}
            />
          ))}
          {computedStats.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No computed stats defined yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  stat,
  allStats,
  expanded,
  onToggle,
  onChange,
  onDelete,
}: {
  stat: Stat;
  allStats: Stat[];
  expanded: boolean;
  onToggle: () => void;
  onChange: (updates: Partial<Stat>) => void;
  onDelete: () => void;
}) {
  const coreStats = allStats.filter((s) => s.type === "core");

  return (
    <Collapsible open={expanded} onOpenChange={onToggle}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="p-3 cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              <div
                className={cn(
                  "w-8 h-8 rounded flex items-center justify-center bg-muted",
                  stat.display.color
                )}
              >
                {stat.short?.[0] || stat.name[0] || "?"}
              </div>
              <div className="flex-1">
                <CardTitle className="text-sm">
                  {stat.name || "Unnamed"}
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {stat.type === "core"
                    ? `Range: ${stat.range?.min}-${stat.range?.max}`
                    : "Calculated"}
                </p>
              </div>
              {expanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Name</Label>
                <Input
                  value={stat.name}
                  onChange={(e) => onChange({ name: e.target.value })}
                  placeholder="Stat name"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Short Name</Label>
                <Input
                  value={stat.short ?? ""}
                  onChange={(e) =>
                    onChange({ short: e.target.value || undefined })
                  }
                  placeholder="STR"
                  maxLength={4}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Description</Label>
              <Textarea
                value={stat.description}
                onChange={(e) => onChange({ description: e.target.value })}
                placeholder="What this stat represents..."
                rows={2}
              />
            </div>

            {/* Core stat: Range */}
            {stat.type === "core" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Min Value</Label>
                  <Input
                    type="number"
                    value={stat.range?.min ?? 1}
                    onChange={(e) =>
                      onChange({
                        range: {
                          ...stat.range,
                          min: Number.parseInt(e.target.value) || 0,
                          max: stat.range?.max ?? 20,
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Max Value</Label>
                  <Input
                    type="number"
                    value={stat.range?.max ?? 20}
                    onChange={(e) =>
                      onChange({
                        range: {
                          min: stat.range?.min ?? 1,
                          max: Number.parseInt(e.target.value) || 100,
                        },
                      })
                    }
                  />
                </div>
              </div>
            )}

            {/* Computed stat: Calculation */}
            {stat.type === "computed" && (
              <div className="space-y-1">
                <Label className="text-xs">Calculation</Label>
                <CalculationBuilder
                  tokens={stat.calculation ?? []}
                  onChange={(calculation) => onChange({ calculation })}
                  availableStats={coreStats}
                />
              </div>
            )}

            {/* Display Options */}
            <div className="space-y-3 border-t pt-3">
              <p className="text-xs font-medium text-muted-foreground">
                Display Options
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Icon</Label>
                  <Select
                    value={stat.display.icon}
                    onValueChange={(icon) =>
                      onChange({ display: { ...stat.display, icon } })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ICON_OPTIONS.map((icon) => (
                        <SelectItem key={icon} value={icon}>
                          {icon}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Color</Label>
                  <Select
                    value={stat.display.color}
                    onValueChange={(color) =>
                      onChange({ display: { ...stat.display, color } })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COLOR_OPTIONS.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          <span className={c.value}>{c.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-xs">Show in Character Creator</Label>
                <Switch
                  checked={stat.display.showInCreator !== false}
                  onCheckedChange={(showInCreator) =>
                    onChange({ display: { ...stat.display, showInCreator } })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-xs">Show in Character Sheet</Label>
                <Switch
                  checked={stat.display.showInSheet !== false}
                  onCheckedChange={(showInSheet) =>
                    onChange({ display: { ...stat.display, showInSheet } })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-xs">Display Style</Label>
                <Select
                  value={stat.display.style}
                  onValueChange={(style: "number" | "bar") =>
                    onChange({ display: { ...stat.display, style } })
                  }
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="bar">Bar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Delete */}
            <Button
              variant="destructive"
              size="sm"
              onClick={onDelete}
              className="w-full"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Delete Stat
            </Button>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
