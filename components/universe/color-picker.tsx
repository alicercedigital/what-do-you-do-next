"use client"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useState } from "react"

// Predefined Tailwind colors for the picker
const COLORS = {
  foreground: [
    { name: "Default", class: "text-foreground", preview: "bg-foreground" },
    { name: "Red", class: "text-red-500", preview: "bg-red-500" },
    { name: "Orange", class: "text-orange-500", preview: "bg-orange-500" },
    { name: "Yellow", class: "text-yellow-500", preview: "bg-yellow-500" },
    { name: "Green", class: "text-green-500", preview: "bg-green-500" },
    { name: "Emerald", class: "text-emerald-500", preview: "bg-emerald-500" },
    { name: "Cyan", class: "text-cyan-500", preview: "bg-cyan-500" },
    { name: "Blue", class: "text-blue-500", preview: "bg-blue-500" },
    { name: "Indigo", class: "text-indigo-500", preview: "bg-indigo-500" },
    { name: "Purple", class: "text-purple-500", preview: "bg-purple-500" },
    { name: "Pink", class: "text-pink-500", preview: "bg-pink-500" },
    { name: "White", class: "text-white", preview: "bg-white" },
  ],
  background: [
    { name: "Default", class: "bg-background", preview: "bg-background" },
    { name: "Red", class: "bg-red-500", preview: "bg-red-500" },
    { name: "Orange", class: "bg-orange-500", preview: "bg-orange-500" },
    { name: "Yellow", class: "bg-yellow-500", preview: "bg-yellow-500" },
    { name: "Green", class: "bg-green-500", preview: "bg-green-500" },
    { name: "Emerald", class: "bg-emerald-500", preview: "bg-emerald-500" },
    { name: "Cyan", class: "bg-cyan-500", preview: "bg-cyan-500" },
    { name: "Blue", class: "bg-blue-500", preview: "bg-blue-500" },
    { name: "Indigo", class: "bg-indigo-500", preview: "bg-indigo-500" },
    { name: "Purple", class: "bg-purple-500", preview: "bg-purple-500" },
    { name: "Pink", class: "bg-pink-500", preview: "bg-pink-500" },
    { name: "Muted", class: "bg-muted", preview: "bg-muted" },
  ],
  barBackground: [
    { name: "Default", class: "bg-secondary", preview: "bg-secondary" },
    { name: "Red Dark", class: "bg-red-900", preview: "bg-red-900" },
    { name: "Orange Dark", class: "bg-orange-900", preview: "bg-orange-900" },
    { name: "Yellow Dark", class: "bg-yellow-900", preview: "bg-yellow-900" },
    { name: "Green Dark", class: "bg-green-900", preview: "bg-green-900" },
    { name: "Emerald Dark", class: "bg-emerald-900", preview: "bg-emerald-900" },
    { name: "Cyan Dark", class: "bg-cyan-900", preview: "bg-cyan-900" },
    { name: "Blue Dark", class: "bg-blue-900", preview: "bg-blue-900" },
    { name: "Indigo Dark", class: "bg-indigo-900", preview: "bg-indigo-900" },
    { name: "Purple Dark", class: "bg-purple-900", preview: "bg-purple-900" },
    { name: "Pink Dark", class: "bg-pink-900", preview: "bg-pink-900" },
    { name: "Muted", class: "bg-muted", preview: "bg-muted" },
  ],
}

interface ColorPickerProps {
  value: string
  onChange: (value: string) => void
  type?: "foreground" | "background" | "barBackground"
  className?: string
}

export function ColorPicker({ value, onChange, type = "foreground", className }: ColorPickerProps) {
  const [open, setOpen] = useState(false)

  const colors = COLORS[type]
  const currentColor = colors.find((c) => c.class === value) || colors[0]

  // Get preview class based on current value
  const getPreviewClass = () => {
    if (type === "foreground") {
      return value.replace("text-", "bg-")
    }
    return value
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("w-full justify-start gap-2 bg-transparent", className)}>
          <div className={cn("h-4 w-4 rounded border", getPreviewClass())} />
          <span>{currentColor.name}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2" align="start">
        <div className="grid grid-cols-4 gap-1">
          {colors.map((color) => (
            <button
              key={color.class}
              type="button"
              onClick={() => {
                onChange(color.class)
                setOpen(false)
              }}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded hover:ring-2 hover:ring-primary",
                value === color.class && "ring-2 ring-primary",
              )}
              title={color.name}
            >
              <div className={cn("h-6 w-6 rounded border", color.preview)} />
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
