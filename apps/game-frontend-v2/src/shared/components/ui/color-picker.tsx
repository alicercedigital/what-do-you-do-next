import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Input } from "./input";
import { cn } from "@/shared/lib/utils";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  presets?: string[];
  className?: string;
  placeholder?: string;
}

const DEFAULT_PRESETS = [
  "#ef4444", // red (health)
  "#f97316", // orange
  "#eab308", // yellow (gold)
  "#22c55e", // green
  "#06b6d4", // cyan
  "#3b82f6", // blue (mana)
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#64748b", // slate
  "#ffffff", // white
  "#000000", // black
];

export function ColorPicker({
  value,
  onChange,
  presets = DEFAULT_PRESETS,
  className,
  placeholder = "#000000",
}: ColorPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(value || "");

  // Sync input value with prop
  React.useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    // Only update if valid hex or empty
    if (!newValue || /^#[0-9A-Fa-f]{6}$/.test(newValue)) {
      onChange(newValue);
    }
  };

  const handlePresetClick = (preset: string) => {
    setInputValue(preset);
    onChange(preset);
  };

  const handleNativeColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  };

  const displayColor = value && /^#[0-9A-Fa-f]{6}$/i.test(value) ? value : "#6b7280";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-9 w-full items-center gap-2 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            className
          )}
        >
          <div
            className="h-5 w-5 shrink-0 rounded border border-border"
            style={{ backgroundColor: displayColor }}
          />
          <span className={cn("flex-1 text-left", !value && "text-muted-foreground")}>
            {value || placeholder}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="space-y-3">
          {/* Native color picker */}
          <div className="flex gap-2">
            <div className="relative">
              <input
                type="color"
                value={displayColor}
                onChange={handleNativeColorChange}
                className="h-10 w-10 cursor-pointer overflow-hidden rounded border-0 p-0"
                style={{ WebkitAppearance: "none" }}
              />
            </div>
            <Input
              value={inputValue}
              onChange={handleInputChange}
              placeholder="#000000"
              className="flex-1 font-mono text-sm"
            />
          </div>

          {/* Presets */}
          <div>
            <div className="mb-2 text-xs font-medium text-muted-foreground">Presets</div>
            <div className="grid grid-cols-6 gap-1.5">
              {presets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handlePresetClick(preset)}
                  className={cn(
                    "h-6 w-6 rounded border transition-transform hover:scale-110",
                    value === preset && "ring-2 ring-ring ring-offset-1"
                  )}
                  style={{ backgroundColor: preset }}
                  title={preset}
                />
              ))}
            </div>
          </div>

          {/* Clear button */}
          {value && (
            <button
              type="button"
              onClick={() => {
                setInputValue("");
                onChange("");
              }}
              className="w-full rounded border border-dashed border-border py-1.5 text-xs text-muted-foreground hover:bg-muted"
            >
              Clear color
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
