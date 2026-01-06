"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type {
    ConflictRole,
    RoleEntityType
} from "@/lib/schemas/conflict-event-schema";
import { Trash2 } from "lucide-react";

interface ConflictRoleEditorProps {
  role: ConflictRole;
  onUpdate: (updates: Partial<ConflictRole>) => void;
  onDelete: () => void;
}

export function ConflictRoleEditor({
  role,
  onUpdate,
  onDelete,
}: ConflictRoleEditorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={role.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              placeholder="e.g., Player, Enemy"
            />
          </div>
          <div className="space-y-2">
            <Label>Entity Type</Label>
            <Select
              value={role.entityType}
              onValueChange={(value) =>
                onUpdate({ entityType: value as RoleEntityType })
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
                Are you sure you want to delete "{role.name}"? This will also
                remove any references to this role in formulas.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Input
          value={role.description || ""}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Describe this role's purpose"
        />
      </div>
      <div className="flex items-center gap-2">
        <Switch
          checked={role.required}
          onCheckedChange={(checked) => onUpdate({ required: checked })}
        />
        <Label className="text-sm">Required for conflict to start</Label>
      </div>
    </div>
  );
}
