import * as React from "react";
import type { v2 } from "@wdydn/shared";
import { Loader2, Sparkles, RefreshCw, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { GenerationPreview } from "./generation-preview";

type Location = v2.Location;

interface LocationImageGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: Location;
  onImageGenerated: (imageUrl: string) => void;
}

const ART_STYLES = [
  { value: "anime", label: "Anime Background" },
  { value: "realistic", label: "Realistic" },
  { value: "painted", label: "Digital Painting" },
  { value: "pixel", label: "Pixel Art" },
  { value: "concept", label: "Concept Art" },
];

const TIME_OF_DAY = [
  { value: "day", label: "Day" },
  { value: "dawn", label: "Dawn" },
  { value: "dusk", label: "Dusk" },
  { value: "night", label: "Night" },
  { value: "overcast", label: "Overcast" },
];

const WEATHER_MOODS = [
  { value: "clear", label: "Clear" },
  { value: "rainy", label: "Rainy" },
  { value: "stormy", label: "Stormy" },
  { value: "misty", label: "Misty / Foggy" },
  { value: "snowy", label: "Snowy" },
];

export function LocationImageGenerator({
  open,
  onOpenChange,
  location,
  onImageGenerated,
}: LocationImageGeneratorProps) {
  const [description, setDescription] = React.useState("");
  const [artStyle, setArtStyle] = React.useState("painted");
  const [timeOfDay, setTimeOfDay] = React.useState("day");
  const [weather, setWeather] = React.useState("clear");

  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generatedUrl, setGeneratedUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  // Pre-fill description from location data
  React.useEffect(() => {
    if (open && location) {
      setDescription(location.description || "");
    }
  }, [open, location]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/generate-image/location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationName: location.name,
          description,
          artStyle,
          timeOfDay,
          weather,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate image");
      }

      const data = await response.json();
      setGeneratedUrl(data.imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAccept = () => {
    if (generatedUrl) {
      onImageGenerated(generatedUrl);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Generate Location Image - {location.name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Settings */}
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the location, atmosphere, key features..."
                rows={4}
              />
            </div>

            <div className="grid gap-2">
              <Label>Art Style</Label>
              <Select value={artStyle} onValueChange={setArtStyle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ART_STYLES.map((style) => (
                    <SelectItem key={style.value} value={style.value}>
                      {style.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Time of Day</Label>
                <Select value={timeOfDay} onValueChange={setTimeOfDay}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_OF_DAY.map((time) => (
                      <SelectItem key={time.value} value={time.value}>
                        {time.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Weather / Mood</Label>
                <Select value={weather} onValueChange={setWeather}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WEATHER_MOODS.map((w) => (
                      <SelectItem key={w.value} value={w.value}>
                        {w.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <GenerationPreview
              imageUrl={generatedUrl}
              isGenerating={isGenerating}
              showActions={false}
              className="aspect-video"
            />

            {error && (
              <div className="text-sm text-red-500 text-center">{error}</div>
            )}

            <div className="flex justify-center gap-2">
              <Button
                variant={generatedUrl ? "outline" : "default"}
                onClick={handleGenerate}
                disabled={isGenerating || !description.trim()}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : generatedUrl ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Regenerate
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate
                  </>
                )}
              </Button>

              {generatedUrl && (
                <Button onClick={handleAccept} disabled={isGenerating}>
                  <Check className="h-4 w-4 mr-2" />
                  Accept
                </Button>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
