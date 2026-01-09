import type { v2 } from "@wdydn/shared";
import { Badge } from "@/shared/components/ui/badge";
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

import { useUniverseEditorStore } from "../store/universe-editor-store";

type Stat = v2.Stat;

function createDefaultStat(): Stat {
  return {
    id: `stat_${Date.now()}`,
    name: "New Stat",
    type: "number",
    base: 0,
  };
}

export function StatsEditor() {
  const {
    universe,
    selectedEntityId,
    selectEntity,
    addStat,
    updateStat,
    deleteStat,
  } = useUniverseEditorStore();

  if (!universe) return null;

  const selectedStat = universe.stats.find((s) => s.id === selectedEntityId);

  const handleCreate = () => {
    const newStat = createDefaultStat();
    addStat(newStat);
  };

  const handleUpdate = (updates: Partial<Stat>) => {
    if (selectedEntityId) {
      updateStat(selectedEntityId, updates);
    }
  };

  return (
    <div className="flex h-[calc(100vh-7rem)]">
      {/* List panel */}
      <div className="w-72 shrink-0">
        <EntityList
          items={universe.stats}
          selectedId={selectedEntityId}
          onSelect={selectEntity}
          onCreate={handleCreate}
          onDelete={deleteStat}
          searchPlaceholder="Search stats..."
          createLabel="Add Stat"
          deleteConfirmTitle="Delete Stat"
          deleteConfirmDescription={(stat) =>
            `Are you sure you want to delete the stat "${stat.name}"? Characters using this stat may be affected.`
          }
          renderItem={(stat, isSelected) => (
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="truncate font-medium">{stat.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {stat.id}
                </p>
              </div>
              <Badge
                variant={isSelected ? "default" : "secondary"}
                className="ml-2 shrink-0"
              >
                {stat.type}
              </Badge>
            </div>
          )}
        />
      </div>

      {/* Detail panel */}
      <div className="flex-1 overflow-hidden">
        {selectedStat ? (
          <ScrollArea className="h-full">
            <div className="max-w-2xl space-y-6 p-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="id">ID</Label>
                      <Input
                        id="id"
                        value={selectedStat.id}
                        onChange={(e) => handleUpdate({ id: e.target.value })}
                        placeholder="stat_id"
                      />
                      <p className="text-xs text-muted-foreground">
                        Used in expressions: stats.{selectedStat.id}
                      </p>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={selectedStat.name}
                        onChange={(e) => handleUpdate({ name: e.target.value })}
                        placeholder="Stat Name"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="short">Short Name</Label>
                      <Input
                        id="short"
                        value={selectedStat.short || ""}
                        onChange={(e) => handleUpdate({ short: e.target.value || undefined })}
                        placeholder="STR, DEX, etc."
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="type">Type</Label>
                      <Select
                        value={selectedStat.type}
                        onValueChange={(value: "number" | "boolean" | "text") =>
                          handleUpdate({ type: value, base: value === "number" ? 0 : value === "boolean" ? false : "" })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="boolean">Boolean</SelectItem>
                          <SelectItem value="text">Text</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={selectedStat.description || ""}
                      onChange={(e) => handleUpdate({ description: e.target.value || undefined })}
                      placeholder="What does this stat represent?"
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Value Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedStat.type === "number" && (
                    <>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                          <Label htmlFor="base">Base Value</Label>
                          <Input
                            id="base"
                            type="number"
                            value={typeof selectedStat.base === "number" ? selectedStat.base : 0}
                            onChange={(e) =>
                              handleUpdate({ base: parseFloat(e.target.value) || 0 })
                            }
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="formula">Formula (optional)</Label>
                          <Input
                            id="formula"
                            value={selectedStat.formula || ""}
                            onChange={(e) => handleUpdate({ formula: e.target.value || undefined })}
                            placeholder="$base + stats.strength / 2"
                          />
                          <p className="text-xs text-muted-foreground">
                            Use $base for the base value, stats.X for other stats
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                          <Label htmlFor="min">Minimum</Label>
                          <Input
                            id="min"
                            type="number"
                            value={selectedStat.range?.min ?? ""}
                            onChange={(e) =>
                              handleUpdate({
                                range: {
                                  min: e.target.value ? parseFloat(e.target.value) : 0,
                                  max: selectedStat.range?.max ?? 100,
                                },
                              })
                            }
                            placeholder="No minimum"
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="max">Maximum</Label>
                          <Input
                            id="max"
                            type="number"
                            value={selectedStat.range?.max ?? ""}
                            onChange={(e) =>
                              handleUpdate({
                                range: {
                                  min: selectedStat.range?.min ?? 0,
                                  max: e.target.value ? parseFloat(e.target.value) : 100,
                                },
                              })
                            }
                            placeholder="No maximum"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {selectedStat.type === "boolean" && (
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <Label htmlFor="boolBase">Default Value</Label>
                        <p className="text-sm text-muted-foreground">
                          Initial value for new characters
                        </p>
                      </div>
                      <Switch
                        id="boolBase"
                        checked={selectedStat.base === true}
                        onCheckedChange={(checked) => handleUpdate({ base: checked })}
                      />
                    </div>
                  )}

                  {selectedStat.type === "text" && (
                    <div className="grid gap-2">
                      <Label htmlFor="textBase">Default Value</Label>
                      <Input
                        id="textBase"
                        value={typeof selectedStat.base === "string" ? selectedStat.base : ""}
                        onChange={(e) => handleUpdate({ base: e.target.value })}
                        placeholder="Default text value"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Display Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="displayStyle">Display Style</Label>
                      <Select
                        value={selectedStat.display?.style || "number"}
                        onValueChange={(value: "number" | "bar" | "badge" | "hidden") =>
                          handleUpdate({
                            display: { ...selectedStat.display, style: value },
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="bar">Progress Bar</SelectItem>
                          <SelectItem value="badge">Badge</SelectItem>
                          <SelectItem value="hidden">Hidden</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="color">Color</Label>
                      <Input
                        id="color"
                        value={selectedStat.display?.color || ""}
                        onChange={(e) =>
                          handleUpdate({
                            display: { ...selectedStat.display, color: e.target.value || undefined },
                          })
                        }
                        placeholder="#ff0000 or red"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="icon">Icon URL</Label>
                      <Input
                        id="icon"
                        value={selectedStat.display?.icon || ""}
                        onChange={(e) =>
                          handleUpdate({
                            display: { ...selectedStat.display, icon: e.target.value || undefined },
                          })
                        }
                        placeholder="https://..."
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="order">Display Order</Label>
                      <Input
                        id="order"
                        type="number"
                        value={selectedStat.display?.order ?? ""}
                        onChange={(e) =>
                          handleUpdate({
                            display: {
                              ...selectedStat.display,
                              order: e.target.value ? parseInt(e.target.value) : undefined,
                            },
                          })
                        }
                        placeholder="Auto"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="showInSheet"
                        checked={selectedStat.display?.showInSheet !== false}
                        onCheckedChange={(checked) =>
                          handleUpdate({
                            display: { ...selectedStat.display, showInSheet: checked },
                          })
                        }
                      />
                      <Label htmlFor="showInSheet">Show in Character Sheet</Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        id="showInCreator"
                        checked={selectedStat.display?.showInCreator === true}
                        onCheckedChange={(checked) =>
                          handleUpdate({
                            display: { ...selectedStat.display, showInCreator: checked },
                          })
                        }
                      />
                      <Label htmlFor="showInCreator">Show in Creator</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Select a stat to edit or create a new one
          </div>
        )}
      </div>
    </div>
  );
}
