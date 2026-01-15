import * as React from "react";
import type { v2 } from "@wdydn/shared";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Badge } from "@/shared/components/ui/badge";
import { Switch } from "@/shared/components/ui/switch";
import { EntityGeneratorDialog } from "./entity-generator-dialog";
import { useEntityGenerator } from "../../ai";

type Character = v2.Character;
type Universe = v2.Universe;

interface CharacterGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  universe: Universe;
  onAccept: (character: Character) => void;
}

const CHARACTER_ROLES = [
  { value: "protagonist", label: "Protagonist", description: "Main playable character" },
  { value: "antagonist", label: "Antagonist", description: "Primary opposition" },
  { value: "ally", label: "Ally", description: "Friendly NPC" },
  { value: "neutral", label: "Neutral", description: "Neutral party" },
  { value: "mentor", label: "Mentor", description: "Guide or teacher" },
  { value: "merchant", label: "Merchant", description: "Shop keeper or trader" },
  { value: "quest-giver", label: "Quest Giver", description: "Provides missions" },
];

const CHARACTER_ARCHETYPES = [
  { value: "warrior", label: "Warrior" },
  { value: "mage", label: "Mage" },
  { value: "rogue", label: "Rogue" },
  { value: "healer", label: "Healer" },
  { value: "scholar", label: "Scholar" },
  { value: "noble", label: "Noble" },
  { value: "commoner", label: "Commoner" },
  { value: "outcast", label: "Outcast" },
  { value: "mysterious", label: "Mysterious" },
  { value: "custom", label: "Custom" },
];

export function CharacterGenerator({
  open,
  onOpenChange,
  universe,
  onAccept,
}: CharacterGeneratorProps) {
  const [role, setRole] = React.useState("ally");
  const [archetype, setArchetype] = React.useState("custom");
  const [isPlayable, setIsPlayable] = React.useState(false);
  const [hints, setHints] = React.useState("");

  const { state, generatedEntity, generate, reset } = useEntityGenerator<Character>(
    "character",
    universe,
    {
      role,
      archetype,
      isPlayable,
      hints,
    }
  );

  const handleGenerate = () => {
    generate();
  };

  const handleAccept = () => {
    if (generatedEntity) {
      onAccept(generatedEntity);
      reset();
      onOpenChange(false);
    }
  };

  const handleRegenerate = () => {
    generate();
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset();
    }
    onOpenChange(newOpen);
  };

  return (
    <EntityGeneratorDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Generate Character"
      description="Use AI to create a new character for your universe"
      isGenerating={state.isLoading}
      hasPreview={!!generatedEntity}
      onGenerate={handleGenerate}
      onAccept={handleAccept}
      onRegenerate={handleRegenerate}
      preview={
        generatedEntity ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium">{generatedEntity.name}</span>
              {generatedEntity.isPlayer && <Badge>Player</Badge>}
              {generatedEntity.playable && !generatedEntity.isPlayer && (
                <Badge variant="secondary">Playable</Badge>
              )}
            </div>
            {generatedEntity.description && (
              <p className="text-sm text-muted-foreground">
                {generatedEntity.description}
              </p>
            )}
            {generatedEntity.personality && (
              <div className="space-y-2">
                {generatedEntity.personality.traits.length > 0 && (
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">
                      Traits:{" "}
                    </span>
                    <span className="text-sm">
                      {generatedEntity.personality.traits.join(", ")}
                    </span>
                  </div>
                )}
                {generatedEntity.personality.values.length > 0 && (
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">
                      Values:{" "}
                    </span>
                    <span className="text-sm">
                      {generatedEntity.personality.values.join(", ")}
                    </span>
                  </div>
                )}
                {generatedEntity.personality.fears.length > 0 && (
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">
                      Fears:{" "}
                    </span>
                    <span className="text-sm">
                      {generatedEntity.personality.fears.join(", ")}
                    </span>
                  </div>
                )}
                {generatedEntity.personality.desires.length > 0 && (
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">
                      Desires:{" "}
                    </span>
                    <span className="text-sm">
                      {generatedEntity.personality.desires.join(", ")}
                    </span>
                  </div>
                )}
              </div>
            )}
            {generatedEntity.memories.length > 0 && (
              <div>
                <span className="text-xs font-medium text-muted-foreground">
                  Memories:{" "}
                </span>
                <ul className="mt-1 text-sm list-disc list-inside">
                  {generatedEntity.memories.slice(0, 3).map((m, i) => (
                    <li key={i} className="truncate">
                      {m}
                    </li>
                  ))}
                  {generatedEntity.memories.length > 3 && (
                    <li className="text-muted-foreground">
                      +{generatedEntity.memories.length - 3} more
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        ) : null
      }
    >
      <div className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CHARACTER_ROLES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    <div>
                      <div>{r.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {r.description}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Archetype</Label>
            <Select value={archetype} onValueChange={setArchetype}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CHARACTER_ARCHETYPES.map((a) => (
                  <SelectItem key={a.value} value={a.value}>
                    {a.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <Label htmlFor="playable">Playable Character</Label>
            <p className="text-xs text-muted-foreground">
              Can this character be selected at game start?
            </p>
          </div>
          <Switch
            id="playable"
            checked={isPlayable}
            onCheckedChange={setIsPlayable}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="hints">Additional Hints (optional)</Label>
          <Textarea
            id="hints"
            value={hints}
            onChange={(e) => setHints(e.target.value)}
            placeholder="e.g., experienced knight with a dark past, friendly but suspicious of strangers..."
            rows={2}
          />
          <p className="text-xs text-muted-foreground">
            Describe personality, background, or appearance hints
          </p>
        </div>

        {state.error && (
          <div className="rounded bg-red-500/10 px-3 py-2 text-sm text-red-500">
            {state.error}
          </div>
        )}
      </div>
    </EntityGeneratorDialog>
  );
}
