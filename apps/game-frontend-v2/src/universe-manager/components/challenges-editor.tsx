import * as React from "react";
import type { v2 } from "@wdydn/shared";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { EntityList } from "@/shared/components/ui/entity-list";
import { EntityIdBadge } from "@/shared/components/ui/entity-id-badge";
import { Swords, Plus, Trash2 } from "lucide-react";

import { useUniverseEditorStore, generateEntityId } from "../store/universe-editor-store";
import { AIFieldWrapper } from "./ai-field-wrapper";
import { ChallengeGenerator } from "./entity-generator";

type Challenge = v2.Challenge;
type ChallengeRole = v2.ChallengeRole;
type ChallengeOutcome = v2.ChallengeOutcome;

function createDefaultChallenge(): Challenge {
  return {
    id: generateEntityId("challenge", "new_challenge"),
    name: "New Challenge",
    roles: [
      { id: "player", name: "Player", required: true },
      { id: "opponent", name: "Opponent", required: true },
    ],
    roundActions: [],
    outcomes: [
      {
        id: "victory",
        name: "Victory",
        condition: "character.opponent.stats.hp <= 0",
      },
      {
        id: "defeat",
        name: "Defeat",
        condition: "character.player.stats.hp <= 0",
      },
    ],
  };
}

export function ChallengesEditor() {
  const [showGenerator, setShowGenerator] = React.useState(false);

  const {
    universe,
    selectedEntityId,
    selectEntity,
    addChallenge,
    updateChallenge,
    deleteChallenge,
  } = useUniverseEditorStore();

  if (!universe) return null;

  const selectedChallenge = universe.challenges.find(
    (c) => c.id === selectedEntityId
  );

  const handleCreate = () => {
    const newChallenge = createDefaultChallenge();
    addChallenge(newChallenge);
  };

  const handleUpdate = (updates: Partial<Challenge>) => {
    if (selectedEntityId) {
      updateChallenge(selectedEntityId, updates);
    }
  };

  const handleAddRole = () => {
    if (!selectedChallenge) return;
    const newRole: ChallengeRole = {
      id: `role_${Date.now()}`,
      name: "New Role",
      required: false,
    };
    handleUpdate({ roles: [...selectedChallenge.roles, newRole] });
  };

  const handleUpdateRole = (index: number, updates: Partial<ChallengeRole>) => {
    if (!selectedChallenge) return;
    const newRoles = [...selectedChallenge.roles];
    newRoles[index] = { ...newRoles[index], ...updates };
    handleUpdate({ roles: newRoles });
  };

  const handleDeleteRole = (index: number) => {
    if (!selectedChallenge) return;
    handleUpdate({
      roles: selectedChallenge.roles.filter((_, i) => i !== index),
    });
  };

  const handleAddOutcome = () => {
    if (!selectedChallenge) return;
    const newOutcome: ChallengeOutcome = {
      id: `outcome_${Date.now()}`,
      name: "New Outcome",
      condition: "",
    };
    handleUpdate({ outcomes: [...selectedChallenge.outcomes, newOutcome] });
  };

  const handleUpdateOutcome = (
    index: number,
    updates: Partial<ChallengeOutcome>
  ) => {
    if (!selectedChallenge) return;
    const newOutcomes = [...selectedChallenge.outcomes];
    newOutcomes[index] = { ...newOutcomes[index], ...updates };
    handleUpdate({ outcomes: newOutcomes });
  };

  const handleDeleteOutcome = (index: number) => {
    if (!selectedChallenge) return;
    handleUpdate({
      outcomes: selectedChallenge.outcomes.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="flex h-[calc(100vh-7rem)]">
      {/* List panel */}
      <div className="w-72 shrink-0">
        <EntityList
          items={universe.challenges}
          selectedId={selectedEntityId}
          onSelect={selectEntity}
          onCreate={handleCreate}
          onDelete={deleteChallenge}
          onGenerateWithAI={() => setShowGenerator(true)}
          searchPlaceholder="Search challenges..."
          createLabel="Add Challenge"
          deleteConfirmTitle="Delete Challenge"
          deleteConfirmDescription={(challenge) =>
            `Are you sure you want to delete "${challenge.name}"? Moments using this challenge will be affected.`
          }
          renderItem={(challenge) => (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                <Swords className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{challenge.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {challenge.roles.length} roles, {challenge.outcomes.length}{" "}
                  outcomes
                </p>
              </div>
            </div>
          )}
        />
      </div>

      {/* Detail panel */}
      <div className="flex-1 overflow-hidden">
        {selectedChallenge ? (
          <ScrollArea className="h-full">
            <div className="max-w-3xl space-y-6 p-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle>Basic Information</CardTitle>
                  <EntityIdBadge id={selectedChallenge.id} />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={selectedChallenge.name}
                      onChange={(e) => handleUpdate({ name: e.target.value })}
                      placeholder="Challenge Name"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <AIFieldWrapper
                      entityType="challenge"
                      field="description"
                      universe={universe}
                      currentEntity={selectedChallenge as unknown as Record<string, unknown>}
                      currentValue={selectedChallenge.description || ""}
                      onValueChange={(value) => handleUpdate({ description: value || undefined })}
                    >
                      <Textarea
                        id="description"
                        value={selectedChallenge.description || ""}
                        onChange={(e) =>
                          handleUpdate({ description: e.target.value || undefined })
                        }
                        placeholder="What kind of challenge is this?"
                        rows={2}
                      />
                    </AIFieldWrapper>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="maxRounds">Max Rounds</Label>
                    <Input
                      id="maxRounds"
                      type="number"
                      min={1}
                      value={selectedChallenge.maxRounds || 10}
                      onChange={(e) =>
                        handleUpdate({
                          maxRounds: parseInt(e.target.value) || undefined,
                        })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Roles</CardTitle>
                  <Button size="sm" variant="outline" onClick={handleAddRole}>
                    <Plus className="mr-1 h-3 w-3" />
                    Add Role
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedChallenge.roles.map((role, index) => (
                    <div
                      key={role.id}
                      className="flex items-center gap-2 rounded-lg border p-3"
                    >
                      <Input
                        value={role.id}
                        onChange={(e) =>
                          handleUpdateRole(index, { id: e.target.value })
                        }
                        placeholder="role_id"
                        className="w-32"
                      />
                      <Input
                        value={role.name}
                        onChange={(e) =>
                          handleUpdateRole(index, { name: e.target.value })
                        }
                        placeholder="Role Name"
                        className="flex-1"
                      />
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={role.required}
                          onChange={(e) =>
                            handleUpdateRole(index, { required: e.target.checked })
                          }
                        />
                        Required
                      </label>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteRole(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  {selectedChallenge.roles.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No roles defined. Add at least one role.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Round Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={selectedChallenge.roundActions.join("\n")}
                    onChange={(e) =>
                      handleUpdate({
                        roundActions: e.target.value
                          .split("\n")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="Enter round actions, one per line...
Example: character.player.stats.hp -= $roll(1d6) + character.opponent.stats.strength / 2"
                    rows={6}
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    Expressions executed each round. Use $roll(1d6), $round,
                    character.[roleId].stats.X
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Outcomes</CardTitle>
                  <Button size="sm" variant="outline" onClick={handleAddOutcome}>
                    <Plus className="mr-1 h-3 w-3" />
                    Add Outcome
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedChallenge.outcomes.map((outcome, index) => (
                    <div
                      key={outcome.id}
                      className="space-y-3 rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-2">
                        <Input
                          value={outcome.id}
                          onChange={(e) =>
                            handleUpdateOutcome(index, { id: e.target.value })
                          }
                          placeholder="outcome_id"
                          className="w-32"
                        />
                        <Input
                          value={outcome.name}
                          onChange={(e) =>
                            handleUpdateOutcome(index, { name: e.target.value })
                          }
                          placeholder="Outcome Name"
                          className="flex-1"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteOutcome(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      <div className="grid gap-2">
                        <Label>Condition</Label>
                        <Input
                          value={outcome.condition}
                          onChange={(e) =>
                            handleUpdateOutcome(index, {
                              condition: e.target.value,
                            })
                          }
                          placeholder="character.opponent.stats.hp <= 0"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Consequences</Label>
                        <Textarea
                          value={(outcome.consequences || []).join("\n")}
                          onChange={(e) =>
                            handleUpdateOutcome(index, {
                              consequences: e.target.value
                                .split("\n")
                                .map((s) => s.trim())
                                .filter(Boolean),
                            })
                          }
                          placeholder="Effects when this outcome is reached (one per line)"
                          rows={2}
                        />
                      </div>
                    </div>
                  ))}
                  {selectedChallenge.outcomes.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No outcomes defined. Add at least one outcome.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Select a challenge to edit or create a new one
          </div>
        )}
      </div>

      {/* AI Challenge Generator */}
      <ChallengeGenerator
        open={showGenerator}
        onOpenChange={setShowGenerator}
        universe={universe}
        onAccept={(challenge) => {
          addChallenge(challenge);
          selectEntity(challenge.id);
        }}
      />
    </div>
  );
}
