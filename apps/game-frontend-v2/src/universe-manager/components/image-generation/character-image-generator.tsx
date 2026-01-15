import * as React from "react";
import type { v2 } from "@wdydn/shared";
import { Loader2, Sparkles, ImagePlus, Wand2 } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { GenerationPreview, EmotionGridPreview } from "./generation-preview";

type Character = v2.Character;

interface CharacterImageGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  character: Character;
  onImagesGenerated: (images: Record<string, string>) => void;
}

const ART_STYLES = [
  { value: "anime", label: "Anime" },
  { value: "realistic", label: "Realistic" },
  { value: "pixel", label: "Pixel Art" },
  { value: "illustration", label: "Digital Illustration" },
  { value: "painterly", label: "Painterly" },
  { value: "comic", label: "Comic Book" },
];

const EMOTIONS = [
  "neutral",
  "happy",
  "joy",
  "anger",
  "sad",
  "fear",
  "thinking",
  "confused",
  "embarrassed",
  "confident",
] as const;

type Emotion = (typeof EMOTIONS)[number];

interface GenerationState {
  isGenerating: boolean;
  currentEmotion: Emotion | null;
  generatedImages: Record<string, string>;
  acceptedImages: Record<string, string>;
  error: string | null;
}

export function CharacterImageGenerator({
  open,
  onOpenChange,
  character,
  onImagesGenerated,
}: CharacterImageGeneratorProps) {
  const [description, setDescription] = React.useState("");
  const [artStyle, setArtStyle] = React.useState("anime");
  const [step, setStep] = React.useState<"config" | "neutral" | "emotions">("config");

  const [state, setState] = React.useState<GenerationState>({
    isGenerating: false,
    currentEmotion: null,
    generatedImages: {},
    acceptedImages: {},
    error: null,
  });

  // Pre-fill description from character data
  React.useEffect(() => {
    if (open && character) {
      const parts: string[] = [];
      if (character.description) parts.push(character.description);
      if (character.personality?.traits.length) {
        parts.push(`Personality: ${character.personality.traits.join(", ")}`);
      }
      setDescription(parts.join("\n"));
    }
  }, [open, character]);

  const generateImage = async (emotion: Emotion) => {
    setState((s) => ({
      ...s,
      isGenerating: true,
      currentEmotion: emotion,
      error: null,
    }));

    try {
      const response = await fetch("/api/ai/generate-image/character", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterName: character.name,
          description,
          artStyle,
          emotion,
          baseImage: state.acceptedImages.neutral,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate image");
      }

      const data = await response.json();

      setState((s) => ({
        ...s,
        isGenerating: false,
        currentEmotion: null,
        generatedImages: {
          ...s.generatedImages,
          [emotion]: data.imageUrl,
        },
      }));
    } catch (error) {
      setState((s) => ({
        ...s,
        isGenerating: false,
        currentEmotion: null,
        error: error instanceof Error ? error.message : "Generation failed",
      }));
    }
  };

  const handleGenerateNeutral = () => {
    generateImage("neutral");
    setStep("neutral");
  };

  const handleAcceptNeutral = () => {
    setState((s) => ({
      ...s,
      acceptedImages: {
        ...s.acceptedImages,
        neutral: s.generatedImages.neutral,
      },
    }));
    setStep("emotions");
  };

  const handleGenerateAllEmotions = async () => {
    const emotionsToGenerate = EMOTIONS.filter((e) => e !== "neutral");

    for (const emotion of emotionsToGenerate) {
      await generateImage(emotion);
    }
  };

  const handleAcceptEmotion = (emotion: string) => {
    setState((s) => ({
      ...s,
      acceptedImages: {
        ...s.acceptedImages,
        [emotion]: s.generatedImages[emotion],
      },
    }));
  };

  const handleRejectEmotion = (emotion: string) => {
    setState((s) => {
      const { [emotion]: _, ...rest } = s.generatedImages;
      return { ...s, generatedImages: rest };
    });
  };

  const handleRegenerateEmotion = (emotion: string) => {
    generateImage(emotion as Emotion);
  };

  const handleFinish = () => {
    onImagesGenerated(state.acceptedImages);
    onOpenChange(false);
  };

  const acceptedCount = Object.keys(state.acceptedImages).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Generate Character Images - {character.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={step} className="flex-1 min-h-0 flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="config" onClick={() => setStep("config")}>
              1. Configure
            </TabsTrigger>
            <TabsTrigger
              value="neutral"
              onClick={() => setStep("neutral")}
              disabled={step === "config"}
            >
              2. Neutral
            </TabsTrigger>
            <TabsTrigger
              value="emotions"
              onClick={() => setStep("emotions")}
              disabled={!state.acceptedImages.neutral}
            >
              3. Emotions
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 min-h-0 mt-4">
            <TabsContent value="config" className="h-full m-0">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label>Appearance Description</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the character's appearance, clothing, distinguishing features..."
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Be specific about features you want to see in the portrait
                  </p>
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
              </div>
            </TabsContent>

            <TabsContent value="neutral" className="h-full m-0">
              <div className="flex flex-col items-center gap-4">
                <p className="text-sm text-muted-foreground text-center">
                  First, generate and approve the neutral expression.
                  <br />
                  This will be used as the base for all other emotions.
                </p>

                <GenerationPreview
                  imageUrl={state.generatedImages.neutral || null}
                  isGenerating={state.currentEmotion === "neutral"}
                  label="Neutral"
                  className="w-64"
                  showActions={false}
                />

                {state.error && (
                  <div className="text-sm text-red-500">{state.error}</div>
                )}

                <div className="flex gap-2">
                  {!state.generatedImages.neutral ? (
                    <Button
                      onClick={handleGenerateNeutral}
                      disabled={state.isGenerating || !description.trim()}
                    >
                      {state.isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-4 w-4 mr-2" />
                          Generate Neutral
                        </>
                      )}
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => generateImage("neutral")}
                        disabled={state.isGenerating}
                      >
                        Regenerate
                      </Button>
                      <Button
                        onClick={handleAcceptNeutral}
                        disabled={state.isGenerating}
                      >
                        Accept & Continue
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="emotions" className="h-full m-0">
              <ScrollArea className="h-[350px]">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Generate emotion variants based on your approved neutral portrait.
                    </p>
                    <Button
                      onClick={handleGenerateAllEmotions}
                      disabled={state.isGenerating}
                      size="sm"
                    >
                      {state.isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <ImagePlus className="h-4 w-4 mr-2" />
                          Generate All Emotions
                        </>
                      )}
                    </Button>
                  </div>

                  <EmotionGridPreview
                    emotions={{
                      neutral: state.acceptedImages.neutral,
                      ...state.generatedImages,
                    }}
                    generatingEmotion={state.currentEmotion}
                    onAccept={handleAcceptEmotion}
                    onRegenerate={handleRegenerateEmotion}
                    onReject={handleRejectEmotion}
                  />

                  {state.error && (
                    <div className="text-sm text-red-500 text-center">
                      {state.error}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {acceptedCount > 0 && `${acceptedCount} image(s) accepted`}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            {step === "emotions" && acceptedCount > 0 && (
              <Button onClick={handleFinish}>
                Save {acceptedCount} Images
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
