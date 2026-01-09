import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Badge } from "@/shared/components/ui/badge";
import { Users, MapPin, Package, Swords, BookOpen, BarChart3 } from "lucide-react";

import { useUniverseEditorStore } from "../store/universe-editor-store";

export function OverviewEditor() {
  const { universe, updateUniverse, updateConfig } = useUniverseEditorStore();

  if (!universe) return null;

  const stats = [
    { label: "Stats", count: universe.stats.length, icon: BarChart3 },
    { label: "Characters", count: universe.characters.length, icon: Users },
    { label: "Locations", count: universe.locations.length, icon: MapPin },
    { label: "Items", count: universe.items.length, icon: Package },
    { label: "Challenges", count: universe.challenges.length, icon: Swords },
    { label: "Moments", count: universe.moments.length, icon: BookOpen },
  ];

  return (
    <ScrollArea className="h-[calc(100vh-7rem)]">
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              The fundamental details of your universe
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={universe.name}
                onChange={(e) => updateUniverse({ name: e.target.value })}
                placeholder="Universe name"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={universe.description}
                onChange={(e) => updateUniverse({ description: e.target.value })}
                placeholder="Describe your universe..."
                rows={4}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="theme">Theme</Label>
              <Input
                id="theme"
                value={universe.theme}
                onChange={(e) => updateUniverse({ theme: e.target.value })}
                placeholder="fantasy, sci-fi, horror..."
              />
              <p className="text-xs text-muted-foreground">
                The theme helps AI understand the tone and style of your universe
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div>
                <Label>ID</Label>
                <p className="text-sm text-muted-foreground">{universe.id}</p>
              </div>
              <div>
                <Label>Version</Label>
                <p className="text-sm text-muted-foreground">{universe.version}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Game Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Game Configuration</CardTitle>
            <CardDescription>
              Rules for character progression and equipment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="startingPoints">Starting Points</Label>
                <Input
                  id="startingPoints"
                  type="number"
                  min={0}
                  value={universe.config.startingPoints}
                  onChange={(e) =>
                    updateConfig({ startingPoints: parseInt(e.target.value) || 0 })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Points for new characters
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="pointsPerLevel">Points per Level</Label>
                <Input
                  id="pointsPerLevel"
                  type="number"
                  min={0}
                  value={universe.config.pointsPerLevel}
                  onChange={(e) =>
                    updateConfig({ pointsPerLevel: parseInt(e.target.value) || 0 })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Points gained on level up
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="experiencePerLevel">XP per Level</Label>
                <Input
                  id="experiencePerLevel"
                  type="number"
                  min={1}
                  value={universe.config.experiencePerLevel}
                  onChange={(e) =>
                    updateConfig({
                      experiencePerLevel: parseInt(e.target.value) || 100,
                    })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  XP needed (multiplied by level)
                </p>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="equipmentSlots">Equipment Slots</Label>
              <Input
                id="equipmentSlots"
                value={universe.config.equipmentSlots.join(", ")}
                onChange={(e) =>
                  updateConfig({
                    equipmentSlots: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="weapon, armor, accessory..."
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated list of equipment slots characters can use
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Content Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Content Summary</CardTitle>
            <CardDescription>
              Overview of all content in your universe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="flex items-center gap-3 rounded-lg border p-4"
                  >
                    <div className="rounded-full bg-primary/10 p-2">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stat.count}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Starting moments */}
            <div className="mt-6">
              <Label>Starting Moments</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {universe.moments
                  .filter((m) => m.status === "available")
                  .map((m) => (
                    <Badge key={m.id} variant="secondary">
                      {m.title || m.id}
                    </Badge>
                  ))}
                {universe.moments.filter((m) => m.status === "available").length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No starting moments. Add moments with status "available" to define where the story begins.
                  </p>
                )}
              </div>
            </div>

            {/* Player characters */}
            <div className="mt-4">
              <Label>Player Characters</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {universe.characters
                  .filter((c) => c.isPlayer || c.playable)
                  .map((c) => (
                    <Badge key={c.id} variant={c.isPlayer ? "default" : "secondary"}>
                      {c.name}
                      {c.isPlayer && " (default)"}
                    </Badge>
                  ))}
                {universe.characters.filter((c) => c.isPlayer || c.playable).length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No player characters. Add a character with "isPlayer" or "playable" set to true.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
