"use client";

import { motion } from "framer-motion";
import { Users, MapPin, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import { universePersistence } from "@/lib/utils/universe-persistence";
import type { GameUniverse } from "@/lib/schemas/game-entity-schema";

interface UniverseCardProps {
  universe: GameUniverse;
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
  const isCustom = universePersistence.isCustomUniverse(universe.id);
  const canStart = (universe.attributes?.length || 0) > 0;

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
        {universe.thumbnailUrl && (
          <div className="relative h-32 overflow-hidden rounded-t-lg">
            <img
              src={universe.thumbnailUrl || "/placeholder.svg"}
              alt={universe.name}
              className={`w-full h-full object-cover ${
                mode === "select"
                  ? "group-hover:scale-105 transition-transform duration-300"
                  : ""
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          </div>
        )}
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle
                  className={mode === "select" ? "text-xl" : "text-lg"}
                >
                  {universe.name}
                </CardTitle>
                {!isCustom && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                    Default
                  </span>
                )}
                {isCustom && mode === "select" && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
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
              <Users className="h-4 w-4" />
              <span>{universe.characters.length}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              <span>{universe.locations.length}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs">
                {universe.attributes?.length || 0} attributes
              </span>
            </div>
          </div>

          {mode === "select" && (
            <div className="space-y-3 flex-1">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Attributes
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(universe.attributes?.length || 0) > 0 ? (
                    universe.attributes!.slice(0, 4).map((attr) => (
                      <span
                        key={attr.id}
                        className="px-2 py-0.5 text-xs rounded-md bg-secondary text-secondary-foreground"
                      >
                        {attr.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground italic">
                      No attributes defined
                    </span>
                  )}
                  {(universe.attributes?.length || 0) > 4 && (
                    <span className="px-2 py-0.5 text-xs rounded-md bg-secondary/50 text-muted-foreground">
                      +{universe.attributes!.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-auto mb-4">
            {mode === "manage" ? (
              <>
                <Link href={`/universes/${universe.id}`} className="flex-1">
                  <Button variant="secondary" className="w-full gap-2">
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                </Link>
                {isCustom && (
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
                          its characters and locations. This action cannot be
                          undone.
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
                className="w-full my-4"
                disabled={!canStart}
              >
                {canStart ? "Select Universe" : "Add Attributes First"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
