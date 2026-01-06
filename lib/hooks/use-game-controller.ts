import { useCallback, useRef, useState } from "react";
import { useGameStore } from "@/lib/store/game-store";
import type { GameEvent, GameOption } from "@/lib/schemas/game-schema";
import { createDiceRollEvent } from "@/lib/utils/game-helpers";
import useSWRMutation from "swr/mutation";

interface UseGameControllerReturn {
  isGenerating: boolean;
  isWaitingForContinue: boolean;
  handleGenerateStory: () => Promise<void>;
  handleOptionClick: (optionId: string) => void;
  handleContinue: () => void;
  handleStartConflict: (
    conflictEventId: string,
    enemyName: string,
    enemyPortrait: string | undefined,
    enemyAttributes: Record<string, number>
  ) => void;
}

async function generateStory(
  url: string,
  { arg }: { arg: { gameStateId: string; nodeCount: number } }
) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(arg),
  });
  if (!res.ok) throw new Error("Failed to generate story");
  return res.json();
}

/**
 * Custom hook that encapsulates game controller logic
 * Extracts business logic from GameCanvas component
 */
export function useGameController(): UseGameControllerReturn {
  const {
    gameState,
    character,
    selectedUniverse,
    isGenerating,
    setIsGenerating,
    setPendingContent,
    showNextEvent,
    selectOption,
    setPendingContent: setPending,
    startConflict: storeStartConflict,
  } = useGameStore();

  const { trigger: triggerGeneration } = useSWRMutation(
    "/api/story/generate",
    generateStory
  );

  // Track if initial generation has started
  const initialGenerationStarted = useRef(false);

  // State for tracking game status to prevent race conditions
  const [gameStatus, setGameStatus] = useState<
    "idle" | "generating" | "animating" | "conflict"
  >("idle");

  const handleGenerateStory = useCallback(async () => {
    if (!gameState || isGenerating || gameStatus !== "idle") return;

    setIsGenerating(true);
    setGameStatus("generating");

    try {
      const result = await triggerGeneration({
        gameStateId: gameState.id,
        nodeCount: gameState.nodes.length,
      });

      if (result.events && result.options) {
        setPendingContent(result.events, result.options);
        // Small delay before showing first event for smooth transition
        setTimeout(() => {
          showNextEvent();
          setGameStatus("animating");
        }, 100);
      }
    } catch (error) {
      console.error("Failed to generate story:", error);
      setGameStatus("idle");
    } finally {
      setIsGenerating(false);
    }
  }, [
    gameState,
    isGenerating,
    gameStatus,
    setIsGenerating,
    setPendingContent,
    showNextEvent,
    triggerGeneration,
  ]);

  const handleOptionClick = useCallback(
    (optionId: string) => {
      if (!gameState || !selectedUniverse || !character) return;

      const optionNode = gameState.nodes.find((n) => n.id === optionId);
      if (!optionNode || optionNode.type !== "option") return;

      const option = optionNode.data as GameOption;

      // Handle attribute test options
      if (option.attributeTest && selectedUniverse) {
        const diceRoll = Math.floor(Math.random() * 20) + 1;
        const attributeValue =
          character?.baseAttributes[option.attributeTest.attributeId] || 0;
        const total = attributeValue + diceRoll;
        const success = total >= option.attributeTest.difficulty;

        const attribute = selectedUniverse.attributes?.find(
          (attr) => attr.id === option.attributeTest!.attributeId
        );

        const diceRollEvent = createDiceRollEvent(
          attribute?.name || "Attribute",
          option.attributeTest.difficulty,
          attributeValue,
          diceRoll,
          success
        );

        selectOption(optionId);
        setPending([diceRollEvent], []);

        // Sequence: select option → show dice roll → continue story
        setTimeout(() => {
          showNextEvent();
          setTimeout(() => {
            handleGenerateStory();
          }, 3000);
        }, 100);

        return;
      }

      // Handle conflict events (check if the current event has conflict data)
      const currentEventNode = gameState.nodes.find(
        (n) => n.type === "event" && n.id === gameState.currentEventId
      );
      if (currentEventNode && currentEventNode.type === "event") {
        const event = currentEventNode.data as GameEvent;
        if (event.conflictData) {
          selectOption(optionId);
          // Start the conflict
          handleStartConflict(
            event.conflictData.conflictEventId,
            event.conflictData.enemyName,
            event.conflictData.enemyPortrait,
            event.conflictData.enemyAttributes
          );
          return;
        }
      }

      // Regular option selection
      selectOption(optionId);
      setTimeout(() => {
        handleGenerateStory();
      }, 800);
    },
    [
      gameState,
      selectedUniverse,
      character,
      selectOption,
      setPending,
      showNextEvent,
      handleGenerateStory,
    ]
  );

  const handleContinue = useCallback(() => {
    if (!gameState) return;

    // Center on last event
    const eventNodes = gameState.nodes.filter((n) => n.type === "event");
    if (eventNodes.length === 0) return;

    // Trigger next event generation
    setTimeout(() => {
      showNextEvent();
      setGameStatus("animating");

      // After showing event, generate next story part
      setTimeout(() => {
        handleGenerateStory();
      }, 2000);
    }, 500);
  }, [gameState, showNextEvent, handleGenerateStory]);

  const handleStartConflict = useCallback(
    (
      conflictEventId: string,
      enemyName: string,
      enemyPortrait: string | undefined,
      enemyAttributes: Record<string, number>
    ) => {
      if (!selectedUniverse || !character) return;

      setGameStatus("conflict");
      storeStartConflict(
        conflictEventId,
        enemyName,
        enemyPortrait,
        enemyAttributes
      );
    },
    [selectedUniverse, character, storeStartConflict]
  );

  // Initialize game if needed
  const checkInitialGeneration = useCallback(() => {
    if (
      gameState &&
      gameState.nodes.length === 0 &&
      !isGenerating &&
      !initialGenerationStarted.current
    ) {
      initialGenerationStarted.current = true;
      handleGenerateStory();
    }
    if (gameState && gameState.nodes.length > 0) {
      initialGenerationStarted.current = false;
    }
  }, [gameState, isGenerating, handleGenerateStory]);

  return {
    isGenerating,
    isWaitingForContinue: gameState?.isWaitingForContinue || false,
    handleGenerateStory,
    handleOptionClick,
    handleContinue,
    handleStartConflict,
  };
}
