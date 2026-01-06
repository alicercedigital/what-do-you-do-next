"use client";

import { useState, useMemo } from "react";
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type {
  GameAttribute,
  FormulaToken,
  AttributeDisplayConfig,
  DistributableConfig,
  DerivedConfig,
} from "@/lib/schemas/game-entity-schema";
import { SmartInput } from "@/components/ui/smart-input";
import { FormulaBuilder } from "./formula-builder";
import { IconPicker, getIconComponent } from "./icon-picker";
import { ColorPicker } from "./color-picker";
import { cn } from "@/lib/utils";
import { EditorShell } from "./editor-shell";

interface AttributeEditorProps {
  attribute: GameAttribute | null;
  allAttributes: GameAttribute[]; // All attributes in the universe for formula builder
  universeContext: { name: string; setting: string }; // For AI context
  onSave: (attribute: GameAttribute) => void;
  onCancel: () => void;
}

const DEFAULT_DISPLAY_CONFIG: AttributeDisplayConfig = {
  displayType: "number",
  icon: "circle",
  iconColor: "text-foreground",
  barColor: "bg-green-500",
  barBackgroundColor: "bg-green-900",
  showPercentage: false,
  showOnCharacterSheet: true,
  position: 0,
  width: "full",
};

const DEFAULT_DISTRIBUTABLE_CONFIG: DistributableConfig = {
  minValue: 1,
  maxValue: 10,
  benchmarks: [
    { value: 1, label: "", description: "" },
    { value: 5, label: "", description: "" },
    { value: 10, label: "", description: "" },
  ],
};

const DEFAULT_DERIVED_CONFIG: DerivedConfig = {
  formula: [],
  minValue: undefined,
  maxValue: undefined,
};

