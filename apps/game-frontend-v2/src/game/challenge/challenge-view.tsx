import { motion, AnimatePresence } from "framer-motion";
import { Swords, Users, Clock, Trophy, AlertCircle, ChevronRight } from "lucide-react";
import type { v2 } from "@wdydn/shared";
type Challenge = v2.Challenge;
type Character = v2.Character;
import { useGameStore, type ChallengeRuntimeState, type ChallengeLogEntry } from "@/store";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Progress } from "@/shared/components/ui/progress";
import { ScrollArea } from "@/shared/components/ui/scroll-area";

interface ChallengeViewProps {
  challenge: Challenge;
  challengeState: ChallengeRuntimeState;
}

/**
 * Challenge view component
 *
 * Displays:
 * - Challenge title and round info
 * - Tracked stats with visual progress
 * - Round log with animations
 * - Advance/end controls
 */
export function ChallengeView({ challenge, challengeState }: ChallengeViewProps) {
  const advanceChallenge = useGameStore((state) => state.advanceChallenge);
  const endChallenge = useGameStore((state) => state.endChallenge);
  const isLoading = useGameStore((state) => state.isLoading);

  const handleAdvance = async () => {
    await advanceChallenge();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <Card className="border-2 border-primary/30 bg-primary/5">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Swords className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">{challenge.name}</CardTitle>
                {challenge.description && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {challenge.description}
                  </p>
                )}
              </div>
            </div>
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" />
              Round {challengeState.round} / {challengeState.maxRounds}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Participants */}
      <ParticipantsPanel
        roles={challenge.roles}
        assignments={challengeState.roleAssignments}
      />

      {/* Tracked Stats */}
      {challenge.trackedStats && challenge.trackedStats.length > 0 && (
        <TrackedStatsPanel
          trackedStats={challenge.trackedStats}
          variables={challengeState.variables}
        />
      )}

      {/* Round Log */}
      <RoundLog log={challengeState.roundLog} currentRound={challengeState.round} />

      {/* Outcome (if completed) */}
      <AnimatePresence>
        {challengeState.outcome && (
          <OutcomeDisplay outcome={challengeState.outcome} />
        )}
      </AnimatePresence>

      {/* Controls */}
      <Card>
        <CardFooter className="pt-4">
          <div className="flex gap-3 w-full">
            {challengeState.completed ? (
              <Button
                onClick={() => endChallenge()}
                className="flex-1"
                size="lg"
              >
                Continue
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => endChallenge()}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Forfeit
                </Button>
                <Button
                  onClick={handleAdvance}
                  disabled={isLoading}
                  className="flex-1"
                  size="lg"
                >
                  {isLoading ? (
                    <motion.span
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      Processing...
                    </motion.span>
                  ) : (
                    <>
                      Next Round
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

interface ParticipantsPanelProps {
  roles: Challenge["roles"];
  assignments: Record<string, string>;
}

function ParticipantsPanel({ roles, assignments }: ParticipantsPanelProps) {
  const gameState = useGameStore((state) => state.gameState);

  const getCharacter = (charId: string): Character | undefined =>
    gameState?.characters.find((c) => c.id === charId);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-sm font-medium">Participants</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          {roles.map((role) => {
            const charId = assignments[role.id];
            const character = charId ? getCharacter(charId) : undefined;

            return (
              <div
                key={role.id}
                className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-2">
                  {character?.images?.neutral ? (
                    <img
                      src={character.images.neutral}
                      alt={character.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-xs font-medium">
                        {character?.name.charAt(0) ?? "?"}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium">
                      {character?.name ?? "Unassigned"}
                    </p>
                    <p className="text-xs text-muted-foreground">{role.name}</p>
                  </div>
                </div>
                {role.required && (
                  <Badge variant="secondary" className="text-xs">
                    Required
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

interface TrackedStatsPanelProps {
  trackedStats: NonNullable<Challenge["trackedStats"]>;
  variables: Record<string, number>;
}

function TrackedStatsPanel({ trackedStats, variables }: TrackedStatsPanelProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Challenge Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {trackedStats.map((stat) => {
            const value = variables[stat.statId] ?? 0;
            const label = stat.label ?? stat.statId;

            if (stat.showAs === "bar") {
              return (
                <div key={stat.statId}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium tabular-nums">{value}</span>
                  </div>
                  <Progress value={Math.min(value, 100)} className="h-2" />
                </div>
              );
            }

            return (
              <div key={stat.statId} className="flex justify-between items-center">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-bold text-lg tabular-nums">{value}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

interface RoundLogProps {
  log: ChallengeLogEntry[];
  currentRound: number;
}

function RoundLog({ log, currentRound }: RoundLogProps) {
  // Group log entries by round
  const entriesByRound = new Map<number, ChallengeLogEntry[]>();
  for (const entry of log) {
    if (!entriesByRound.has(entry.round)) {
      entriesByRound.set(entry.round, []);
    }
    entriesByRound.get(entry.round)!.push(entry);
  }

  // Get entries for current round (could be used for highlighting)
  const _currentRoundEntries = entriesByRound.get(currentRound) ?? [];
  void _currentRoundEntries; // Reserved for future use

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Round Log</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[150px]">
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {[...log].reverse().map((entry, index) => (
                <motion.div
                  key={`${entry.round}-${index}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className={cn(
                    "text-sm p-2 rounded-lg",
                    entry.type === "outcome" && "bg-primary/10 font-medium",
                    entry.type === "action" && "bg-muted/50",
                    entry.type === "effect" && "bg-muted/30",
                    entry.type === "roll" && "bg-blue-500/10"
                  )}
                >
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="text-xs shrink-0">
                      R{entry.round}
                    </Badge>
                    <span>{entry.message}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

interface OutcomeDisplayProps {
  outcome: { id: string; name: string };
}

function OutcomeDisplay({ outcome }: OutcomeDisplayProps) {
  // Determine if this is a positive or negative outcome based on naming
  const isPositive =
    outcome.id.includes("win") ||
    outcome.id.includes("success") ||
    outcome.name.toLowerCase().includes("victory") ||
    outcome.name.toLowerCase().includes("success");

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", duration: 0.5 }}
    >
      <Card
        className={cn(
          "border-2",
          isPositive
            ? "border-green-500/50 bg-green-500/10"
            : "border-destructive/50 bg-destructive/10"
        )}
      >
        <CardContent className="py-6 text-center">
          <div className="flex justify-center mb-3">
            {isPositive ? (
              <Trophy className="h-10 w-10 text-green-500" />
            ) : (
              <AlertCircle className="h-10 w-10 text-destructive" />
            )}
          </div>
          <h3 className="text-xl font-bold mb-1">{outcome.name}</h3>
          <p className="text-sm text-muted-foreground">
            {isPositive
              ? "You have emerged victorious!"
              : "The challenge has ended."}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
