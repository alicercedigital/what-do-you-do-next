"use client"

import { useState } from "react"
import { Plus, Edit2, Trash2, Save, X, ChevronDown, ChevronUp, Sparkles, Loader2 } from "lucide-react"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { GameAttribute, GameGenre } from "@/lib/schemas/game-schema"
import { genrePersistence } from "@/lib/utils/genre-persistence"

interface AttributeFormData {
  id: string
  name: string
  summary: string
  benchmarks: Array<{
    value: number
    label: string
    description: string
  }>
}

interface AttributeManagementProps {
  genre: GameGenre
  onUpdate: () => void
}

export function AttributeManagement({ genre, onUpdate }: AttributeManagementProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAttribute, setEditingAttribute] = useState<GameAttribute | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratingBenchmarks, setIsGeneratingBenchmarks] = useState(false)
  const [formData, setFormData] = useState<AttributeFormData>({
    id: "",
    name: "",
    summary: "",
    benchmarks: [
      { value: 1, label: "", description: "" },
      { value: 2, label: "", description: "" },
      { value: 3, label: "", description: "" },
      { value: 4, label: "", description: "" },
      { value: 5, label: "", description: "" },
    ],
  })

  const handleOpenDialog = (attribute?: GameAttribute) => {
    if (attribute) {
      setEditingAttribute(attribute)
      setFormData({
        id: attribute.id,
        name: attribute.name,
        summary: attribute.summary,
        benchmarks: [...attribute.benchmarks],
      })
    } else {
      setEditingAttribute(null)
      setFormData({
        id: crypto.randomUUID(),
        name: "",
        summary: "",
        benchmarks: [
          { value: 1, label: "", description: "" },
          { value: 2, label: "", description: "" },
          { value: 3, label: "", description: "" },
          { value: 4, label: "", description: "" },
          { value: 5, label: "", description: "" },
        ],
      })
    }
    setDialogOpen(true)
  }

  const handleGenerateAttribute = async () => {
    if (!formData.name.trim()) {
      alert("Please enter an attribute name first")
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch("/api/attributes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attributeName: formData.name,
          genreSetting: genre.setting,
        }),
      })

      if (!response.ok) throw new Error("Failed to generate attribute")

      const { attribute } = await response.json()
      setFormData({
        id: attribute.id,
        name: attribute.name,
        summary: attribute.summary,
        benchmarks: attribute.benchmarks,
      })
    } catch (error) {
      console.error("Error generating attribute:", error)
      alert("Failed to generate attribute. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateBenchmarks = async () => {
    if (!formData.name.trim() || !formData.summary.trim()) {
      alert("Please fill in attribute name and summary first")
      return
    }

    setIsGeneratingBenchmarks(true)
    try {
      const response = await fetch("/api/attributes/generate-benchmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attributeName: formData.name,
          attributeSummary: formData.summary,
          genreSetting: genre.setting,
        }),
      })

      if (!response.ok) throw new Error("Failed to generate benchmarks")

      const { benchmarks } = await response.json()
      setFormData({ ...formData, benchmarks })
    } catch (error) {
      console.error("Error generating benchmarks:", error)
      alert("Failed to generate benchmarks. Please try again.")
    } finally {
      setIsGeneratingBenchmarks(false)
    }
  }

  const handleSave = () => {
    if (!formData.name.trim() || !formData.summary.trim()) {
      return
    }

    // Validate benchmarks
    const validBenchmarks = formData.benchmarks.every((b) => b.label.trim() && b.description.trim())
    if (!validBenchmarks) {
      alert("Please fill in all benchmark fields")
      return
    }

    const newAttribute: GameAttribute = {
      id: formData.id,
      name: formData.name.trim(),
      summary: formData.summary.trim(),
      benchmarks: formData.benchmarks.map((b) => ({
        value: b.value,
        label: b.label.trim(),
        description: b.description.trim(),
      })),
    }

    const updatedAttributes = editingAttribute
      ? genre.attributes.map((attr) => (attr.id === editingAttribute.id ? newAttribute : attr))
      : [...genre.attributes, newAttribute]

    const updatedGenre: GameGenre = {
      ...genre,
      attributes: updatedAttributes,
    }

    genrePersistence.saveGenre(updatedGenre)
    onUpdate()
    setDialogOpen(false)
  }

  const handleDelete = (attributeId: string) => {
    if (confirm("Are you sure you want to delete this attribute?")) {
      const updatedGenre: GameGenre = {
        ...genre,
        attributes: genre.attributes.filter((attr) => attr.id !== attributeId),
      }

      genrePersistence.saveGenre(updatedGenre)
      onUpdate()
    }
  }

  const updateBenchmark = (index: number, field: "label" | "description", value: string) => {
    const newBenchmarks = [...formData.benchmarks]
    newBenchmarks[index] = { ...newBenchmarks[index], [field]: value }
    setFormData({ ...formData, benchmarks: newBenchmarks })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Attributes for {genre.name}</h3>
          <p className="text-sm text-muted-foreground">Define character attributes and their benchmarks</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              New Attribute
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>{editingAttribute ? "Edit Attribute" : "Create New Attribute"}</DialogTitle>
              <DialogDescription>Define an attribute with 5 benchmark levels (1-5)</DialogDescription>
            </DialogHeader>
            <ScrollArea className="flex-1 px-1">
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="attr-name">Attribute Name</Label>
                  <div className="flex gap-2">
                    <Input
                      id="attr-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Strength"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGenerateAttribute}
                      disabled={isGenerating || !formData.name.trim()}
                    >
                      {isGenerating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter a name and click Generate to auto-fill everything
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="attr-summary">Summary</Label>
                  <Textarea
                    id="attr-summary"
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    placeholder="Physical power and combat prowess"
                    rows={2}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Benchmarks (1-5)</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateBenchmarks}
                      disabled={isGeneratingBenchmarks || !formData.name.trim() || !formData.summary.trim()}
                    >
                      {isGeneratingBenchmarks ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate Benchmarks
                        </>
                      )}
                    </Button>
                  </div>
                  {formData.benchmarks.map((benchmark, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Badge variant="outline">Level {benchmark.value}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-1">
                          <Label htmlFor={`label-${index}`} className="text-xs">
                            Label
                          </Label>
                          <Input
                            id={`label-${index}`}
                            value={benchmark.label}
                            onChange={(e) => updateBenchmark(index, "label", e.target.value)}
                            placeholder={index === 0 ? "Novice" : index === 4 ? "Legendary" : "Expert"}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`desc-${index}`} className="text-xs">
                            Description
                          </Label>
                          <Textarea
                            id={`desc-${index}`}
                            value={benchmark.description}
                            onChange={(e) => updateBenchmark(index, "description", e.target.value)}
                            placeholder="Describe capabilities at this level..."
                            rows={2}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </ScrollArea>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!formData.name.trim() || !formData.summary.trim()}>
                <Save className="h-4 w-4 mr-2" />
                Save Attribute
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {genre.attributes.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <p>No attributes defined. Click "New Attribute" to add one.</p>
            </CardContent>
          </Card>
        ) : (
          genre.attributes.map((attribute) => (
            <AttributeCard
              key={attribute.id}
              attribute={attribute}
              onEdit={() => handleOpenDialog(attribute)}
              onDelete={() => handleDelete(attribute.id)}
              isCustomGenre={genrePersistence.isCustomGenre(genre.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}

function AttributeCard({
  attribute,
  onEdit,
  onDelete,
  isCustomGenre,
}: {
  attribute: GameAttribute
  onEdit: () => void
  onDelete: () => void
  isCustomGenre: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <CardTitle className="text-base">{attribute.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{attribute.summary}</p>
            </div>
            <div className="flex items-center gap-1">
              {isCustomGenre && (
                <>
                  <Button variant="ghost" size="icon" onClick={onEdit}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={onDelete}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </>
              )}
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon">
                  {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent>
            <div className="space-y-2">
              {attribute.benchmarks.map((benchmark) => (
                <div key={benchmark.value} className="flex items-start gap-3 p-2 rounded-lg bg-secondary/30">
                  <Badge variant="outline" className="shrink-0">
                    {benchmark.value}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{benchmark.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{benchmark.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
