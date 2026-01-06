"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GenericFormulaBuilder } from "./generic-formula-builder";
import type {
  CycleStep,
  CycleStepAction,
  ConflictRole,
  ConflictOutcome,
} from "@/lib/schemas/conflict-event-schema";
import type { GameAttribute } from "@/lib/schemas/game-entity-schema";

interface ConflictCycleStepEditorProps {
  step: CycleStep;
  onUpdate: (updates: Partial<CycleStep>) => void;
  onActionChange: (action: CycleStepAction) => void;
  roles: ConflictRole[];
  attributes: GameAttribute[];
  outcomes: ConflictOutcome[];
  allSteps: CycleStep[];
}

export function ConflictCycleStepEditor({
  step,
  onUpdate,
  onActionChange,
  roles,
  attributes,
  outcomes,
  allSteps,
}: ConflictCycleStepEditorProps) {
  const handleActionTypeChange = (value: string) => {
    let newAction: CycleStepAction;
    switch (value) {
      case "modify-attribute":
        newAction = {
          type: "modify-attribute",
          roleId: roles[0]?.id || "",
          attributeId: "",
          operation: "subtract",
          formula: [],
        };
        break;
      case "check-condition":
        newAction = {
          type: "check-condition",
          condition: [],
          thenSteps: [],
        };
        break;
      case "set-variable":
        newAction = {
          type: "set-variable",
          variableName: "",
          formula: [],
        };
        break;
      case "log-message":
        newAction = {
          type: "log-message",
          template: "",
        };
        break;
      case "trigger-outcome":
        newAction = {
          type: "trigger-outcome",
          outcomeId: outcomes[0]?.id || "",
        };
        break;
      case "roll-dice":
        newAction = {
          type: "roll-dice",
          variableName: "roll",
          diceCount: 1,
          diceSides: 20,
        };
        break;
      case "compare-attributes":
        newAction = {
          type: "compare-attributes",
          comparisons: [],
          resultVariable: "winner",
        };
        break;
      default:
        return;
    }
    onActionChange(newAction);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Step Name</Label>
          <Input
            value={step.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="Name this step"
          />
        </div>
        <div className="space-y-2">
          <Label>Action Type</Label>
          <Select
            value={step.action.type}
            onValueChange={handleActionTypeChange}
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
              <SelectItem value="compare-attributes">
                Compare Attributes
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Description (optional)</Label>
        <Input
          value={step.description || ""}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Explain what this step does"
        />
      </div>

      {/* Action-specific fields */}
      <StepActionEditor
        action={step.action}
        onChange={onActionChange}
        roles={roles}
        attributes={attributes}
        outcomes={outcomes}
        allSteps={allSteps}
      />
    </div>
  );
}

// Step Action Editor Component
interface StepActionEditorProps {
  action: CycleStepAction;
  onChange: (action: CycleStepAction) => void;
  roles: ConflictRole[];
  attributes: GameAttribute[];
  outcomes: ConflictOutcome[];
  allSteps: CycleStep[];
}

function StepActionEditor({
  action,
  onChange,
  roles,
  attributes,
  outcomes,
  allSteps,
}: StepActionEditorProps) {
  switch (action.type) {
    case "check-condition":
      return (
        <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
          <Label className="text-sm font-medium">Condition</Label>
          <GenericFormulaBuilder
            tokens={action.condition}
            onChange={(tokens) => onChange({ ...action, condition: tokens })}
            availableAttributes={attributes}
            roles={roles}
            allowComparisons
            allowLogical
            allowRoleAttributes
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">If TRUE, execute steps:</Label>
              <Select
                value={action.thenSteps[0] || "_none"}
                onValueChange={(value) =>
                  onChange({
                    ...action,
                    thenSteps: value === "_none" ? [] : [value],
                  })
                }
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
              <Label className="text-sm">
                If FALSE, execute steps (optional):
              </Label>
              <Select
                value={action.elseSteps?.[0] || "_none"}
                onValueChange={(value) =>
                  onChange({
                    ...action,
                    elseSteps: value === "_none" ? undefined : [value],
                  })
                }
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
      );

    case "modify-attribute":
      return (
        <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Role</Label>
              <Select
                value={action.roleId}
                onValueChange={(value) =>
                  onChange({ ...action, roleId: value })
                }
              >
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
              <Select
                value={action.attributeId}
                onValueChange={(value) =>
                  onChange({ ...action, attributeId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select attribute..." />
                </SelectTrigger>
                <SelectContent>
                  {attributes.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                      {a.shortName && ` (${a.shortName})`}
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
                  onChange({
                    ...action,
                    operation: value as
                      | "set"
                      | "add"
                      | "subtract"
                      | "multiply"
                      | "divide",
                  })
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
            <GenericFormulaBuilder
              tokens={action.formula}
              onChange={(tokens) => onChange({ ...action, formula: tokens })}
              availableAttributes={attributes}
              roles={roles}
              allowRoleAttributes
            />
          </div>
        </div>
      );

    case "trigger-outcome":
      return (
        <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
          <Label className="text-sm">Outcome to Trigger</Label>
          <Select
            value={action.outcomeId}
            onValueChange={(value) => onChange({ ...action, outcomeId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select outcome..." />
            </SelectTrigger>
            <SelectContent>
              {outcomes.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );

    case "roll-dice":
      return (
        <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Variable Name</Label>
              <Input
                value={action.variableName}
                onChange={(e) =>
                  onChange({ ...action, variableName: e.target.value })
                }
                placeholder="e.g., roll, attack"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Dice Count</Label>
              <Input
                type="number"
                min={1}
                value={action.diceCount}
                onChange={(e) =>
                  onChange({
                    ...action,
                    diceCount: Number.parseInt(e.target.value) || 1,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Dice Sides</Label>
              <Select
                value={action.diceSides.toString()}
                onValueChange={(value) =>
                  onChange({ ...action, diceSides: Number.parseInt(value) })
                }
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
            <GenericFormulaBuilder
              tokens={action.modifier || []}
              onChange={(tokens) =>
                onChange({
                  ...action,
                  modifier: tokens.length > 0 ? tokens : undefined,
                })
              }
              availableAttributes={attributes}
              roles={roles}
              allowRoleAttributes
            />
          </div>
        </div>
      );

    case "set-variable":
      return (
        <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
          <div className="space-y-2">
            <Label className="text-sm">Variable Name</Label>
            <Input
              value={action.variableName}
              onChange={(e) =>
                onChange({ ...action, variableName: e.target.value })
              }
              placeholder="e.g., damage, speed"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Value Formula</Label>
            <GenericFormulaBuilder
              tokens={action.formula}
              onChange={(tokens) => onChange({ ...action, formula: tokens })}
              availableAttributes={attributes}
              roles={roles}
              allowRoleAttributes
            />
          </div>
        </div>
      );

    case "log-message":
      return (
        <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
          <Label className="text-sm">Message Template</Label>
          <Input
            value={action.template}
            onChange={(e) => onChange({ ...action, template: e.target.value })}
            placeholder="Use {role.attribute} for values. E.g., '{player.name} attacks for {damage} damage!'"
          />
          <p className="text-xs text-muted-foreground">
            Use {"{role.attribute}"} syntax to interpolate values. Available
            roles: {roles.map((r) => r.name.toLowerCase()).join(", ")}
          </p>
        </div>
      );

    case "compare-attributes":
      return (
        <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Result Variable</Label>
              <Input
                value={action.resultVariable}
                onChange={(e) =>
                  onChange({ ...action, resultVariable: e.target.value })
                }
                placeholder="e.g., winner, fastest"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Order Variable (optional)</Label>
              <Input
                value={action.orderVariable || ""}
                onChange={(e) =>
                  onChange({
                    ...action,
                    orderVariable: e.target.value || undefined,
                  })
                }
                placeholder="e.g., turnOrder"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Add formulas for each role to compare. The role with the highest
            value will be stored in the result variable.
          </p>
        </div>
      );

    default:
      return null;
  }
}
