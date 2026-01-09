import { motion, AnimatePresence } from "framer-motion";
import type { v2 } from "@wdydn/shared";
type Location = v2.Location;
import { cn } from "@/shared/lib/utils";

interface LocationBackgroundProps {
  location?: Location;
  className?: string;
}

/**
 * Location background with animated transitions
 *
 * Features:
 * - Crossfade between locations
 * - Gradient overlay for readability
 * - Fallback color gradients based on location type
 */
export function LocationBackground({
  location,
  className,
}: LocationBackgroundProps) {
  const backgroundUrl = location?.background;

  // Fallback gradient based on location tags/id
  const fallbackGradient = getFallbackGradient(location);

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={location?.id ?? "default"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0"
        >
          {backgroundUrl ? (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${backgroundUrl})` }}
            />
          ) : (
            <div className={cn("absolute inset-0", fallbackGradient)} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />

      {/* Vignette effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,hsl(var(--background)/0.6)_100%)]" />

      {/* Location name overlay */}
      {location && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="absolute top-4 left-4 z-10"
        >
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Location
          </p>
          <h2 className="text-lg font-semibold">{location.name}</h2>
        </motion.div>
      )}
    </div>
  );
}

function getFallbackGradient(location?: Location): string {
  if (!location) {
    return "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900";
  }

  // Check location id for theme hints
  const id = location.id.toLowerCase();

  if (id.includes("tavern") || id.includes("inn")) {
    return "bg-gradient-to-br from-amber-950 via-orange-950 to-stone-950";
  }
  if (id.includes("forest") || id.includes("woods")) {
    return "bg-gradient-to-br from-emerald-950 via-green-950 to-teal-950";
  }
  if (id.includes("castle") || id.includes("throne")) {
    return "bg-gradient-to-br from-purple-950 via-violet-950 to-indigo-950";
  }
  if (id.includes("market") || id.includes("shop")) {
    return "bg-gradient-to-br from-yellow-950 via-amber-950 to-orange-950";
  }
  if (id.includes("dungeon") || id.includes("cave")) {
    return "bg-gradient-to-br from-zinc-950 via-neutral-950 to-stone-950";
  }
  if (id.includes("temple") || id.includes("church")) {
    return "bg-gradient-to-br from-sky-950 via-blue-950 to-indigo-950";
  }
  if (id.includes("beach") || id.includes("ocean")) {
    return "bg-gradient-to-br from-cyan-950 via-teal-950 to-blue-950";
  }
  if (id.includes("mountain") || id.includes("peak")) {
    return "bg-gradient-to-br from-slate-900 via-stone-900 to-zinc-900";
  }

  // Default
  return "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900";
}
