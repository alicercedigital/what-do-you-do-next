import { useState, useEffect } from "react"
import type { Universe } from "@wdydn/shared"
import { getUniverse, saveUniverse } from "@/shared/lib/storage"
import { STARTER_UNIVERSES } from "@/shared/data/starter-universes"
import { StatEditor } from "./stat-editor"
import { ItemEditor } from "./item-editor"
import { ChallengeEditor } from "./challenge-editor"
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Textarea } from "@/shared/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { ArrowLeft, Save, Settings2, Package, Swords, Users, MapPin } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface Props {
  universeId: string
}

export function UniverseEditor({ universeId }: Props) {
  const navigate = useNavigate()
  const [universe, setUniverse] = useState<Universe | null>(null)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    // Try loading from storage first
    let loaded = getUniverse(universeId)

    // If not in storage, check if it's a starter universe
    if (!loaded) {
      loaded = STARTER_UNIVERSES.find(u => u.id === universeId) || null
    }

    if (loaded) {
      setUniverse(loaded)
    } else {
      // Create a new universe with defaults
      const newUniverse: Universe = {
        id: universeId,
        name: "New Universe",
        description: "",
        theme: "",
        stats: [],
        items: [],
        challenges: [],
        npcs: [],
        locations: [],
        config: {
          startingPoints: 10,
          pointsPerLevel: 3,
          equipmentSlots: ["head", "body", "weapon", "accessory"],
        },
      }
      setUniverse(newUniverse)
      setHasChanges(true) // Mark as having changes so user can save
    }
  }, [universeId])

  const handleChange = (updates: Partial<Universe>) => {
    if (!universe) return
    setUniverse({ ...universe, ...updates })
    setHasChanges(true)
  }

  const handleSave = async () => {
    if (!universe) return
    setSaving(true)
    try {
      saveUniverse(universe)
      setHasChanges(false)
    } finally {
      setSaving(false)
    }
  }

  if (!universe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Universe not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center justify-between p-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/universes")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="font-bold">{universe.name}</h1>
              <p className="text-xs text-muted-foreground">{universe.theme}</p>
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving || !hasChanges}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : hasChanges ? "Save Changes" : "Saved"}
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto p-4">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="w-full grid grid-cols-5">
            <TabsTrigger value="general" className="flex items-center gap-1">
              <Settings2 className="h-3 w-3" />
              <span className="hidden sm:inline">General</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-1">
              <Settings2 className="h-3 w-3" />
              <span className="hidden sm:inline">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="items" className="flex items-center gap-1">
              <Package className="h-3 w-3" />
              <span className="hidden sm:inline">Items</span>
            </TabsTrigger>
            <TabsTrigger value="challenges" className="flex items-center gap-1">
              <Swords className="h-3 w-3" />
              <span className="hidden sm:inline">Challenges</span>
            </TabsTrigger>
            <TabsTrigger value="world" className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span className="hidden sm:inline">World</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Universe Name</Label>
                  <Input
                    value={universe.name}
                    onChange={(e) => handleChange({ name: e.target.value })}
                    placeholder="My Universe"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Input
                    value={universe.theme}
                    onChange={(e) => handleChange({ theme: e.target.value })}
                    placeholder="dark fantasy, sci-fi, etc."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={universe.description}
                    onChange={(e) => handleChange({ description: e.target.value })}
                    placeholder="Describe your universe..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Starting Points</Label>
                    <Input
                      type="number"
                      value={universe.config.startingPoints}
                      onChange={(e) =>
                        handleChange({
                          config: { ...universe.config, startingPoints: Number.parseInt(e.target.value) || 10 },
                        })
                      }
                    />
                    <p className="text-xs text-muted-foreground">Points to distribute at character creation</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Points Per Level</Label>
                    <Input
                      type="number"
                      value={universe.config.pointsPerLevel}
                      onChange={(e) =>
                        handleChange({
                          config: { ...universe.config, pointsPerLevel: Number.parseInt(e.target.value) || 3 },
                        })
                      }
                    />
                    <p className="text-xs text-muted-foreground">Points gained when leveling up</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Equipment Slots</Label>
                  <Input
                    value={universe.config.equipmentSlots.join(", ")}
                    onChange={(e) =>
                      handleChange({
                        config: {
                          ...universe.config,
                          equipmentSlots: e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        },
                      })
                    }
                    placeholder="head, body, weapon, accessory"
                  />
                  <p className="text-xs text-muted-foreground">Comma-separated list of equipment slots</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="mt-6">
            <StatEditor stats={universe.stats} onChange={(stats) => handleChange({ stats })} />
          </TabsContent>

          <TabsContent value="items" className="mt-6">
            <ItemEditor
              items={universe.items}
              onChange={(items) => handleChange({ items })}
              stats={universe.stats}
              equipmentSlots={universe.config.equipmentSlots}
            />
          </TabsContent>

          <TabsContent value="challenges" className="mt-6">
            <ChallengeEditor
              challenges={universe.challenges}
              onChange={(challenges) => handleChange({ challenges })}
              stats={universe.stats}
            />
          </TabsContent>

          <TabsContent value="world" className="mt-6 space-y-6">
            <NPCEditor npcs={universe.npcs} onChange={(npcs) => handleChange({ npcs })} stats={universe.stats} />
            <LocationEditor locations={universe.locations} onChange={(locations) => handleChange({ locations })} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

