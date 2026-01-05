"use client"

import type React from "react"

import { useState } from "react"
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Users,
  RotateCcw,
  Trophy,
  Swords,
  Timer,
  GraduationCap,
  MessageSquare,
  Sparkles,
  AlertTriangle,
  Copy,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
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
} from "@/components/ui/alert-dialog"
import { IconPicker } from "./icon-picker"
import { ConflictFormulaBuilder } from "./conflict-formula-builder"
import type {
  ConflictEvent,
  ConflictRole,
  CycleStep,
  ConflictOutcome,
  CycleStepAction,
  RoleEntityType,
} from "@/lib/schemas/conflict-event-schema"
import { CONFLICT_TEMPLATES } from "@/lib/schemas/conflict-event-schema"
import type { GameAttribute } from "@/lib/schemas/game-entity-schema"
import { cn } from "@/lib/utils"

interface ConflictEventEditorProps {
  conflictEvent: ConflictEvent | null
  attributes: GameAttribute[]
  onSave: (conflictEvent: ConflictEvent) => void
  onCancel: () => void
}

const TEMPLATE_ICONS: Record<string, React.ReactNode> = {
  combat: <Swords className="h-5 w-5" />,
  race: <Timer className="h-5 w-5" />,
  exam: <GraduationCap className="h-5 w-5" />,
  negotiation: <MessageSquare className="h-5 w-5" />,
}

const DEFAULT_CONFLICT: ConflictEvent = {
  id: "",
  name: "",
  description: "",
  icon: "swords",
  roles: [],
  cycleSteps: [],
  outcomes: [],
  maxCycles: 100,
  showTurnLog: true,
  animationSpeed: "normal",
}