export function AttributeEditor({
  attribute,
  allAttributes,
  universeContext,
  onSave,
  onCancel,
}: AttributeEditorProps) {
  const [data, setData] = useState<GameAttribute>(() => {
    if (attribute) {
      return {
        ...attribute,
        display: { ...DEFAULT_DISPLAY_CONFIG, ...attribute.display },
        distributableConfig:
          attribute.distributableConfig || DEFAULT_DISTRIBUTABLE_CONFIG,
        derivedConfig: attribute.derivedConfig || DEFAULT_DERIVED_CONFIG,
      };
    }
    return {
      id: crypto.randomUUID(),
      name: "",
      shortName: "",
      summary: "",
      category: "distributable",
      display: DEFAULT_DISPLAY_CONFIG,
      distributableConfig: DEFAULT_DISTRIBUTABLE_CONFIG,
      derivedConfig: DEFAULT_DERIVED_CONFIG,
    };
  });

  const [activeTab, setActiveTab] = useState<"basic" | "config" | "display">(
    "basic"
  );
  const [showBenchmarks, setShowBenchmarks] = useState(true);

  // Filter out current attribute from available list for formula
  const otherAttributes = useMemo(() => {
    return allAttributes.filter((a) => a.id !== data.id);
  }, [allAttributes, data.id]);

  const updateData = (updates: Partial<GameAttribute>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const updateDisplay = (updates: Partial<AttributeDisplayConfig>) => {
    setData((prev) => ({
      ...prev,
      display: { ...prev.display, ...updates },
    }));
  };

  const updateDistributableConfig = (updates: Partial<DistributableConfig>) => {
    setData((prev) => ({
      ...prev,
      distributableConfig: { ...prev.distributableConfig!, ...updates },
    }));
  };

  const updateDerivedConfig = (updates: Partial<DerivedConfig>) => {
    setData((prev) => ({
      ...prev,
      derivedConfig: { ...prev.derivedConfig!, ...updates },
    }));
  };

  const updateBenchmark = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const updated = [...(data.distributableConfig?.benchmarks || [])];
    updated[index] = { ...updated[index], [field]: value };
    updateDistributableConfig({ benchmarks: updated });
  };

  const addBenchmark = () => {
    const benchmarks = data.distributableConfig?.benchmarks || [];
    const nextValue =
      benchmarks.length > 0 ? benchmarks[benchmarks.length - 1].value + 1 : 1;
    updateDistributableConfig({
      benchmarks: [
        ...benchmarks,
        { value: nextValue, label: "", description: "" },
      ],
    });
  };

  const removeBenchmark = (index: number) => {
    const benchmarks = data.distributableConfig?.benchmarks || [];
    if (benchmarks.length <= 1) return;
    updateDistributableConfig({
      benchmarks: benchmarks.filter((_, i) => i !== index),
    });
  };

  const handleFormulaChange = (tokens: FormulaToken[]) => {
    updateDerivedConfig({ formula: tokens });
  };

  const canSave = data.name.trim().length > 0;

  const Icon = getIconComponent(data.display.icon);

  return (
    <EditorShell
      title="Attribute"
      subtitle={attribute ? `Editing: ${attribute.name}` : undefined}
      isEditing={!!attribute}
      onSave={() => onSave(data)}
      onCancel={onCancel}
      canSave={canSave}
    >
      {/* Preview Card */}
      <Card className="mb-6 bg-secondary/30">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-2 rounded-lg bg-background",
                data.display.iconColor
              )}
            >
              <Icon className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">
                  {data.name || "Attribute Name"}
                </span>
                {data.shortName && (
                  <span className="text-sm text-muted-foreground">
                    ({data.shortName})
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {data.summary || "Attribute summary..."}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-muted-foreground uppercase">
                {data.category === "distributable"
                  ? "Distributable"
                  : "Derived"}
              </span>
            </div>
          </div>

          {/* Bar preview for bar display type */}
          {data.display.displayType === "bar" && (
            <div className="mt-3">
              <div
                className={cn(
                  "h-3 rounded-full",
                  data.display.barBackgroundColor || "bg-secondary"
                )}
              >
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    data.display.barColor || "bg-primary"
                  )}
                  style={{ width: "65%" }}
                />
              </div>
              {data.display.showPercentage && (
                <p className="text-xs text-muted-foreground text-center mt-1">
                  65%
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Editor Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as typeof activeTab)}
      >
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="display">Display</TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic">
          <Card className="py-4">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Define the attribute name, type, and description
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <SmartInput
                  value={data.name}
                  onChange={(value) => updateData({ name: value })}
                  placeholder="e.g., Strength, Health Points, Mana"
                  fieldType="attribute-name"
                  context={{
                    universeName: universeContext.name,
                    setting: universeContext.setting,
                    attributeCategory: data.category,
                    existingAttributes: otherAttributes.map((a) => a.name),
                  }}
                />
              </div>

              {/* Short Name */}
              <div className="space-y-2">
                <Label htmlFor="shortName">Short Name (optional)</Label>
                <Input
                  id="shortName"
                  placeholder="e.g., STR, HP, MP"
                  value={data.shortName || ""}
                  onChange={(e) => updateData({ shortName: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Used in compact UI displays
                </p>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={data.category}
                  onValueChange={(v) =>
                    updateData({ category: v as "distributable" | "derived" })
                  }
                >
                  <SelectTrigger className="bg-transparent">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="distributable">
                      <div className="flex flex-col items-start">
                        <span>Distributable</span>
                        <span className="text-xs text-muted-foreground">
                          Players assign points (e.g., Strength)
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="derived">
                      <div className="flex flex-col items-start">
                        <span>Derived</span>
                        <span className="text-xs text-muted-foreground">
                          Calculated from formula (e.g., HP)
                        </span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Summary */}
              <div className="space-y-2">
                <Label htmlFor="summary">Summary</Label>
                <SmartInput
                  value={data.summary}
                  onChange={(value) => updateData({ summary: value })}
                  placeholder="What this attribute represents..."
                  multiline
                  rows={3}
                  fieldType="attribute-summary"
                  context={{
                    universeName: universeContext.name,
                    setting: universeContext.setting,
                    attributeName: data.name,
                    attributeCategory: data.category,
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuration Tab */}
        <TabsContent value="config">
          <Card className="py-4">
            <CardHeader>
              <CardTitle>
                {data.category === "distributable"
                  ? "Distributable Configuration"
                  : "Derived Configuration"}
              </CardTitle>
              <CardDescription>
                {data.category === "distributable"
                  ? "Configure value ranges and benchmarks"
                  : "Configure the formula and value limits"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {data.category === "distributable" ? (
                <>
                  {/* Min/Max Values */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Minimum Value</Label>
                      <Input
                        type="number"
                        value={data.distributableConfig?.minValue ?? 1}
                        onChange={(e) =>
                          updateDistributableConfig({
                            minValue: Number.parseInt(e.target.value) || 1,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Maximum Value</Label>
                      <Input
                        type="number"
                        value={data.distributableConfig?.maxValue ?? 10}
                        onChange={(e) =>
                          updateDistributableConfig({
                            maxValue: Number.parseInt(e.target.value) || 10,
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* Benchmarks */}
                  <Collapsible
                    open={showBenchmarks}
                    onOpenChange={setShowBenchmarks}
                  >
                    <div className="flex items-center justify-between">
                      <Label>Benchmarks</Label>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addBenchmark}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm">
                            {showBenchmarks ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </div>
                    <CollapsibleContent className="mt-3 space-y-3">
                      {(data.distributableConfig?.benchmarks || []).map(
                        (benchmark, index) => (
                          <div
                            key={index}
                            className="p-4 rounded-lg bg-secondary/30 space-y-3"
                          >
                            <div className="flex items-center gap-3">
                              <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                              <div className="w-16">
                                <Label className="text-xs">Value</Label>
                                <Input
                                  type="number"
                                  value={benchmark.value}
                                  onChange={(e) =>
                                    updateBenchmark(
                                      index,
                                      "value",
                                      Number.parseInt(e.target.value) || 0
                                    )
                                  }
                                  className="mt-1"
                                />
                              </div>
                              <div className="flex-1">
                                <Label className="text-xs">Label</Label>
                                <Input
                                  placeholder="e.g., Novice, Expert, Master"
                                  value={benchmark.label}
                                  onChange={(e) =>
                                    updateBenchmark(
                                      index,
                                      "label",
                                      e.target.value
                                    )
                                  }
                                  className="mt-1"
                                />
                              </div>
                              {(data.distributableConfig?.benchmarks?.length ||
                                0) > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="mt-5 text-destructive"
                                  onClick={() => removeBenchmark(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            <div>
                              <Label className="text-xs">Description</Label>
                              <Input
                                placeholder="Capabilities at this level..."
                                value={benchmark.description}
                                onChange={(e) =>
                                  updateBenchmark(
                                    index,
                                    "description",
                                    e.target.value
                                  )
                                }
                                className="mt-1"
                              />
                            </div>
                          </div>
                        )
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                </>
              ) : (
                <>
                  {/* Formula Builder */}
                  <div className="space-y-2">
                    <Label>Formula</Label>
                    <FormulaBuilder
                      tokens={data.derivedConfig?.formula || []}
                      onChange={handleFormulaChange}
                      availableAttributes={otherAttributes}
                      currentAttributeId={data.id}
                    />
                  </div>

                  {/* Min/Max Caps */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Minimum Cap (optional)</Label>
                      <Input
                        type="number"
                        placeholder="No minimum"
                        value={data.derivedConfig?.minValue ?? ""}
                        onChange={(e) =>
                          updateDerivedConfig({
                            minValue: e.target.value
                              ? Number.parseInt(e.target.value)
                              : undefined,
                          })
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Floor value (e.g., HP cannot go below 1)
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Maximum Cap (optional)</Label>
                      <Input
                        type="number"
                        placeholder="No maximum"
                        value={data.derivedConfig?.maxValue ?? ""}
                        onChange={(e) =>
                          updateDerivedConfig({
                            maxValue: e.target.value
                              ? Number.parseInt(e.target.value)
                              : undefined,
                          })
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Ceiling value (e.g., max HP of 100)
                      </p>
                    </div>
                  </div>

                  {otherAttributes.filter((a) => a.category === "distributable")
                    .length === 0 && (
                    <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                      <p className="text-sm text-yellow-600">
                        No distributable attributes available for the formula.
                        Create some distributable attributes first to reference
                        them in derived attribute formulas.
                      </p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Display Tab */}
        <TabsContent value="display">
          <Card className="py-4">
            <CardHeader>
              <CardTitle>Display Settings</CardTitle>
              <CardDescription>
                Configure how this attribute appears in the game UI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Display Type */}
              <div className="space-y-2">
                <Label>Display Type</Label>
                <Select
                  value={data.display.displayType}
                  onValueChange={(v) =>
                    updateDisplay({
                      displayType: v as "number" | "bar" | "percentage",
                    })
                  }
                >
                  <SelectTrigger className="bg-transparent">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="bar">Progress Bar</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Icon */}
              <div className="space-y-2">
                <Label>Icon</Label>
                <IconPicker
                  value={data.display.icon}
                  onChange={(v) => updateDisplay({ icon: v })}
                />
              </div>

              {/* Icon Color */}
              <div className="space-y-2">
                <Label>Icon Color</Label>
                <ColorPicker
                  value={data.display.iconColor}
                  onChange={(v) => updateDisplay({ iconColor: v })}
                  type="foreground"
                />
              </div>

              {/* Bar Colors (only for bar type) */}
              {data.display.displayType === "bar" && (
                <>
                  <div className="space-y-2">
                    <Label>Bar Color</Label>
                    <ColorPicker
                      value={data.display.barColor || "bg-green-500"}
                      onChange={(v) => updateDisplay({ barColor: v })}
                      type="background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bar Background Color</Label>
                    <ColorPicker
                      value={data.display.barBackgroundColor || "bg-green-900"}
                      onChange={(v) => updateDisplay({ barBackgroundColor: v })}
                      type="barBackground"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Show Percentage</Label>
                      <p className="text-xs text-muted-foreground">
                        Display percentage value on the bar
                      </p>
                    </div>
                    <Switch
                      checked={data.display.showPercentage}
                      onCheckedChange={(v) =>
                        updateDisplay({ showPercentage: v })
                      }
                    />
                  </div>
                </>
              )}

              {/* Character Sheet Settings */}
              <div className="border-t pt-6 space-y-4">
                <h4 className="font-medium">Character Sheet</h4>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show on Character Sheet</Label>
                    <p className="text-xs text-muted-foreground">
                      Display this attribute in the character view
                    </p>
                  </div>
                  <Switch
                    checked={data.display.showOnCharacterSheet}
                    onCheckedChange={(v) =>
                      updateDisplay({ showOnCharacterSheet: v })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Position</Label>
                  <Input
                    type="number"
                    min={0}
                    value={data.display.position}
                    onChange={(e) =>
                      updateDisplay({
                        position: Number.parseInt(e.target.value) || 0,
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Order in the character sheet (lower = first)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Width</Label>
                  <Select
                    value={data.display.width}
                    onValueChange={(v) =>
                      updateDisplay({ width: v as "full" | "half" | "third" })
                    }
                  >
                    <SelectTrigger className="bg-transparent">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full Width (100%)</SelectItem>
                      <SelectItem value="half">Half Width (50%)</SelectItem>
                      <SelectItem value="third">Third Width (33%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </EditorShell>
  );
}
