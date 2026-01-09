import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { cn } from "@/shared/lib/utils";
import {
  AlignLeft,
  ChevronDown,
  FileText,
  Lightbulb,
  Loader2,
  Sparkles,
  Wand2,
} from "lucide-react";
import type * as React from "react";
import { useCallback, useState } from "react";

export type SmartInputAction = {
  id: "generate" | "expand" | "improve" | "summarize" | "suggest-names";
  label: string;
  icon: React.ElementType;
  description?: string;
  requiresValue?: boolean; // If true, action only shows when there's existing content
};

export const DEFAULT_TEXT_ACTIONS: SmartInputAction[] = [
  {
    id: "generate",
    label: "Generate",
    icon: Sparkles,
    description: "AI generates content",
  },
  {
    id: "expand",
    label: "Expand",
    icon: Wand2,
    description: "Expand and improve",
    requiresValue: true,
  },
  {
    id: "improve",
    label: "Improve",
    icon: Lightbulb,
    description: "Fix and enhance",
    requiresValue: true,
  },
  {
    id: "summarize",
    label: "Summarize",
    icon: AlignLeft,
    description: "Make it concise",
    requiresValue: true,
  },
];

export const DEFAULT_NAME_ACTIONS: SmartInputAction[] = [
  {
    id: "generate",
    label: "Generate",
    icon: Sparkles,
    description: "AI generates a name",
  },
  {
    id: "suggest-names",
    label: "Suggest Options",
    icon: FileText,
    description: "Get multiple suggestions",
  },
  {
    id: "improve",
    label: "Improve",
    icon: Lightbulb,
    description: "Refine the name",
    requiresValue: true,
  },
];

interface SmartInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  multiline?: boolean;
  rows?: number;
  actions?: SmartInputAction[];
  fieldType: string; // Used to customize AI prompts
  context?: Record<string, unknown>; // Additional context for AI
  disabled?: boolean;
  onSuggestionsReceived?: (suggestions: string[]) => void; // For handling multiple suggestions
}

export function SmartInput({
  value,
  onChange,
  placeholder,
  className,
  inputClassName,
  multiline = false,
  rows = 3,
  actions = multiline ? DEFAULT_TEXT_ACTIONS : DEFAULT_NAME_ACTIONS,
  fieldType,
  context = {},
  disabled = false,
  onSuggestionsReceived,
}: SmartInputProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const executeAction = useCallback(
    async (actionId: string) => {
      setIsLoading(true);
      setLoadingAction(actionId);

      try {
        const response = await fetch("/api/ai/smart-input", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: actionId,
            value,
            context,
            fieldType,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate content");
        }

        const data = await response.json();

        if (actionId === "suggest-names" && onSuggestionsReceived) {
          // Parse multiple suggestions (one per line)
          const suggestions = data.result
            .split("\n")
            .map((s: string) => s.trim())
            .filter((s: string) => s.length > 0);
          onSuggestionsReceived(suggestions);
        } else {
          onChange(data.result);
        }
      } catch (error) {
        console.error("[v0] Smart input error:", error);
      } finally {
        setIsLoading(false);
        setLoadingAction(null);
      }
    },
    [value, context, fieldType, onChange, onSuggestionsReceived]
  );

  const availableActions = actions.filter((action) => {
    if (action.requiresValue && !value.trim()) {
      return false;
    }
    return true;
  });

  const InputComponent = multiline ? Textarea : Input;

  return (
    <div className={cn("relative flex items-start gap-2", className)}>
      <div className="relative flex-1">
        <InputComponent
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          rows={multiline ? rows : undefined}
          className={cn(inputClassName, isLoading && "opacity-70")}
        />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-md bg-background/50">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={disabled || isLoading || availableActions.length === 0}
            className="shrink-0 bg-transparent"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <ChevronDown className="absolute -bottom-0.5 -right-0.5 h-3 w-3" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="flex items-center gap-2 text-xs font-normal text-muted-foreground">
            <Sparkles className="h-3 w-3" />
            AI Actions
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {availableActions.map((action) => {
            const Icon = action.icon;
            return (
              <DropdownMenuItem
                key={action.id}
                onClick={() => executeAction(action.id)}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {loadingAction === action.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
                <div className="flex flex-col">
                  <span>{action.label}</span>
                  {action.description && (
                    <span className="text-xs text-muted-foreground">
                      {action.description}
                    </span>
                  )}
                </div>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// Wrapper component for handling name suggestions with a popover
interface SmartNameInputProps extends Omit<
  SmartInputProps,
  "multiline" | "onSuggestionsReceived"
> {
  showSuggestions?: boolean;
}

export function SmartNameInput({
  showSuggestions = true,
  ...props
}: SmartNameInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestionsDropdown, setShowSuggestionsDropdown] = useState(false);

  const handleSuggestionsReceived = useCallback((newSuggestions: string[]) => {
    setSuggestions(newSuggestions);
    setShowSuggestionsDropdown(true);
  }, []);

  const handleSelectSuggestion = useCallback(
    (suggestion: string) => {
      props.onChange(suggestion);
      setShowSuggestionsDropdown(false);
      setSuggestions([]);
    },
    [props.onChange]
  );

  return (
    <div className="relative">
      <SmartInput
        {...props}
        multiline={false}
        onSuggestionsReceived={
          showSuggestions ? handleSuggestionsReceived : undefined
        }
      />

      {showSuggestionsDropdown && suggestions.length > 0 && (
        <div className="absolute top-full left-0 z-50 mt-1 w-full rounded-md border bg-popover p-1 shadow-md">
          <div className="mb-1 px-2 py-1 text-xs font-medium text-muted-foreground">
            Suggestions
          </div>
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelectSuggestion(suggestion)}
              className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
            >
              {suggestion}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowSuggestionsDropdown(false)}
            className="mt-1 w-full rounded-sm px-2 py-1 text-center text-xs text-muted-foreground hover:bg-accent"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
