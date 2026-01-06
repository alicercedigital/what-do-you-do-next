"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/lib/store/game-store";
import { universePersistence } from "@/lib/utils/universe-persistence";
import type { GameUniverse } from "@/lib/schemas/game-entity-schema";
import { UniverseCard } from "@/components/universe/universe-card";

export function UniverseSelector() {
  const { selectUniverse, setCurrentStep } = useGameStore();
  const [universes, setUniverses] = useState<GameUniverse[]>([]);

  useEffect(() => {
    setUniverses(universePersistence.getAllUniverses());
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl"
      >
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => setCurrentStep("menu")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Menu
        </Button>

        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Globe className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight">
              Select Universe
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Choose a universe to begin your adventure
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {universes.map((universe, index) => (
            <UniverseCard
              key={universe.id}
              universe={universe}
              index={index}
              mode="select"
              onSelect={() => selectUniverse(universe)}
            />
          ))}
        </div>

        {universes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              No universes available.
            </p>
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/universes")}
            >
              Create Universe
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
