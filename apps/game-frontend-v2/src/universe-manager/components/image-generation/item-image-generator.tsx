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
import { Switch } from "@/shared/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { GenerationPreview } from "./generation-preview";

type Item = v2.Item;

interface ItemImageGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: Item;
  onImageGenerated: (imageUrl: string) => void;
}

const ART_STYLES = [
  { value: "icon", label: "Icon / UI Style" },
  { value: "detailed", label: "Detailed Illustration" },
  { value: "pixel", label: "Pixel Art" },
  { value: "realistic", label: "Realistic" },
  { value: "anime", label: "Anime Style" },
];

const RARITY_EFFECTS = [
  { value: "none", label: "None" },
  { value: "subtle", label: "Subtle Glow" },
  { value: "moderate", label: "Moderate Effects" },
  { value: "epic", label: "Epic Effects" },
];

export function ItemImageGenerator({
  open,
  onOpenChange,
  item,
  onImageGenerated,
}: ItemImageGeneratorProps) {
  const [description, setDescription] = React.useState("");
  const [artStyle, setArtStyle] = React.useState("icon");
  const [transparentBg, setTransparentBg] = React.useState(true);
  const [rarityEffects, setRarityEffects] = React.useState("subtle");

  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generatedUrl, setGeneratedUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  // Pre-fill description from item data
  React.useEffect(() => {
    if (open && item) {
      setDescription(item.description || "");
      // Set rarity effects based on item rarity
      if (item.rarity === "legendary" || item.rarity === "epic") {
        setRarityEffects("epic");
      } else if (item.rarity === "rare") {
        setRarityEffects("moderate");
      } else if (item.rarity === "uncommon") {
        setRarityEffects("subtle");
      } else {
        setRarityEffects("none");
      }
    }
  }, [open, item]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/generate-image/item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemName: item.name,
          description,
          artStyle,
          transparentBg,
          rarityEffects,
          kind: item.kind,
          rarity: item.rarity,
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
            Generate Item Image - {item.name}
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
                placeholder="Describe the item's appearance, materials, glow effects..."
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

            <div className="grid gap-2">
              <Label>Rarity Effects</Label>
              <Select value={rarityEffects} onValueChange={setRarityEffects}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RARITY_EFFECTS.map((effect) => (
                    <SelectItem key={effect.value} value={effect.value}>
                      {effect.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Add visual effects based on item rarity
              </p>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label htmlFor="transparent">Transparent Background</Label>
                <p className="text-xs text-muted-foreground">
                  Best for UI icons and inventory
                </p>
              </div>
              <Switch
                id="transparent"
                checked={transparentBg}
                onCheckedChange={setTransparentBg}
              />
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <GenerationPreview
              imageUrl={generatedUrl}
              isGenerating={isGenerating}
              showActions={false}
              className={transparentBg ? "bg-checkered" : ""}
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
