import * as React from "react";
import type { v2 } from "@wdydn/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Switch } from "@/shared/components/ui/switch";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { EntityList } from "@/shared/components/ui/entity-list";
import { EntityIdBadge } from "@/shared/components/ui/entity-id-badge";

import { useUniverseEditorStore, generateEntityId } from "../store/universe-editor-store";
import { AIFieldWrapper } from "./ai-field-wrapper";
import { MomentGenerator } from "./entity-generator";

type Moment = v2.Moment;
type MomentStatus = v2.MomentStatus;
type Emotion = v2.Emotion;

const STATUSES: MomentStatus[] = [
  "available",
  "active",
  "lived",
  "passed",
  "hidden",
  "locked",
];

const EMOTIONS: Emotion[] = [
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
];

const statusColors: Record<MomentStatus, string> = {
  available: "bg-green-500/20 text-green-400",
  active: "bg-blue-500/20 text-blue-400",
  lived: "bg-slate-500/20 text-slate-400",
  passed: "bg-amber-500/20 text-amber-400",
  hidden: "bg-purple-500/20 text-purple-400",
  locked: "bg-red-500/20 text-red-400",
};

function createDefaultMoment(): Moment {
  return {
    id: generateEntityId("moment", "new_moment"),
    title: "New Moment",
    text: "",
    preview: "",
    status: "hidden",
  };
}

