import * as React from "react";
import type { v2 } from "@wdydn/shared";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

type Universe = v2.Universe;

interface PathAutocompleteProps {
  universe: Universe;
  onSelect: (path: string) => void;
}

type PathCategory = "character" | "moment" | "stats" | "globalStats";

export function PathAutocomplete({ universe, onSelect }: PathAutocompleteProps) {
  const [category, setCategory] = React.useState<PathCategory>("character");
  const [entityId, setEntityId] = React.useState<string>("");
  const [property, setProperty] = React.useState<string>("");

  const categories: { value: PathCategory; label: string }[] = [
    { value: "character", label: "Character" },
    { value: "moment", label: "Moment" },
    { value: "stats", label: "Stats (shorthand)" },
    { value: "globalStats", label: "Global Stats" },
  ];

  const getEntities = () => {
    switch (category) {
      case "character":
        return [
          { id: "$player", name: "$player (current player)" },
          ...universe.characters.map((c) => ({ id: c.id, name: c.name })),
        ];
      case "moment":
        return [
          { id: "$self", name: "$self (current moment)" },
          ...universe.moments.map((m) => ({
            id: m.id,
            name: m.title || m.id,
          })),
        ];
      default:
        return [];
    }
  };

  const getProperties = () => {
    switch (category) {
      case "character":
        return [
          { id: "stats.", name: "stats.*" },
          { id: "disposition.", name: "disposition.*" },
          ...universe.stats.map((s) => ({
            id: `stats.${s.id}`,
            name: `stats.${s.id} (${s.name})`,
          })),
        ];
      case "moment":
        return [
          { id: "status", name: "status" },
          { id: "locationId", name: "locationId" },
        ];
      case "stats":
        return universe.stats.map((s) => ({
          id: s.id,
          name: `${s.id} (${s.name})`,
        }));
      case "globalStats":
        return [{ id: "custom", name: "Enter custom key" }];
      default:
        return [];
    }
  };

  const buildPath = () => {
    switch (category) {
      case "character":
        if (entityId && property) {
          return `character.${entityId}.${property}`;
        }
        return "";
      case "moment":
        if (entityId && property) {
          // Add wildcard suffix for moment instances
          const suffix = entityId === "$self" ? "" : "-*";
          return `moment.${entityId}${suffix}.${property}`;
        }
        return "";
      case "stats":
        if (property) {
          return `stats.${property}`;
        }
        return "";
      case "globalStats":
        if (property) {
          return `globalStats.${property}`;
        }
        return "";
      default:
        return "";
    }
  };

  const handleInsert = () => {
    const path = buildPath();
    if (path) {
      onSelect(path);
      setEntityId("");
      setProperty("");
    }
  };

  const entities = getEntities();
  const properties = getProperties();
  const needsEntity = category === "character" || category === "moment";

  return (
    <div>
      <div className="mb-2 text-xs font-medium text-muted-foreground">
        Path Builder
      </div>
      <div className="flex flex-wrap gap-2 items-end">
        <div className="flex-1 min-w-[120px]">
          <label className="text-[10px] text-muted-foreground">Category</label>
          <Select
            value={category}
            onValueChange={(v: PathCategory) => {
              setCategory(v);
              setEntityId("");
              setProperty("");
            }}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {needsEntity && (
          <div className="flex-1 min-w-[120px]">
            <label className="text-[10px] text-muted-foreground">Entity</label>
            <Select value={entityId} onValueChange={setEntityId}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {entities.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex-1 min-w-[120px]">
          <label className="text-[10px] text-muted-foreground">Property</label>
          <Select value={property} onValueChange={setProperty}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {properties.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          type="button"
          size="sm"
          className="h-8"
          onClick={handleInsert}
          disabled={!buildPath()}
        >
          Insert
        </Button>
      </div>

      {buildPath() && (
        <div className="mt-2 rounded bg-muted px-2 py-1 font-mono text-xs">
          {buildPath()}
        </div>
      )}
    </div>
  );
}
