import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { useUniverseEditorStore } from "../store/universe-editor-store";
import { EditorHeader } from "../components/editor-header";
import { EditorTabs } from "../components/editor-tabs";
import { CreationHelper } from "../components/creation-helper";
import { OverviewEditor } from "../components/overview-editor";
import { StatsEditor } from "../components/stats-editor";
import { CharactersEditor } from "../components/characters-editor";
import { LocationsEditor } from "../components/locations-editor";
import { ItemsEditor } from "../components/items-editor";
import { ChallengesEditor } from "../components/challenges-editor";
import { MomentsEditor } from "../components/moments-editor";

export function UniverseEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    universe,
    activeTab,
    isLoading,
    error,
    loadUniverse,
  } = useUniverseEditorStore();

  useEffect(() => {
    if (id) {
      loadUniverse(id);
    }

    return () => {
      // Don't reset on unmount - keep state for quick navigation
    };
  }, [id, loadUniverse]);

  if (isLoading && !universe) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error && !universe) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-destructive">{error}</p>
        <button
          onClick={() => navigate("/universes")}
          className="text-primary underline"
        >
          Back to Universe List
        </button>
      </div>
    );
  }

  if (!universe) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Universe not found</p>
        <button
          onClick={() => navigate("/universes")}
          className="text-primary underline"
        >
          Back to Universe List
        </button>
      </div>
    );
  }

  const renderEditor = () => {
    switch (activeTab) {
      case "helper":
        return <CreationHelper />;
      case "overview":
        return <OverviewEditor />;
      case "stats":
        return <StatsEditor />;
      case "characters":
        return <CharactersEditor />;
      case "locations":
        return <LocationsEditor />;
      case "items":
        return <ItemsEditor />;
      case "challenges":
        return <ChallengesEditor />;
      case "moments":
        return <MomentsEditor />;
      default:
        return <OverviewEditor />;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <EditorHeader />
      <EditorTabs />
      <main className="flex-1 overflow-hidden">
        {renderEditor()}
      </main>
    </div>
  );
}
