import { Loader2, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import type { HelperStepId } from "./helper-steps";

interface HelperPreviewProps {
  stepId: HelperStepId;
  selectedValues: string[];
  freeformText: string;
  previewText?: string;
  isLoading?: boolean;
  onGenerate: () => void;
  onSkip: () => void;
  canGenerate: boolean;
  canSkip: boolean;
  error?: string | null;
}

export function HelperPreview({
  stepId,
  selectedValues,
  freeformText,
  previewText,
  isLoading = false,
  onGenerate,
  onSkip,
  canGenerate,
  canSkip,
  error,
}: HelperPreviewProps) {
  const hasContent = selectedValues.length > 0 || freeformText.trim().length > 0;

  const getStepLabel = (id: HelperStepId): string => {
    switch (id) {
      case "core-idea":
        return "Universe concept";
      case "world-rules":
        return "Stats & mechanics";
      case "places":
        return "Locations";
      case "characters":
        return "Characters";
      case "things":
        return "Items";
      case "first-moments":
        return "Opening moments";
      default:
        return "Content";
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 pt-0">
        <ScrollArea className="flex-1 min-h-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : hasContent ? (
            <div className="space-y-3 pr-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  {getStepLabel(stepId)} to generate:
                </p>
                <div className="text-sm space-y-1">
                  {selectedValues.map((value) => (
                    <p key={value} className="text-foreground">
                      • {value}
                    </p>
                  ))}
                  {freeformText && (
                    <p className="text-foreground italic">
                      "{freeformText}"
                    </p>
                  )}
                </div>
              </div>
              {previewText && (
                <div className="pt-2 border-t">
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    AI will create:
                  </p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {previewText}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
              Select options or type to see preview
            </div>
          )}
        </ScrollArea>

        {/* Error display - above buttons so it stays visible */}
        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="flex gap-2 pt-2 border-t">
          <Button
            onClick={onGenerate}
            disabled={!canGenerate || isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate & Add
              </>
            )}
          </Button>
          {canSkip && (
            <Button
              variant="outline"
              onClick={onSkip}
              disabled={isLoading}
            >
              Skip
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
