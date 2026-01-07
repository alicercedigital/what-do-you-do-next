"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import type { Universe } from "@/core/types";
import { STARTER_UNIVERSES } from "@/data/starter-universes";
import { motion } from "framer-motion";
import { MapPin, Pencil, Trash2, Swords, Sparkles } from "lucide-react";
import Link from "next/link";

interface UniverseCardProps {
  universe: Universe;
  index: number;
  onDelete?: () => void;
  onSelect?: () => void;
  mode?: "manage" | "select";
}

export function UniverseCard({
  universe,
  index,
  onDelete,
  onSelect,
  mode = "manage",
}: UniverseCardProps) {
  const isStarter = STARTER_UNIVERSES.some((u) => u.id === universe.id);
  const canStart = universe.stats.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card
        className={`group h-full flex flex-col ${
          mode === "select"
            ? "cursor-pointer hover:border-primary/50 transition-all duration-300 bg-card/50 backdrop-blur-sm"
            : "bg-card/50 hover:bg-card/80 transition-colors"
        }`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle
                  className={mode === "select" ? "text-xl" : "text-lg"}
                >
                  {universe.name}
                </CardTitle>
                {isStarter && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Starter
                  </span>
                )}
                {!isStarter && mode === "select" && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                    Custom
                  </span>
                )}
              </div>
              <CardDescription className="line-clamp-2 text-sm">
                {universe.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1.5">
              <Swords className="h-4 w-4" />
              <span>{universe.challenges.length}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              <span>{universe.locations.length}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs">
                {universe.stats.length} stats
              </span>
            </div>
          </div>

          {mode === "select" && (
            <div className="space-y-3 flex-1">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Stats
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {universe.stats.length > 0 ? (
                    universe.stats.filter(s => s.type === "core").slice(0, 4).map((stat) => (
                      <span
                        key={stat.id}
                        className="px-2 py-0.5 text-xs rounded-md bg-secondary text-secondary-foreground"
                      >
                        {stat.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground italic">
                      No stats defined
                    </span>
                  )}
                  {universe.stats.filter(s => s.type === "core").length > 4 && (
                    <span className="px-2 py-0.5 text-xs rounded-md bg-secondary/50 text-muted-foreground">
                      +{universe.stats.filter(s => s.type === "core").length - 4} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-auto pt-4">
            {mode === "manage" ? (
              <>
                <Link href={`/universes/${universe.id}`} className="flex-1">
                  <Button variant="secondary" className="w-full gap-2">
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                </Link>
                {!isStarter && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-destructive hover:text-destructive bg-transparent"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Universe?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete "{universe.name}" and all
                          its data. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={onDelete}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </>
            ) : (
              <Button
                onClick={onSelect}
                className="w-full"
                disabled={!canStart}
              >
                {canStart ? "Select Universe" : "Add Stats First"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
