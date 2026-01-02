"use client"

import { useState } from "react"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import type { GameAttribute } from "@/lib/schemas/game-entity-schema"

interface AttributeEditorProps {
  attribute: GameAttribute | null
  onSave: (attribute: GameAttribute) => void
  onCancel: () => void
}

export function AttributeEditor({ attribute, onSave, onCancel }: AttributeEditorProps) {
  const [data, setData] = useState<GameAttribute>(
    attribute || {
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
    },
  )

  const updateBenchmark = (index: number, field: string, value: string | number) => {
    const updated = [...data.benchmarks]
    updated[index] = { ...updated[index], [field]: value }
    setData({ ...data, benchmarks: updated })
  }

  const addBenchmark = () => {
    const nextValue = data.benchmarks.length + 1
    setData({
      ...data,
      benchmarks: [...data.benchmarks, { value: nextValue, label: "", description: "" }],
    })
  }

  const removeBenchmark = (index: number) => {
    if (data.benchmarks.length <= 1) return
    const updated = data.benchmarks.filter((_, i) => i !== index)
    setData({ ...data, benchmarks: updated })
  }

  const canSave = data.name.trim().length > 0 && data.benchmarks.every((b) => b.label.trim().length > 0)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{attribute ? "Edit Attribute" : "Create Attribute"}</h1>
          </div>
          <Button onClick={() => onSave(data)} disabled={!canSave}>
            Save Attribute
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Attribute Details</CardTitle>
            <CardDescription>Define an attribute for characters in this universe</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="e.g., Strength, Intelligence, Charisma"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="summary">Summary</Label>
              <Textarea
                id="summary"
                placeholder="What this attribute represents..."
                value={data.summary}
                onChange={(e) => setData({ ...data, summary: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Benchmarks</Label>
                <Button variant="outline" size="sm" onClick={addBenchmark}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Level
                </Button>
              </div>

              <div className="space-y-3">
                {data.benchmarks.map((benchmark, index) => (
                  <div key={index} className="p-4 rounded-lg bg-secondary/30 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-16">
                        <Label className="text-xs">Value</Label>
                        <Input
                          type="number"
                          value={benchmark.value}
                          onChange={(e) => updateBenchmark(index, "value", Number.parseInt(e.target.value) || 0)}
                          className="mt-1"
                        />
                      </div>
                      <div className="flex-1">
                        <Label className="text-xs">Label</Label>
                        <Input
                          placeholder="e.g., Novice, Expert, Master"
                          value={benchmark.label}
                          onChange={(e) => updateBenchmark(index, "label", e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      {data.benchmarks.length > 1 && (
                        <Button
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
                        onChange={(e) => updateBenchmark(index, "description", e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