export function ConflictEventEditor({ conflictEvent, attributes, onSave, onCancel }: ConflictEventEditorProps) {
  const isEditing = !!conflictEvent

  const [conflict, setConflict] = useState<ConflictEvent>(() => {
    if (conflictEvent) return conflictEvent
    return {
      ...DEFAULT_CONFLICT,
      id: crypto.randomUUID(),
    }
  })

  const [activeTab, setActiveTab] = useState("general")
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set())
  const [expandedOutcomes, setExpandedOutcomes] = useState<Set<string>>(new Set())

  // Template selection
  const applyTemplate = (templateKey: string) => {
    const template = CONFLICT_TEMPLATES[templateKey]
    if (template) {
      setConflict((prev) => ({
        ...prev,
        ...template,
        id: prev.id, // Keep the ID
        roles: template.roles?.map((r) => ({ ...r, id: r.id || crypto.randomUUID() })) || [],
        outcomes: template.outcomes?.map((o) => ({ ...o, id: o.id || crypto.randomUUID() })) || [],
      }))
    }
  }

  // Update helpers
  const updateConflict = (updates: Partial<ConflictEvent>) => {
    setConflict((prev) => ({ ...prev, ...updates }))
  }

  // Role management
  const addRole = () => {
    const newRole: ConflictRole = {
      id: crypto.randomUUID(),
      name: `Role ${conflict.roles.length + 1}`,
      description: "",
      entityType: "character",
      required: true,
    }
    updateConflict({ roles: [...conflict.roles, newRole] })
  }

  const updateRole = (roleId: string, updates: Partial<ConflictRole>) => {
    updateConflict({
      roles: conflict.roles.map((r) => (r.id === roleId ? { ...r, ...updates } : r)),
    })
  }

  const deleteRole = (roleId: string) => {
    updateConflict({
      roles: conflict.roles.filter((r) => r.id !== roleId),
    })
  }

  // Cycle step management
  const addStep = () => {
    const newStep: CycleStep = {
      id: crypto.randomUUID(),
      name: `Step ${conflict.cycleSteps.length + 1}`,
      description: "",
      action: {
        type: "check-condition",
        condition: [],
        thenSteps: [],
      },
      executeFor: "once",
    }
    updateConflict({ cycleSteps: [...conflict.cycleSteps, newStep] })
    setExpandedSteps((prev) => new Set([...prev, newStep.id]))
  }

  const updateStep = (stepId: string, updates: Partial<CycleStep>) => {
    updateConflict({
      cycleSteps: conflict.cycleSteps.map((s) => (s.id === stepId ? { ...s, ...updates } : s)),
    })
  }

  const updateStepAction = (stepId: string, action: CycleStepAction) => {
    updateConflict({
      cycleSteps: conflict.cycleSteps.map((s) => (s.id === stepId ? { ...s, action } : s)),
    })
  }

  const deleteStep = (stepId: string) => {
    updateConflict({
      cycleSteps: conflict.cycleSteps.filter((s) => s.id !== stepId),
    })
  }

  const moveStep = (stepId: string, direction: "up" | "down") => {
    const index = conflict.cycleSteps.findIndex((s) => s.id === stepId)
    if (index === -1) return
    if (direction === "up" && index === 0) return
    if (direction === "down" && index === conflict.cycleSteps.length - 1) return

    const newSteps = [...conflict.cycleSteps]
    const swapIndex = direction === "up" ? index - 1 : index + 1
    ;[newSteps[index], newSteps[swapIndex]] = [newSteps[swapIndex], newSteps[index]]
    updateConflict({ cycleSteps: newSteps })
  }

  const duplicateStep = (stepId: string) => {
    const step = conflict.cycleSteps.find((s) => s.id === stepId)
    if (!step) return
    const newStep = {
      ...JSON.parse(JSON.stringify(step)),
      id: crypto.randomUUID(),
      name: `${step.name} (copy)`,
    }
    const index = conflict.cycleSteps.findIndex((s) => s.id === stepId)
    const newSteps = [...conflict.cycleSteps]
    newSteps.splice(index + 1, 0, newStep)
    updateConflict({ cycleSteps: newSteps })
    setExpandedSteps((prev) => new Set([...prev, newStep.id]))
  }

  // Outcome management
  const addOutcome = () => {
    const newOutcome: ConflictOutcome = {
      id: crypto.randomUUID(),
      name: `Outcome ${conflict.outcomes.length + 1}`,
      description: "",
      type: "neutral",
      attributeChanges: [],
      itemRewards: [],
      triggersGameOver: false,
    }
    updateConflict({ outcomes: [...conflict.outcomes, newOutcome] })
    setExpandedOutcomes((prev) => new Set([...prev, newOutcome.id]))
  }

  const updateOutcome = (outcomeId: string, updates: Partial<ConflictOutcome>) => {
    updateConflict({
      outcomes: conflict.outcomes.map((o) => (o.id === outcomeId ? { ...o, ...updates } : o)),
    })
  }

  const deleteOutcome = (outcomeId: string) => {
    updateConflict({
      outcomes: conflict.outcomes.filter((o) => o.id !== outcomeId),
    })
  }

  // Toggle helpers
  const toggleStep = (stepId: string) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev)
      if (next.has(stepId)) next.delete(stepId)
      else next.add(stepId)
      return next
    })
  }

  const toggleOutcome = (outcomeId: string) => {
    setExpandedOutcomes((prev) => {
      const next = new Set(prev)
      if (next.has(outcomeId)) next.delete(outcomeId)
      else next.add(outcomeId)
      return next
    })
  }

  // Validation
  const canSave =
    conflict.name.trim().length > 0 &&
    conflict.roles.length > 0 &&
    conflict.cycleSteps.length > 0 &&
    conflict.outcomes.length > 0

  const handleSave = () => {
    if (canSave) {
      onSave(conflict)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{isEditing ? "Edit Conflict Event" : "Create Conflict Event"}</h1>
              <p className="text-muted-foreground text-sm">Define auto-battle turn-based events</p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={!canSave} className="gap-2">
            <Save className="h-4 w-4" />
            Save Conflict
          </Button>
        </div>

        {/* Template Selection (only for new conflicts) */}
        {!isEditing && !conflict.name && (
          <Card className="mb-6 py-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Start from Template
              </CardTitle>
              <CardDescription>Choose a template to get started quickly, or create from scratch</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(CONFLICT_TEMPLATES).map(([key, template]) => (
                  <Button
                    key={key}
                    variant="outline"
                    className="h-auto flex-col gap-2 p-4 bg-transparent"
                    onClick={() => applyTemplate(key)}
                  >
                    {TEMPLATE_ICONS[key]}
                    <span className="font-medium">{template.name}</span>
                    <span className="text-xs text-muted-foreground text-center">
                      {template.description?.slice(0, 50)}...
                    </span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="general" className="gap-2">
              <Swords className="h-4 w-4" />
              <span className="hidden sm:inline">General</span>
            </TabsTrigger>
            <TabsTrigger value="roles" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Roles</span>
              <span className="ml-1 text-xs bg-secondary px-1.5 rounded">{conflict.roles.length}</span>
            </TabsTrigger>
            <TabsTrigger value="cycle" className="gap-2">
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline">Cycle</span>
              <span className="ml-1 text-xs bg-secondary px-1.5 rounded">{conflict.cycleSteps.length}</span>
            </TabsTrigger>
            <TabsTrigger value="outcomes" className="gap-2">
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Outcomes</span>
              <span className="ml-1 text-xs bg-secondary px-1.5 rounded">{conflict.outcomes.length}</span>
            </TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general">
            <Card className="py-4">
              <CardHeader>
                <CardTitle>Conflict Details</CardTitle>
                <CardDescription>Basic information about this conflict type</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-[80px_1fr] gap-4">
                  <div className="space-y-2">
                    <Label>Icon</Label>
                    <IconPicker value={conflict.icon} onChange={(icon) => updateConflict({ icon })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Combat, Race, Exam"
                      value={conflict.name}
                      onChange={(e) => updateConflict({ name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe how this conflict works..."
                    value={conflict.description}
                    onChange={(e) => updateConflict({ description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Max Cycles</Label>
                    <Input
                      type="number"
                      value={conflict.maxCycles}
                      onChange={(e) => updateConflict({ maxCycles: Number.parseInt(e.target.value) || 100 })}
                    />
                    <p className="text-xs text-muted-foreground">Safety limit to prevent infinite loops</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Animation Speed</Label>
                    <Select
                      value={conflict.animationSpeed}
                      onValueChange={(value) =>
                        updateConflict({ animationSpeed: value as "slow" | "normal" | "fast" | "instant" })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="slow">Slow</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="fast">Fast</SelectItem>
                        <SelectItem value="instant">Instant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Turn Log</Label>
                    <p className="text-xs text-muted-foreground">Display a log of each turn's actions</p>
                  </div>
                  <Switch
                    checked={conflict.showTurnLog}
                    onCheckedChange={(checked) => updateConflict({ showTurnLog: checked })}
                  />
                </div>

                {conflict.outcomes.length > 0 && (
                  <div className="space-y-2">
                    <Label>Default Outcome</Label>
                    <Select
                      value={conflict.defaultOutcomeId || ""}
                      onValueChange={(value) => updateConflict({ defaultOutcomeId: value || undefined })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select outcome if max cycles reached" />
                      </SelectTrigger>
                      <SelectContent>
                        {conflict.outcomes.map((outcome) => (
                          <SelectItem key={outcome.id} value={outcome.id}>
                            {outcome.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Roles Tab */}
          <TabsContent value="roles">
            <Card className="py-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Roles</CardTitle>
                    <CardDescription>Define who participates in this conflict</CardDescription>
                  </div>
                  <Button onClick={addRole} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Role
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {conflict.roles.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No roles defined yet</p>
                    <p className="text-sm">Add roles to define who participates in this conflict</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {conflict.roles.map((role) => (
                      <Card key={role.id} className="py-3">
                        <CardContent className="p-4 space-y-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Name</Label>
                                <Input
                                  value={role.name}
                                  onChange={(e) => updateRole(role.id, { name: e.target.value })}
                                  placeholder="e.g., Player, Enemy"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Entity Type</Label>
                                <Select
                                  value={role.entityType}
                                  onValueChange={(value) =>
                                    updateRole(role.id, { entityType: value as RoleEntityType })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="character">Character</SelectItem>
                                    <SelectItem value="location">Location</SelectItem>
                                    <SelectItem value="item">Item</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Role</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{role.name}"? This will also remove any references
                                    to this role in formulas.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteRole(role.id)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                          <div className="space-y-2">
                            <Label>Description</Label>
                            <Input
                              value={role.description}
                              onChange={(e) => updateRole(role.id, { description: e.target.value })}
                              placeholder="Describe this role's purpose"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={role.required}
                              onCheckedChange={(checked) => updateRole(role.id, { required: checked })}
                            />
                            <Label className="text-sm">Required for conflict to start</Label>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cycle Tab */}
          <TabsContent value="cycle">
            <Card className="py-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Cycle Steps</CardTitle>
                    <CardDescription>Define the steps that run each turn until an outcome is triggered</CardDescription>
                  </div>
                  <Button onClick={addStep} className="gap-2" disabled={conflict.roles.length === 0}>
                    <Plus className="h-4 w-4" />
                    Add Step
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {conflict.roles.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Add roles first</p>
                    <p className="text-sm">You need to define roles before creating cycle steps</p>
                  </div>
                ) : conflict.cycleSteps.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <RotateCcw className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No steps defined yet</p>
                    <p className="text-sm">Add steps to define what happens each turn</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-3 pr-4">
                      {conflict.cycleSteps.map((step, index) => (
                        <Collapsible
                          key={step.id}
                          open={expandedSteps.has(step.id)}
                          onOpenChange={() => toggleStep(step.id)}
                        >
                          <Card className="py-0">
                            <CollapsibleTrigger asChild>
                              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <span className="text-xs text-muted-foreground font-mono w-6">#{index + 1}</span>
                                    <div>
                                      <CardTitle className="text-base">{step.name}</CardTitle>
                                      <CardDescription className="text-xs">
                                        {step.action.type.replace(/-/g, " ")}
                                        {step.executeFor === "each-role" && " (for each role)"}
                                      </CardDescription>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        moveStep(step.id, "up")
                                      }}
                                      disabled={index === 0}
                                    >
                                      <ChevronUp className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        moveStep(step.id, "down")
                                      }}
                                      disabled={index === conflict.cycleSteps.length - 1}
                                    >
                                      <ChevronDown className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        duplicateStep(step.id)
                                      }}
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 text-destructive"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Delete Step</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Are you sure you want to delete "{step.name}"?
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction onClick={() => deleteStep(step.id)}>
                                            Delete
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                    {expandedSteps.has(step.id) ? (
                                      <ChevronUp className="h-4 w-4" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4" />
                                    )}
                                  </div>
                                </div>
                              </CardHeader>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <CardContent className="pt-0 pb-4 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Step Name</Label>
                                    <Input
                                      value={step.name}
                                      onChange={(e) => updateStep(step.id, { name: e.target.value })}
                                      placeholder="Name this step"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Action Type</Label>
                                    <Select
                                      value={step.action.type}
                                      onValueChange={(value) => {
                                        // Create new action based on type
                                        let newAction: CycleStepAction
                                        switch (value) {
                                          case "modify-attribute":
                                            newAction = {
                                              type: "modify-attribute",
                                              roleId: conflict.roles[0]?.id || "",
                                              attributeId: "",
                                              operation: "subtract",
                                              formula: [],
                                            }
                                            break
                                          case "check-condition":
                                            newAction = {
                                              type: "check-condition",
                                              condition: [],
                                              thenSteps: [],
                                            }
                                            break
                                          case "set-variable":
                                            newAction = {
                                              type: "set-variable",
                                              variableName: "",
                                              formula: [],
                                            }
                                            break
                                          case "log-message":
                                            newAction = {
                                              type: "log-message",
                                              template: "",
                                            }
                                            break
                                          case "trigger-outcome":
                                            newAction = {
                                              type: "trigger-outcome",
                                              outcomeId: conflict.outcomes[0]?.id || "",
                                            }
                                            break
                                          case "roll-dice":
                                            newAction = {
                                              type: "roll-dice",
                                              variableName: "roll",
                                              diceCount: 1,
                                              diceSides: 20,
                                            }
                                            break
                                          case "compare-attributes":
                                            newAction = {
                                              type: "compare-attributes",
                                              comparisons: [],
                                              resultVariable: "winner",
                                            }
                                            break
                                          default:
                                            return
                                        }
                                        updateStepAction(step.id, newAction)
                                      }}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="check-condition">Check Condition</SelectItem>
                                        <SelectItem value="modify-attribute">Modify Attribute</SelectItem>
                                        <SelectItem value="trigger-outcome">Trigger Outcome</SelectItem>
                                        <SelectItem value="roll-dice">Roll Dice</SelectItem>
                                        <SelectItem value="set-variable">Set Variable</SelectItem>
                                        <SelectItem value="log-message">Log Message</SelectItem>
                                        <SelectItem value="compare-attributes">Compare Attributes</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label>Description (optional)</Label>
                                  <Input
                                    value={step.description || ""}
                                    onChange={(e) => updateStep(step.id, { description: e.target.value })}
                                    placeholder="Explain what this step does"
                                  />
                                </div>

                                {/* Action-specific fields */}
                                <StepActionEditor
                                  action={step.action}
                                  onChange={(action) => updateStepAction(step.id, action)}
                                  roles={conflict.roles}
                                  attributes={attributes}
                                  outcomes={conflict.outcomes}
                                  allSteps={conflict.cycleSteps}
                                />
                              </CardContent>
                            </CollapsibleContent>
                          </Card>
                        </Collapsible>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Outcomes Tab */}
          <TabsContent value="outcomes">
            <Card className="py-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Outcomes</CardTitle>
                    <CardDescription>Define possible endings and their rewards</CardDescription>
                  </div>
                  <Button onClick={addOutcome} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Outcome
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {conflict.outcomes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No outcomes defined yet</p>
                    <p className="text-sm">Add outcomes to define how the conflict can end</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-3 pr-4">
                      {conflict.outcomes.map((outcome) => (
                        <Collapsible
                          key={outcome.id}
                          open={expandedOutcomes.has(outcome.id)}
                          onOpenChange={() => toggleOutcome(outcome.id)}
                        >
                          <Card className="py-0">
                            <CollapsibleTrigger asChild>
                              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        outcome.type === "success" && "border-green-500 text-green-500",
                                        outcome.type === "failure" && "border-red-500 text-red-500",
                                        outcome.type === "neutral" && "border-muted-foreground",
                                      )}
                                    >
                                      {outcome.type}
                                    </Badge>
                                    <div>
                                      <CardTitle className="text-base">{outcome.name}</CardTitle>
                                      {outcome.triggersGameOver && (
                                        <CardDescription className="text-xs text-destructive">
                                          Triggers Game Over
                                        </CardDescription>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 text-destructive"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Delete Outcome</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Are you sure you want to delete "{outcome.name}"?
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction onClick={() => deleteOutcome(outcome.id)}>
                                            Delete
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                    {expandedOutcomes.has(outcome.id) ? (
                                      <ChevronUp className="h-4 w-4" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4" />
                                    )}
                                  </div>
                                </div>
                              </CardHeader>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <CardContent className="pt-0 pb-4 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Name</Label>
                                    <Input
                                      value={outcome.name}
                                      onChange={(e) => updateOutcome(outcome.id, { name: e.target.value })}
                                      placeholder="e.g., Victory, Defeat"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Type</Label>
                                    <Select
                                      value={outcome.type}
                                      onValueChange={(value) =>
                                        updateOutcome(outcome.id, { type: value as "success" | "failure" | "neutral" })
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="success">Success</SelectItem>
                                        <SelectItem value="failure">Failure</SelectItem>
                                        <SelectItem value="neutral">Neutral</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label>Description</Label>
                                  <Textarea
                                    value={outcome.description}
                                    onChange={(e) => updateOutcome(outcome.id, { description: e.target.value })}
                                    placeholder="What happens when this outcome occurs"
                                    rows={2}
                                  />
                                </div>

                                <div className="flex items-center gap-2">
                                  <Switch
                                    checked={outcome.triggersGameOver}
                                    onCheckedChange={(checked) =>
                                      updateOutcome(outcome.id, { triggersGameOver: checked })
                                    }
                                  />
                                  <Label className="text-sm">Triggers Game Over</Label>
                                </div>

                                {conflict.roles.length > 0 && attributes.length > 0 && (
                                  <div className="space-y-2">
                                    <Label>Experience Formula (optional)</Label>
                                    <ConflictFormulaBuilder
                                      tokens={outcome.experienceFormula || []}
                                      onChange={(tokens) => updateOutcome(outcome.id, { experienceFormula: tokens })}
                                      roles={conflict.roles}
                                      attributes={attributes}
                                    />
                                  </div>
                                )}
                              </CardContent>
                            </CollapsibleContent>
                          </Card>
                        </Collapsible>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// Step Action Editor Component
interface StepActionEditorProps {
  action: CycleStepAction
  onChange: (action: CycleStepAction) => void
  roles: ConflictRole[]
  attributes: GameAttribute[]
  outcomes: ConflictOutcome[]
  allSteps: CycleStep[]
}

function StepActionEditor({ action, onChange, roles, attributes, outcomes, allSteps }: StepActionEditorProps) {
  switch (action.type) {
    case "check-condition":
      return (
        <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
          <Label className="text-sm font-medium">Condition</Label>
          <ConflictFormulaBuilder
            tokens={action.condition}
            onChange={(tokens) => onChange({ ...action, condition: tokens })}
            roles={roles}
            attributes={attributes}
            allowComparisons
            allowLogical
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">If TRUE, execute steps:</Label>
              <Select
                value={action.thenSteps[0] || "_none"}
                onValueChange={(value) => onChange({ ...action, thenSteps: value === "_none" ? [] : [value] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select step..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">None</SelectItem>
                  {allSteps.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">If FALSE, execute steps (optional):</Label>
              <Select
                value={action.elseSteps?.[0] || "_none"}
                onValueChange={(value) => onChange({ ...action, elseSteps: value === "_none" ? undefined : [value] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select step..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">None</SelectItem>
                  {allSteps.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )

    case "modify-attribute":
      return (
        <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Role</Label>
              <Select value={action.roleId} onValueChange={(value) => onChange({ ...action, roleId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role..." />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Attribute</Label>
              <Select value={action.attributeId} onValueChange={(value) => onChange({ ...action, attributeId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select attribute..." />
                </SelectTrigger>
                <SelectContent>
                  {attributes.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Operation</Label>
              <Select
                value={action.operation}
                onValueChange={(value) =>
                  onChange({ ...action, operation: value as "set" | "add" | "subtract" | "multiply" | "divide" })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="set">Set to</SelectItem>
                  <SelectItem value="add">Add</SelectItem>
                  <SelectItem value="subtract">Subtract</SelectItem>
                  <SelectItem value="multiply">Multiply by</SelectItem>
                  <SelectItem value="divide">Divide by</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Value Formula</Label>
            <ConflictFormulaBuilder
              tokens={action.formula}
              onChange={(tokens) => onChange({ ...action, formula: tokens })}
              roles={roles}
              attributes={attributes}
            />
          </div>
        </div>
      )

    case "trigger-outcome":
      return (
        <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
          <Label className="text-sm">Outcome to Trigger</Label>
          <Select value={action.outcomeId} onValueChange={(value) => onChange({ ...action, outcomeId: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select outcome..." />
            </SelectTrigger>
            <SelectContent>
              {outcomes.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        o.type === "success" && "border-green-500 text-green-500",
                        o.type === "failure" && "border-red-500 text-red-500",
                      )}
                    >
                      {o.type}
                    </Badge>
                    {o.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )

    case "roll-dice":
      return (
        <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Variable Name</Label>
              <Input
                value={action.variableName}
                onChange={(e) => onChange({ ...action, variableName: e.target.value })}
                placeholder="e.g., roll, attack"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Dice Count</Label>
              <Input
                type="number"
                min={1}
                value={action.diceCount}
                onChange={(e) => onChange({ ...action, diceCount: Number.parseInt(e.target.value) || 1 })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Dice Sides</Label>
              <Select
                value={action.diceSides.toString()}
                onValueChange={(value) => onChange({ ...action, diceSides: Number.parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4">d4</SelectItem>
                  <SelectItem value="6">d6</SelectItem>
                  <SelectItem value="8">d8</SelectItem>
                  <SelectItem value="10">d10</SelectItem>
                  <SelectItem value="12">d12</SelectItem>
                  <SelectItem value="20">d20</SelectItem>
                  <SelectItem value="100">d100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Modifier Formula (optional)</Label>
            <ConflictFormulaBuilder
              tokens={action.modifier || []}
              onChange={(tokens) => onChange({ ...action, modifier: tokens.length > 0 ? tokens : undefined })}
              roles={roles}
              attributes={attributes}
            />
          </div>
        </div>
      )

    case "set-variable":
      return (
        <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
          <div className="space-y-2">
            <Label className="text-sm">Variable Name</Label>
            <Input
              value={action.variableName}
              onChange={(e) => onChange({ ...action, variableName: e.target.value })}
              placeholder="e.g., damage, speed"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Value Formula</Label>
            <ConflictFormulaBuilder
              tokens={action.formula}
              onChange={(tokens) => onChange({ ...action, formula: tokens })}
              roles={roles}
              attributes={attributes}
            />
          </div>
        </div>
      )

    case "log-message":
      return (
        <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
          <Label className="text-sm">Message Template</Label>
          <Textarea
            value={action.template}
            onChange={(e) => onChange({ ...action, template: e.target.value })}
            placeholder="Use {role.attribute} for values. E.g., '{player.name} attacks for {damage} damage!'"
            rows={2}
          />
          <p className="text-xs text-muted-foreground">
            Use {"{role.attribute}"} syntax to interpolate values. Available roles:{" "}
            {roles.map((r) => r.name.toLowerCase()).join(", ")}
          </p>
        </div>
      )

    case "compare-attributes":
      return (
        <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Result Variable</Label>
              <Input
                value={action.resultVariable}
                onChange={(e) => onChange({ ...action, resultVariable: e.target.value })}
                placeholder="e.g., winner, fastest"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Order Variable (optional)</Label>
              <Input
                value={action.orderVariable || ""}
                onChange={(e) => onChange({ ...action, orderVariable: e.target.value || undefined })}
                placeholder="e.g., turnOrder"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Add formulas for each role to compare. The role with the highest value will be stored in the result
            variable.
          </p>
        </div>
      )

    default:
      return null
  }
}
