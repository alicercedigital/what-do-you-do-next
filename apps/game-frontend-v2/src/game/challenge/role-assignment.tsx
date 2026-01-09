import { useState } from "react";
import { motion } from "framer-motion";
import { Users, ChevronRight } from "lucide-react";
import type { v2 } from "@wdydn/shared";
type Challenge = v2.Challenge;
import { useGameStore } from "@/store";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

interface RoleAssignmentProps {
  challenge: Challenge;
  onStart: (roleAssignments: Record<string, string>) => void;
  onCancel: () => void;
}

/**
 * Role assignment dialog for starting a challenge
 *
 * Allows player to assign characters to challenge roles
 */
export function RoleAssignment({ challenge, onStart, onCancel }: RoleAssignmentProps) {
  const gameState = useGameStore((state) => state.gameState);
  const isLoading = useGameStore((state) => state.isLoading);

  // Initialize with player character assigned to first required role
  const player = gameState?.characters.find((c) => c.isPlayer);
  const initialAssignments: Record<string, string> = {};

  if (player) {
    const firstRequiredRole = challenge.roles.find((r) => r.required);
    if (firstRequiredRole) {
      initialAssignments[firstRequiredRole.id] = player.id;
    }
  }

  const [assignments, setAssignments] = useState<Record<string, string>>(initialAssignments);

  const characters = gameState?.characters ?? [];

  const handleAssign = (roleId: string, characterId: string) => {
    setAssignments((prev) => ({
      ...prev,
      [roleId]: characterId,
    }));
  };

  const canStart = challenge.roles
    .filter((r) => r.required)
    .every((r) => assignments[r.id]);

  const handleStart = () => {
    if (canStart) {
      onStart(assignments);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto"
    >
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>{challenge.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                Assign characters to roles
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {challenge.roles.map((role) => (
              <div key={role.id}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">{role.name}</label>
                  {role.required && (
                    <Badge variant="secondary" className="text-xs">
                      Required
                    </Badge>
                  )}
                </div>
                <Select
                  value={assignments[role.id] ?? ""}
                  onValueChange={(value) => handleAssign(role.id, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select character..." />
                  </SelectTrigger>
                  <SelectContent>
                    {characters.map((char) => (
                      <SelectItem key={char.id} value={char.id}>
                        <div className="flex items-center gap-2">
                          {char.images?.neutral ? (
                            <img
                              src={char.images.neutral}
                              alt={char.name}
                              className="w-5 h-5 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                              <span className="text-xs">{char.name.charAt(0)}</span>
                            </div>
                          )}
                          <span>{char.name}</span>
                          {char.isPlayer && (
                            <Badge variant="outline" className="text-xs ml-1">
                              You
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>

          {challenge.description && (
            <p className="text-sm text-muted-foreground mt-4 pt-4 border-t">
              {challenge.description}
            </p>
          )}
        </CardContent>

        <CardFooter className="gap-3">
          <Button variant="outline" onClick={onCancel} disabled={isLoading} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleStart}
            disabled={!canStart || isLoading}
            className="flex-1"
          >
            {isLoading ? (
              "Starting..."
            ) : (
              <>
                Start Challenge
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
