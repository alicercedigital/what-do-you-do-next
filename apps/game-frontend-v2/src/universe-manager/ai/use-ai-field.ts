import * as React from "react";
import type { v2 } from "@wdydn/shared";
import { getFieldPrompt, type AIAction } from "./prompts";
import { buildFieldContext, type AIContext } from "./ai-context";

type Universe = v2.Universe;

interface UseAIFieldOptions {
  entityType: string;
  field: string;
  universe: Universe;
  currentEntity?: Record<string, unknown>;
}

interface AIFieldState {
  isLoading: boolean;
  error: string | null;
}

interface AIFieldResult {
  state: AIFieldState;
  availableActions: AIAction[];
  executeAction: (action: AIAction, currentValue: string) => Promise<string | null>;
  getContext: () => AIContext;
}

/**
 * Hook for AI-assisted field generation
 */
export function useAIField({
  entityType,
  field,
  universe,
  currentEntity,
}: UseAIFieldOptions): AIFieldResult {
  const [state, setState] = React.useState<AIFieldState>({
    isLoading: false,
    error: null,
  });

  // Determine which actions are available for this field
  const availableActions = React.useMemo(() => {
    const actions: AIAction[] = [];
    if (getFieldPrompt(entityType, field, "generate")) actions.push("generate");
    if (getFieldPrompt(entityType, field, "improve")) actions.push("improve");
    if (getFieldPrompt(entityType, field, "expand")) actions.push("expand");
    if (getFieldPrompt(entityType, field, "suggestions")) actions.push("suggestions");
    return actions;
  }, [entityType, field]);

  const getContext = React.useCallback(() => {
    return buildFieldContext(entityType, field, universe, currentEntity);
  }, [entityType, field, universe, currentEntity]);

  const executeAction = React.useCallback(
    async (action: AIAction, currentValue: string): Promise<string | null> => {
      const prompt = getFieldPrompt(entityType, field, action);
      if (!prompt) {
        setState((s) => ({ ...s, error: "No prompt available for this action" }));
        return null;
      }

      setState({ isLoading: true, error: null });

      try {
        const context = buildFieldContext(entityType, field, universe, currentEntity);

        // Replace {value} placeholder in prompt
        const finalPrompt = prompt.replace("{value}", currentValue);

        const response = await fetch("/api/ai/smart-input", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            value: currentValue,
            prompt: finalPrompt,
            context,
            entityType,
            field,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate content");
        }

        const data = await response.json();
        setState({ isLoading: false, error: null });
        return data.result;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        setState({ isLoading: false, error: message });
        return null;
      }
    },
    [entityType, field, universe, currentEntity]
  );

  return {
    state,
    availableActions,
    executeAction,
    getContext,
  };
}

/**
 * Hook for generating entire entities
 */
export function useAIEntityGenerator(entityType: string, universe: Universe) {
  const [state, setState] = React.useState<AIFieldState>({
    isLoading: false,
    error: null,
  });

  const generateEntity = React.useCallback(
    async (hints?: Record<string, string>): Promise<unknown | null> => {
      setState({ isLoading: true, error: null });

      try {
        const response = await fetch(`/api/editor/ai/generate/${entityType}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            universe: {
              name: universe.name,
              theme: universe.theme,
              description: universe.description,
            },
            hints,
            existingEntities: getExistingEntities(entityType, universe),
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate entity");
        }

        const data = await response.json();
        setState({ isLoading: false, error: null });
        return data.entity;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        setState({ isLoading: false, error: message });
        return null;
      }
    },
    [entityType, universe]
  );

  return {
    state,
    generateEntity,
  };
}

function getExistingEntities(entityType: string, universe: Universe) {
  switch (entityType) {
    case "character":
      return universe.characters.map((c) => ({ id: c.id, name: c.name }));
    case "location":
      return universe.locations.map((l) => ({ id: l.id, name: l.name }));
    case "item":
      return universe.items.map((i) => ({ id: i.id, name: i.name }));
    case "moment":
      return universe.moments.map((m) => ({ id: m.id, title: m.title }));
    case "stat":
      return universe.stats.map((s) => ({ id: s.id, name: s.name }));
    case "challenge":
      return universe.challenges.map((c) => ({ id: c.id, name: c.name }));
    default:
      return [];
  }
}

interface EntityGeneratorState {
  isLoading: boolean;
  error: string | null;
}

interface EntityGeneratorResult<T> {
  state: EntityGeneratorState;
  generatedEntity: T | null;
  generate: () => void;
  reset: () => void;
}

/**
 * Hook for AI entity generation with preview support
 */
export function useEntityGenerator<T>(
  entityType: string,
  universe: Universe,
  hints: Record<string, unknown>
): EntityGeneratorResult<T> {
  const [state, setState] = React.useState<EntityGeneratorState>({
    isLoading: false,
    error: null,
  });
  const [generatedEntity, setGeneratedEntity] = React.useState<T | null>(null);

  const generate = React.useCallback(() => {
    setState({ isLoading: true, error: null });

    fetch(`/api/editor/ai/generate/${entityType}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        universe: {
          name: universe.name,
          theme: universe.theme,
          description: universe.description,
          config: universe.config,
        },
        hints,
        existingEntities: getExistingEntities(entityType, universe),
        stats: universe.stats.map((s) => ({
          id: s.id,
          name: s.name,
          type: s.type,
        })),
      }),
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to generate entity");
        }
        return response.json();
      })
      .then((data) => {
        setGeneratedEntity(data.entity as T);
        setState({ isLoading: false, error: null });
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Unknown error";
        setState({ isLoading: false, error: message });
      });
  }, [entityType, universe, hints]);

  const reset = React.useCallback(() => {
    setGeneratedEntity(null);
    setState({ isLoading: false, error: null });
  }, []);

  return {
    state,
    generatedEntity,
    generate,
    reset,
  };
}
