import * as React from "react";
import type { v2 } from "@wdydn/shared";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Badge } from "@/shared/components/ui/badge";
import { EntityGeneratorDialog } from "./entity-generator-dialog";
import { useEntityGenerator } from "../../ai";

type Stat = v2.Stat;
type Universe = v2.Universe;

interface StatGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  universe: Universe;
  onAccept: (stat: Stat) => void;
}

const STAT_CATEGORIES = [
  { value: "attribute", label: "Attribute", description: "Core character traits (STR, DEX, INT)" },
  { value: "skill", label: "Skill", description: "Learned abilities (Combat, Stealth, Magic)" },
  { value: "resource", label: "Resource", description: "Expendable values (Health, Mana, Gold)" },
  { value: "status", label: "Status", description: "Flags and conditions (Poisoned, Blessed)" },
  { value: "relationship", label: "Relationship", description: "NPC affinity and reputation" },
];

const STAT_TYPES = [
  { value: "number", label: "Number" },
  { value: "boolean", label: "Boolean" },
  { value: "text", label: "Text" },
];

export function StatGenerator({
  open,
  onOpenChange,
  universe,
  onAccept,
}: StatGeneratorProps) {
  const [category, setCategory] = React.useState("attribute");
  const [statType, setStatType] = React.useState<Stat["type"]>("number");
  const [hints, setHints] = React.useState("");

  const { state, generatedEntity, generate, reset } = useEntityGenerator<Stat>(
    "stat",
    universe,
    {
      category,
      type: statType,
      hints,
    }
  );

  const handleGenerate = () => {
    generate();
  };

  const handleAccept = () => {
    if (generatedEntity) {
      onAccept(generatedEntity);
      reset();
      onOpenChange(false);
    }
  };

  const handleRegenerate = () => {
    generate();
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset();
    }
    onOpenChange(newOpen);
  };

  return (
    <EntityGeneratorDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Generate Stat"
      description="Use AI to create a new stat for your universe"
      isGenerating={state.isLoading}
      hasPreview={!!generatedEntity}
      onGenerate={handleGenerate}
      onAccept={handleAccept}
      onRegenerate={handleRegenerate}
      preview={
        generatedEntity ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium">{generatedEntity.name}</span>
              <Badge variant="outline">{generatedEntity.type}</Badge>
              {generatedEntity.short && (
                <Badge variant="secondary">{generatedEntity.short}</Badge>
              )}
            </div>
            {generatedEntity.description && (
              <p className="text-sm text-muted-foreground">
                {generatedEntity.description}
              </p>
            )}
            <div className="grid grid-cols-2 gap-2 text-sm">
              {generatedEntity.type === "number" && (
                <>
                  <div>
                    <span className="text-muted-foreground">Base: </span>
                    {generatedEntity.base}
                  </div>
                  {generatedEntity.range?.min !== undefined && (
                    <div>
                      <span className="text-muted-foreground">Min: </span>
                      {generatedEntity.range.min}
                    </div>
                  )}
                  {generatedEntity.range?.max !== undefined && (
                    <div>
                      <span className="text-muted-foreground">Max: </span>
                      {generatedEntity.range.max}
                    </div>
                  )}
                </>
              )}
              {generatedEntity.type === "boolean" && (
                <div>
                  <span className="text-muted-foreground">Default: </span>
                  {generatedEntity.base ? "true" : "false"}
                </div>
              )}
              {generatedEntity.type === "text" && generatedEntity.base && (
                <div>
                  <span className="text-muted-foreground">Default: </span>
                  {String(generatedEntity.base)}
                </div>
              )}
            </div>
            {generatedEntity.display?.color && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Color:</span>
                <div
                  className="h-4 w-4 rounded"
                  style={{ backgroundColor: generatedEntity.display.color }}
                />
                <span className="text-xs text-muted-foreground">
                  {generatedEntity.display.color}
                </span>
              </div>
            )}
          </div>
        ) : null
      }
    >
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label>Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STAT_CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  <div>
                    <div>{cat.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {cat.description}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>Type</Label>
          <Select
            value={statType}
            onValueChange={(v) => setStatType(v as Stat["type"])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STAT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="hints">Additional Hints (optional)</Label>
          <Input
            id="hints"
            value={hints}
            onChange={(e) => setHints(e.target.value)}
            placeholder="e.g., medieval fantasy, combat-focused, simple..."
          />
          <p className="text-xs text-muted-foreground">
            Provide any additional context to guide the AI generation
          </p>
        </div>

        {state.error && (
          <div className="rounded bg-red-500/10 px-3 py-2 text-sm text-red-500">
            {state.error}
          </div>
        )}
      </div>
    </EntityGeneratorDialog>
  );
}
