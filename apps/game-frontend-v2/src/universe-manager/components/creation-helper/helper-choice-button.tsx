import { Check } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export interface ChoiceOption {
  id: string;
  label: string;
  description?: string;
}

interface HelperChoiceButtonProps {
  option: ChoiceOption;
  selected: boolean;
  onClick: () => void;
  mode: "multiple" | "single";
  disabled?: boolean;
}

export function HelperChoiceButton({
  option,
  selected,
  onClick,
  mode,
  disabled = false,
}: HelperChoiceButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative flex flex-col items-start gap-1 rounded-lg border-2 p-3 text-left transition-all",
        "hover:border-primary/50 hover:bg-accent/50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        selected
          ? "border-primary bg-primary/10"
          : "border-muted-foreground/20 bg-card"
      )}
    >
      {/* Selection indicator */}
      <div
        className={cn(
          "absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full border transition-all",
          mode === "single" ? "rounded-full" : "rounded-md",
          selected
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/30"
        )}
      >
        {selected && <Check className="h-3 w-3" />}
      </div>

      {/* Label */}
      <span className="pr-6 font-medium">{option.label}</span>

      {/* Description */}
      {option.description && (
        <span className="text-xs text-muted-foreground line-clamp-2">
          {option.description}
        </span>
      )}
    </button>
  );
}
