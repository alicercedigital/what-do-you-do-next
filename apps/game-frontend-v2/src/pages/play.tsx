import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useGameStore } from "@/store";
import { GameSession } from "@/game/components";
import { LoadingSpinner } from "@/game/components/loading-spinner";

/**
 * Play page - wraps the GameSession component
 *
 * Handles:
 * - Redirecting to home if no game is loaded
 * - Auto-loading game from persisted gameId
 * - Graceful error handling when game doesn't exist
 */
export function PlayPage() {
  const navigate = useNavigate();
  const phase = useGameStore((state) => state.phase);
  const gameState = useGameStore((state) => state.gameState);
  const gameId = useGameStore((state) => state.gameId);
  const loadGame = useGameStore((state) => state.loadGame);
  const isLoading = useGameStore((state) => state.isLoading);
  const error = useGameStore((state) => state.error);
  const setError = useGameStore((state) => state.setError);

  // If we have a gameId but no gameState, try to load it (once)
  useEffect(() => {
    if (gameId && !gameState && !isLoading && !error) {
      loadGame(gameId);
    }
  }, [gameId, gameState, isLoading, error, loadGame]);

  // Redirect to home if no game or on error
  useEffect(() => {
    if (phase === "menu" && !gameId) {
      if (error) {
        toast.error("Could not load game", { description: error });
        setError(null);
      }
      navigate("/", { replace: true });
    }
  }, [phase, gameId, error, navigate, setError]);

  // Show loading while game is being loaded
  if (isLoading || (!gameState && gameId)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // No game to show, will redirect
  if (!gameState) {
    return null;
  }

  return <GameSession />;
}
