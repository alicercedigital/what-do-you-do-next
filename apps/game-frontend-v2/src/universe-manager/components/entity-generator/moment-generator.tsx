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

type Moment = v2.Moment;
type Universe = v2.Universe;

interface MomentGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  universe: Universe;
  onAccept: (moment: Moment) => void;
}

const MOMENT_TYPES = [
  { value: "story", label: "Story", description: "Narrative exposition" },
  { value: "dialogue", label: "Dialogue", description: "Character conversation" },
  { value: "choice", label: "Choice", description: "Player decision point" },
  { value: "combat", label: "Combat", description: "Challenge encounter" },
  { value: "exploration", label: "Exploration", description: "Discovery and travel" },
  { value: "transition", label: "Transition", description: "Scene/location change" },
];

const MOMENT_MOODS = [
  { value: "neutral", label: "Neutral" },
  { value: "tense", label: "Tense" },
  { value: "happy", label: "Happy" },
  { value: "sad", label: "Sad" },
  { value: "mysterious", label: "Mysterious" },
  { value: "action", label: "Action" },
  { value: "romantic", label: "Romantic" },
  { value: "horror", label: "Horror" },
];

export function MomentGenerator({
  open,
  onOpenChange,
  universe,
  onAccept,
}: MomentGeneratorProps) {
  const [momentType, setMomentType] = React.useState("story");
  const [mood, setMood] = React.useState("neutral");
  const [locationId, setLocationId] = React.useState("");
  const [speakerId, setSpeakerId] = React.useState("");
  const [isUrgent, setIsUrgent] = React.useState(false);
  const [connectTo, setConnectTo] = React.useState("");
  const [hints, setHints] = React.useState("");

  const { state, generatedEntity, generate, reset } = useEntityGenerator<Moment>(
    "moment",
    universe,
    {
      type: momentType,
      mood,
      locationId: locationId || undefined,
      speakerId: speakerId || undefined,
      isUrgent,
      connectTo: connectTo || undefined,
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
      title="Generate Moment"
      description="Use AI to create a new moment for your universe"
      isGenerating={state.isLoading}
      hasPreview={!!generatedEntity}
      onGenerate={handleGenerate}
      onAccept={handleAccept}
      onRegenerate={handleRegenerate}
      preview={
        generatedEntity ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium">{generatedEntity.title}</span>
              {generatedEntity.urgent && (
                <Badge variant="destructive">Urgent</Badge>
              )}
            </div>
            {generatedEntity.preview && (
              <p className="text-sm italic text-muted-foreground">
                {generatedEntity.preview}
              </p>
            )}
            {generatedEntity.text && (
              <p className="text-sm">{generatedEntity.text}</p>
            )}
            <div className="grid grid-cols-2 gap-2 text-sm">
              {generatedEntity.locationId && (
                <div>
                  <span className="text-muted-foreground">Location: </span>
                  {universe.locations.find((l) => l.id === generatedEntity.locationId)
                    ?.name || generatedEntity.locationId}
                </div>
              )}
              {generatedEntity.stage && (
                <div>
                  <span className="text-muted-foreground">Stage: </span>
                  {Object.entries(generatedEntity.stage)
                    .filter(([, slot]) => slot?.characterId)
                    .map(([, slot]) => {
                      const char = universe.characters.find((c) => c.id === slot?.characterId);
                      return char?.name || slot?.characterId;
                    })
                    .join(", ") || "Empty"}
                </div>
              )}
            </div>
            {generatedEntity.transitions && (
              <div>
                <span className="text-xs font-medium text-muted-foreground">
                  Transitions:{" "}
                </span>
                {Object.entries(generatedEntity.transitions).map(
                  ([status, exprs]) =>
                    exprs &&
                    exprs.length > 0 && (
                      <div key={status} className="mt-1">
                        <Badge variant="outline" className="text-xs mr-1">
                          {status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {exprs.length} expression(s)
                        </span>
                      </div>
                    )
                )}
              </div>
            )}
          </div>
        ) : null
      }
    >
      <div className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label>Moment Type</Label>
            <Select value={momentType} onValueChange={setMomentType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MOMENT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    <div>
                      <div>{t.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {t.description}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Mood</Label>
            <Select value={mood} onValueChange={setMood}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MOMENT_MOODS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {universe.locations.length > 0 && (
            <div className="grid gap-2">
              <Label>Location (optional)</Label>
              <Select value={locationId} onValueChange={setLocationId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None</SelectItem>
                  {universe.locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {universe.characters.length > 0 && (
            <div className="grid gap-2">
              <Label>Speaker (optional)</Label>
              <Select value={speakerId} onValueChange={setSpeakerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select speaker" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None</SelectItem>
                  {universe.characters.map((char) => (
                    <SelectItem key={char.id} value={char.id}>
                      {char.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {universe.moments.length > 0 && (
          <div className="grid gap-2">
            <Label>Connect To Moment (optional)</Label>
            <Select value={connectTo} onValueChange={setConnectTo}>
              <SelectTrigger>
                <SelectValue placeholder="Select a moment to connect" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">None</SelectItem>
                {universe.moments.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              The new moment will create a transition from this moment
            </p>
          </div>
        )}

        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <Label htmlFor="urgent">Urgent</Label>
            <p className="text-xs text-muted-foreground">
              Player must choose this moment or it will be marked as passed
            </p>
          </div>
          <Switch id="urgent" checked={isUrgent} onCheckedChange={setIsUrgent} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="hints">Additional Hints (optional)</Label>
          <Textarea
            id="hints"
            value={hints}
            onChange={(e) => setHints(e.target.value)}
            placeholder="e.g., dramatic reveal, introduces new character, leads to boss fight..."
            rows={2}
          />
          <p className="text-xs text-muted-foreground">
            Describe plot points, character involvement, or narrative direction
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
