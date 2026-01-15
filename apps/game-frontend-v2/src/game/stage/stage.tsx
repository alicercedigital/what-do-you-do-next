import { motion } from "framer-motion";
import type { v2 } from "@wdydn/shared";
type Moment = v2.Moment;
type Emotion = v2.Emotion;
import { useGameStore } from "@/store";
import { cn } from "@/shared/lib/utils";

type StageConfig = NonNullable<Moment["stage"]>;
type SlotConfig = StageConfig[keyof StageConfig];

interface StageProps {
  stage: StageConfig;
}

/**
 * Character stage with left/center/right slots
 *
 * Displays character portraits with emotions and speaking indicators
 */
export function Stage({ stage }: StageProps) {
  return (
    <div className="relative h-48 flex items-end justify-between px-8 py-4">
      <CharacterSlot position="left" config={stage.left} />
      <CharacterSlot position="center" config={stage.center} />
      <CharacterSlot position="right" config={stage.right} />
    </div>
  );
}

interface CharacterSlotProps {
  position: "left" | "center" | "right";
  config: SlotConfig;
}

function CharacterSlot({ position, config }: CharacterSlotProps) {
  const gameState = useGameStore((state) => state.gameState);
  const universe = useGameStore((state) => state.universe);

  if (!config) {
    return <div className="w-24" />;
  }

  // Find character
  const character =
    gameState?.characters.find((c) => c.id === config.characterId) ??
    universe?.characters.find((c) => c.id === config.characterId);

  if (!character) {
    return <div className="w-24" />;
  }

  const emotion = config.emotion ?? "neutral";
  const imageUrl = character.images?.[emotion] ?? character.images?.neutral;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: position === "center" ? 0 : 0.1 }}
      className={cn(
        "relative flex flex-col items-center",
        position === "center" && "z-10 scale-110"
      )}
    >
      {/* Portrait */}
      <div className="relative w-24 h-32">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={character.name}
            className="w-full h-full object-cover rounded-lg shadow-lg"
          />
        ) : (
          <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
            <span className="text-2xl font-bold text-muted-foreground">
              {character.name.charAt(0)}
            </span>
          </div>
        )}

        {/* Speaking indicator */}
        {config.speaking && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
            <SpeakingIndicator />
          </div>
        )}

        {/* Emotion overlay */}
        <EmotionOverlay emotion={emotion} />
      </div>

      {/* Name */}
      <p className="mt-2 text-sm font-medium text-center">{character.name}</p>
    </motion.div>
  );
}

function SpeakingIndicator() {
  return (
    <div className="flex gap-0.5">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 bg-primary rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
          }}
        />
      ))}
    </div>
  );
}

interface EmotionOverlayProps {
  emotion: Emotion;
}

function EmotionOverlay({ emotion }: EmotionOverlayProps) {
  // Add subtle visual effects based on emotion
  const overlayColors: Partial<Record<Emotion, string>> = {
    anger: "bg-red-500/10",
    sad: "bg-blue-500/10",
    fear: "bg-purple-500/10",
    joy: "bg-yellow-500/10",
    happy: "bg-green-500/10",
  };

  const overlayColor = overlayColors[emotion];

  if (!overlayColor) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "absolute inset-0 rounded-lg pointer-events-none",
        overlayColor
      )}
    />
  );
}
