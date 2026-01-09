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
import { EntityGeneratorDialog } from "./entity-generator-dialog";
import { useEntityGenerator } from "../../ai";

type Location = v2.Location;
type Universe = v2.Universe;

interface LocationGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  universe: Universe;
  onAccept: (location: Location) => void;
}

const LOCATION_TYPES = [
  { value: "indoor", label: "Indoor", description: "Buildings, rooms, caves" },
  { value: "outdoor", label: "Outdoor", description: "Forests, fields, roads" },
  { value: "urban", label: "Urban", description: "Cities, towns, markets" },
  { value: "dungeon", label: "Dungeon", description: "Dangerous exploration areas" },
  { value: "sanctuary", label: "Sanctuary", description: "Safe havens, temples" },
  { value: "wild", label: "Wilderness", description: "Untamed natural areas" },
];

const LOCATION_MOODS = [
  { value: "peaceful", label: "Peaceful" },
  { value: "tense", label: "Tense" },
  { value: "mysterious", label: "Mysterious" },
  { value: "dangerous", label: "Dangerous" },
  { value: "lively", label: "Lively" },
  { value: "melancholic", label: "Melancholic" },
  { value: "eerie", label: "Eerie" },
  { value: "neutral", label: "Neutral" },
];

export function LocationGenerator({
  open,
  onOpenChange,
  universe,
  onAccept,
}: LocationGeneratorProps) {
  const [locationType, setLocationType] = React.useState("outdoor");
  const [mood, setMood] = React.useState("neutral");
  const [connectedTo, setConnectedTo] = React.useState<string>("");
  const [hints, setHints] = React.useState("");

  const { state, generatedEntity, generate, reset } = useEntityGenerator<Location>(
    "location",
    universe,
    {
      type: locationType,
      mood,
      connectedTo: connectedTo || undefined,
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
      title="Generate Location"
      description="Use AI to create a new location for your universe"
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
            </div>
            {generatedEntity.description && (
              <p className="text-sm text-muted-foreground">
                {generatedEntity.description}
              </p>
            )}
            {generatedEntity.requirements && generatedEntity.requirements.length > 0 && (
              <div>
                <span className="text-xs font-medium text-muted-foreground">
                  Requirements:{" "}
                </span>
                <ul className="mt-1 text-sm list-disc list-inside">
                  {generatedEntity.requirements.map((r, i) => (
                    <li key={i} className="truncate font-mono text-xs">
                      {r}
                    </li>
                  ))}
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
            <Label>Type</Label>
            <Select value={locationType} onValueChange={setLocationType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOCATION_TYPES.map((t) => (
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
                {LOCATION_MOODS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {universe.locations.length > 0 && (
          <div className="grid gap-2">
            <Label>Connected To (optional)</Label>
            <Select value={connectedTo} onValueChange={setConnectedTo}>
              <SelectTrigger>
                <SelectValue placeholder="Select a location to connect" />
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
            <p className="text-xs text-muted-foreground">
              The new location will be connected to this existing location
            </p>
          </div>
        )}

        <div className="grid gap-2">
          <Label htmlFor="hints">Additional Hints (optional)</Label>
          <Textarea
            id="hints"
            value={hints}
            onChange={(e) => setHints(e.target.value)}
            placeholder="e.g., ancient ruins with magical artifacts, hidden entrance through waterfall..."
            rows={2}
          />
          <p className="text-xs text-muted-foreground">
            Describe specific features, atmosphere, or story elements
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
