import { useState } from "react"
import type { Item, Stat } from "@wdydn/shared"
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Textarea } from "@/shared/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { Switch } from "@/shared/components/ui/switch"
import { cn } from "@/shared/lib/utils"
import { Plus, Trash2, ChevronDown, ChevronRight, Package, Sword, FlaskRound, Key } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/shared/components/ui/collapsible"

interface Props {
  items: Item[]
  onChange: (items: Item[]) => void
  stats: Stat[]
  equipmentSlots: string[]
}

const DEFAULT_ITEM: Omit<Item, "id"> = {
  name: "",
  description: "",
  icon: "package",
  rarity: "common",
  kind: "equipment",
}

const RARITY_OPTIONS: Item["rarity"][] = ["common", "uncommon", "rare", "epic", "legendary"]

const RARITY_COLORS = {
  common: "text-gray-400",
  uncommon: "text-green-400",
  rare: "text-blue-400",
  epic: "text-purple-400",
  legendary: "text-orange-400",
}

const KIND_ICONS = {
  equipment: Sword,
  consumable: FlaskRound,
  key: Key,
}

export function ItemEditor({ items, onChange, stats, equipmentSlots }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const addItem = () => {
    const newItem: Item = {
      ...DEFAULT_ITEM,
      id: crypto.randomUUID(),
      name: "New Item",
    }
    onChange([...items, newItem])
    setExpandedId(newItem.id)
  }

  const updateItem = (id: string, updates: Partial<Item>) => {
    onChange(items.map((i) => (i.id === id ? { ...i, ...updates } : i)))
  }

  const deleteItem = (id: string) => {
    onChange(items.filter((i) => i.id !== id))
    if (expandedId === id) setExpandedId(null)
  }

  const groupedItems = {
    equipment: items.filter((i) => i.kind === "equipment"),
    consumable: items.filter((i) => i.kind === "consumable"),
    key: items.filter((i) => i.kind === "key"),
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Package className="h-4 w-4" />
          Items
          <span className="text-xs bg-muted px-2 py-0.5 rounded">{items.length}</span>
        </h3>
        <Button variant="outline" size="sm" onClick={addItem}>
          <Plus className="h-3 w-3 mr-1" />
          Add Item
        </Button>
      </div>

      {Object.entries(groupedItems).map(([kind, kindItems]) => {
        if (kindItems.length === 0) return null
        const Icon = KIND_ICONS[kind as keyof typeof KIND_ICONS]

        return (
          <div key={kind} className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-2 capitalize">
              <Icon className="h-3 w-3" />
              {kind} ({kindItems.length})
            </p>
            {kindItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                stats={stats}
                equipmentSlots={equipmentSlots}
                expanded={expandedId === item.id}
                onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
                onChange={(updates) => updateItem(item.id, updates)}
                onDelete={() => deleteItem(item.id)}
              />
            ))}
          </div>
        )
      })}

      {items.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No items defined yet</p>}
    </div>
  )
}

function ItemCard({
  item,
  stats,
  equipmentSlots,
  expanded,
  onToggle,
  onChange,
  onDelete,
}: {
  item: Item
  stats: Stat[]
  equipmentSlots: string[]
  expanded: boolean
  onToggle: () => void
  onChange: (updates: Partial<Item>) => void
  onDelete: () => void
}) {
  const Icon = KIND_ICONS[item.kind]

  const addBonus = () => {
    const bonuses = item.bonuses ?? []
    onChange({ bonuses: [...bonuses, { statId: stats[0]?.id ?? "", amount: 1 }] })
  }

  const updateBonus = (index: number, updates: Partial<{ statId: string; amount: number }>) => {
    const bonuses = [...(item.bonuses ?? [])]
    bonuses[index] = { ...bonuses[index], ...updates }
    onChange({ bonuses })
  }

  const removeBonus = (index: number) => {
    const bonuses = (item.bonuses ?? []).filter((_, i) => i !== index)
    onChange({ bonuses: bonuses.length > 0 ? bonuses : undefined })
  }

  return (
    <Collapsible open={expanded} onOpenChange={onToggle}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="p-3 cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div
                className={cn("w-8 h-8 rounded flex items-center justify-center bg-muted", RARITY_COLORS[item.rarity])}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <CardTitle className={cn("text-sm", RARITY_COLORS[item.rarity])}>{item.name || "Unnamed"}</CardTitle>
                <p className="text-xs text-muted-foreground capitalize">
                  {item.rarity} {item.kind}
                </p>
              </div>
              {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Name</Label>
                <Input value={item.name} onChange={(e) => onChange({ name: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Rarity</Label>
                <Select value={item.rarity} onValueChange={(rarity: Item["rarity"]) => onChange({ rarity })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RARITY_OPTIONS.map((r) => (
                      <SelectItem key={r} value={r}>
                        <span className={cn("capitalize", RARITY_COLORS[r])}>{r}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Description</Label>
              <Textarea value={item.description} onChange={(e) => onChange({ description: e.target.value })} rows={2} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Kind</Label>
                <Select value={item.kind} onValueChange={(kind: Item["kind"]) => onChange({ kind })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equipment">Equipment</SelectItem>
                    <SelectItem value="consumable">Consumable</SelectItem>
                    <SelectItem value="key">Key Item</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {item.kind === "equipment" && (
                <div className="space-y-1">
                  <Label className="text-xs">Slot</Label>
                  <Select value={item.slot ?? ""} onValueChange={(slot) => onChange({ slot })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select slot" />
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
            </div>

            {/* Consumable options */}
            {item.kind === "consumable" && (
              <div className="space-y-3 border-t pt-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Stackable</Label>
                  <Switch checked={item.stackable ?? false} onCheckedChange={(stackable) => onChange({ stackable })} />
                </div>
                {item.stackable && (
                  <div className="space-y-1">
                    <Label className="text-xs">Max Stack</Label>
                    <Input
                      type="number"
                      value={item.maxStack ?? 10}
                      onChange={(e) => onChange({ maxStack: Number.parseInt(e.target.value) || 10 })}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Stat Bonuses */}
            {item.kind === "equipment" && (
              <div className="space-y-3 border-t pt-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">Stat Bonuses</p>
                  <Button variant="outline" size="sm" onClick={addBonus}>
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>
                {(item.bonuses ?? []).map((bonus, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Select value={bonus.statId} onValueChange={(statId) => updateBonus(index, { statId })}>
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {stats.map((stat) => (
                          <SelectItem key={stat.id} value={stat.id}>
                            {stat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      value={bonus.amount}
                      onChange={(e) => updateBonus(index, { amount: Number.parseInt(e.target.value) || 0 })}
                      className="w-20"
                    />
                    <Button variant="ghost" size="icon" onClick={() => removeBonus(index)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Delete */}
            <Button variant="destructive" size="sm" onClick={onDelete} className="w-full">
              <Trash2 className="h-3 w-3 mr-1" />
              Delete Item
            </Button>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
