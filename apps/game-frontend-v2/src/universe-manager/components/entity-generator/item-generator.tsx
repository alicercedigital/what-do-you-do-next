import * as React from "react";
import type { v2 } from "@wdydn/shared";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
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

type Item = v2.Item;
type Universe = v2.Universe;

interface ItemGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  universe: Universe;
  onAccept: (item: Item) => void;
}

const ITEM_KINDS = [
  { value: "equipment", label: "Equipment", description: "Wearable items with stat bonuses" },
  { value: "consumable", label: "Consumable", description: "One-time use items" },
  { value: "object", label: "Object", description: "Key items and misc objects" },
];

const ITEM_RARITIES = [
  { value: "common", label: "Common", color: "text-slate-400" },
  { value: "uncommon", label: "Uncommon", color: "text-green-400" },
  { value: "rare", label: "Rare", color: "text-blue-400" },
  { value: "epic", label: "Epic", color: "text-purple-400" },
  { value: "legendary", label: "Legendary", color: "text-amber-400" },
];

const ITEM_PURPOSES = [
  { value: "weapon", label: "Weapon" },
  { value: "armor", label: "Armor" },
  { value: "accessory", label: "Accessory" },
  { value: "healing", label: "Healing" },
  { value: "buff", label: "Buff" },
  { value: "utility", label: "Utility" },
  { value: "quest", label: "Quest Item" },
  { value: "treasure", label: "Treasure" },
  { value: "custom", label: "Custom" },
];

export function ItemGenerator({
  open,
  onOpenChange,
  universe,
  onAccept,
}: ItemGeneratorProps) {
  const [kind, setKind] = React.useState<Item["kind"]>("equipment");
  const [rarity, setRarity] = React.useState<Item["rarity"]>("common");
  const [purpose, setPurpose] = React.useState("custom");
  const [slot, setSlot] = React.useState("");
  const [hints, setHints] = React.useState("");

  const { state, generatedEntity, generate, reset } = useEntityGenerator<Item>(
    "item",
    universe,
    {
      kind,
      rarity,
      purpose,
      slot: slot || undefined,
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
      title="Generate Item"
      description="Use AI to create a new item for your universe"
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
              <Badge variant="outline" className="capitalize">
                {generatedEntity.kind}
              </Badge>
              {generatedEntity.rarity && (
                <Badge
                  variant="secondary"
                  className={`capitalize ${
                    ITEM_RARITIES.find((r) => r.value === generatedEntity.rarity)
                      ?.color || ""
                  }`}
                >
                  {generatedEntity.rarity}
                </Badge>
              )}
            </div>
            {generatedEntity.description && (
              <p className="text-sm text-muted-foreground">
                {generatedEntity.description}
              </p>
            )}
            <div className="grid grid-cols-2 gap-2 text-sm">
              {generatedEntity.slot && (
                <div>
                  <span className="text-muted-foreground">Slot: </span>
                  {generatedEntity.slot}
                </div>
              )}
              {generatedEntity.stackable && (
                <div>
                  <span className="text-muted-foreground">Max Stack: </span>
                  {generatedEntity.maxStack || 99}
                </div>
              )}
            </div>
            {generatedEntity.whileEquipped && generatedEntity.whileEquipped.length > 0 && (
              <div>
                <span className="text-xs font-medium text-muted-foreground">
                  While Equipped:{" "}
                </span>
                <ul className="mt-1 text-sm">
                  {generatedEntity.whileEquipped.map((bonus, i) => {
                    const stat = universe.stats.find((s) => s.id === bonus.statId);
                    const sign = bonus.amount > 0 ? "+" : "";
                    return (
                      <li key={i}>
                        {stat?.name || bonus.statId}: {sign}
                        {bonus.amount}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            {generatedEntity.onUse && generatedEntity.onUse.length > 0 && (
              <div>
                <span className="text-xs font-medium text-muted-foreground">
                  On Use:{" "}
                </span>
                <ul className="mt-1 text-sm list-disc list-inside">
                  {generatedEntity.onUse.map((effect, i) => (
                    <li key={i} className="truncate font-mono text-xs">
                      {effect}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : null
      }
    >
      <div className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="grid gap-2">
            <Label>Kind</Label>
            <Select value={kind} onValueChange={(v) => setKind(v as Item["kind"])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ITEM_KINDS.map((k) => (
                  <SelectItem key={k.value} value={k.value}>
                    <div>
                      <div>{k.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {k.description}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Rarity</Label>
            <Select
              value={rarity || "common"}
              onValueChange={(v) => setRarity(v as Item["rarity"])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ITEM_RARITIES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    <span className={r.color}>{r.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Purpose</Label>
            <Select value={purpose} onValueChange={setPurpose}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ITEM_PURPOSES.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {kind === "equipment" && universe.config.equipmentSlots.length > 0 && (
          <div className="grid gap-2">
            <Label>Equipment Slot</Label>
            <Select value={slot} onValueChange={setSlot}>
              <SelectTrigger>
                <SelectValue placeholder="Select a slot" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Auto-detect</SelectItem>
                {universe.config.equipmentSlots.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="grid gap-2">
          <Label htmlFor="hints">Additional Hints (optional)</Label>
          <Textarea
            id="hints"
            value={hints}
            onChange={(e) => setHints(e.target.value)}
            placeholder="e.g., ancient blade with fire enchantment, health potion with side effects..."
            rows={2}
          />
          <p className="text-xs text-muted-foreground">
            Describe effects, appearance, or lore details
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
