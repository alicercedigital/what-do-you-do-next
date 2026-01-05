"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import {
  Heart,
  Zap,
  Shield,
  Sword,
  Brain,
  Eye,
  Hand,
  Footprints,
  Flame,
  Snowflake,
  Droplet,
  Wind,
  Star,
  Moon,
  Sun,
  Sparkles,
  Target,
  Crosshair,
  Activity,
  Battery,
  Gauge,
  Timer,
  Clock,
  Hourglass,
  Crown,
  Gem,
  Coins,
  Trophy,
  Medal,
  Award,
  Skull,
  Ghost,
  Bug,
  Leaf,
  TreeDeciduous,
  Mountain,
  Waves,
  Cloud,
  CloudLightning as Lightning,
  Circle,
  Square,
  Triangle,
  Hexagon,
  Octagon,
  Pentagon,
  type LucideIcon,
} from "lucide-react"

// Map of icon names to components
export const ICON_MAP: Record<string, LucideIcon> = {
  heart: Heart,
  zap: Zap,
  shield: Shield,
  sword: Sword,
  brain: Brain,
  eye: Eye,
  hand: Hand,
  footprints: Footprints,
  flame: Flame,
  snowflake: Snowflake,
  droplet: Droplet,
  wind: Wind,
  star: Star,
  moon: Moon,
  sun: Sun,
  sparkles: Sparkles,
  target: Target,
  crosshair: Crosshair,
  activity: Activity,
  battery: Battery,
  gauge: Gauge,
  timer: Timer,
  clock: Clock,
  hourglass: Hourglass,
  crown: Crown,
  gem: Gem,
  coins: Coins,
  trophy: Trophy,
  medal: Medal,
  award: Award,
  skull: Skull,
  ghost: Ghost,
  bug: Bug,
  leaf: Leaf,
  tree: TreeDeciduous,
  mountain: Mountain,
  waves: Waves,
  cloud: Cloud,
  lightning: Lightning,
  circle: Circle,
  square: Square,
  triangle: Triangle,
  hexagon: Hexagon,
  octagon: Octagon,
  pentagon: Pentagon,
}

// Get icon component by name
export function getIconComponent(name: string): LucideIcon {
  return ICON_MAP[name] || Circle
}

interface IconPickerProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function IconPicker({ value, onChange, className }: IconPickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const filteredIcons = useMemo(() => {
    const searchLower = search.toLowerCase()
    return Object.keys(ICON_MAP).filter((name) => name.includes(searchLower))
  }, [search])

  const SelectedIcon = getIconComponent(value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("w-full justify-start gap-2 bg-transparent", className)}>
          <SelectedIcon className="h-4 w-4" />
          <span className="capitalize">{value || "Select icon"}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <div className="p-2 border-b">
          <Input
            placeholder="Search icons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8"
          />
        </div>
        <ScrollArea className="h-48">
          <div className="grid grid-cols-6 gap-1 p-2">
            {filteredIcons.map((name) => {
              const Icon = ICON_MAP[name]
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    onChange(name)
                    setOpen(false)
                  }}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded hover:bg-accent",
                    value === name && "bg-accent ring-1 ring-primary",
                  )}
                  title={name}
                >
                  <Icon className="h-4 w-4" />
                </button>
              )
            })}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
