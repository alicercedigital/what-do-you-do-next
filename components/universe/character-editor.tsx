"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import type {
    GameAttribute, GameCharacter
} from "@/lib/schemas/game-entity-schema";
import { useState } from "react";
import { EditorShell } from "./editor-shell";

interface CharacterEditorProps {
  character: GameCharacter | null;
  attributes: GameAttribute[];
  onSave: (character: GameCharacter) => void;
  onCancel: () => void;
}

export function CharacterEditor({
  character,
  attributes,
  onSave,
  onCancel,
}: CharacterEditorProps) {
  const [data, setData] = useState<GameCharacter>(
    character || {
      id: crypto.randomUUID(),
      type: "character",
      name: "",
      description: "",
      role: "",
      attributes: Object.fromEntries(attributes.map((a) => [a.id, 1])),
      portraits: {},
    }
  );

  const updateAttribute = (attrId: string, value: number) => {
    setData({
      ...data,
      attributes: { ...data.attributes, [attrId]: value },
    });
  };

  const canSave = data.name.trim().length > 0 && data.role.trim().length > 0;

  return (
    <EditorShell
      title="Character"
      subtitle={character ? `Editing: ${character.name}` : undefined}
      isEditing={!!character}
      onSave={() => onSave(data)}
      onCancel={onCancel}
      canSave={canSave}
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Character Details</CardTitle>
            <CardDescription>
              Basic information about this character
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Character name"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                placeholder="e.g., Mentor, Antagonist, Ally"
                value={data.role}
                onChange={(e) => setData({ ...data, role: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Character backstory and personality..."
                value={data.description}
                onChange={(e) =>
                  setData({ ...data, description: e.target.value })
                }
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attributes</CardTitle>
            <CardDescription>
              Set this character's attribute values
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {attributes.map((attr) => {
              const value = data.attributes[attr.id] || 1;
              const benchmark = attr.distributableConfig?.benchmarks.find(
                (b) => b.value === value
              );
              const maxValue = Math.max(
                ...(attr.distributableConfig?.benchmarks || []).map(
                  (b) => b.value
                )
              );

              return (
                <div key={attr.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{attr.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {attr.summary}
                      </p>
                    </div>
                    <span className="text-2xl font-bold text-primary">
                      {value}
                    </span>
                  </div>
                  <Slider
                    value={[value]}
                    min={1}
                    max={maxValue}
                    step={1}
                    onValueChange={([v]) => updateAttribute(attr.id, v)}
                  />
                  {benchmark && (
                    <p className="text-xs text-primary/70">
                      {benchmark.label}: {benchmark.description}
                    </p>
                  )}
                </div>
              );
            })}

            {attributes.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No attributes defined for this universe.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </EditorShell>
  );
}
