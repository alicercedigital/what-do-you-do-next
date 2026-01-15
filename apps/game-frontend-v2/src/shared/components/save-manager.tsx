import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Save, Trash2, Loader2, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { Input } from "@/shared/components/ui/input";
import {
  useLibraryStore,
  useCurrentUniverseSaves,
  formatPlayTime,
  type FullGameSave,
} from "@/store/library-store";
import { cn } from "@/shared/lib/utils";

interface SaveSlotProps {
  slot: number;
  save: FullGameSave | null;
  isAutoSave: boolean;
  onLoad: () => void;
  onSave: (name: string) => void;
  onDelete: () => void;
  disabled?: boolean;
}

function SaveSlot({
  slot,
  save,
  isAutoSave,
  onLoad,
  onSave,
  onDelete,
  disabled,
}: SaveSlotProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(save?.name || `Save ${slot}`);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = () => {
    onSave(newName);
    setIsEditing(false);
  };

  return (
    <>
      <div
        className={cn(
          "flex items-center gap-4 rounded-lg border p-4 transition-colors",
          save && "hover:bg-muted/50",
          !save && "border-dashed"
        )}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
          {isAutoSave ? (
            <CheckCircle className="h-6 w-6 text-primary" />
          ) : save ? (
            <Save className="h-6 w-6 text-muted-foreground" />
          ) : (
            <div className="h-6 w-6 border-2 border-dashed border-muted-foreground/50 rounded" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex gap-2">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="h-8"
                placeholder="Save name"
              />
              <Button size="sm" onClick={handleSave}>
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          ) : save ? (
            <>
              <div className="font-medium">{save.name}</div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {formatPlayTime(save.play_time_seconds)}
                </span>
                <span>
                  {formatDistanceToNow(new Date(save.updated_at), { addSuffix: true })}
                </span>
              </div>
            </>
          ) : (
            <div className="text-muted-foreground">Empty slot</div>
          )}
        </div>

        {!isEditing && (
          <div className="flex items-center gap-2">
            {save && (
              <>
                <Button size="sm" variant="outline" onClick={onLoad} disabled={disabled}>
                  Load
                </Button>
                {!isAutoSave && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={disabled}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </>
            )}
            {!isAutoSave && (
              <Button
                size="sm"
                onClick={() => {
                  if (save) {
                    setIsEditing(true);
                  } else {
                    onSave(`Save ${slot}`);
                  }
                }}
                disabled={disabled}
              >
                {save ? "Overwrite" : "Save Here"}
              </Button>
            )}
          </div>
        )}
      </div>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Save?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{save?.name}"? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete();
                setShowDeleteConfirm(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

interface SaveManagerProps {
  universeId: string;
  currentState: Record<string, unknown>;
  universeVersion?: number;
  playTimeSeconds?: number;
  onLoad: (save: FullGameSave) => void;
  trigger?: React.ReactNode;
}

export function SaveManager({
  universeId,
  currentState,
  universeVersion = 1,
  playTimeSeconds = 0,
  onLoad,
  trigger,
}: SaveManagerProps) {
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { loadSaves, saveGame, deleteSave, isLoadingSaves } = useLibraryStore();
  const saves = useCurrentUniverseSaves();

  // Load saves when dialog opens
  useEffect(() => {
    if (open) {
      loadSaves(universeId);
    }
  }, [open, universeId, loadSaves]);

  // Create slot array (0 = autosave, 1-5 = manual)
  const slots = [0, 1, 2, 3, 4, 5].map((slot) => ({
    slot,
    save: saves.find((s) => s.slot === slot) || null,
    isAutoSave: slot === 0,
  }));

  const handleSave = async (slot: number, name: string) => {
    setIsSaving(true);
    setError(null);

    const result = await saveGame(universeId, {
      slot,
      name,
      state: currentState,
      universeVersion,
      playTimeSeconds,
    });

    if (!result) {
      setError("Failed to save game");
    }

    setIsSaving(false);
  };

  const handleLoad = (save: FullGameSave) => {
    onLoad(save);
    setOpen(false);
  };

  const handleDelete = async (slot: number) => {
    await deleteSave(universeId, slot);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Save className="mr-2 h-4 w-4" />
            Saves
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Save & Load</DialogTitle>
          <DialogDescription>
            Manage your game saves. Slot 0 is used for autosaving.
          </DialogDescription>
        </DialogHeader>

        {isLoadingSaves ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-3">
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            {slots.map(({ slot, save, isAutoSave }) => (
              <SaveSlot
                key={slot}
                slot={slot}
                save={save}
                isAutoSave={isAutoSave}
                onLoad={() => save && handleLoad(save)}
                onSave={(name) => handleSave(slot, name)}
                onDelete={() => handleDelete(slot)}
                disabled={isSaving}
              />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
