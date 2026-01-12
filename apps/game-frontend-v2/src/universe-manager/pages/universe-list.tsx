import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus,
  Upload,
  Trash2,
  Copy,
  Play,
  Edit,
  Loader2,
  Download,
  Globe,
  Lock,
  Eye,
} from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

import { useUniverseEditorStore } from "../store/universe-editor-store";
import { useAuthStore } from "@/store/auth-store";

interface UniverseSummary {
  id: string;
  name: string;
  description: string;
  theme: string;
  visibility?: "private" | "unlisted" | "public";
  is_published?: boolean;
  owner_id?: string;
}

function VisibilityBadge({
  visibility,
  isPublished,
}: {
  visibility?: string;
  isPublished?: boolean;
}) {
  if (isPublished && visibility === "public") {
    return (
      <Badge variant="default" className="gap-1">
        <Globe className="h-3 w-3" />
        Published
      </Badge>
    );
  }
  if (visibility === "unlisted") {
    return (
      <Badge variant="secondary" className="gap-1">
        <Eye className="h-3 w-3" />
        Unlisted
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="gap-1">
      <Lock className="h-3 w-3" />
      Private
    </Badge>
  );
}

export function UniverseListPage() {
  const navigate = useNavigate();
  const { createUniverse, deleteUniverse, duplicateUniverse } =
    useUniverseEditorStore();
  const user = useAuthStore((state) => state.user);

  const [universes, setUniverses] = useState<UniverseSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create dialog state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newTheme, setNewTheme] = useState("fantasy");
  const [isCreating, setIsCreating] = useState(false);

  // Delete dialog state
  const [deleteTarget, setDeleteTarget] = useState<UniverseSummary | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  // Import state
  const [isImporting, setIsImporting] = useState(false);

  const loadUniverses = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/universes");
      if (!response.ok) throw new Error("Failed to load universes");
      const data = await response.json();
      setUniverses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load universes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUniverses();
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;

    setIsCreating(true);
    try {
      const universeId = await createUniverse({
        name: newName.trim(),
        description: newDescription.trim(),
        theme: newTheme,
      });
      setIsCreateOpen(false);
      setNewName("");
      setNewDescription("");
      setNewTheme("fantasy");
      navigate(`/universes/${universeId}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create universe"
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      await deleteUniverse(deleteTarget.id);
      setUniverses((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete universe"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDuplicate = async (universe: UniverseSummary) => {
    try {
      const newId = await duplicateUniverse(universe.id);
      await loadUniverses();
      navigate(`/universes/${newId}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to duplicate universe"
      );
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const importData = JSON.parse(text);

      // Check if it's an exported universe (has exportVersion) or raw universe
      const universeData = importData.universe || importData;

      // Use the new import endpoint
      const response = await fetch("/api/universe/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ universe: universeData }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to import universe");
      }

      const result = await response.json();
      await loadUniverses();

      // Navigate to the imported universe
      if (result.universeId) {
        navigate(`/universes/${result.universeId}`);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to import universe"
      );
    } finally {
      setIsImporting(false);
      // Reset file input
      event.target.value = "";
    }
  };

  const handleExport = async (universe: UniverseSummary) => {
    try {
      const response = await fetch(`/api/universe/${universe.id}/export`);
      if (!response.ok) throw new Error("Failed to export universe");

      const data = await response.json();

      // Create download
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${universe.name.replace(/[^a-z0-9]/gi, "_")}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to export universe"
      );
    }
  };

  const handleTest = (universe: UniverseSummary) => {
    // Navigate to home page with universe pre-selected for testing
    navigate(`/?test=${universe.id}`);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Universe Manager
            </h1>
            <p className="mt-1 text-muted-foreground">
              Create and manage your interactive game universes
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Import button */}
            <label>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
                disabled={isImporting}
              />
              <Button variant="outline" asChild disabled={isImporting}>
                <span className="cursor-pointer">
                  {isImporting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  Import
                </span>
              </Button>
            </label>

            {/* Create button */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Universe
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Universe</DialogTitle>
                  <DialogDescription>
                    Start with a blank universe and add content in the editor.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="My Universe"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="A brief description..."
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="theme">Theme</Label>
                    <Input
                      id="theme"
                      value={newTheme}
                      onChange={(e) => setNewTheme(e.target.value)}
                      placeholder="fantasy, sci-fi, horror..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateOpen(false)}
                    disabled={isCreating}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreate}
                    disabled={!newName.trim() || isCreating}
                  >
                    {isCreating && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive">
            {error}
            <Button
              variant="ghost"
              size="sm"
              className="ml-2"
              onClick={() => setError(null)}
            >
              Dismiss
            </Button>
          </div>
        )}

        {/* Universe grid */}
        {universes.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="mb-4 text-muted-foreground">No universes yet</p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Universe
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {universes.map((universe, index) => (
              <motion.div
                key={universe.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="group relative overflow-hidden transition-colors hover:border-primary/50">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="truncate">
                          {universe.name}
                        </CardTitle>
                        <CardDescription className="mt-1 line-clamp-2">
                          {universe.description || "No description"}
                        </CardDescription>
                      </div>
                      <div className="ml-2 flex shrink-0 flex-col items-end gap-1">
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                          {universe.theme}
                        </span>
                        <VisibilityBadge
                          visibility={universe.visibility}
                          isPublished={universe.is_published}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => navigate(`/universes/${universe.id}`)}
                      >
                        <Edit className="mr-1 h-3 w-3" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleTest(universe)}
                      >
                        <Play className="mr-1 h-3 w-3" />
                        Test
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost">
                            •••
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleDuplicate(universe)}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleExport(universe)}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Export
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteTarget(universe)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Back to home link */}
        <div className="mt-8 text-center">
          <Button variant="ghost" onClick={() => navigate("/")}>
            Back to Home
          </Button>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Universe</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget?.name}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
