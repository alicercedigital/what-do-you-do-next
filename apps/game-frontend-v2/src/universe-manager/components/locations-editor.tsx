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
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { EntityList } from "@/shared/components/ui/entity-list";
import { EntityIdBadge } from "@/shared/components/ui/entity-id-badge";
import { MapPin, Image } from "lucide-react";

import {
  useUniverseEditorStore,
  generateEntityId,
} from "../store/universe-editor-store";
import { AIFieldWrapper } from "./ai-field-wrapper";
import { LocationGenerator } from "./entity-generator";

type Location = v2.Location;

function createDefaultLocation(): Location {
  return {
    id: generateEntityId("loc", "new_location"),
    name: "New Location",
    description: "",
  };
}

export function LocationsEditor() {
  const [showGenerator, setShowGenerator] = React.useState(false);

  const {
    universe,
    selectedEntityId,
    selectEntity,
    addLocation,
    updateLocation,
    deleteLocation,
  } = useUniverseEditorStore();

  if (!universe) return null;

  const selectedLocation = universe.locations.find(
    (l) => l.id === selectedEntityId
  );

  const handleCreate = () => {
    const newLocation = createDefaultLocation();
    addLocation(newLocation);
  };

  const handleUpdate = (updates: Partial<Location>) => {
    if (selectedEntityId) {
      updateLocation(selectedEntityId, updates);
    }
  };

  return (
    <div className="flex h-[calc(100vh-7rem)]">
      {/* List panel */}
      <div className="w-72 shrink-0">
        <EntityList
          items={universe.locations}
          selectedId={selectedEntityId}
          onSelect={selectEntity}
          onCreate={handleCreate}
          onDelete={deleteLocation}
          onGenerateWithAI={() => setShowGenerator(true)}
          searchPlaceholder="Search locations..."
          createLabel="Add Location"
          deleteConfirmTitle="Delete Location"
          deleteConfirmDescription={(loc) =>
            `Are you sure you want to delete "${loc.name}"? Moments referencing this location will be affected.`
          }
          renderItem={(loc) => (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                {loc.background ? (
                  <Image className="h-4 w-4 text-primary" />
                ) : (
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{loc.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {loc.id}
                </p>
              </div>
            </div>
          )}
        />
      </div>

      {/* Detail panel */}
      <div className="">
        {selectedLocation ? (
          <ScrollArea className="h-full">
            <div className="max-w-2xl space-y-6 p-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle>Basic Information</CardTitle>
                  <EntityIdBadge id={selectedLocation.id} />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={selectedLocation.name}
                      onChange={(e) => handleUpdate({ name: e.target.value })}
                      placeholder="Location Name"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <AIFieldWrapper
                      entityType="location"
                      field="description"
                      universe={universe}
                      currentEntity={
                        selectedLocation as unknown as Record<string, unknown>
                      }
                      currentValue={selectedLocation.description}
                      onValueChange={(value) =>
                        handleUpdate({ description: value })
                      }
                    >
                      <Textarea
                        id="description"
                        value={selectedLocation.description}
                        onChange={(e) =>
                          handleUpdate({ description: e.target.value })
                        }
                        placeholder="Describe this location..."
                        rows={4}
                      />
                    </AIFieldWrapper>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Visual & Audio</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="background">Background Image URL</Label>
                    <Input
                      id="background"
                      value={selectedLocation.background || ""}
                      onChange={(e) =>
                        handleUpdate({
                          background: e.target.value || undefined,
                        })
                      }
                      placeholder="https://..."
                    />
                    {selectedLocation.background && (
                      <div className="mt-2 overflow-hidden rounded-md border">
                        <img
                          src={selectedLocation.background}
                          alt="Background preview"
                          className="h-40 w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="music">Background Music URL</Label>
                    <Input
                      id="music"
                      value={selectedLocation.music || ""}
                      onChange={(e) =>
                        handleUpdate({ music: e.target.value || undefined })
                      }
                      placeholder="https://..."
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="ambientSound">Ambient Sound URL</Label>
                    <Input
                      id="ambientSound"
                      value={selectedLocation.ambientSound || ""}
                      onChange={(e) =>
                        handleUpdate({
                          ambientSound: e.target.value || undefined,
                        })
                      }
                      placeholder="https://..."
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Access Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={(selectedLocation.requirements || []).join("\n")}
                    onChange={(e) =>
                      handleUpdate({
                        requirements: e.target.value
                          .split("\n")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="Enter requirements, one per line...
Example: character.$player.stats.level >= 5"
                    rows={4}
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    Expression conditions that must be met to access this
                    location (one per line)
                  </p>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Select a location to edit or create a new one
          </div>
        )}
      </div>

      {/* AI Location Generator */}
      <LocationGenerator
        open={showGenerator}
        onOpenChange={setShowGenerator}
        universe={universe}
        onAccept={(location) => {
          addLocation(location);
          selectEntity(location.id);
        }}
      />
    </div>
  );
}
