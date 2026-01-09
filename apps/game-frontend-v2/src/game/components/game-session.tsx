import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useGameStore, useActiveMoment, useAvailableMoments, useCurrentLocation, useIsLoading } from "@/store";
import { GameHeader } from "./game-header";
import { MomentDisplay } from "./moment-display";
import { ChoicePanel } from "./choice-panel";
import { LoadingSpinner } from "./loading-spinner";
import { HistoryPanel } from "./history-panel";
import { LocationBackground } from "@/game/stage/location-background";
import { ChallengeView, RoleAssignment } from "@/game/challenge";

/**
 * Main game session container
 *
 * Displays:
 * - Game header with character info
 * - Location background
 * - Stage with characters (if active moment has stage)
 * - Active moment content OR choice panel
 */
export function GameSession() {
  const gameState = useGameStore((state) => state.gameState);
  const universe = useGameStore((state) => state.universe);
  const challengeState = useGameStore((state) => state.challengeState);
  const challengeDefinition = useGameStore((state) => state.challengeDefinition);
  const startChallenge = useGameStore((state) => state.startChallenge);
  const error = useGameStore((state) => state.error);
  const setError = useGameStore((state) => state.setError);

  const activeMoment = useActiveMoment();
  const availableMoments = useAvailableMoments();
  const location = useCurrentLocation();
  const isLoading = useIsLoading();

  // State for showing role assignment when a moment has a challenge
  const [showRoleAssignment, setShowRoleAssignment] = useState(false);

  // Check if active moment has an unstarted challenge
  const momentHasChallenge = activeMoment?.challenge && !challengeState;

  const handleStartChallenge = async (roleAssignments: Record<string, string>) => {
    await startChallenge(roleAssignments);
    setShowRoleAssignment(false);
  };

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, setError]);

  if (!gameState || !universe) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <GameHeader />

      {/* Error toast */}
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg shadow-lg">
          {error}
        </div>
      )}

      <main className="flex-1 relative overflow-hidden">
        {/* Location background */}
        <LocationBackground location={location} />

        {/* Content area */}
        <div className="relative z-10 container mx-auto py-8 flex flex-col min-h-[calc(100vh-3.5rem)]">
          {/* History panel at top */}
          <HistoryPanel className="mb-4" />

          {/* Main content with animations */}
          <div className="flex-1 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {isLoading && !challengeState ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-center py-12"
                >
                  <LoadingSpinner />
                </motion.div>
              ) : challengeState && challengeDefinition ? (
                <motion.div
                  key="challenge"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <ChallengeView
                    challenge={challengeDefinition}
                    challengeState={challengeState}
                  />
                </motion.div>
              ) : showRoleAssignment && activeMoment?.challenge ? (
                <motion.div
                  key="role-assignment"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <RoleAssignment
                    challenge={activeMoment.challenge}
                    onStart={handleStartChallenge}
                    onCancel={() => setShowRoleAssignment(false)}
                  />
                </motion.div>
              ) : activeMoment ? (
                <motion.div
                  key={`moment-${activeMoment.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <MomentDisplay
                    moment={activeMoment}
                    onStartChallenge={momentHasChallenge ? () => setShowRoleAssignment(true) : undefined}
                  />
                </motion.div>
              ) : availableMoments.length > 0 ? (
                <motion.div
                  key="choices"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <ChoicePanel moments={availableMoments} />
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12"
                >
                  <p className="text-muted-foreground">No moments available</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    The story needs more content...
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
