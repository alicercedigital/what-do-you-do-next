import { useState, useEffect } from "react";
import {
  History,
  Loader2,
  Clock,
  AlertTriangle,
  RotateCcw,
  Plus,
  Check,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/shared/components/ui/alert";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { useUniverseEditorStore, useUniverseMetadata } from "../store/universe-editor-store";

interface UniverseVersion {
  id: string;
  universe_id: string;
  version: number;
  changelog: string | null;
  created_at: string;
}

export function VersionSelector() {
  const { universe, isDirty, loadUniverse } = useUniverseEditorStore();
  const metadata = useUniverseMetadata();

  const [isOpen, setIsOpen] = useState(false);
  const [versions, setVersions] = useState<UniverseVersion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);
  const [isRestoringVersion, setIsRestoringVersion] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const [changelog, setChangelog] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentVersion = metadata?.version ?? 1;

  useEffect(() => {
    if (isOpen && universe?.id) {
      loadVersions();
    }
  }, [isOpen, universe?.id]);

  const loadVersions = async () => {
    if (!universe?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/universe/${universe.id}/versions`);
      if (!response.ok) {
        throw new Error("Failed to load versions");
      }
      const data = await response.json();
      setVersions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load versions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateVersion = async () => {
    if (!universe?.id) return;

    setIsCreatingVersion(true);
    setError(null);

    try {
      const response = await fetch(`/api/universe/${universe.id}/version`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ changelog: changelog.trim() || null }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create version");
      }

      // Reload versions and reset form
      await loadVersions();
      setChangelog("");
      setShowCreateForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create version");
    } finally {
      setIsCreatingVersion(false);
    }
  };

  const handleRestoreVersion = async () => {
    if (!universe?.id || selectedVersion === null) return;

    setIsRestoringVersion(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/universe/${universe.id}/version/${selectedVersion}`
      );
      if (!response.ok) {
        throw new Error("Failed to load version");
      }

      // Reload the universe with the restored version data
      await loadUniverse(universe.id);
      setIsOpen(false);
      setSelectedVersion(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to restore version");
    } finally {
      setIsRestoringVersion(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <History className="h-4 w-4" />
          v{currentVersion}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Version History
          </DialogTitle>
          <DialogDescription>
            View and manage versions of your universe. Create snapshots to save
            important milestones.
          </DialogDescription>
        </DialogHeader>

        {isDirty && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Unsaved Changes</AlertTitle>
            <AlertDescription>
              You have unsaved changes. Save your work before creating a new
              version or restoring an old one.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {/* Current Version */}
          <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/50">
            <div className="flex items-center gap-2">
              <Badge>Current</Badge>
              <span className="font-medium">Version {currentVersion}</span>
            </div>
            {!showCreateForm && (
              <Button
                size="sm"
                onClick={() => setShowCreateForm(true)}
                disabled={isDirty}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Version
              </Button>
            )}
          </div>

          {/* Create Version Form */}
          {showCreateForm && (
            <div className="space-y-3 rounded-lg border p-4">
              <div className="space-y-2">
                <Label htmlFor="changelog">Changelog (optional)</Label>
                <Textarea
                  id="changelog"
                  value={changelog}
                  onChange={(e) => setChangelog(e.target.value)}
                  placeholder="Describe what changed in this version..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowCreateForm(false);
                    setChangelog("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleCreateVersion}
                  disabled={isCreatingVersion || isDirty}
                >
                  {isCreatingVersion ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  Create v{currentVersion + 1}
                </Button>
              </div>
            </div>
          )}

          <Separator />

          {/* Version List */}
          <div className="space-y-2">
            <Label>Previous Versions</Label>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : versions.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center">
                <History className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No previous versions yet. Create a version to save a snapshot
                  of your universe.
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {versions
                    .sort((a, b) => b.version - a.version)
                    .map((version) => (
                      <div
                        key={version.id}
                        className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                          selectedVersion === version.version
                            ? "border-primary bg-primary/5"
                            : "hover:bg-accent/50 cursor-pointer"
                        }`}
                        onClick={() => setSelectedVersion(version.version)}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              Version {version.version}
                            </span>
                            {version.version === currentVersion && (
                              <Badge variant="secondary" className="text-xs">
                                Current
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(version.created_at), {
                              addSuffix: true,
                            })}
                          </div>
                          {version.changelog && (
                            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                              {version.changelog}
                            </p>
                          )}
                        </div>
                        {selectedVersion === version.version && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
          {selectedVersion !== null && selectedVersion !== currentVersion && (
            <Button
              onClick={handleRestoreVersion}
              disabled={isRestoringVersion || isDirty}
            >
              {isRestoringVersion ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw className="mr-2 h-4 w-4" />
              )}
              Restore v{selectedVersion}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
