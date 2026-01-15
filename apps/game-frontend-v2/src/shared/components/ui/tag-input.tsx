import * as React from "react";
import { X, Plus } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Badge } from "./badge";
import { Input } from "./input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover";

interface TagInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  suggestions?: string[];
  allowCustom?: boolean;
  placeholder?: string;
  className?: string;
}

export function TagInput({
  value,
  onChange,
  suggestions = [],
  allowCustom = true,
  placeholder = "Add tag...",
  className,
}: TagInputProps) {
  const [inputValue, setInputValue] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Filter suggestions based on input and existing values
  const filteredSuggestions = React.useMemo(() => {
    const lowerInput = inputValue.toLowerCase();
    return suggestions.filter(
      (s) =>
        !value.includes(s) &&
        (lowerInput === "" || s.toLowerCase().includes(lowerInput))
    );
  }, [suggestions, value, inputValue]);

  const addTag = (tag: string) => {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInputValue("");
    setIsOpen(false);
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      if (allowCustom || suggestions.includes(inputValue.trim().toLowerCase())) {
        addTag(inputValue);
      }
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (e.target.value && !isOpen) {
      setIsOpen(true);
    }
  };

  const handleFocus = () => {
    if (filteredSuggestions.length > 0 || inputValue) {
      setIsOpen(true);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Tags display */}
      <div className="flex flex-wrap gap-1.5 min-h-[28px]">
        {value.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="gap-1 pl-2 pr-1 text-xs"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>

      {/* Input with suggestions */}
      <Popover open={isOpen && filteredSuggestions.length > 0} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              placeholder={placeholder}
              className="pr-8"
            />
            <button
              type="button"
              onClick={() => {
                if (inputValue.trim()) {
                  addTag(inputValue);
                } else {
                  inputRef.current?.focus();
                  setIsOpen(true);
                }
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-1"
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="max-h-48 overflow-y-auto">
            {filteredSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => addTag(suggestion)}
                className="flex w-full items-center rounded px-2 py-1.5 text-sm hover:bg-muted"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {allowCustom && (
        <p className="text-xs text-muted-foreground">
          Type and press Enter to add custom tags
        </p>
      )}
    </div>
  );
}
