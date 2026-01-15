import * as React from "react";
import { HELPER_STEPS, type HelperStepId, getStepIndex, getNextStep, getPreviousStep } from "./helper-steps";
import type { ChoiceOption } from "./helper-choice-button";

interface StepState {
  selectedValues: string[];
  freeformText: string;
  options: ChoiceOption[];
  aiSuggestions: string[];
}

interface CreationHelperState {
  currentStep: HelperStepId;
  stepStates: Record<HelperStepId, StepState>;
  completedSteps: HelperStepId[];
  isGenerating: boolean;
  isLoadingOptions: boolean;
  error: string | null;
}

type CreationHelperAction =
  | { type: "SET_STEP"; stepId: HelperStepId }
  | { type: "SET_SELECTIONS"; stepId: HelperStepId; values: string[] }
  | { type: "SET_FREEFORM"; stepId: HelperStepId; text: string }
  | { type: "SET_OPTIONS"; stepId: HelperStepId; options: ChoiceOption[] }
  | { type: "SET_AI_SUGGESTIONS"; stepId: HelperStepId; suggestions: string[] }
  | { type: "MARK_COMPLETED"; stepId: HelperStepId }
  | { type: "SET_GENERATING"; isGenerating: boolean }
  | { type: "SET_LOADING_OPTIONS"; isLoading: boolean }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "RESET" };

function createInitialStepStates(): Record<HelperStepId, StepState> {
  const states = {} as Record<HelperStepId, StepState>;
  for (const step of HELPER_STEPS) {
    states[step.id] = {
      selectedValues: [],
      freeformText: "",
      options: step.defaultOptions,
      aiSuggestions: [],
    };
  }
  return states;
}

function createInitialState(): CreationHelperState {
  return {
    currentStep: "core-idea",
    stepStates: createInitialStepStates(),
    completedSteps: [],
    isGenerating: false,
    isLoadingOptions: false,
    error: null,
  };
}

function reducer(state: CreationHelperState, action: CreationHelperAction): CreationHelperState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, currentStep: action.stepId, error: null };

    case "SET_SELECTIONS":
      return {
        ...state,
        stepStates: {
          ...state.stepStates,
          [action.stepId]: {
            ...state.stepStates[action.stepId],
            selectedValues: action.values,
          },
        },
      };

    case "SET_FREEFORM":
      return {
        ...state,
        stepStates: {
          ...state.stepStates,
          [action.stepId]: {
            ...state.stepStates[action.stepId],
            freeformText: action.text,
          },
        },
      };

    case "SET_OPTIONS":
      return {
        ...state,
        stepStates: {
          ...state.stepStates,
          [action.stepId]: {
            ...state.stepStates[action.stepId],
            options: action.options,
          },
        },
      };

    case "SET_AI_SUGGESTIONS":
      return {
        ...state,
        stepStates: {
          ...state.stepStates,
          [action.stepId]: {
            ...state.stepStates[action.stepId],
            aiSuggestions: action.suggestions,
          },
        },
      };

    case "MARK_COMPLETED":
      if (state.completedSteps.includes(action.stepId)) {
        return state;
      }
      return {
        ...state,
        completedSteps: [...state.completedSteps, action.stepId],
      };

    case "SET_GENERATING":
      return { ...state, isGenerating: action.isGenerating };

    case "SET_LOADING_OPTIONS":
      return { ...state, isLoadingOptions: action.isLoading };

    case "SET_ERROR":
      return { ...state, error: action.error };

    case "RESET":
      return createInitialState();

    default:
      return state;
  }
}

export interface UseCreationHelperReturn {
  // State
  currentStep: HelperStepId;
  currentStepConfig: (typeof HELPER_STEPS)[number];
  currentStepState: StepState;
  completedSteps: HelperStepId[];
  isGenerating: boolean;
  isLoadingOptions: boolean;
  error: string | null;

