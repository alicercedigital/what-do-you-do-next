import * as React from "react";
import type { v2 } from "@wdydn/shared";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Switch } from "@/shared/components/ui/switch";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { EntityList } from "@/shared/components/ui/entity-list";
import { EntityIdBadge } from "@/shared/components/ui/entity-id-badge";
import { User, Star } from "lucide-react";

import {
  useUniverseEditorStore,
  generateEntityId,
} from "../store/universe-editor-store";
import { AIFieldWrapper } from "./ai-field-wrapper";
import { CharacterGenerator } from "./entity-generator";

type Character = v2.Character;

function createDefaultCharacter(): Character {
  return {
    id: generateEntityId("char", "new_character"),
    name: "New Character",
    stats: {},
    disposition: {},
    memories: [],
    personality: {
      traits: [],
      values: [],
      fears: [],
      desires: [],
    },
  };
}

export function CharactersEditor() {
  const [showGenerator, setShowGenerator] = React.useState(false);

  const {
    universe,
    selectedEntityId,
    selectEntity,
    addCharacter,
    updateCharacter,
    deleteCharacter,
  } = useUniverseEditorStore();

  if (!universe) return null;

  const selectedCharacter = universe.characters.find(
    (c) => c.id === selectedEntityId
  );

  const handleCreate = () => {
    const newCharacter = createDefaultCharacter();
    addCharacter(newCharacter);
  };

  const handleUpdate = (updates: Partial<Character>) => {
    if (selectedEntityId) {
      updateCharacter(selectedEntityId, updates);
    }
  };

  const handlePersonalityUpdate = (
    field: keyof Character["personality"],
    value: string
  ) => {
    if (!selectedCharacter) return;
    handleUpdate({
      personality: {
        ...selectedCharacter.personality,
        [field]: value
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      },
    });
  };

  return (
    <div className="flex h-[calc(100vh-7rem)]">
      {/* List panel */}
      <div className="w-72 shrink-0">
        <EntityList
          items={universe.characters}
          selectedId={selectedEntityId}
          onSelect={selectEntity}
          onCreate={handleCreate}
          onDelete={deleteCharacter}
          onGenerateWithAI={() => setShowGenerator(true)}
          searchPlaceholder="Search characters..."
          createLabel="Add Character"
          deleteConfirmTitle="Delete Character"
          deleteConfirmDescription={(char) =>
            `Are you sure you want to delete "${char.name}"? All references to this character will be broken.`
          }
          renderItem={(char) => (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                {char.isPlayer ? (
                  <Star className="h-4 w-4 text-primary" />
                ) : (
                  <User className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{char.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {char.isPlayer
                    ? "Player"
                    : char.playable
                      ? "Playable"
                      : "NPC"}
                </p>
              </div>
            </div>
          )}
        />
      </div>

      {/* Detail panel */}
      <div className="">
        {selectedCharacter ? (
          <ScrollArea className="h-full">
            <div className="max-w-3xl space-y-6 p-6">
              <Tabs defaultValue="basic">
                <TabsList>
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="stats">Stats</TabsTrigger>
                  <TabsTrigger value="personality">Personality</TabsTrigger>
                  <TabsTrigger value="images">Images</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="mt-6 space-y-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                      <CardTitle>Basic Information</CardTitle>
                      <EntityIdBadge id={selectedCharacter.id} />
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={selectedCharacter.name}
                          onChange={(e) =>
                            handleUpdate({ name: e.target.value })
                          }
                          placeholder="Character Name"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <AIFieldWrapper
                          entityType="character"
                          field="description"
                          universe={universe}
                          currentEntity={
                            selectedCharacter as unknown as Record<
                              string,
                              unknown
                            >
                          }
                          currentValue={selectedCharacter.description || ""}
                          onValueChange={(value) =>
                            handleUpdate({ description: value || undefined })
                          }
                        >
                          <Textarea
                            id="description"
                            value={selectedCharacter.description || ""}
                            onChange={(e) =>
                              handleUpdate({
                                description: e.target.value || undefined,
                              })
                            }
                            placeholder="Background and lore..."
                            rows={4}
                          />
                        </AIFieldWrapper>
                      </div>

                      <div className="flex flex-wrap gap-6">
                        <div className="flex items-center gap-2">
                          <Switch
                            id="isPlayer"
                            checked={selectedCharacter.isPlayer === true}
                            onCheckedChange={(checked) =>
                              handleUpdate({ isPlayer: checked || undefined })
                            }
                          />
                          <Label htmlFor="isPlayer">Is Player Character</Label>
                        </div>

                        <div className="flex items-center gap-2">
                          <Switch
                            id="playable"
                            checked={selectedCharacter.playable === true}
                            onCheckedChange={(checked) =>
                              handleUpdate({ playable: checked || undefined })
                            }
                          />
                          <Label htmlFor="playable">Playable at Start</Label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="stats" className="mt-6 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Character Stats</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {universe.stats.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No stats defined. Add stats in the Stats tab first.
                        </p>
                      ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                          {universe.stats.map((stat) => (
                            <div key={stat.id} className="grid gap-2">
                              <Label htmlFor={`stat-${stat.id}`}>
                                {stat.name}
                              </Label>
                              {stat.type === "number" && (
                                <Input
                                  id={`stat-${stat.id}`}
                                  type="number"
                                  value={
                                    typeof selectedCharacter.stats[stat.id] ===
                                    "number"
                                      ? (selectedCharacter.stats[
                                          stat.id
                                        ] as number)
                                      : ((stat.base as number) ?? 0)
                                  }
                                  onChange={(e) =>
                                    handleUpdate({
                                      stats: {
                                        ...selectedCharacter.stats,
                                        [stat.id]:
                                          parseFloat(e.target.value) || 0,
                                      },
                                    })
                                  }
                                />
                              )}
                              {stat.type === "boolean" && (
                                <Switch
                                  id={`stat-${stat.id}`}
                                  checked={
                                    selectedCharacter.stats[stat.id] === true
                                  }
                                  onCheckedChange={(checked) =>
                                    handleUpdate({
                                      stats: {
                                        ...selectedCharacter.stats,
                                        [stat.id]: checked,
                                      },
                                    })
                                  }
                                />
                              )}
                              {stat.type === "text" && (
                                <Input
                                  id={`stat-${stat.id}`}
                                  value={
                                    typeof selectedCharacter.stats[stat.id] ===
                                    "string"
                                      ? (selectedCharacter.stats[
                                          stat.id
                                        ] as string)
                                      : ((stat.base as string) ?? "")
                                  }
                                  onChange={(e) =>
                                    handleUpdate({
                                      stats: {
                                        ...selectedCharacter.stats,
                                        [stat.id]: e.target.value,
                                      },
                                    })
                                  }
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="personality" className="mt-6 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Personality</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="traits">Traits</Label>
                        <Input
                          id="traits"
                          value={selectedCharacter.personality.traits.join(
                            ", "
                          )}
                          onChange={(e) =>
                            handlePersonalityUpdate("traits", e.target.value)
                          }
                          placeholder="brave, cunning, stubborn..."
                        />
                        <p className="text-xs text-muted-foreground">
                          How they behave (comma-separated)
                        </p>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="values">Values</Label>
                        <Input
                          id="values"
                          value={selectedCharacter.personality.values.join(
                            ", "
                          )}
                          onChange={(e) =>
                            handlePersonalityUpdate("values", e.target.value)
                          }
                          placeholder="honor, family, wealth..."
                        />
                        <p className="text-xs text-muted-foreground">
                          What they prioritize (comma-separated)
                        </p>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="fears">Fears</Label>
                        <Input
                          id="fears"
                          value={selectedCharacter.personality.fears.join(", ")}
                          onChange={(e) =>
                            handlePersonalityUpdate("fears", e.target.value)
                          }
                          placeholder="failure, heights, loneliness..."
                        />
                        <p className="text-xs text-muted-foreground">
                          What they avoid (comma-separated)
                        </p>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="desires">Desires</Label>
                        <Input
                          id="desires"
                          value={selectedCharacter.personality.desires.join(
                            ", "
                          )}
                          onChange={(e) =>
                            handlePersonalityUpdate("desires", e.target.value)
                          }
                          placeholder="power, love, redemption..."
                        />
                        <p className="text-xs text-muted-foreground">
                          What they pursue (comma-separated)
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Memories</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={selectedCharacter.memories.join("\n")}
                        onChange={(e) =>
                          handleUpdate({
                            memories: e.target.value
                              .split("\n")
                              .filter(Boolean),
                          })
                        }
                        placeholder="Enter memories, one per line..."
                        rows={4}
                      />
                      <p className="mt-2 text-xs text-muted-foreground">
                        Free-form memory strings, one per line
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="images" className="mt-6 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Character Images</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Add image URLs for different emotional states. The
                        images will be used for character portraits during
                        gameplay.
                      </p>
                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        {(
                          [
                            "neutral",
                            "happy",
                            "joy",
                            "anger",
                            "sad",
                            "fear",
                            "thinking",
                            "confused",
                            "embarrassed",
                            "confident",
                          ] as const
                        ).map((emotion) => (
                          <div key={emotion} className="grid gap-2">
                            <Label
                              htmlFor={`image-${emotion}`}
                              className="capitalize"
                            >
                              {emotion}
                            </Label>
                            <Input
                              id={`image-${emotion}`}
                              value={selectedCharacter.images?.[emotion] || ""}
                              onChange={(e) =>
                                handleUpdate({
                                  images: {
                                    ...selectedCharacter.images,
                                    [emotion]: e.target.value || undefined,
                                  },
                                })
                              }
                              placeholder="https://..."
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Select a character to edit or create a new one
          </div>
        )}
      </div>

      {/* AI Character Generator */}
      <CharacterGenerator
        open={showGenerator}
        onOpenChange={setShowGenerator}
        universe={universe}
        onAccept={(character) => {
          addCharacter(character);
          selectEntity(character.id);
        }}
      />
    </div>
  );
}
