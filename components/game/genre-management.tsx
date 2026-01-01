"use client"

import { useState, useEffect } from "react"
import { Plus, Edit2, Trash2, Save, X, ChevronRight, Sparkles, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AttributeManagement } from "./attribute-management"
import type { GameGenre } from "@/lib/schemas/game-schema"
import { genrePersistence } from "@/lib/utils/genre-persistence"

interface GenreFormData {
  id: string
  name: string
  description: string
  setting: string
}

export function GenreManagement() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [attributeDialogOpen, setAttributeDialogOpen] = useState(false)
  const [genres, setGenres] = useState<GameGenre[]>([])
  const [editingGenre, setEditingGenre] = useState<GameGenre | null>(null)
  const [selectedGenre, setSelectedGenre] = useState<GameGenre | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [genreTheme, setGenreTheme] = useState("")
  const [formData, setFormData] = useState<GenreFormData>({
    id: "",
    name: "",
    description: "",
    setting: "",
  })

  useEffect(() => {
    loadGenres()
  }, [])

  const loadGenres = () => {
    setGenres(genrePersistence.getAllGenres())
  }

  const handleOpenDialog = (genre?: GameGenre) => {
    if (genre) {
      setEditingGenre(genre)
      setFormData({
        id: genre.id,
        name: genre.name,
        description: genre.description,
        setting: genre.setting,
      })
      setGenreTheme("")
    } else {
      setEditingGenre(null)
      setFormData({
        id: crypto.randomUUID(),
        name: "",
        description: "",
        setting: "",
      })
      setGenreTheme("")
    }
    setDialogOpen(true)
  }

  const handleGenerateGenre = async () => {
    if (!formData.name.trim()) {
      alert("Please enter a genre name first")
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch("/api/genres/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          genreName: formData.name,
          genreTheme: genreTheme.trim() || undefined,
        }),
      })

      if (!response.ok) throw new Error("Failed to generate genre")

      const { genre } = await response.json()

      // Update form data with generated genre
      setFormData({
        id: genre.id,
        name: genre.name,
        description: genre.description,
        setting: genre.setting,
      })

      // Save the genre immediately with all attributes
      genrePersistence.saveGenre(genre)
      loadGenres()

      alert(`Genre "${genre.name}" created with ${genre.attributes.length} attributes!`)
      setDialogOpen(false)
    } catch (error) {
      console.error("Error generating genre:", error)
      alert("Failed to generate genre. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = () => {
    if (!formData.name.trim() || !formData.description.trim() || !formData.setting.trim()) {
      return
    }

    const genre: GameGenre = {
      id: formData.id,
      name: formData.name.trim(),
      description: formData.description.trim(),
      setting: formData.setting.trim(),
      attributes: editingGenre?.attributes || [], // Keep existing attributes or empty
    }

    genrePersistence.saveGenre(genre)
    loadGenres()
    setDialogOpen(false)
  }

  const handleDelete = (genreId: string) => {
    if (confirm("Are you sure you want to delete this genre?")) {
      const success = genrePersistence.deleteGenre(genreId)
      if (success) {
        loadGenres()
      }
    }
  }

  const handleOpenAttributeManager = (genre: GameGenre) => {
    setSelectedGenre(genre)
    setAttributeDialogOpen(true)
  }

  const handleAttributeUpdate = () => {
    loadGenres()
    // Refresh selected genre
    if (selectedGenre) {
      const updated = genrePersistence.getAllGenres().find((g) => g.id === selectedGenre.id)
      if (updated) {
        setSelectedGenre(updated)
      }
    }
  }

  const isCustomGenre = (genreId: string) => genrePersistence.isCustomGenre(genreId)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Genre Management</h2>
          <p className="text-sm text-muted-foreground">Create and manage custom game genres</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              New Genre
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingGenre ? "Edit Genre" : "Create New Genre"}</DialogTitle>
              <DialogDescription>
                Define the basic information for your genre, or use AI to generate everything.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Genre Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Space Opera"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="theme">Theme / Context (Optional)</Label>
                <Textarea
                  id="theme"
                  value={genreTheme}
                  onChange={(e) => setGenreTheme(e.target.value)}
                  placeholder="e.g., 'with emphasis on political intrigue' or 'inspired by 1950s pulp sci-fi'"
                  rows={2}
                />
                <p className="text-xs text-muted-foreground">Additional context to guide AI generation</p>
              </div>

              <div className="flex items-center justify-center py-2">
                <Button
                  type="button"
                  variant="default"
                  className="w-full"
                  onClick={handleGenerateGenre}
                  disabled={isGenerating || !formData.name.trim()}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Complete Genre...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Complete Genre with AI
                    </>
                  )}
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or create manually</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Epic adventures across the galaxy with starships and alien civilizations..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="setting">Setting</Label>
                <Textarea
                  id="setting"
                  value={formData.setting}
                  onChange={(e) => setFormData({ ...formData, setting: e.target.value })}
                  placeholder="The year 3042, humanity has colonized hundreds of star systems..."
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!formData.name.trim() || !formData.description.trim() || !formData.setting.trim()}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Genre
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="h-[600px] pr-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {genres.map((genre) => (
            <Card key={genre.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {genre.name}
                      {!isCustomGenre(genre.id) && (
                        <Badge variant="secondary" className="text-xs">
                          Default
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-2">{genre.description}</CardDescription>
                  </div>
                  {isCustomGenre(genre.id) && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(genre)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(genre.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Setting</p>
                    <p className="text-sm">{genre.setting}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Attributes ({genre.attributes.length})
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {genre.attributes.length > 0 ? (
                        genre.attributes.map((attr) => (
                          <Badge key={attr.id} variant="outline" className="text-xs">
                            {attr.name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground italic">No attributes defined</span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-transparent"
                    onClick={() => handleOpenAttributeManager(genre)}
                  >
                    <ChevronRight className="h-4 w-4 mr-2" />
                    Manage Attributes
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      <Dialog open={attributeDialogOpen} onOpenChange={setAttributeDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          {selectedGenre && <AttributeManagement genre={selectedGenre} onUpdate={handleAttributeUpdate} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
