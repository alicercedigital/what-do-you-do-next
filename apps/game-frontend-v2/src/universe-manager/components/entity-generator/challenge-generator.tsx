import * as React from "react";
import type { v2 } from "@wdydn/shared";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Badge } from "@/shared/components/ui/badge";
import { EntityGeneratorDialog } from "./entity-generator-dialog";
import { useEntityGenerator } from "../../ai";

type Challenge = v2.Challenge;
type Universe = v2.Universe;

interface ChallengeGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  universe: Universe;
  onAccept: (challenge: Challenge) => void;
}

const CHALLENGE_TYPES = [
  { value: "combat", label: "Combat", description: "Fighting encounters" },
  { value: "social", label: "Social", description: "Dialogue and persuasion" },
  { value: "puzzle", label: "Puzzle", description: "Logic and problem-solving" },
  { value: "stealth", label: "Stealth", description: "Avoiding detection" },
  { value: "race", label: "Race", description: "Speed-based competition" },
  { value: "survival", label: "Survival", description: "Endurance challenges" },
  { value: "skill", label: "Skill Check", description: "Ability tests" },
];

const DIFFICULTY_LEVELS = [
  { value: "trivial", label: "Trivial", description: "Almost guaranteed success" },
  { value: "easy", label: "Easy", description: "Slight challenge" },
  { value: "normal", label: "Normal", description: "Fair challenge" },
  { value: "hard", label: "Hard", description: "Significant challenge" },
  { value: "extreme", label: "Extreme", description: "Very difficult" },
];

export function ChallengeGenerator({
  open,
  onOpenChange,
  universe,
  onAccept,
}: ChallengeGeneratorProps) {
  const [challengeType, setChallengeType] = React.useState("combat");
  const [difficulty, setDifficulty] = React.useState("normal");
  const [roleCount, setRoleCount] = React.useState("2");
  const [hints, setHints] = React.useState("");

  const { state, generatedEntity, generate, reset } = useEntityGenerator<Challenge>(
    "challenge",
    universe,
    {
      type: challengeType,
      difficulty,
      roleCount: parseInt(roleCount, 10),
      hints,
    }
  );

  const handleGenerate = () => {
    generate();
  };

  const handleAccept = () => {
    if (generatedEntity) {
      onAccept(generatedEntity);
      reset();
      onOpenChange(false);
    }
  };

  const handleRegenerate = () => {
    generate();
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset();
    }
    onOpenChange(newOpen);
  };

  return (
    <EntityGeneratorDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Generate Challenge"
      description="Use AI to create a new challenge for your universe"
      isGenerating={state.isLoading}
      hasPreview={!!generatedEntity}
      onGenerate={handleGenerate}
      onAccept={handleAccept}
      onRegenerate={handleRegenerate}
      preview={
        generatedEntity ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium">{generatedEntity.name}</span>
            </div>
            {generatedEntity.description && (
              <p className="text-sm text-muted-foreground">
                {generatedEntity.description}
              </p>
            )}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Max Rounds: </span>
                {generatedEntity.maxRounds || "∞"}
              </div>
              <div>
                <span className="text-muted-foreground">Roles: </span>
                {generatedEntity.roles?.length || 0}
              </div>
            </div>
            {generatedEntity.roles && generatedEntity.roles.length > 0 && (
              <div>
                <span className="text-xs font-medium text-muted-foreground">
                  Roles:{" "}
                </span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {generatedEntity.roles.map((role) => (
                    <Badge key={role.id} variant="outline">
                      {role.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {generatedEntity.outcomes && generatedEntity.outcomes.length > 0 && (
              <div>
                <span className="text-xs font-medium text-muted-foreground">
                  Outcomes:{" "}
                </span>
                <ul className="mt-1 text-sm">
                  {generatedEntity.outcomes.slice(0, 3).map((outcome, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {outcome.name}
                      </Badge>
                      <span className="text-xs text-muted-foreground truncate">
                        {outcome.condition}
                      </span>
                    </li>
                  ))}
                  {generatedEntity.outcomes.length > 3 && (
                    <li className="text-xs text-muted-foreground">
                      +{generatedEntity.outcomes.length - 3} more outcomes
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        ) : null
      }
    >
      <div className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label>Challenge Type</Label>
            <Select value={challengeType} onValueChange={setChallengeType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CHALLENGE_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    <div>
                      <div>{t.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {t.description}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Difficulty</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DIFFICULTY_LEVELS.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    <div>
                      <div>{d.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {d.description}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="roleCount">Number of Roles</Label>
          <Input
            id="roleCount"
            type="number"
            min={1}
            max={10}
            value={roleCount}
            onChange={(e) => setRoleCount(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            How many distinct roles participate in this challenge
          </p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="hints">Additional Hints (optional)</Label>
          <Textarea
            id="hints"
            value={hints}
            onChange={(e) => setHints(e.target.value)}
            placeholder="e.g., boss fight with multiple phases, negotiation with time limit..."
            rows={2}
          />
          <p className="text-xs text-muted-foreground">
            Describe mechanics, win/lose conditions, or special rules
          </p>
        </div>

        {state.error && (
          <div className="rounded bg-red-500/10 px-3 py-2 text-sm text-red-500">
            {state.error}
          </div>
        )}
      </div>
    </EntityGeneratorDialog>
  );
}
