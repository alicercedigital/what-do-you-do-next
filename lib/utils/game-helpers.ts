"use client";

import type {
  GameEvent,
  GameOption,
  CanvasNode,
  CanvasConnection,
  PlayerCharacter,
} from "@/lib/schemas/game-schema";
import type { GameUniverse } from "@/lib/schemas/game-entity-schema";
import {
  CARD_DIMENSIONS,
  POSITIONING,
  ANIMATION,
  TIMING,
  COLORS,
  UI,
} from "@/lib/constants/game";

/**
 * Common utility functions to reduce repetition across the game codebase
 */

// UUID generation
export const generateId = (prefix: string = ""): string => {
  const uuid = crypto.randomUUID();
  return prefix ? `${prefix}-${uuid}` : uuid;
};

// Event creation helpers
export const createDiceRollEvent = (
  attributeName: string,
  targetNumber: number,
  attributeValue: number,
  diceRoll: number,
  success: boolean,
  heroJourneyStep: string = "tests-allies-enemies"
): GameEvent => ({
  id: generateId("dice-roll"),
  heroJourneyStep: heroJourneyStep as any,
  type: "dice-roll",
  title: `${attributeName} Test`,
  content: `Rolling against difficulty ${targetNumber}...`,
  diceRollData: {
    attributeName,
    targetNumber,
    attributeValue,
    diceRoll,
    success,
  },
});

export const createConflictEvent = (
  conflictEventId: string,
  enemyName: string,
  enemyAttributes: Record<string, number>,
  heroJourneyStep: string = "tests-allies-enemies"
): GameEvent => ({
  id: generateId("conflict"),
  heroJourneyStep: heroJourneyStep as any,
  type: "conflict",
  title: `Conflict: ${enemyName}`,
  content: `A conflict has begun with ${enemyName}!`,
  conflictData: {
    conflictEventId,
    enemyName,
    enemyAttributes,
  },
});

export const createStandardEvent = (
  type: GameEvent["type"],
  title: string,
  content: string,
  heroJourneyStep: string,
  options?: {
    locationChange?: string;
    imageUrl?: string;
    audioId?: string;
    statChanges?: Record<string, number>;
  }
): GameEvent => ({
  id: generateId("event"),
  heroJourneyStep: heroJourneyStep as any,
  type,
  title,
  content,
  ...options,
});

// Node creation helpers
export const createEventNode = (
  event: GameEvent,
  position: { x: number; y: number },
  isNew: boolean = false,
  isActive: boolean = false,
  characterPortrait?: string,
  locationImage?: string
): CanvasNode => ({
  id: event.id,
  type: "event",
  data: event,
  position,
});

export const createOptionNode = (
  option: GameOption,
  position: { x: number; y: number },
  isNew: boolean = false,
  selected: boolean = false,
  greyedOut: boolean = false
): CanvasNode => ({
  id: option.id,
  type: "option",
  data: option,
  position,
  selected,
  greyedOut,
});

export const createConnection = (
  fromNodeId: string,
  toNodeId: string,
  active: boolean = false
): CanvasConnection => ({
  id: generateId("conn"),
  fromNodeId,
  toNodeId,
  active,
});

// Position calculation helpers
export const calculateNodeDimensions = (
  nodeType: string,
  eventType?: string
): { width: number; height: number } => {
  if (nodeType === "option") {
    return CARD_DIMENSIONS.option;
  }
  if (nodeType === "event") {
    if (eventType === "dice-roll") {
      return CARD_DIMENSIONS.diceRoll;
    }
    if (eventType === "conflict") {
      return CARD_DIMENSIONS.conflict;
    }
    return CARD_DIMENSIONS.event;
  }
  return CARD_DIMENSIONS.event;
};

export const calculateNextEventPosition = (
  lastEventPosition: { x: number; y: number },
  offset: number = POSITIONING.eventOffset
): { x: number; y: number } => ({
  x: lastEventPosition.x + offset,
  y: lastEventPosition.y,
});