  // Derived
  canGoNext: boolean;
  canGoPrevious: boolean;
  hasSelections: boolean;
  stepIndex: number;
  totalSteps: number;

  // Actions
  goToStep: (stepId: HelperStepId) => void;
  goToNext: () => void;
  goToPrevious: () => void;
  setSelections: (values: string[]) => void;
  setFreeformText: (text: string) => void;
  setOptions: (options: ChoiceOption[]) => void;
  setAiSuggestions: (suggestions: string[]) => void;
  markCompleted: () => void;
  setGenerating: (isGenerating: boolean) => void;
  setLoadingOptions: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export function useCreationHelper(): UseCreationHelperReturn {
  const [state, dispatch] = React.useReducer(reducer, null, createInitialState);

  const currentStepConfig = HELPER_STEPS.find((s) => s.id === state.currentStep)!;
  const currentStepState = state.stepStates[state.currentStep];
  const stepIndex = getStepIndex(state.currentStep);

  const hasSelections =
    currentStepState.selectedValues.length > 0 ||
    currentStepState.freeformText.trim().length > 0;

  const canGoNext = getNextStep(state.currentStep) !== undefined;
  const canGoPrevious = getPreviousStep(state.currentStep) !== undefined;

  const goToStep = React.useCallback((stepId: HelperStepId) => {
    dispatch({ type: "SET_STEP", stepId });
  }, []);

  const goToNext = React.useCallback(() => {
    const next = getNextStep(state.currentStep);
    if (next) {
      dispatch({ type: "SET_STEP", stepId: next.id });
    }
  }, [state.currentStep]);

  const goToPrevious = React.useCallback(() => {
    const prev = getPreviousStep(state.currentStep);
    if (prev) {
      dispatch({ type: "SET_STEP", stepId: prev.id });
    }
  }, [state.currentStep]);

  const setSelections = React.useCallback(
    (values: string[]) => {
      dispatch({ type: "SET_SELECTIONS", stepId: state.currentStep, values });
    },
    [state.currentStep]
  );

  const setFreeformText = React.useCallback(
    (text: string) => {
      dispatch({ type: "SET_FREEFORM", stepId: state.currentStep, text });
    },
    [state.currentStep]
  );

  const setOptions = React.useCallback(
    (options: ChoiceOption[]) => {
      dispatch({ type: "SET_OPTIONS", stepId: state.currentStep, options });
    },
    [state.currentStep]
  );

  const setAiSuggestions = React.useCallback(
    (suggestions: string[]) => {
      dispatch({ type: "SET_AI_SUGGESTIONS", stepId: state.currentStep, suggestions });
    },
    [state.currentStep]
  );

  const markCompleted = React.useCallback(() => {
    dispatch({ type: "MARK_COMPLETED", stepId: state.currentStep });
  }, [state.currentStep]);

  const setGenerating = React.useCallback((isGenerating: boolean) => {
    dispatch({ type: "SET_GENERATING", isGenerating });
  }, []);

  const setLoadingOptions = React.useCallback((isLoading: boolean) => {
    dispatch({ type: "SET_LOADING_OPTIONS", isLoading });
  }, []);

  const setError = React.useCallback((error: string | null) => {
    dispatch({ type: "SET_ERROR", error });
  }, []);

  const reset = React.useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  return {
    // State
    currentStep: state.currentStep,
    currentStepConfig,
    currentStepState,
    completedSteps: state.completedSteps,
    isGenerating: state.isGenerating,
    isLoadingOptions: state.isLoadingOptions,
    error: state.error,

    // Derived
    canGoNext,
    canGoPrevious,
    hasSelections,
    stepIndex,
    totalSteps: HELPER_STEPS.length,

    // Actions
    goToStep,
    goToNext,
    goToPrevious,
    setSelections,
    setFreeformText,
    setOptions,
    setAiSuggestions,
    markCompleted,
    setGenerating,
    setLoadingOptions,
    setError,
    reset,
  };
}
