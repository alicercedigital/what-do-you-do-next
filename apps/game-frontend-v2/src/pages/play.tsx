import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "@/store";
import { GameSession } from "@/game/components";
import { LoadingSpinner } from "@/game/components/loading-spinner";

/**
 * Play page - wraps the GameSession component
 *
 * Handles:
 * - Redirecting to home if no game is loaded
 * - Auto-loading game from persisted gameId
 */
export function PlayPage() {
  const navigate = useNavigate();
  const phase = useGameStore((state) => state.phase);
  const gameState = useGameStore((state) => state.gameState);
  const gameId = useGameStore((state) => state.gameId);
  const loadGame = useGameStore((state) => state.loadGame);
  const isLoading = useGameStore((state) => state.isLoading);

  // If we have a gameId but no gameState, try to load it
  useEffect(() => {
    if (gameId && !gameState && !isLoading) {
      loadGame(gameId);
    }
  }, [gameId, gameState, isLoading, loadGame]);

  // Redirect to home if no game
  useEffect(() => {
    if (phase === "menu" && !gameId) {
      navigate("/");
    }
  }, [phase, gameId, navigate]);

  // Show loading while game is being loaded
  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return <GameSession />;
}
