"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Save, Plus, Trash2, Users, MapPin, Settings, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { universePersistence } from "@/lib/utils/universe-persistence"
import type { GameUniverse, GameCharacter, GameLocation, GameAttribute } from "@/lib/schemas/game-entity-schema"
import { AttributeEditor } from "./attribute-editor"
import { CharacterEditor } from "./character-editor"
import { LocationEditor } from "./location-editor"
import Link from "next/link"

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
    charactersAttributes: [],
    characters: [],
    locations: [],
    relationshipLabels: [],
  })

  const [activeTab, setActiveTab] = useState("general")
  const [editingCharacter, setEditingCharacter] = useState<GameCharacter | null>(null)
  const [editingLocation, setEditingLocation] = useState<GameLocation | null>(null)
  const [editingAttribute, setEditingAttribute] = useState<GameAttribute | null>(null)
  const [isCreatingCharacter, setIsCreatingCharacter] = useState(false)
  const [isCreatingLocation, setIsCreatingLocation] = useState(false)
  const [isCreatingAttribute, setIsCreatingAttribute] = useState(false)

  useEffect(() => {
    if (universeId) {
      const existingUniverse = universePersistence.getUniverseById(universeId)
      if (existingUniverse) {
        setUniverse(existingUniverse)
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
    const existingIndex = universe.charactersAttributes.findIndex((a) => a.id === attribute.id)
    if (existingIndex >= 0) {
      const updated = [...universe.charactersAttributes]
      updated[existingIndex] = attribute
      updateUniverse({ charactersAttributes: updated })
    } else {
      updateUniverse({ charactersAttributes: [...universe.charactersAttributes, attribute] })
    }
    setEditingAttribute(null)
    setIsCreatingAttribute(false)
  }

  const handleDeleteAttribute = (attributeId: string) => {
    updateUniverse({
      charactersAttributes: universe.charactersAttributes.filter((a) => a.id !== attributeId),
    })
  }

  const canSave = universe.name.trim().length > 0

  // Show character editor
  if (editingCharacter || isCreatingCharacter) {
    return (
      <CharacterEditor
        character={editingCharacter}
        attributes={universe.charactersAttributes}
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
        onSave={handleSaveAttribute}
        onCancel={() => {
          setEditingAttribute(null)
          setIsCreatingAttribute(false)
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
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="general" className="gap-2">
              <Settings className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="attributes" className="gap-2">
              Attributes
              <span className="ml-1 text-xs bg-secondary px-1.5 rounded">{universe.charactersAttributes.length}</span>
            </TabsTrigger>
            <TabsTrigger value="characters" className="gap-2">
              <Users className="h-4 w-4" />
              Characters
              <span className="ml-1 text-xs bg-secondary px-1.5 rounded">{universe.characters.length}</span>
            </TabsTrigger>
            <TabsTrigger value="locations" className="gap-2">
              <MapPin className="h-4 w-4" />
              Locations
              <span className="ml-1 text-xs bg-secondary px-1.5 rounded">{universe.locations.length}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Universe Details</CardTitle>
                <CardDescription>Basic information about your universe</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Dark Fantasy"
                    value={universe.name}
                    onChange={(e) => updateUniverse({ name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="A brief description of this universe..."
                    value={universe.description}
                    onChange={(e) => updateUniverse({ description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="setting">Setting</Label>
                  <Textarea
                    id="setting"
                    placeholder="Describe the world, era, and atmosphere..."
                    value={universe.setting}
                    onChange={(e) => updateUniverse({ setting: e.target.value })}
                    rows={4}
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
          </TabsContent>

          <TabsContent value="attributes">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Character Attributes</CardTitle>
                    <CardDescription>Define attributes that characters will have</CardDescription>
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
                    {universe.charactersAttributes.map((attr) => (
                      <motion.div
                        key={attr.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-3 p-4 rounded-lg bg-secondary/30 group"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{attr.name}</p>
                          <p className="text-sm text-muted-foreground">{attr.summary}</p>
                          <p className="text-xs text-muted-foreground mt-1">{attr.benchmarks.length} benchmarks</p>
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
                    ))}
                    {universe.charactersAttributes.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No attributes defined yet. Add some to create characters.
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="characters">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Characters</CardTitle>
                    <CardDescription>NPCs and entities in your universe</CardDescription>
                  </div>
                  <Button
                    onClick={() => setIsCreatingCharacter(true)}
                    className="gap-2"
                    disabled={universe.charactersAttributes.length === 0}
                  >
                    <Plus className="h-4 w-4" />
                    Add Character
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {universe.charactersAttributes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Define attributes first before adding characters.
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

          <TabsContent value="locations">
            <Card>
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
