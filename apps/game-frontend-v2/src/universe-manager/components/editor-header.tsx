import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Download, Play, Loader2, Check, AlertCircle, Globe, GlobeLock } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
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
import { useUniverseEditorStore, useUniverseMetadata, useIsPublishing } from "../store/universe-editor-store";
import { VersionSelector } from "./version-selector";

export function EditorHeader() {
  const navigate = useNavigate();
  const [showPublishDialog, setShowPublishDialog] = useState(false);

  const {
    universe,
    isDirty,
    isSaving,
    lastSaved,
    error,
    saveUniverse,
    validate,
    publishUniverse,
    unpublishUniverse,
  } = useUniverseEditorStore();

  const metadata = useUniverseMetadata();
  const isPublishing = useIsPublishing();

  if (!universe) return null;

  const isPublished = metadata?.is_published ?? false;

  const handleSave = async () => {
    const errors = validate();
    if (errors.some((e) => e.severity === "error")) {
      return;
    }
    await saveUniverse();
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(universe, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${universe.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleTest = () => {
    // Navigate to home page with universe pre-selected for testing
    navigate(`/?test=${universe.id}`);
  };

  const handlePublishAction = async () => {
    setShowPublishDialog(false);
    if (isPublished) {
      await unpublishUniverse();
    } else {
      await publishUniverse();
    }
  };

  const formatLastSaved = () => {
    if (!lastSaved) return null;
    const diff = Date.now() - lastSaved;
    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return `${Math.floor(diff / 3600000)}h ago`;
  };

  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-4">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/universes")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">{universe.name}</h1>
          {isDirty && (
            <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-500">
              Unsaved
            </span>
          )}
          {!isDirty && lastSaved && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Check className="h-3 w-3" />
              Saved {formatLastSaved()}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {error && (
          <span className="flex items-center gap-1 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {error}
          </span>
        )}

        <VersionSelector />

        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>

        <Button variant="outline" size="sm" onClick={handleTest}>
          <Play className="mr-2 h-4 w-4" />
          Test
        </Button>

        <Button
          size="sm"
          onClick={handleSave}
          disabled={!isDirty || isSaving}
        >
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save
        </Button>

        <Button
          size="sm"
          variant={isPublished ? "secondary" : "default"}
          onClick={() => setShowPublishDialog(true)}
          disabled={isPublishing || isDirty}
        >
          {isPublishing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : isPublished ? (
            <GlobeLock className="mr-2 h-4 w-4" />
          ) : (
            <Globe className="mr-2 h-4 w-4" />
          )}
          {isPublished ? "Unpublish" : "Publish"}
        </Button>
      </div>

      {/* Publish/Unpublish confirmation dialog */}
      <AlertDialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isPublished ? "Unpublish Universe" : "Publish Universe"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isPublished
                ? "This will remove your universe from the public marketplace. Players who have already started playing will still have access to their saved games."
                : "This will make your universe publicly available in the marketplace. Make sure your universe is complete and ready for players."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePublishAction}>
              {isPublished ? "Unpublish" : "Publish"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
}
