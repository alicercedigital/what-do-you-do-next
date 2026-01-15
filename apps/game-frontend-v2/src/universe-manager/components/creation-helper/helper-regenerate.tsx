import { RefreshCw, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

export interface RegenerateOption {
  id: string;
  label: string;
  isAiGenerated?: boolean;
}

// Fixed regeneration options that are always available
export const FIXED_REGENERATE_OPTIONS: RegenerateOption[] = [
  { id: "totally-different", label: "Totally Different" },
  { id: "more-specific", label: "More Specific" },
  { id: "simpler", label: "Simpler" },
  { id: "more-of-these", label: "More of These" },
];

interface HelperRegenerateProps {
  onRegenerate: (option: RegenerateOption) => void;
  aiOptions?: RegenerateOption[];
  isLoading?: boolean;
  isLoadingAiOptions?: boolean;
}

export function HelperRegenerate({
  onRegenerate,
  aiOptions = [],
  isLoading = false,
  isLoadingAiOptions = false,
}: HelperRegenerateProps) {
  return (
    <div className="space-y-3">
      {/* Section header */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <RefreshCw className="h-4 w-4" />
        <span>Need more suggestions? Try:</span>
      </div>

      {/* Fixed regenerate buttons */}
      <div className="flex flex-wrap gap-2">
        {FIXED_REGENERATE_OPTIONS.map((option) => (
          <Button
            key={option.id}
            variant="outline"
            size="sm"
            onClick={() => onRegenerate(option)}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            ) : null}
            {option.label}
          </Button>
        ))}
      </div>

      {/* AI-generated contextual options */}
      {(aiOptions.length > 0 || isLoadingAiOptions) && (
        <div className="space-y-2 pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Based on your selections:
          </p>
          {isLoadingAiOptions ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Getting suggestions...</span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {aiOptions.map((option) => (
                <Button
                  key={option.id}
                  variant="secondary"
                  size="sm"
                  onClick={() => onRegenerate(option)}
                  disabled={isLoading}
                  className="gap-1"
                >
                  <Sparkles className="h-3 w-3" />
                  {option.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
