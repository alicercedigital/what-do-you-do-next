import * as React from "react";
import type { v2 } from "@wdydn/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Switch } from "@/shared/components/ui/switch";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { EntityList } from "@/shared/components/ui/entity-list";
import { EntityIdBadge } from "@/shared/components/ui/entity-id-badge";
import { Package, Sword, Sparkles as SparklesIcon, Box } from "lucide-react";

import { useUniverseEditorStore, generateEntityId } from "../store/universe-editor-store";
import { AIFieldWrapper } from "./ai-field-wrapper";
import { ItemGenerator } from "./entity-generator";

type Item = v2.Item;

function createDefaultItem(): Item {
  return {
    id: generateEntityId("item", "new_item"),
    name: "New Item",
    description: "",
    kind: "object",
  };
}

const kindIcons = {
  equipment: Sword,
  consumable: SparklesIcon,
  object: Box,
};

const rarityColors: Record<string, string> = {
  common: "bg-slate-500/20 text-slate-400",
  uncommon: "bg-green-500/20 text-green-400",
  rare: "bg-blue-500/20 text-blue-400",
  epic: "bg-purple-500/20 text-purple-400",
  legendary: "bg-amber-500/20 text-amber-400",
};

export function ItemsEditor() {
  const [showGenerator, setShowGenerator] = React.useState(false);

  const {
    universe,
    selectedEntityId,
    selectEntity,
    addItem,
    updateItem,
    deleteItem,
  } = useUniverseEditorStore();

  if (!universe) return null;

  const selectedItem = universe.items.find((i) => i.id === selectedEntityId);

  const handleCreate = () => {
    const newItem = createDefaultItem();
    addItem(newItem);
  };

  const handleUpdate = (updates: Partial<Item>) => {
    if (selectedEntityId) {
      updateItem(selectedEntityId, updates);
    }
  };

  return (
    <div className="flex h-[calc(100vh-7rem)]">
      {/* List panel */}
      <div className="w-72 shrink-0">
        <EntityList
          items={universe.items}
          selectedId={selectedEntityId}
          onSelect={selectEntity}
          onCreate={handleCreate}
          onDelete={deleteItem}
          onGenerateWithAI={() => setShowGenerator(true)}
          searchPlaceholder="Search items..."
          createLabel="Add Item"
          deleteConfirmTitle="Delete Item"
          deleteConfirmDescription={(item) =>
            `Are you sure you want to delete "${item.name}"? Characters with this item will be affected.`
          }
          renderItem={(item) => {
            const Icon = kindIcons[item.kind] || Package;
            return (
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium">{item.name}</p>
                    {item.rarity && (
                      <span
                        className={`rounded px-1 py-0.5 text-[10px] ${
                          rarityColors[item.rarity] || ""
                        }`}
                      >
                        {item.rarity}
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-muted-foreground capitalize">
                    {item.kind}
                  </p>
                </div>
              </div>
            );
          }}
        />
      </div>

      {/* Detail panel */}
      <div className="flex-1 overflow-hidden">
        {selectedItem ? (
          <ScrollArea className="h-full">
            <div className="max-w-2xl space-y-6 p-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle>Basic Information</CardTitle>
                  <EntityIdBadge id={selectedItem.id} />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={selectedItem.name}
                      onChange={(e) => handleUpdate({ name: e.target.value })}
                      placeholder="Item Name"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <AIFieldWrapper
                      entityType="item"
                      field="description"
                      universe={universe}
                      currentEntity={selectedItem as unknown as Record<string, unknown>}
                      currentValue={selectedItem.description || ""}
                      onValueChange={(value) => handleUpdate({ description: value || undefined })}
                    >
                      <Textarea
                        id="description"
                        value={selectedItem.description}
                        onChange={(e) => handleUpdate({ description: e.target.value })}
                        placeholder="Describe this item..."
                        rows={3}
                      />
                    </AIFieldWrapper>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="kind">Type</Label>
                      <Select
                        value={selectedItem.kind}
                        onValueChange={(value: Item["kind"]) =>
                          handleUpdate({ kind: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="equipment">Equipment</SelectItem>
                          <SelectItem value="consumable">Consumable</SelectItem>
                          <SelectItem value="object">Object</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="rarity">Rarity</Label>
                      <Select
                        value={selectedItem.rarity || "common"}
                        onValueChange={(value) =>
                          handleUpdate({ rarity: value as Item["rarity"] })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="common">Common</SelectItem>
                          <SelectItem value="uncommon">Uncommon</SelectItem>
                          <SelectItem value="rare">Rare</SelectItem>
                          <SelectItem value="epic">Epic</SelectItem>
                          <SelectItem value="legendary">Legendary</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="icon">Icon URL</Label>
                    <Input
                      id="icon"
                      value={selectedItem.icon || ""}
                      onChange={(e) =>
                        handleUpdate({ icon: e.target.value || undefined })
                      }
                      placeholder="https://..."
                    />
                  </div>
                </CardContent>
              </Card>

              {selectedItem.kind === "equipment" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Equipment Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="slot">Equipment Slot</Label>
                      <Select
                        value={selectedItem.slot || ""}
                        onValueChange={(value) =>
                          handleUpdate({ slot: value || undefined })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select slot" />
                        </SelectTrigger>
                        <SelectContent>
                          {universe.config.equipmentSlots.map((slot) => (
                            <SelectItem key={slot} value={slot}>
                              {slot}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label>Stat Bonuses While Equipped</Label>
                      <div className="space-y-2">
                        {universe.stats
                          .filter((s) => s.type === "number")
                          .map((stat) => {
                            const bonus = selectedItem.whileEquipped?.find(
                              (b) => b.statId === stat.id
                            );
                            return (
                              <div
                                key={stat.id}
                                className="flex items-center gap-2"
                              >
                                <Label className="w-32">{stat.name}</Label>
                                <Input
                                  type="number"
                                  value={bonus?.amount || 0}
                                  onChange={(e) => {
                                    const amount = parseFloat(e.target.value) || 0;
                                    const existing =
                                      selectedItem.whileEquipped || [];
                                    const filtered = existing.filter(
                                      (b) => b.statId !== stat.id
                                    );
                                    if (amount !== 0) {
                                      filtered.push({ statId: stat.id, amount });
                                    }
                                    handleUpdate({
                                      whileEquipped:
                                        filtered.length > 0 ? filtered : undefined,
                                    });
                                  }}
                                  className="w-24"
                                />
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {selectedItem.kind === "consumable" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Consumable Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2">
                      <Label>On Use Effects</Label>
                      <Textarea
                        value={(selectedItem.onUse || []).join("\n")}
                        onChange={(e) =>
                          handleUpdate({
                            onUse: e.target.value
                              .split("\n")
                              .map((s) => s.trim())
                              .filter(Boolean),
                          })
                        }
                        placeholder="Enter effects, one per line...
Example: character.$player.stats.health += 50"
                        rows={4}
                      />
                      <p className="text-xs text-muted-foreground">
                        Consequences applied when item is used (one per line)
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Stacking</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <Label htmlFor="stackable">Stackable</Label>
                      <p className="text-sm text-muted-foreground">
                        Can multiple of this item stack together?
                      </p>
                    </div>
                    <Switch
                      id="stackable"
                      checked={selectedItem.stackable === true}
                      onCheckedChange={(checked) =>
                        handleUpdate({ stackable: checked || undefined })
                      }
                    />
                  </div>

                  {selectedItem.stackable && (
                    <div className="grid gap-2">
                      <Label htmlFor="maxStack">Max Stack Size</Label>
                      <Input
                        id="maxStack"
                        type="number"
                        min={1}
                        value={selectedItem.maxStack || 99}
                        onChange={(e) =>
                          handleUpdate({
                            maxStack: parseInt(e.target.value) || undefined,
                          })
                        }
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Select an item to edit or create a new one
          </div>
        )}
      </div>

      {/* AI Item Generator */}
      <ItemGenerator
        open={showGenerator}
        onOpenChange={setShowGenerator}
        universe={universe}
        onAccept={(item) => {
          addItem(item);
          selectEntity(item.id);
        }}
      />
    </div>
  );
}
