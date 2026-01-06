"use client"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SmartInput } from "@/components/ui/smart-input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ConflictEvent } from "@/lib/schemas/conflict-event-schema"
import type {
    GameAttribute, GameCharacter, GameItem, GameLocation, GameUniverse
} from "@/lib/schemas/game-entity-schema"
import { cn } from "@/lib/utils"
import { universePersistence } from "@/lib/utils/universe-persistence"
import { motion } from "framer-motion"
import {
    ArrowLeft, ChevronRight, MapPin, Package, Plus, Save, Settings, Sliders, Swords, Trash2,
    Users
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { AttributeEditor } from "./attribute-editor"
import { CharacterEditor } from "./character-editor"
import { ConflictEventEditor } from "./conflict-event-editor"
import { getIconComponent } from "./icon-picker"
import { ItemEditor } from "./item-editor"
import { LocationEditor } from "./location-editor"

interface UniverseEditorProps {
  universeId?: string
}

export function UniverseEditor({ universeId }: UniverseEditorProps) {
  const router = useRouter()
  const isEditing = !!universeId

  const [universe, setUniverse] = useState<GameUniverse>({
    id: crypto.randomUUID(),
    name: "",
    description: "",
    setting: "",
    thumbnailUrl: "",
    attributeConfig: {
      startingPoints: 20,
      pointsPerLevelUp: 2,
    },
    attributes: [],
    equipmentSlots: ["Head", "Body", "Main Hand", "Off Hand", "Accessory"],
    items: [],
    conflictEvents: [],
    characters: [],
    locations: [],
    relationshipLabels: [],
  })

  const [activeTab, setActiveTab] = useState("general")
  const [editingCharacter, setEditingCharacter] = useState<GameCharacter | null>(null)
  const [editingLocation, setEditingLocation] = useState<GameLocation | null>(null)
  const [editingAttribute, setEditingAttribute] = useState<GameAttribute | null>(null)
  const [editingItem, setEditingItem] = useState<GameItem | null>(null)
  const [editingConflict, setEditingConflict] = useState<ConflictEvent | null>(null)
  const [isCreatingCharacter, setIsCreatingCharacter] = useState(false)
  const [isCreatingLocation, setIsCreatingLocation] = useState(false)
  const [isCreatingAttribute, setIsCreatingAttribute] = useState(false)
  const [isCreatingItem, setIsCreatingItem] = useState(false)
  const [isCreatingConflict, setIsCreatingConflict] = useState(false)

  useEffect(() => {
    if (universeId) {
      const existingUniverse = universePersistence.getUniverseById(universeId)
      if (existingUniverse) {
        setUniverse({
          ...existingUniverse,
          attributeConfig: existingUniverse.attributeConfig || { startingPoints: 20, pointsPerLevelUp: 2 },
          attributes: existingUniverse.attributes || (existingUniverse as any).charactersAttributes || [],
          equipmentSlots: existingUniverse.equipmentSlots || ["Head", "Body", "Main Hand", "Off Hand", "Accessory"],
          items: existingUniverse.items || [],
          conflictEvents: existingUniverse.conflictEvents || [],
        })
      }
    }
  }, [universeId])

  const handleSave = () => {
    if (!universe.name.trim()) return
    universePersistence.saveUniverse(universe)
    router.push("/universes")
  }

  const updateUniverse = (updates: Partial<GameUniverse>) => {
    setUniverse((prev) => ({ ...prev, ...updates }))
  }

  // Character handlers
  const handleSaveCharacter = (character: GameCharacter) => {
    const existingIndex = universe.characters.findIndex((c) => c.id === character.id)
    if (existingIndex >= 0) {
      const updated = [...universe.characters]
      updated[existingIndex] = character
      updateUniverse({ characters: updated })
    } else {
      updateUniverse({ characters: [...universe.characters, character] })
    }
    setEditingCharacter(null)
    setIsCreatingCharacter(false)
  }

  const handleDeleteCharacter = (characterId: string) => {
    updateUniverse({
      characters: universe.characters.filter((c) => c.id !== characterId),
    })
  }

  // Location handlers
  const handleSaveLocation = (location: GameLocation) => {
    const existingIndex = universe.locations.findIndex((l) => l.id === location.id)
    if (existingIndex >= 0) {
      const updated = [...universe.locations]
      updated[existingIndex] = location
      updateUniverse({ locations: updated })
    } else {
      updateUniverse({ locations: [...universe.locations, location] })
    }
    setEditingLocation(null)
    setIsCreatingLocation(false)
  }

  const handleDeleteLocation = (locationId: string) => {
    updateUniverse({
      locations: universe.locations.filter((l) => l.id !== locationId),
    })
  }

  const handleSaveAttribute = (attribute: GameAttribute) => {
    const existingIndex = universe.attributes.findIndex((a) => a.id === attribute.id)
    if (existingIndex >= 0) {
      const updated = [...universe.attributes]
      updated[existingIndex] = attribute
      updateUniverse({ attributes: updated })
    } else {
      updateUniverse({ attributes: [...universe.attributes, attribute] })
    }
    setEditingAttribute(null)
    setIsCreatingAttribute(false)
  }

  const handleDeleteAttribute = (attributeId: string) => {
    updateUniverse({
      attributes: universe.attributes.filter((a) => a.id !== attributeId),
    })
  }

  const handleSaveItem = (item: GameItem) => {
    const existingIndex = universe.items.findIndex((i) => i.id === item.id)
    if (existingIndex >= 0) {
      const updated = [...universe.items]
      updated[existingIndex] = item
      updateUniverse({ items: updated })
    } else {
      updateUniverse({ items: [...universe.items, item] })
    }
    setEditingItem(null)
    setIsCreatingItem(false)
  }

  const handleDeleteItem = (itemId: string) => {
    updateUniverse({
      items: universe.items.filter((i) => i.id !== itemId),
    })
  }

  // Equipment slot handlers
  const addEquipmentSlot = () => {
    updateUniverse({
      equipmentSlots: [...universe.equipmentSlots, `Slot ${universe.equipmentSlots.length + 1}`],
    })
  }

  const updateEquipmentSlot = (index: number, value: string) => {
    const updated = [...universe.equipmentSlots]
    updated[index] = value
    updateUniverse({ equipmentSlots: updated })
  }

  const removeEquipmentSlot = (index: number) => {
    updateUniverse({
      equipmentSlots: universe.equipmentSlots.filter((_, i) => i !== index),
    })
  }

  // Conflict event handlers
  const handleSaveConflict = (conflict: ConflictEvent) => {
    const existingIndex = universe.conflictEvents.findIndex((c) => c.id === conflict.id)
    if (existingIndex >= 0) {
      const updated = [...universe.conflictEvents]
      updated[existingIndex] = conflict
      updateUniverse({ conflictEvents: updated })
    } else {
      updateUniverse({ conflictEvents: [...universe.conflictEvents, conflict] })
    }
    setEditingConflict(null)
    setIsCreatingConflict(false)
  }

  const handleDeleteConflict = (conflictId: string) => {
    updateUniverse({
      conflictEvents: universe.conflictEvents.filter((c) => c.id !== conflictId),
    })
  }

  const canSave = universe.name.trim().length > 0

  // Counts for tabs
  const distributableCount = universe.attributes.filter((a) => a.category === "distributable").length
  const derivedCount = universe.attributes.filter((a) => a.category === "derived").length

  if (editingConflict || isCreatingConflict) {
    return (
      <ConflictEventEditor
        conflictEvent={editingConflict}
        attributes={universe.attributes}
        onSave={handleSaveConflict}
        onCancel={() => {
          setEditingConflict(null)
          setIsCreatingConflict(false)
        }}
      />
    )
  }

  // Show character editor
  if (editingCharacter || isCreatingCharacter) {
    return (
      <CharacterEditor
        character={editingCharacter}
        attributes={universe.attributes.filter((a) => a.category === "distributable")}
        onSave={handleSaveCharacter}
        onCancel={() => {
          setEditingCharacter(null)
          setIsCreatingCharacter(false)
        }}
      />
    )
  }

  // Show location editor
  if (editingLocation || isCreatingLocation) {
    return (
      <LocationEditor
        location={editingLocation}
        onSave={handleSaveLocation}
        onCancel={() => {
          setEditingLocation(null)
          setIsCreatingLocation(false)
        }}
      />
    )
  }

  // Show attribute editor
  if (editingAttribute || isCreatingAttribute) {
    return (
      <AttributeEditor
        attribute={editingAttribute}
        allAttributes={universe.attributes}
        universeContext={{ name: universe.name, setting: universe.setting }}
        onSave={handleSaveAttribute}
        onCancel={() => {
          setEditingAttribute(null)
          setIsCreatingAttribute(false)
        }}
      />
    )
  }

  // Show item editor
  if (editingItem || isCreatingItem) {
    return (
      <ItemEditor
        item={editingItem}
        attributes={universe.attributes}
        equipmentSlots={universe.equipmentSlots}
        universeContext={{ name: universe.name, setting: universe.setting }}
        onSave={handleSaveItem}
        onCancel={() => {
          setEditingItem(null)
          setIsCreatingItem(false)
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/universes">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">{isEditing ? "Edit Universe" : "Create Universe"}</h1>
              <p className="text-muted-foreground text-sm">
                {isEditing ? "Modify your universe settings" : "Define a new game universe"}
              </p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={!canSave} className="gap-2">
            <Save className="h-4 w-4" />
            Save Universe
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6 mb-6">
            <TabsTrigger value="general" className="gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">General</span>
            </TabsTrigger>
            <TabsTrigger value="attributes" className="gap-2">
              <Sliders className="h-4 w-4" />
              <span className="hidden sm:inline">Attributes</span>
              <span className="ml-1 text-xs bg-secondary px-1.5 rounded">{universe.attributes.length}</span>
            </TabsTrigger>
            <TabsTrigger value="items" className="gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Items</span>
              <span className="ml-1 text-xs bg-secondary px-1.5 rounded">{universe.items.length}</span>
            </TabsTrigger>
            <TabsTrigger value="conflicts" className="gap-2">
              <Swords className="h-4 w-4" />
              <span className="hidden sm:inline">Conflicts</span>
              <span className="ml-1 text-xs bg-secondary px-1.5 rounded">{universe.conflictEvents.length}</span>
            </TabsTrigger>
            <TabsTrigger value="characters" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Characters</span>
              <span className="ml-1 text-xs bg-secondary px-1.5 rounded">{universe.characters.length}</span>
            </TabsTrigger>
            <TabsTrigger value="locations" className="gap-2">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Locations</span>
              <span className="ml-1 text-xs bg-secondary px-1.5 rounded">{universe.locations.length}</span>
            </TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general">
            <div className="space-y-6">
              <Card className="py-4">
                <CardHeader>
                  <CardTitle>Universe Details</CardTitle>
                  <CardDescription>Basic information about your universe</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <SmartInput
                      value={universe.name}
                      onChange={(value) => updateUniverse({ name: value })}
                      placeholder="e.g., Dark Fantasy"
                      fieldType="universe-name"
                      context={{ setting: universe.setting }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <SmartInput
                      value={universe.description}
                      onChange={(value) => updateUniverse({ description: value })}
                      placeholder="A brief description of this universe..."
                      multiline
                      rows={3}
                      fieldType="universe-description"
                      context={{ universeName: universe.name, setting: universe.setting }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="setting">Setting</Label>
                    <SmartInput
                      value={universe.setting}
                      onChange={(value) => updateUniverse({ setting: value })}
                      placeholder="Describe the world, era, and atmosphere..."
                      multiline
                      rows={4}
                      fieldType="universe-description"
                      context={{ universeName: universe.name }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="thumbnail">Thumbnail URL (optional)</Label>
                    <Input
                      id="thumbnail"
                      placeholder="https://example.com/image.jpg"
                      value={universe.thumbnailUrl || ""}
                      onChange={(e) => updateUniverse({ thumbnailUrl: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="py-4">
                <CardHeader>
                  <CardTitle>Attribute System</CardTitle>
                  <CardDescription>Configure how character attributes work</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Starting Points</Label>
                      <Input
                        type="number"
                        value={universe.attributeConfig.startingPoints}
                        onChange={(e) =>
                          updateUniverse({
                            attributeConfig: {
                              ...universe.attributeConfig,
                              startingPoints: Number.parseInt(e.target.value) || 20,
                            },
                          })
                        }
                      />
                      <p className="text-xs text-muted-foreground">Points available at character creation</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Points Per Level Up</Label>
                      <Input
                        type="number"
                        value={universe.attributeConfig.pointsPerLevelUp}
                        onChange={(e) =>
                          updateUniverse({
                            attributeConfig: {
                              ...universe.attributeConfig,
                              pointsPerLevelUp: Number.parseInt(e.target.value) || 2,
                            },
                          })
                        }
                      />
                      <p className="text-xs text-muted-foreground">Points gained when leveling up</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="py-4">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Equipment Slots</CardTitle>
                      <CardDescription>Define where characters can equip items</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={addEquipmentSlot}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Slot
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {universe.equipmentSlots.map((slot, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={slot}
                          onChange={(e) => updateEquipmentSlot(index, e.target.value)}
                          placeholder="Slot name"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeEquipmentSlot(index)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Attributes Tab */}
          <TabsContent value="attributes">
            <Card className="py-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Attributes</CardTitle>
                    <CardDescription>
                      Define attributes for characters ({distributableCount} distributable, {derivedCount} derived)
                    </CardDescription>
                  </div>
                  <Button onClick={() => setIsCreatingAttribute(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Attribute
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {universe.attributes.map((attr) => {
                      const Icon = getIconComponent(attr.display?.icon || "circle")
                      return (
                        <motion.div
                          key={attr.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center gap-3 p-4 rounded-lg bg-secondary/30 group"
                        >
                          <div
                            className={cn("p-2 rounded-lg bg-background", attr.display?.iconColor || "text-foreground")}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{attr.name}</p>
                              {attr.shortName && (
                                <span className="text-xs text-muted-foreground">({attr.shortName})</span>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {attr.category === "distributable" ? "Distributable" : "Derived"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{attr.summary}</p>
                            {attr.category === "distributable" && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {attr.distributableConfig?.benchmarks?.length || 0} benchmarks
                              </p>
                            )}
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => setEditingAttribute(attr)}>
                            Edit
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="opacity-0 group-hover:opacity-100 text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Attribute?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will remove "{attr.name}" from this universe.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteAttribute(attr.id)}
                                  className="bg-destructive text-destructive-foreground"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </motion.div>
                      )
                    })}
                    {universe.attributes.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No attributes defined yet. Add some to create characters.
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="items">
            <Card className="py-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Items</CardTitle>
                    <CardDescription>Equipment, consumables, and objects in your universe</CardDescription>
                  </div>
                  <Button onClick={() => setIsCreatingItem(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {universe.items.map((item) => {
                      const Icon = getIconComponent(item.icon || "package")
                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center gap-3 p-4 rounded-lg bg-secondary/30 group"
                        >
                          <div className="p-2 rounded-lg bg-background">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{item.name}</p>
                              <Badge variant="outline" className="text-xs capitalize">
                                {item.type}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-xs capitalize",
                                  item.rarity === "legendary" && "border-yellow-500 text-yellow-500",
                                  item.rarity === "epic" && "border-purple-500 text-purple-500",
                                  item.rarity === "rare" && "border-blue-500 text-blue-500",
                                  item.rarity === "uncommon" && "border-green-500 text-green-500",
                                )}
                              >
                                {item.rarity}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
                            {item.slot && <p className="text-xs text-muted-foreground mt-1">Slot: {item.slot}</p>}
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => setEditingItem(item)}>
                            Edit
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="opacity-0 group-hover:opacity-100 text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Item?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will remove "{item.name}" from this universe.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="bg-destructive text-destructive-foreground"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </motion.div>
                      )
                    })}
                    {universe.items.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No items yet. Add equipment, consumables, or objects.
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Conflicts Tab */}
          <TabsContent value="conflicts">
            <Card className="py-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Conflict Events</CardTitle>
                    <CardDescription>
                      Define auto-battle turn-based events like combat, races, exams, etc.
                    </CardDescription>
                  </div>
                  <Button onClick={() => setIsCreatingConflict(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Conflict
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {universe.conflictEvents.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Swords className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium">No conflict events yet</p>
                    <p className="text-sm mt-1">Create conflict events to add challenges to your universe</p>
                    <Button
                      variant="outline"
                      className="mt-4 bg-transparent"
                      onClick={() => setIsCreatingConflict(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create your first conflict
                    </Button>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {universe.conflictEvents.map((conflict) => {
                        const Icon = getIconComponent(conflict.icon || "swords")
                        return (
                          <motion.div
                            key={conflict.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-3 p-4 rounded-lg bg-secondary/30 group"
                          >
                            <div className="p-2 rounded-lg bg-background text-foreground">
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{conflict.name}</p>
                                <Badge variant="outline" className="text-xs">
                                  {conflict.roles.length} roles
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {conflict.cycleSteps.length} steps
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {conflict.outcomes.length} outcomes
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground truncate">{conflict.description}</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setEditingConflict(conflict)}>
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Conflict Event</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{conflict.name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteConflict(conflict.id)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </motion.div>
                        )
                      })}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Characters Tab */}
          <TabsContent value="characters">
            <Card className="py-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Characters</CardTitle>
                    <CardDescription>NPCs and entities in your universe</CardDescription>
                  </div>
                  <Button
                    onClick={() => setIsCreatingCharacter(true)}
                    className="gap-2"
                    disabled={universe.attributes.filter((a) => a.category === "distributable").length === 0}
                  >
                    <Plus className="h-4 w-4" />
                    Add Character
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {universe.attributes.filter((a) => a.category === "distributable").length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Define distributable attributes first before adding characters.
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {universe.characters.map((char) => (
                        <motion.div
                          key={char.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center gap-3 p-4 rounded-lg bg-secondary/30 group"
                        >
                          <div className="flex-1">
                            <p className="font-medium">{char.name}</p>
                            <p className="text-sm text-muted-foreground">{char.role}</p>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{char.description}</p>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => setEditingCharacter(char)}>
                            Edit
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="opacity-0 group-hover:opacity-100 text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Character?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will remove "{char.name}" from this universe.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteCharacter(char.id)}
                                  className="bg-destructive text-destructive-foreground"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </motion.div>
                      ))}
                      {universe.characters.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          No characters yet. Add some to populate your universe.
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Locations Tab */}
          <TabsContent value="locations">
            <Card className="py-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Locations</CardTitle>
                    <CardDescription>Places in your universe</CardDescription>
                  </div>
                  <Button onClick={() => setIsCreatingLocation(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Location
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {universe.locations.map((loc) => (
                      <motion.div
                        key={loc.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-3 p-4 rounded-lg bg-secondary/30 group"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{loc.name}</p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{loc.description}</p>
                          <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                            <span>{loc.musics.length} music tracks</span>
                            <span>•</span>
                            <span>{loc.ambientSounds.length} ambient sounds</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setEditingLocation(loc)}>
                          Edit
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Location?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove "{loc.name}" from this universe.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteLocation(loc.id)}
                                className="bg-destructive text-destructive-foreground"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </motion.div>
                    ))}
                    {universe.locations.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No locations yet. Add some to build your world.
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