export const calculateOptionPositions = (
  eventPosition: { x: number; y: number },
  optionCount: number,
  spacing: number = POSITIONING.optionSpacing
): { x: number; y: number }[] => {
  const totalHeight = (optionCount - 1) * spacing;
  const startY = eventPosition.y - totalHeight / 2;
  const x = eventPosition.x + POSITIONING.optionOffset;

  return Array.from({ length: optionCount }, (_, index) => ({
    x,
    y: startY + index * spacing,
  }));
};

// Character helpers
export const createPlayerCharacter = (
  name: string,
  universe: GameUniverse,
  baseAttributes: Record<string, number>,
  derivedAttributes: Record<string, number>
): PlayerCharacter => ({
  id: generateId("character"),
  name: name.trim(),
  baseAttributes,
  cachedDerivedAttributes: derivedAttributes,
  equipment: {},
  inventory: [],
  level: 1,
  totalPoints: universe.attributeConfig?.startingPoints ?? 20,
  usedPoints: Object.values(baseAttributes).reduce((sum, val) => sum + val, 0),
  role: "protagonist",
  portraits: {},
  type: "character",
  description: "",
});

// Game state helpers
export const createInitialGameState = (
  universe: GameUniverse,
  character: PlayerCharacter
) => ({
  id: generateId("game"),
  universeId: universe.id,
  character,
  currentHeroStep: "ordinary-world" as const,
  nodes: [],
  connections: [],
  currentEventId: null,
  isWaitingForChoice: false,
  storyHistory: [],
  pendingEvents: [],
  pendingOptions: [],
  lastSelectedOptionId: null,
  isWaitingForContinue: false,
  activeConflict: null,
});

// Animation helpers
export const getSpringAnimationProps = (isNew: boolean = false) => {
  if (isNew) {
    return {
      initial: {
        scale: ANIMATION.scale.new,
        opacity: ANIMATION.opacity.hidden,
        y: ANIMATION.y.offset,
      },
      animate: {
        scale: ANIMATION.scale.normal,
        opacity: ANIMATION.opacity.visible,
        y: 0,
      },
      transition: {
        type: "spring",
        stiffness: ANIMATION.spring.stiffness,
        damping: ANIMATION.spring.damping,
        mass: ANIMATION.spring.mass,
      },
    };
  }
  return {
    initial: false,
    animate: {
      scale: ANIMATION.scale.normal,
      opacity: ANIMATION.opacity.visible,
      y: 0,
    },
    transition: {
      type: "spring",
      stiffness: ANIMATION.spring.stiffness,
      damping: ANIMATION.spring.damping,
      mass: ANIMATION.spring.mass,
    },
  };
};

// Common delay helper
export const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Type guards
export const isDiceRollEvent = (
  event: GameEvent
): event is GameEvent & {
  diceRollData: NonNullable<GameEvent["diceRollData"]>;
} => {
  return event.type === "dice-roll" && !!event.diceRollData;
};

export const isConflictEvent = (
  event: GameEvent
): event is GameEvent & {
  conflictData: NonNullable<GameEvent["conflictData"]>;
} => {
  return event.type === "conflict" && !!event.conflictData;
};

// String helpers
export const formatAttributeName = (attrId: string): string => {
  return attrId.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

export const truncateText = (
  text: string,
  maxLength: number = UI.maxContentLength
): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
};

// Color helpers
export const getEventColor = (eventType: string): string => {
  const colorMap: Record<string, string> = {
    "dice-roll": COLORS.primary,
    conflict: COLORS.danger,
    narrative: COLORS.secondary,
    dialogue: COLORS.secondary,
    action: COLORS.primary,
    audio: COLORS.secondary,
    image: COLORS.secondary,
  };
  return colorMap[eventType] || COLORS.secondary;
};

// Connection helpers
export const getConnectionColor = (active: boolean): string => {
  return active ? COLORS.primary : COLORS.secondary;
};

// Timing helpers
export const getTiming = (key: keyof typeof TIMING): number => {
  return TIMING[key];
};
