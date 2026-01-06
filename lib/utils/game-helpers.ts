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

// Node mapping helper for ReactFlow
export const mapToFlowNodes = (
  gameState: any,
  newNodeIds: Set<string>,
  activeConflictState: any,
  handlers: { onOptionClick: (id: string) => void }
) => {
  if (!gameState) return [];

  return gameState.nodes.map((node: any) => {
    const isNew = newNodeIds.has(node.id);

    if (node.type === "event") {
      const event = node.data;

      // Dice roll nodes
      if (event.type === "dice-roll") {
        return {
          id: node.id,
          type: "diceRoll",
          position: node.position,
          draggable: false,
          selectable: false,
          focusable: false,
          data: {
            ...event.diceRollData,
            characterPortrait: gameState.character?.portraits?.confident,
            isNew,
          },
        };
      }

      // Conflict nodes
      if (event.type === "conflict" && activeConflictState) {
        const conflictEvent = gameState.selectedUniverse?.conflictEvents?.find(
          (c: any) => c.id === event.conflictData?.conflictEventId
        );
        return {
          id: node.id,
          type: "conflict",
          position: node.position,
          draggable: false,
          selectable: false,
          focusable: false,
          data: {
            conflict: conflictEvent,
            roleStates: activeConflictState.roleStates,
            logs: activeConflictState.logs,
            currentCycle: activeConflictState.currentCycle,
            isComplete: activeConflictState.isComplete,
            outcome: activeConflictState.outcome,
            isNew,
            characterPortrait: gameState.character?.portraits?.confident,
          },
        };
      }

      // Standard event nodes
      return {
        id: node.id,
        type: "event",
        position: node.position,
        draggable: false,
        selectable: false,
        focusable: false,
        data: {
          event,
          isNew,
          isActive: node.id === gameState.currentEventId,
          characterPortrait: gameState.character?.portraits?.confident,
          locationImage: event.locationChange
            ? `/placeholder.svg?height=128&width=320&query=${encodeURIComponent(
                event.locationChange || "fantasy landscape"
              )}`
            : undefined,
        },
      };
    }

    // Option nodes
    if (node.type === "option") {
      return {
        id: node.id,
        type: "option",
        position: node.position,
        draggable: false,
        selectable: false,
        focusable: false,
        data: {
          option: node.data,
          onClick: () => handlers.onOptionClick(node.id),
          selected: node.selected,
          greyedOut: node.greyedOut,
          isNew,
        },
      };
    }

    return {
      id: node.id,
      position: node.position,
      data: { ...node.data, isNew },
    };
  });
};

/**
 * Calculates the next nodes to be displayed in the game flow
 * This logic was moved from the game store to reduce complexity
 */
export const calculateNextNodes = (
  gameState: any,
  pendingEvents: any[],
  pendingOptions: any[]
) => {
  if (pendingEvents.length === 0) return null;

  const [nextEvent, ...remainingEvents] = pendingEvents;
  const batchId = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const nodeId = `event-${batchId}`;

  // Calculate position using helper
  let fromNodeId: string | null = null;
  let position = { x: 100, y: 200 };

  const eventNodes = gameState.nodes.filter((n: any) => n.type === "event");
  const selectedOptionNode = gameState.lastSelectedOptionId
    ? gameState.nodes.find((n: any) => n.id === gameState.lastSelectedOptionId)
    : null;

  if (selectedOptionNode) {
    fromNodeId = selectedOptionNode.id;
    position = calculateNextEventPosition(selectedOptionNode.position);
  } else if (eventNodes.length > 0) {
    const lastEventNode = eventNodes.reduce(
      (rightmost: any, node: any) =>
        node.position.x > rightmost.position.x ? node : rightmost,
      eventNodes[0]
    );
    fromNodeId = lastEventNode.id;
    position = calculateNextEventPosition(lastEventNode.position);
  }

  const newNode = createEventNode(nextEvent, position);
  newNode.id = nodeId; // Override with batch ID

  const hasMoreEvents = remainingEvents.length > 0;
  const shouldShowOptions = !hasMoreEvents && pendingOptions.length > 0;

  return {
    newNode,
    fromNodeId,
    position,
    hasMoreEvents,
    shouldShowOptions,
    remainingEvents,
    batchId,
    nodeId,
  };
};

/**
 * Calculates option nodes to be displayed after events
 */
export const calculateOptionNodes = (
  position: { x: number; y: number },
  pendingOptions: any[],
  batchId: string,
  nodeId: string
) => {
  const optionPositions = calculateOptionPositions(
    position,
    pendingOptions.length
  );

  return pendingOptions.map((option, index) => {
    const optionNodeId = `option-${batchId}-${index}`;
    const optConnId = `conn-option-${batchId}-${index}`;

    const optionNode = createOptionNode(
      option,
      optionPositions[index],
      true,
      false,
      false
    );
    optionNode.id = optionNodeId;

    const optionConnection = createConnection(nodeId, optionNodeId, false);
    optionConnection.id = optConnId;

    return { optionNode, optionConnection, optionNodeId, optConnId };
  });
};
