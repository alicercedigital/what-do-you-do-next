"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { GenericFormulaBuilder } from "./generic-formula-builder";
import { cn } from "@/lib/utils";
import type {
  ConflictOutcome,
  ConflictRole,
} from "@/lib/schemas/conflict-event-schema";
import type { GameAttribute } from "@/lib/schemas/game-entity-schema";

interface ConflictOutcomeEditorProps {
  outcome: ConflictOutcome;
  onUpdate: (updates: Partial<ConflictOutcome>) => void;
  roles: ConflictRole[];
  attributes: GameAttribute[];
}

export function ConflictOutcomeEditor({
  outcome,
  onUpdate,
  roles,
  attributes,
}: ConflictOutcomeEditorProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Name</Label>
          <Input
            value={outcome.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="e.g., Victory, Defeat"
          />
        </div>
        <div className="space-y-2">
          <Label>Type</Label>
          <Select
            value={outcome.type}
            onValueChange={(value) =>
              onUpdate({
                type: value as "success" | "failure" | "neutral",
              })
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
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="What happens when this outcome occurs"
          rows={2}
        />
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={outcome.triggersGameOver}
          onCheckedChange={(checked) => onUpdate({ triggersGameOver: checked })}
        />
        <Label className="text-sm">Triggers Game Over</Label>
      </div>

      {roles.length > 0 && attributes.length > 0 && (
        <>
          <div className="space-y-2">
            <Label>Experience Formula (optional)</Label>
            <GenericFormulaBuilder
              tokens={outcome.experienceFormula || []}
              onChange={(tokens) => onUpdate({ experienceFormula: tokens })}
              availableAttributes={attributes}
              roles={roles}
              allowRoleAttributes
            />
          </div>

          <div className="space-y-2">
            <Label>Attribute Changes</Label>
            <AttributeChangesEditor
              attributeChanges={outcome.attributeChanges || []}
              onChange={(changes) => onUpdate({ attributeChanges: changes })}
              roles={roles}
              attributes={attributes}
            />
          </div>

          <div className="space-y-2">
            <Label>Item Rewards</Label>
            <ItemRewardsEditor
              itemRewards={outcome.itemRewards || []}
              onChange={(rewards) => onUpdate({ itemRewards: rewards })}
            />
          </div>
        </>
      )}
    </div>
  );
}

// Attribute Changes Editor
interface AttributeChangesEditorProps {
  attributeChanges: Array<{
    roleId: string;
    attributeId: string;
    formula: any[];
  }>;
  onChange: (
    changes: Array<{ roleId: string; attributeId: string; formula: any[] }>
  ) => void;
  roles: ConflictRole[];
  attributes: GameAttribute[];
}

function AttributeChangesEditor({
  attributeChanges,
  onChange,
  roles,
  attributes,
}: AttributeChangesEditorProps) {
  const addChange = () => {
    onChange([
      ...attributeChanges,
      {
        roleId: roles[0]?.id || "",
        attributeId: attributes[0]?.id || "",
        formula: [],
      },
    ]);
  };

  const updateChange = (
    index: number,
    updates: Partial<{ roleId: string; attributeId: string; formula: any[] }>
  ) => {
    const newChanges = [...attributeChanges];
    newChanges[index] = { ...newChanges[index], ...updates };
    onChange(newChanges);
  };

  const removeChange = (index: number) => {
    onChange(attributeChanges.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      {attributeChanges.map((change, index) => (
        <div key={index} className="border rounded-md p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Change #{index + 1}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeChange(index)}
              className="h-6 px-2 text-xs text-destructive"
            >
              Remove
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Select
              value={change.roleId}
              onValueChange={(value) => updateChange(index, { roleId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={change.attributeId}
              onValueChange={(value) =>
                updateChange(index, { attributeId: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Attribute" />
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
          <GenericFormulaBuilder
            tokens={change.formula}
            onChange={(tokens) => updateChange(index, { formula: tokens })}
            availableAttributes={attributes}
            roles={roles}
            allowRoleAttributes
          />
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addChange}>
        Add Attribute Change
      </Button>
    </div>
  );
}

// Item Rewards Editor
interface ItemRewardsEditorProps {
  itemRewards: Array<{
    itemId: string;
    quantity: number;
    chance: number;
  }>;
  onChange: (
    rewards: Array<{ itemId: string; quantity: number; chance: number }>
  ) => void;
}

function ItemRewardsEditor({ itemRewards, onChange }: ItemRewardsEditorProps) {
  const addReward = () => {
    onChange([...itemRewards, { itemId: "", quantity: 1, chance: 1 }]);
  };

  const updateReward = (
    index: number,
    updates: Partial<{ itemId: string; quantity: number; chance: number }>
  ) => {
    const newRewards = [...itemRewards];
    newRewards[index] = { ...newRewards[index], ...updates };
    onChange(newRewards);
  };

  const removeReward = (index: number) => {
    onChange(itemRewards.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      {itemRewards.map((reward, index) => (
        <div key={index} className="border rounded-md p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Reward #{index + 1}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeReward(index)}
              className="h-6 px-2 text-xs text-destructive"
            >
              Remove
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Input
              placeholder="Item ID"
              value={reward.itemId}
              onChange={(e) => updateReward(index, { itemId: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Quantity"
              value={reward.quantity}
              onChange={(e) =>
                updateReward(index, {
                  quantity: Number.parseInt(e.target.value) || 1,
                })
              }
              min={1}
            />
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Chance"
                value={reward.chance}
                onChange={(e) =>
                  updateReward(index, {
                    chance: Math.max(
                      0,
                      Math.min(1, Number.parseFloat(e.target.value) || 1)
                    ),
                  })
                }
                min={0}
                max={1}
                step={0.1}
              />
              <span className="text-xs text-muted-foreground">0-1</span>
            </div>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addReward}>
        Add Item Reward
      </Button>
    </div>
  );
}