// Simple NPC Editor
function NPCEditor({
  npcs,
  onChange,
  stats,
}: {
  npcs: Universe["npcs"]
  onChange: (npcs: Universe["npcs"]) => void
  stats: Universe["stats"]
}) {
  const addNPC = () => {
    onChange([
      ...npcs,
      {
        id: crypto.randomUUID(),
        name: "New NPC",
        description: "",
        role: "ally",
        stats: {},
      },
    ])
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            NPCs
          </CardTitle>
          <Button variant="outline" size="sm" onClick={addNPC}>
            Add NPC
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {npcs.map((npc, index) => (
          <div key={npc.id} className="flex items-center gap-2 p-2 rounded bg-muted/50">
            <Input
              value={npc.name}
              onChange={(e) => {
                const newNpcs = [...npcs]
                newNpcs[index] = { ...npc, name: e.target.value }
                onChange(newNpcs)
              }}
              className="flex-1"
            />
            <Input
              value={npc.role}
              onChange={(e) => {
                const newNpcs = [...npcs]
                newNpcs[index] = { ...npc, role: e.target.value }
                onChange(newNpcs)
              }}
              placeholder="role"
              className="w-24"
            />
            <Button variant="ghost" size="icon" onClick={() => onChange(npcs.filter((_, i) => i !== index))}>
              <Settings2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
        {npcs.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No NPCs defined</p>}
      </CardContent>
    </Card>
  )
}

// Simple Location Editor
function LocationEditor({
  locations,
  onChange,
}: {
  locations: Universe["locations"]
  onChange: (locations: Universe["locations"]) => void
}) {
  const addLocation = () => {
    onChange([
      ...locations,
      {
        id: crypto.randomUUID(),
        name: "New Location",
        description: "",
      },
    ])
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Locations
          </CardTitle>
          <Button variant="outline" size="sm" onClick={addLocation}>
            Add Location
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {locations.map((location, index) => (
          <div key={location.id} className="flex items-center gap-2 p-2 rounded bg-muted/50">
            <Input
              value={location.name}
              onChange={(e) => {
                const newLocations = [...locations]
                newLocations[index] = { ...location, name: e.target.value }
                onChange(newLocations)
              }}
              className="flex-1"
            />
            <Button variant="ghost" size="icon" onClick={() => onChange(locations.filter((_, i) => i !== index))}>
              <Settings2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
        {locations.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No locations defined</p>
        )}
      </CardContent>
    </Card>
  )
}
