import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { UniverseCard } from "./universe-card";
import type { MarketplaceUniverse } from "@/store/marketplace-store";

interface UniverseGridProps {
  universes: MarketplaceUniverse[];
  isLoading?: boolean;
  showCreator?: boolean;
  emptyMessage?: string;
}

export function UniverseGrid({
  universes,
  isLoading = false,
  showCreator = true,
  emptyMessage = "No universes found",
}: UniverseGridProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (universes.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {universes.map((universe, index) => (
        <motion.div
          key={universe.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
        >
          <UniverseCard universe={universe} showCreator={showCreator} />
        </motion.div>
      ))}
    </div>
  );
}
