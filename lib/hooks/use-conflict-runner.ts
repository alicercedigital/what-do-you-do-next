import { useEffect, useRef, useState } from "react";
import { useGameStore } from "@/lib/store/game-store";
import {
  executeCycle,
  type ConflictExecutionState,
} from "@/lib/game-engine/conflict-system";
import { TIMING } from "@/lib/constants/game";

interface UseConflictRunnerReturn {
  isRunning: boolean;
  currentCycle: number;
  logs: any[];
  outcome: any;
  isComplete: boolean;
  runNextCycle: () => void;
  stop: () => void;
}

/**
 * Custom hook that manages conflict execution outside of the store
 * Extracts the while loop and timing logic from the store action
 */
export function useConflictRunner(): UseConflictRunnerReturn {
  const {
    activeConflictState,
    isConflictRunning,
    updateGameState,
    endConflict: storeEndConflict,
  } = useGameStore();

  const [isRunning, setIsRunning] = useState(false);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [logs, setLogs] = useState<any[]>([]);
  const [outcome, setOutcome] = useState<any>(null);
  const [isComplete, setIsComplete] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRunningRef = useRef(false);

  // Sync with store state
  useEffect(() => {
    if (activeConflictState) {
      setCurrentCycle(activeConflictState.currentCycle);
      setLogs(activeConflictState.logs);
      setOutcome(activeConflictState.outcome);
      setIsComplete(activeConflictState.isComplete);
    }
  }, [activeConflictState]);

  // Auto-run when conflict starts
  useEffect(() => {
    if (activeConflictState && isConflictRunning && !isRunningRef.current) {
      startAutoRun();
    } else if (!isConflictRunning && isRunningRef.current) {
      stopAutoRun();
    }
  }, [activeConflictState, isConflictRunning]);

  const runNextCycle = () => {
    if (!activeConflictState || activeConflictState.isComplete) return;

    const newState = executeCycle(activeConflictState);

    // Update store with new state
    useGameStore.setState({ activeConflictState: newState });

    // Check if conflict is complete
    if (newState.isComplete) {
      stopAutoRun();
    }
  };

  const startAutoRun = () => {
    if (isRunningRef.current) return;

    isRunningRef.current = true;
    setIsRunning(true);

    const runCycles = async () => {
      let state = useGameStore.getState().activeConflictState;

      while (state && !state.isComplete && isRunningRef.current) {
        await new Promise((resolve) =>
          setTimeout(resolve, TIMING.conflictCycleDelay)
        );

        const currentState = useGameStore.getState().activeConflictState;
        if (!currentState || currentState.isComplete || !isRunningRef.current)
          break;

        const newState = executeCycle(currentState);
        useGameStore.setState({ activeConflictState: newState });
        state = newState;
      }

      if (isRunningRef.current) {
        stopAutoRun();
      }
    };

    runCycles();
  };

  const stopAutoRun = () => {
    isRunningRef.current = false;
    setIsRunning(false);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const stop = () => {
    stopAutoRun();
    storeEndConflict();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAutoRun();
    };
  }, []);

  return {
    isRunning,
    currentCycle,
    logs,
    outcome,
    isComplete,
    runNextCycle,
    stop,
  };
}
