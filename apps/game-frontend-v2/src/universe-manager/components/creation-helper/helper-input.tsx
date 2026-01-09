import * as React from "react";
import { Plus, X, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Button } from "@/shared/components/ui/button";
import { HelperChoiceButton, type ChoiceOption } from "./helper-choice-button";
import type { InputMode } from "./helper-steps";

interface HelperInputProps {
  mode: InputMode;
  question: string;
  description?: string;
  options: ChoiceOption[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  textValue: string;
  onTextChange: (value: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  aiSuggestions?: string[];
  onRequestMoreOptions?: () => void;
}

export function HelperInput({
  mode,
  question,
  description,
  options,
  selectedValues,
  onSelectionChange,
  textValue,
  onTextChange,
  placeholder = "Type anything here...",
  isLoading = false,
  aiSuggestions = [],
  onRequestMoreOptions,
}: HelperInputProps) {
  const [inputValue, setInputValue] = React.useState("");

  const handleChoiceClick = (optionId: string) => {
    if (mode === "single") {
      // Single choice: replace selection
      onSelectionChange([optionId]);
    } else {
      // Multiple choice: toggle selection
      if (selectedValues.includes(optionId)) {
        onSelectionChange(selectedValues.filter((v) => v !== optionId));
      } else {
        onSelectionChange([...selectedValues, optionId]);
      }
    }
  };

  const handleRemoveSelection = (value: string) => {
    onSelectionChange(selectedValues.filter((v) => v !== value));
  };

  const handleAddCustom = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !selectedValues.includes(trimmed)) {
      onSelectionChange([...selectedValues, trimmed]);
      setInputValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      handleAddCustom();
    } else if (e.key === "Backspace" && !inputValue && selectedValues.length > 0) {
      // Remove last selection on backspace if input is empty
      handleRemoveSelection(selectedValues[selectedValues.length - 1]);
    }
  };

  const handleAiSuggestionClick = (suggestion: string) => {
    if (!selectedValues.includes(suggestion)) {
      onSelectionChange([...selectedValues, suggestion]);
    }
  };

  // Get display label for a selection (from options or as-is for custom)
  const getSelectionLabel = (value: string): string => {
    const option = options.find((o) => o.id === value);
    return option?.label || value;
  };

  // Check if a value is from predefined options
  const isOptionSelected = (optionId: string): boolean => {
    return selectedValues.includes(optionId);
  };

  return (
    <div className="space-y-6">
      {/* Question header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">{question}</h2>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>

      {/* Selected values as badges */}
      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center">
          {selectedValues.map((value) => (
            <Badge
              key={value}
              variant="default"
              className="gap-1 px-3 py-1.5 text-sm"
            >
              {getSelectionLabel(value)}
              <button
                type="button"
                onClick={() => handleRemoveSelection(value)}
                className="ml-1 rounded-full p-0.5 hover:bg-primary-foreground/20"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Choice buttons grid (for multiple/single modes) */}
      {(mode === "multiple" || mode === "single") && (
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 rounded-lg">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {options.map((option) => (
              <HelperChoiceButton
                key={option.id}
                option={option}
                selected={isOptionSelected(option.id)}
                onClick={() => handleChoiceClick(option.id)}
                mode={mode}
                disabled={isLoading}
              />
            ))}
            {/* More options button */}
            {onRequestMoreOptions && (
              <button
                type="button"
                onClick={onRequestMoreOptions}
                disabled={isLoading}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed p-3",
                  "text-muted-foreground transition-all",
                  "hover:border-primary/50 hover:text-primary hover:bg-accent/50",
                  "disabled:pointer-events-none disabled:opacity-50"
                )}
              >
                <Sparkles className="h-5 w-5" />
                <span className="text-sm font-medium">More ideas...</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Text input area */}
      {mode === "open" ? (
        <div className="max-w-2xl mx-auto">
          <Textarea
            value={textValue}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder={placeholder}
            rows={4}
            className="resize-none"
          />
        </div>
      ) : (
        <div className="relative max-w-xl mx-auto">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleAddCustom}
            disabled={!inputValue.trim()}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* AI suggestions */}
      {aiSuggestions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 justify-center">
          <span className="text-xs text-muted-foreground">AI suggestions:</span>
          {aiSuggestions.map((suggestion) => (
            <Button
              key={suggestion}
              variant="outline"
              size="sm"
              onClick={() => handleAiSuggestionClick(suggestion)}
              disabled={selectedValues.includes(suggestion)}
              className="gap-1"
            >
              <Sparkles className="h-3 w-3" />
              {suggestion}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
