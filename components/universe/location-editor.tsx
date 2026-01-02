"use client"

import { useState } from "react"
import { ArrowLeft, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import type { GameLocation } from "@/lib/schemas/game-entity-schema"

interface LocationEditorProps {
  location: GameLocation | null
  onSave: (location: GameLocation) => void
  onCancel: () => void
}

export function LocationEditor({ location, onSave, onCancel }: LocationEditorProps) {
  const [data, setData] = useState<GameLocation>(
    location || {
      id: crypto.randomUUID(),
      type: "location",
      name: "",
      description: "",
      attributes: {},
      musics: [],
      ambientSounds: [],
      backgroundImageUrl: "",
    },
  )

  const [newMusic, setNewMusic] = useState("")
  const [newAmbient, setNewAmbient] = useState("")

  const addMusic = () => {
    if (newMusic.trim()) {
      setData({ ...data, musics: [...data.musics, newMusic.trim()] })
      setNewMusic("")
    }
  }

  const removeMusic = (index: number) => {
    setData({ ...data, musics: data.musics.filter((_, i) => i !== index) })
  }

  const addAmbient = () => {
    if (newAmbient.trim()) {
      setData({ ...data, ambientSounds: [...data.ambientSounds, newAmbient.trim()] })
      setNewAmbient("")
    }
  }

  const removeAmbient = (index: number) => {
    setData({ ...data, ambientSounds: data.ambientSounds.filter((_, i) => i !== index) })
  }

  const canSave = data.name.trim().length > 0

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{location ? "Edit Location" : "Create Location"}</h1>
          </div>
          <Button onClick={() => onSave(data)} disabled={!canSave}>
            Save Location
          </Button>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Location Details</CardTitle>
              <CardDescription>Basic information about this location</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Location name"
                  value={data.name}
                  onChange={(e) => setData({ ...data, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe this location..."
                  value={data.description}
                  onChange={(e) => setData({ ...data, description: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="background">Background Image URL (optional)</Label>
                <Input
                  id="background"
                  placeholder="https://example.com/image.jpg"
                  value={data.backgroundImageUrl || ""}
                  onChange={(e) => setData({ ...data, backgroundImageUrl: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Audio References</CardTitle>
              <CardDescription>Track references for music and ambient sounds</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Music Tracks</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Track ID or name"
                    value={newMusic}
                    onChange={(e) => setNewMusic(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addMusic()}
                  />
                  <Button variant="outline" onClick={addMusic}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {data.musics.map((track, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {track}
                      <button onClick={() => removeMusic(index)} className="ml-1 hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Ambient Sounds</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Sound ID or name"
                    value={newAmbient}
                    onChange={(e) => setNewAmbient(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addAmbient()}
                  />
                  <Button variant="outline" onClick={addAmbient}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {data.ambientSounds.map((sound, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {sound}
                      <button onClick={() => removeAmbient(index)} className="ml-1 hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
