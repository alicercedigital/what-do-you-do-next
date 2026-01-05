"use client"

import { useState } from "react"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import type { GameItem, GameAttribute, ItemAttributeModifier } from "@/lib/schemas/game-entity-schema"
import { SmartInput } from "@/components/ui/smart-input"
import { IconPicker, getIconComponent } from "./icon-picker"
import { cn } from "@/lib/utils"

interface ItemEditorProps {
  item: GameItem | null
  attributes: GameAttribute[]
  equipmentSlots: string[]
  universeContext: { name: string; setting: string }
  onSave: (item: GameItem) => void
  onCancel: () => void
}

const RARITY_COLORS = {
  common: "border-muted-foreground text-muted-foreground",
  uncommon: "border-green-500 text-green-500",
  rare: "border-blue-500 text-blue-500",
  epic: "border-purple-500 text-purple-500",
  legendary: "border-yellow-500 text-yellow-500",
}

export function ItemEditor({ item, attributes, equipmentSlots, universeContext, onSave, onCancel }: ItemEditorProps) {
  const [data, setData] = useState<GameItem>(() => {
    if (item) {
      return { ...item }
    }
    return {
      id: crypto.randomUUID(),
      name: "",
      description: "",
      type: "equipment",
      icon: "sword",
      rarity: "common",
      stackable: false,
      maxStack: 1,
      slot: equipmentSlots[0] || "",
      attributeModifiers: [],
    }
  })

  const [activeTab, setActiveTab] = useState<"basic" | "modifiers">("basic")

  const updateData = (updates: Partial<GameItem>) => {
    setData((prev) => ({ ...prev, ...updates }))
  }

  const addModifier = () => {
    const availableAttributes = attributes.filter(
      (attr) => !data.attributeModifiers.some((m) => m.attributeId === attr.id),
    )
    if (availableAttributes.length === 0) return

    updateData({
      attributeModifiers: [...data.attributeModifiers, { attributeId: availableAttributes[0].id, modifier: 1 }],
    })
  }

  const updateModifier = (index: number, updates: Partial<ItemAttributeModifier>) => {
    const updated = [...data.attributeModifiers]
    updated[index] = { ...updated[index], ...updates }
    updateData({ attributeModifiers: updated })
  }

  const removeModifier = (index: number) => {
    updateData({
      attributeModifiers: data.attributeModifiers.filter((_, i) => i !== index),
    })
  }

  const canSave = data.name.trim().length > 0

  const Icon = getIconComponent(data.icon)

  // Get distributable attributes for modifiers
  const distributableAttrs = attributes.filter((a) => a.category === "distributable")

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{item ? "Edit Item" : "Create Item"}</h1>
          </div>
          <Button onClick={() => onSave(data)} disabled={!canSave}>
            Save Item
          </Button>
        </div>

        {/* Preview Card */}
        <Card className="mb-6 bg-secondary/30">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-background">
                <Icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{data.name || "Item Name"}</span>
                  <Badge variant="outline" className={cn("text-xs capitalize", RARITY_COLORS[data.rarity])}>
                    {data.rarity}
                  </Badge>
                  <Badge variant="outline" className="text-xs capitalize">
                    {data.type}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{data.description || "Item description..."}</p>
                {data.type === "equipment" && data.slot && (
                  <p className="text-xs text-muted-foreground mt-1">Slot: {data.slot}</p>
                )}
              </div>
            </div>

            {/* Modifier preview */}
            {data.attributeModifiers.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {data.attributeModifiers.map((mod, index) => {
                  const attr = attributes.find((a) => a.id === mod.attributeId)
                  if (!attr) return null
                  return (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {attr.shortName || attr.name} {mod.modifier >= 0 ? "+" : ""}
                      {mod.modifier}
                    </Badge>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Editor Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="modifiers">Attribute Modifiers</TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic">
            <Card className="py-4">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Define the item's name, type, and properties</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <SmartInput
                    value={data.name}
                    onChange={(value) => updateData({ name: value })}
                    placeholder="e.g., Iron Sword, Health Potion, Ancient Key"
                    fieldType="item-name"
                    context={{
                      universeName: universeContext.name,
                      setting: universeContext.setting,
                      itemType: data.type,
                      rarity: data.rarity,
                    }}
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <SmartInput
                    value={data.description}
                    onChange={(value) => updateData({ description: value })}
                    placeholder="Describe the item's appearance and properties..."
                    multiline
                    rows={3}
                    fieldType="item-description"
                    context={{
                      universeName: universeContext.name,
                      setting: universeContext.setting,
                      itemName: data.name,
                      itemType: data.type,
                      rarity: data.rarity,
                    }}
                  />
                </div>

                {/* Type */}
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={data.type}
                    onValueChange={(v) => updateData({ type: v as "equipment" | "consumable" | "object" })}
                  >
                    <SelectTrigger className="bg-transparent">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equipment">
                        <div className="flex flex-col items-start">
                          <span>Equipment</span>
                          <span className="text-xs text-muted-foreground">Can be equipped by characters</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="consumable">
                        <div className="flex flex-col items-start">
                          <span>Consumable</span>
                          <span className="text-xs text-muted-foreground">One-time use, permanent effects</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="object">
                        <div className="flex flex-col items-start">
                          <span>Object</span>
                          <span className="text-xs text-muted-foreground">Key items, quest objects</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Rarity */}
                <div className="space-y-2">
                  <Label>Rarity</Label>
                  <Select
                    value={data.rarity}
                    onValueChange={(v) =>
                      updateData({ rarity: v as "common" | "uncommon" | "rare" | "epic" | "legendary" })
                    }
                  >
                    <SelectTrigger className="bg-transparent">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="common">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-muted-foreground" />
                          <span>Common</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="uncommon">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-green-500" />
                          <span>Uncommon</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="rare">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-blue-500" />
                          <span>Rare</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="epic">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-purple-500" />
                          <span>Epic</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="legendary">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-yellow-500" />
                          <span>Legendary</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Icon */}
                <div className="space-y-2">
                  <Label>Icon</Label>
                  <IconPicker value={data.icon} onChange={(v) => updateData({ icon: v })} />
                </div>

                {/* Equipment Slot (only for equipment type) */}
                {data.type === "equipment" && (
                  <div className="space-y-2">
                    <Label>Equipment Slot</Label>
                    <Select value={data.slot || ""} onValueChange={(v) => updateData({ slot: v })}>
                      <SelectTrigger className="bg-transparent">
                        <SelectValue placeholder="Select a slot" />
                      </SelectTrigger>
                      <SelectContent>
                        {equipmentSlots.map((slot) => (
                          <SelectItem key={slot} value={slot}>
                            {slot}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Stackable (for consumables and objects) */}
                {data.type !== "equipment" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Stackable</Label>
                        <p className="text-xs text-muted-foreground">Can multiple items stack in inventory</p>
                      </div>
                      <Switch checked={data.stackable} onCheckedChange={(v) => updateData({ stackable: v })} />
                    </div>

                    {data.stackable && (
                      <div className="space-y-2">
                        <Label>Max Stack Size</Label>
                        <Input
                          type="number"
                          min={1}
                          value={data.maxStack || 99}
                          onChange={(e) => updateData({ maxStack: Number.parseInt(e.target.value) || 99 })}
                        />
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attribute Modifiers Tab */}
          <TabsContent value="modifiers">
            <Card className="py-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Attribute Modifiers</CardTitle>
                    <CardDescription>
                      {data.type === "equipment"
                        ? "Bonuses applied when equipped"
                        : data.type === "consumable"
                          ? "Permanent changes when consumed"
                          : "No modifiers for object type"}
                    </CardDescription>
                  </div>
                  {data.type !== "object" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addModifier}
                      disabled={data.attributeModifiers.length >= distributableAttrs.length}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Modifier
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {data.type === "object" ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Object type items don't have attribute modifiers.
                  </div>
                ) : distributableAttrs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No distributable attributes defined. Create some attributes first.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.attributeModifiers.map((mod, index) => {
                      const attr = attributes.find((a) => a.id === mod.attributeId)
                      return (
                        <div key={index} className="flex items-center gap-3 p-4 rounded-lg bg-secondary/30">
                          <div className="flex-1">
                            <Select
                              value={mod.attributeId}
                              onValueChange={(v) => updateModifier(index, { attributeId: v })}
                            >
                              <SelectTrigger className="bg-transparent">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {distributableAttrs.map((attr) => (
                                  <SelectItem key={attr.id} value={attr.id}>
                                    {attr.name}
                                    {attr.shortName && ` (${attr.shortName})`}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="w-24">
                            <Input
                              type="number"
                              value={mod.modifier}
                              onChange={(e) =>
                                updateModifier(index, { modifier: Number.parseInt(e.target.value) || 0 })
                              }
                              placeholder="+/-"
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => removeModifier(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    })}

                    {data.attributeModifiers.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No modifiers yet. Add some to affect character attributes.
                      </div>
                    )}

                    {data.type === "consumable" && data.attributeModifiers.length > 0 && (
                      <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                        <p className="text-sm text-yellow-600">
                          When consumed, these modifiers will be permanently added to the character's base attributes,
                          and the item will be destroyed.
                        </p>
                      </div>
                    )}

                    {data.type === "equipment" && data.attributeModifiers.length > 0 && (
                      <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <p className="text-sm text-blue-600">
                          These modifiers are applied while the item is equipped and removed when unequipped.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