export function MomentsEditor() {
  const [showGenerator, setShowGenerator] = React.useState(false);

  const {
    universe,
    selectedEntityId,
    selectEntity,
    addMoment,
    updateMoment,
    deleteMoment,
  } = useUniverseEditorStore();

  if (!universe) return null;

  const selectedMoment = universe.moments.find((m) => m.id === selectedEntityId);

  const handleCreate = () => {
    const newMoment = createDefaultMoment();
    addMoment(newMoment);
  };

  const handleUpdate = (updates: Partial<Moment>) => {
    if (selectedEntityId) {
      updateMoment(selectedEntityId, updates);
    }
  };

  const handleStageUpdate = (
    position: "left" | "center" | "right",
    value: { characterId: string; emotion?: Emotion; speaking?: boolean } | undefined
  ) => {
    if (!selectedMoment) return;
    const currentStage = selectedMoment.stage || { left: undefined, center: undefined, right: undefined };
    handleUpdate({
      stage: {
        left: currentStage.left,
        center: currentStage.center,
        right: currentStage.right,
        [position]: value,
      },
    });
  };

  const handleTransitionUpdate = (status: MomentStatus, expressions: string[]) => {
    if (!selectedMoment) return;
    const newTransitions = { ...selectedMoment.transitions };
    if (expressions.length > 0) {
      newTransitions[status] = expressions;
    } else {
      delete newTransitions[status];
    }
    handleUpdate({ transitions: newTransitions });
  };

  return (
    <div className="flex h-[calc(100vh-7rem)]">
      {/* List panel */}
      <div className="w-72 shrink-0">
        <EntityList
          items={universe.moments}
          selectedId={selectedEntityId}
          onSelect={selectEntity}
          onCreate={handleCreate}
          onDelete={deleteMoment}
          onGenerateWithAI={() => setShowGenerator(true)}
          searchPlaceholder="Search moments..."
          createLabel="Add Moment"
          deleteConfirmTitle="Delete Moment"
          deleteConfirmDescription={(moment) =>
            `Are you sure you want to delete "${moment.title || moment.id}"? This cannot be undone.`
          }
          getSearchValue={(moment) => moment.title || moment.id}
          renderItem={(moment) => (
            <div>
              <div className="flex items-center justify-between">
                <p className="truncate font-medium">{moment.title || moment.id}</p>
                {moment.status && (
                  <span
                    className={`ml-2 shrink-0 rounded px-1 py-0.5 text-[10px] capitalize ${
                      statusColors[moment.status]
                    }`}
                  >
                    {moment.status}
                  </span>
                )}
              </div>
              <p className="truncate text-xs text-muted-foreground">{moment.id}</p>
            </div>
          )}
        />
      </div>

      {/* Detail panel */}
      <div className="flex-1 overflow-hidden">
        {selectedMoment ? (
          <ScrollArea className="h-full">
            <div className="max-w-3xl space-y-6 p-6">
              <Tabs defaultValue="content">
                <TabsList>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="stage">Stage</TabsTrigger>
                  <TabsTrigger value="transitions">Transitions</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="mt-6 space-y-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                      <CardTitle>Narrative Content</CardTitle>
                      <EntityIdBadge id={selectedMoment.id} />
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          value={selectedMoment.title || ""}
                          onChange={(e) =>
                            handleUpdate({ title: e.target.value || undefined })
                          }
                          placeholder="Moment Title"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="preview">Preview Text</Label>
                        <Input
                          id="preview"
                          value={selectedMoment.preview || ""}
                          onChange={(e) =>
                            handleUpdate({ preview: e.target.value || undefined })
                          }
                          placeholder="Short text shown as choice button"
                        />
                        <p className="text-xs text-muted-foreground">
                          This text is shown when the moment appears as a choice
                        </p>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="text">Narrative Text</Label>
                        <AIFieldWrapper
                          entityType="moment"
                          field="text"
                          universe={universe}
                          currentEntity={selectedMoment as unknown as Record<string, unknown>}
                          currentValue={selectedMoment.text || ""}
                          onValueChange={(value) => handleUpdate({ text: value || undefined })}
                        >
                          <Textarea
                            id="text"
                            value={selectedMoment.text || ""}
                            onChange={(e) =>
                              handleUpdate({ text: e.target.value || undefined })
                            }
                            placeholder="The main narrative content..."
                            rows={8}
                          />
                        </AIFieldWrapper>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="stage" className="mt-6 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Stage Layout</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 sm:grid-cols-3">
                        {(["left", "center", "right"] as const).map((position) => {
                          const slot = selectedMoment.stage?.[position];
                          return (
                            <div key={position} className="space-y-2">
                              <Label className="capitalize">{position}</Label>
                              <div className="rounded-lg border p-3 space-y-2">
                                <Select
                                  value={slot?.characterId || "__none__"}
                                  onValueChange={(value) => {
                                    if (value && value !== "__none__") {
                                      handleStageUpdate(position, {
                                        characterId: value,
                                        emotion: slot?.emotion || "neutral",
                                        speaking: slot?.speaking,
                                      });
                                    } else {
                                      handleStageUpdate(position, undefined);
                                    }
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="No character" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="__none__">None</SelectItem>
                                    {universe.characters.map((char) => (
                                      <SelectItem key={char.id} value={char.id}>
                                        {char.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>

                                {slot && (
                                  <>
                                    <Select
                                      value={slot.emotion || "neutral"}
                                      onValueChange={(value: Emotion) =>
                                        handleStageUpdate(position, {
                                          ...slot,
                                          emotion: value,
                                        })
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {EMOTIONS.map((emotion) => (
                                          <SelectItem key={emotion} value={emotion}>
                                            {emotion}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>

                                    <div className="flex items-center gap-2">
                                      <Switch
                                        id={`speaking-${position}`}
                                        checked={slot.speaking === true}
                                        onCheckedChange={(checked) =>
                                          handleStageUpdate(position, {
                                            ...slot,
                                            speaking: checked || undefined,
                                          })
                                        }
                                      />
                                      <Label htmlFor={`speaking-${position}`}>
                                        Speaking
                                      </Label>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-4 grid gap-2">
                        <Label htmlFor="locationId">Location</Label>
                        <Select
                          value={selectedMoment.locationId || "__none__"}
                          onValueChange={(value) =>
                            handleUpdate({ locationId: value === "__none__" ? undefined : value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="No location" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">None</SelectItem>
                            {universe.locations.map((loc) => (
                              <SelectItem key={loc.id} value={loc.id}>
                                {loc.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="transitions" className="mt-6 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Status Transitions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {STATUSES.map((status) => (
                        <div key={status} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded px-2 py-0.5 text-xs capitalize ${statusColors[status]}`}
                            >
                              {status}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              Expressions run when moment is in this status
                            </span>
                          </div>
                          <Textarea
                            value={
                              (selectedMoment.transitions?.[status] || []).join("\n")
                            }
                            onChange={(e) =>
                              handleTransitionUpdate(
                                status,
                                e.target.value
                                  .split("\n")
                                  .map((s) => s.trim())
                                  .filter(Boolean)
                              )
                            }
                            placeholder={`Expressions for ${status} status (one per line)...
Example: $self.status = available when character.$player.stats.gold >= 10`}
                            rows={3}
                          />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="settings" className="mt-6 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Moment Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="status">Initial Status</Label>
                        <Select
                          value={selectedMoment.status || "hidden"}
                          onValueChange={(value: MomentStatus) =>
                            handleUpdate({ status: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUSES.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Moments with "available" status are starting moments
                        </p>
                      </div>

                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <Label htmlFor="urgent">Urgent</Label>
                          <p className="text-sm text-muted-foreground">
                            If not chosen, can transition to 'passed'
                          </p>
                        </div>
                        <Switch
                          id="urgent"
                          checked={selectedMoment.urgent === true}
                          onCheckedChange={(checked) =>
                            handleUpdate({ urgent: checked || undefined })
                          }
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="tags">Tags</Label>
                        <Input
                          id="tags"
                          value={(selectedMoment.tags || []).join(", ")}
                          onChange={(e) =>
                            handleUpdate({
                              tags: e.target.value
                                .split(",")
                                .map((s) => s.trim())
                                .filter(Boolean),
                            })
                          }
                          placeholder="combat, story, side-quest..."
                        />
                        <p className="text-xs text-muted-foreground">
                          Comma-separated tags for filtering and categorization
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Attached Challenge</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Select
                        value={selectedMoment.challenge?.id || "__none__"}
                        onValueChange={(value) => {
                          if (value && value !== "__none__") {
                            const challenge = universe.challenges.find(
                              (c) => c.id === value
                            );
                            handleUpdate({
                              challenge: challenge
                                ? JSON.parse(JSON.stringify(challenge))
                                : undefined,
                            });
                          } else {
                            handleUpdate({ challenge: undefined });
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="No challenge" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">None</SelectItem>
                          {universe.challenges.map((challenge) => (
                            <SelectItem key={challenge.id} value={challenge.id}>
                              {challenge.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Attach a challenge template to this moment. The challenge will
                        be copied when the moment is entered.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Select a moment to edit or create a new one
          </div>
        )}
      </div>

      {/* AI Moment Generator */}
      <MomentGenerator
        open={showGenerator}
        onOpenChange={setShowGenerator}
        universe={universe}
        onAccept={(moment) => {
          addMoment(moment);
          selectEntity(moment.id);
        }}
      />
    </div>
  );
}
