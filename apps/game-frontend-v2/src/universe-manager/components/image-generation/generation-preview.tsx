import { RefreshCw, Check, X, Loader2, ImageIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";

interface GenerationPreviewProps {
  imageUrl: string | null;
  isGenerating: boolean;
  label?: string;
  onAccept?: () => void;
  onRegenerate?: () => void;
  onReject?: () => void;
  className?: string;
  showActions?: boolean;
}

export function GenerationPreview({
  imageUrl,
  isGenerating,
  label,
  onAccept,
  onRegenerate,
  onReject,
  className,
  showActions = true,
}: GenerationPreviewProps) {
  return (
    <div className={cn("relative rounded-lg border overflow-hidden", className)}>
      {/* Label */}
      {label && (
        <div className="absolute top-2 left-2 z-10 bg-black/60 px-2 py-0.5 rounded text-xs text-white">
          {label}
        </div>
      )}

      {/* Image or placeholder */}
      <div className="aspect-square bg-muted">
        {isGenerating ? (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="mt-2 text-sm text-muted-foreground">Generating...</span>
          </div>
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt={label || "Generated image"}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
            <ImageIcon className="h-8 w-8" />
            <span className="mt-2 text-sm">Not generated</span>
          </div>
        )}
      </div>

      {/* Actions */}
      {showActions && imageUrl && !isGenerating && (
        <div className="absolute bottom-2 right-2 flex gap-1">
          {onReject && (
            <Button
              variant="destructive"
              size="icon"
              className="h-8 w-8"
              onClick={onReject}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          {onRegenerate && (
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8"
              onClick={onRegenerate}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
          {onAccept && (
            <Button
              variant="default"
              size="icon"
              className="h-8 w-8"
              onClick={onAccept}
            >
              <Check className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

interface EmotionGridPreviewProps {
  emotions: Record<string, string | null>;
  generatingEmotion: string | null;
  onAccept: (emotion: string) => void;
  onRegenerate: (emotion: string) => void;
  onReject: (emotion: string) => void;
}

export function EmotionGridPreview({
  emotions,
  generatingEmotion,
  onAccept,
  onRegenerate,
  onReject,
}: EmotionGridPreviewProps) {
  const emotionList = [
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
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
      {emotionList.map((emotion) => (
        <GenerationPreview
          key={emotion}
          imageUrl={emotions[emotion] || null}
          isGenerating={generatingEmotion === emotion}
          label={emotion}
          onAccept={() => onAccept(emotion)}
          onRegenerate={() => onRegenerate(emotion)}
          onReject={() => onReject(emotion)}
        />
      ))}
    </div>
  );
}
