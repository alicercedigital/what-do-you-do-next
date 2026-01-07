import { useState } from "react";
import type {
  ChallengeTemplate,
  Stat,
  RoundAction,
  Outcome,
} from "@wdydn/shared";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Switch } from "@/shared/components/ui/switch";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Swords,
  Play,
  Target,
  MessageSquare,
  Dices,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { CalculationBuilder } from "@/universe/components/calculation-builder";

interface Props {
  challenges: ChallengeTemplate[];
  onChange: (challenges: ChallengeTemplate[]) => void;
  stats: Stat[];
}

const DEFAULT_CHALLENGE: Omit<ChallengeTemplate, "id"> = {
  name: "New Challenge",
  description: "",
  icon: "swords",
  roles: [
    { id: "player", name: "Player", required: true },
    { id: "enemy", name: "Enemy", required: true },
  ],
  trackedStats: [],
  rounds: [],
  outcomes: [
    { id: "victory", name: "Victory", description: "You won!", result: "win" },
    { id: "defeat", name: "Defeat", description: "You lost.", result: "lose" },
  ],
  maxRounds: 50,
  display: {
    roundDelay: 1000,
    showLog: true,
    theme: "combat",
  },
};

export function ChallengeEditor({ challenges, onChange, stats }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const addChallenge = () => {
    const newChallenge: ChallengeTemplate = {
      ...DEFAULT_CHALLENGE,
      id: crypto.randomUUID(),
    };
    onChange([...challenges, newChallenge]);
    setExpandedId(newChallenge.id);
  };

  const updateChallenge = (id: string, updates: Partial<ChallengeTemplate>) => {
    onChange(challenges.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deleteChallenge = (id: string) => {
    onChange(challenges.filter((c) => c.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Swords className="h-4 w-4" />
          Challenges
          <span className="text-xs bg-muted px-2 py-0.5 rounded">
            {challenges.length}
          </span>
        </h3>
        <Button variant="outline" size="sm" onClick={addChallenge}>
          <Plus className="h-3 w-3 mr-1" />
          Add Challenge
        </Button>
      </div>

      <div className="space-y-2">
        {challenges.map((challenge) => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            stats={stats}
            expanded={expandedId === challenge.id}
            onToggle={() =>
              setExpandedId(expandedId === challenge.id ? null : challenge.id)
            }
            onChange={(updates) => updateChallenge(challenge.id, updates)}
            onDelete={() => deleteChallenge(challenge.id)}
          />
        ))}
        {challenges.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No challenges defined yet
          </p>
        )}
      </div>
    </div>
  );
}

function ChallengeCard({
  challenge,
  stats,
  expanded,
  onToggle,
  onChange,
  onDelete,
}: {
  challenge: ChallengeTemplate;
  stats: Stat[];
  expanded: boolean;
  onToggle: () => void;
  onChange: (updates: Partial<ChallengeTemplate>) => void;
  onDelete: () => void;
}) {
  const roleIds = challenge.roles.map((r) => r.id);

  return (
    <Collapsible open={expanded} onOpenChange={onToggle}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="p-3 cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded flex items-center justify-center bg-muted">
                <Swords className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-sm">{challenge.name}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {challenge.roles.length} roles, {challenge.rounds.length}{" "}
                  actions
                </p>
              </div>
              {expanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="basic" className="flex-1">
                  Basic
                </TabsTrigger>
                <TabsTrigger value="actions" className="flex-1">
                  Actions
                </TabsTrigger>
                <TabsTrigger value="outcomes" className="flex-1">
                  Outcomes
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Name</Label>
                    <Input
                      value={challenge.name}
                      onChange={(e) => onChange({ name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Theme</Label>
                    <Select
                      value={challenge.display.theme}
                      onValueChange={(
                        theme: Exclude<
                          ChallengeTemplate["display"]["theme"],
                          undefined
                        >
                      ) =>
                        onChange({ display: { ...challenge.display, theme } })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={"combat"}>Combat</SelectItem>
                        <SelectItem value={"race"}>Race</SelectItem>
                        <SelectItem value={"academic"}>Academic</SelectItem>
                        <SelectItem value={"social"}>Social</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Description</Label>
                  <Textarea
                    value={challenge.description}
                    onChange={(e) => onChange({ description: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Max Rounds</Label>
                    <Input
                      type="number"
                      value={challenge.maxRounds}
                      onChange={(e) =>
                        onChange({
                          maxRounds: Number.parseInt(e.target.value) || 50,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Round Delay (ms)</Label>
                    <Input
                      type="number"
                      value={challenge.display.roundDelay}
                      onChange={(e) =>
                        onChange({
                          display: {
                            ...challenge.display,
                            roundDelay: Number.parseInt(e.target.value) || 1000,
                          },
                        })
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-xs">Show Battle Log</Label>
                  <Switch
                    checked={challenge.display.showLog}
                    onCheckedChange={(showLog) =>
                      onChange({ display: { ...challenge.display, showLog } })
                    }
                  />
                </div>

                {/* Roles */}
                <div className="space-y-2 border-t pt-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground">
                      Roles
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        onChange({
                          roles: [
                            ...challenge.roles,
                            {
                              id: `role-${challenge.roles.length}`,
                              name: "New Role",
                              required: false,
                            },
                          ],
                        })
                      }
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  {challenge.roles.map((role, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={role.id}
                        onChange={(e) => {
                          const roles = [...challenge.roles];
                          roles[index] = { ...role, id: e.target.value };
                          onChange({ roles });
                        }}
                        placeholder="ID"
                        className="w-24"
                      />
                      <Input
                        value={role.name}
                        onChange={(e) => {
                          const roles = [...challenge.roles];
                          roles[index] = { ...role, name: e.target.value };
                          onChange({ roles });
                        }}
                        placeholder="Display Name"
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          onChange({
                            roles: challenge.roles.filter(
                              (_, i) => i !== index
                            ),
                          })
                        }
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="actions" className="space-y-4 pt-4">
                <RoundActionsEditor
                  actions={challenge.rounds}
                  onChange={(rounds) => onChange({ rounds })}
                  stats={stats}
                  roles={roleIds}
                  outcomes={challenge.outcomes}
                />
              </TabsContent>

              <TabsContent value="outcomes" className="space-y-4 pt-4">
                <OutcomesEditor
                  outcomes={challenge.outcomes}
                  onChange={(outcomes) => onChange({ outcomes })}
                  stats={stats}
                />
              </TabsContent>
            </Tabs>

            <Button
              variant="destructive"
              size="sm"
              onClick={onDelete}
              className="w-full mt-4"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Delete Challenge
            </Button>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

function RoundActionsEditor({
  actions,
  onChange,
  stats,
  roles,
  outcomes,
}: {
  actions: RoundAction[];
  onChange: (actions: RoundAction[]) => void;
  stats: Stat[];
  roles: string[];
  outcomes: Outcome[];
}) {
  const addAction = (type: RoundAction["type"]) => {
    let newAction: RoundAction;
    switch (type) {
      case "damage":
        newAction = {
          type: "damage",
          target: roles[0] ?? "player",
          stat: "hp",
          amount: [],
          message: "",
        };
        break;
      case "check":
        newAction = { type: "check", condition: [] };
        break;
      case "log":
        newAction = { type: "log", message: "" };
        break;
      case "roll":
        newAction = { type: "roll", dice: "1d20", saveAs: "roll" };
        break;
      default:
        return;
    }
    onChange([...actions, newAction]);
  };

  const updateAction = (index: number, updates: Partial<RoundAction>) => {
    const newActions = [...actions];
    newActions[index] = { ...newActions[index], ...updates } as RoundAction;
    onChange(newActions);
  };

  const removeAction = (index: number) => {
    onChange(actions.filter((_, i) => i !== index));
  };

  const ActionIcon = {
    damage: Target,
    check: Play,
    log: MessageSquare,
    roll: Dices,
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => addAction("damage")}>
          <Target className="h-3 w-3 mr-1" />
          Damage
        </Button>
        <Button variant="outline" size="sm" onClick={() => addAction("check")}>
          <Play className="h-3 w-3 mr-1" />
          Check
        </Button>
        <Button variant="outline" size="sm" onClick={() => addAction("log")}>
          <MessageSquare className="h-3 w-3 mr-1" />
          Log
        </Button>
        <Button variant="outline" size="sm" onClick={() => addAction("roll")}>
          <Dices className="h-3 w-3 mr-1" />
          Roll
        </Button>
      </div>

      {actions.map((action, index) => {
        const Icon = ActionIcon[action.type];
        return (
          <Card key={index} className="p-3">
            <div className="flex items-start gap-2">
              <Icon className="h-4 w-4 mt-1 text-muted-foreground shrink-0" />
              <div className="flex-1 space-y-2">
                {action.type === "damage" && (
                  <>
                    <div className="flex items-center gap-2">
                      <Select
                        value={action.target}
                        onValueChange={(target) =>
                          updateAction(index, { target })
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((r) => (
                            <SelectItem key={r} value={r}>
                              {r}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span className="text-sm text-muted-foreground">
                        loses
                      </span>
                      <Input
                        value={action.stat}
                        onChange={(e) =>
                          updateAction(index, { stat: e.target.value })
                        }
                        className="w-20"
                        placeholder="stat"
                      />
                    </div>
                    <CalculationBuilder
                      tokens={action.amount}
                      onChange={(amount) => updateAction(index, { amount })}
                      availableStats={stats}
                      allowRoles
                      roles={roles}
                    />
                    <Input
                      value={action.message ?? ""}
                      onChange={(e) =>
                        updateAction(index, { message: e.target.value })
                      }
                      placeholder="Message template..."
                    />
                  </>
                )}

                {action.type === "check" && (
                  <>
                    <p className="text-xs text-muted-foreground">
                      Condition (triggers outcome if value {"<="} 0):
                    </p>
                    <CalculationBuilder
                      tokens={action.condition}
                      onChange={(condition) =>
                        updateAction(index, { condition })
                      }
                      availableStats={stats}
                      allowRoles
                      roles={roles}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Select
                        value={action.onTrue ?? "none"}
                        onValueChange={(onTrue) =>
                          updateAction(index, { onTrue })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="On True" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {outcomes.map((o) => (
                            <SelectItem key={o.id} value={o.id}>
                              {o.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={action.onFalse ?? "none"}
                        onValueChange={(onFalse) =>
                          updateAction(index, { onFalse })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="On False" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {outcomes.map((o) => (
                            <SelectItem key={o.id} value={o.id}>
                              {o.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {action.type === "log" && (
                  <Input
                    value={action.message}
                    onChange={(e) =>
                      updateAction(index, { message: e.target.value })
                    }
                    placeholder="Message template with {role.stat} placeholders..."
                  />
                )}

                {action.type === "roll" && (
                  <div className="flex items-center gap-2">
                    <Input
                      value={action.dice}
                      onChange={(e) =>
                        updateAction(index, { dice: e.target.value })
                      }
                      placeholder="1d20"
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">
                      save as
                    </span>
                    <Input
                      value={action.saveAs}
                      onChange={(e) =>
                        updateAction(index, { saveAs: e.target.value })
                      }
                      placeholder="variable"
                      className="w-24"
                    />
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeAction(index)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </Card>
        );
      })}

      {actions.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No round actions defined
        </p>
      )}
    </div>
  );
}

function OutcomesEditor({
  outcomes,
  onChange,
  stats,
}: {
  outcomes: Outcome[];
  onChange: (outcomes: Outcome[]) => void;
  stats: Stat[];
}) {
  const addOutcome = () => {
    onChange([
      ...outcomes,
      {
        id: crypto.randomUUID(),
        name: "New Outcome",
        description: "",
        result: "draw",
      },
    ]);
  };

  const updateOutcome = (index: number, updates: Partial<Outcome>) => {
    const newOutcomes = [...outcomes];
    newOutcomes[index] = { ...newOutcomes[index], ...updates };
    onChange(newOutcomes);
  };

  const removeOutcome = (index: number) => {
    onChange(outcomes.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <Button variant="outline" size="sm" onClick={addOutcome}>
        <Plus className="h-3 w-3 mr-1" />
        Add Outcome
      </Button>

      {outcomes.map((outcome, index) => (
        <Card key={index} className="p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Input
              value={outcome.id}
              onChange={(e) => updateOutcome(index, { id: e.target.value })}
              placeholder="ID"
              className="w-24"
            />
            <Input
              value={outcome.name}
              onChange={(e) => updateOutcome(index, { name: e.target.value })}
              placeholder="Name"
              className="flex-1"
            />
            <Select
              value={outcome.result}
              onValueChange={(result: Outcome["result"]) =>
                updateOutcome(index, { result })
              }
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="win">Win</SelectItem>
                <SelectItem value="lose">Lose</SelectItem>
                <SelectItem value="draw">Draw</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeOutcome(index)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
          <Input
            value={outcome.description}
            onChange={(e) =>
              updateOutcome(index, { description: e.target.value })
            }
            placeholder="Description"
          />
          <div className="flex items-center gap-2">
            <Label className="text-xs">XP Reward:</Label>
            <Input
              type="number"
              value={outcome.rewards?.experience ?? 0}
              onChange={(e) =>
                updateOutcome(index, {
                  rewards: {
                    ...outcome.rewards,
                    experience: Number.parseInt(e.target.value) || 0,
                  },
                })
              }
              className="w-20"
            />
            <Label className="text-xs ml-2">Game Over:</Label>
            <Switch
              checked={outcome.gameOver ?? false}
              onCheckedChange={(gameOver) => updateOutcome(index, { gameOver })}
            />
          </div>
        </Card>
      ))}
    </div>
  );
}
