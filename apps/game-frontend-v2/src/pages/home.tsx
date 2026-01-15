import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Upload, FolderOpen } from "lucide-react";
import { useGameStore } from "@/store";
import { api } from "@/shared/lib/api";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";

interface UniverseInfo {
  id: string;
  name: string;
  description: string;
  theme: string;
}

interface SavedGame {
  id: string;
  universeId: string;
  createdAt: number;
  savedAt: number;
}

/**
 * Home page / main menu
 */
export function HomePage() {
  const navigate = useNavigate();
  const createGame = useGameStore((state) => state.createGame);
  const loadGame = useGameStore((state) => state.loadGame);
  const phase = useGameStore((state) => state.phase);

  const [universes, setUniverses] = useState<UniverseInfo[]>([]);
  const [savedGames, setSavedGames] = useState<SavedGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newGameOpen, setNewGameOpen] = useState(false);

  // Load universes and saved games
  useEffect(() => {
    async function loadData() {
      try {
        const [univs, games] = await Promise.all([
          api.getUniverses(),
          api.listGames(),
        ]);
        setUniverses(univs);
        setSavedGames(games);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Redirect if game is already playing
  useEffect(() => {
    if (phase === "playing") {
      navigate("/play");
    }
  }, [phase, navigate]);

  const handleNewGame = async (universeId: string) => {
    setNewGameOpen(false);
    await createGame(universeId);
    navigate("/play");
  };

  const handleContinueGame = async (gameId: string) => {
    await loadGame(gameId);
    navigate("/play");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container py-12 max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2">What Do You Do Next?</h1>
          <p className="text-muted-foreground">
            Interactive story experiences
          </p>
        </div>

        {/* Main actions */}
        <div className="grid gap-6 md:grid-cols-2 mb-12">
          {/* New Game */}
          <Dialog open={newGameOpen} onOpenChange={setNewGameOpen}>
            <DialogTrigger asChild>
              <Card className="cursor-pointer hover:border-primary/50 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="h-5 w-5" />
                    New Game
                  </CardTitle>
                  <CardDescription>
                    Start a new adventure
                  </CardDescription>
                </CardHeader>
              </Card>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Choose a Universe</DialogTitle>
                <DialogDescription>
                  Select a universe to start your adventure
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 mt-4">
                {universes.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No universes available. Upload a universe to get started.
                  </p>
                ) : (
                  universes.map((universe) => (
                    <Button
                      key={universe.id}
                      variant="outline"
                      className="w-full justify-start h-auto py-3"
                      onClick={() => handleNewGame(universe.id)}
                    >
                      <div className="text-left">
                        <div className="font-medium">{universe.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {universe.description}
                        </div>
                      </div>
                    </Button>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Continue Game */}
          <Card className={savedGames.length === 0 ? "opacity-50" : "cursor-pointer hover:border-primary/50 transition-colors"}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Continue
              </CardTitle>
              <CardDescription>
                {savedGames.length === 0
                  ? "No saved games"
                  : `${savedGames.length} saved game${savedGames.length > 1 ? "s" : ""}`}
              </CardDescription>
            </CardHeader>
            {savedGames.length > 0 && (
              <CardContent>
                <div className="space-y-2">
                  {savedGames.slice(0, 3).map((game) => {
                    const universe = universes.find((u) => u.id === game.universeId);
                    return (
                      <Button
                        key={game.id}
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => handleContinueGame(game.id)}
                      >
                        <div className="text-left">
                          <div className="text-sm font-medium">
                            {universe?.name ?? game.universeId}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Saved {new Date(game.savedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Upload Universe */}
        <div className="text-center">
          <Button variant="outline" size="lg" asChild>
            <label className="cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              Upload Universe
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  try {
                    const text = await file.text();
                    const universe = JSON.parse(text);
                    await api.registerUniverse(universe);
                    setUniverses((prev) => [
                      ...prev,
                      {
                        id: universe.id,
                        name: universe.name,
                        description: universe.description,
                        theme: universe.theme,
                      },
                    ]);
                  } catch (error) {
                    console.error("Failed to upload universe:", error);
                  }
                }}
              />
            </label>
          </Button>
        </div>
      </div>
  );
}
