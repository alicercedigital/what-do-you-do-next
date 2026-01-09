import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Download, Play, Loader2, Check, AlertCircle } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { useUniverseEditorStore } from "../store/universe-editor-store";

export function EditorHeader() {
  const navigate = useNavigate();

  const {
    universe,
    isDirty,
    isSaving,
    lastSaved,
    error,
    saveUniverse,
    validate,
  } = useUniverseEditorStore();

  if (!universe) return null;

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
      </div>
    </header>
  );
}
