import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { useUniverseEditorStore } from "../../store/universe-editor-store";
import { HelperProgress } from "./helper-progress";
import { HelperInput } from "./helper-input";
import { HelperPreview } from "./helper-preview";
import { HelperRegenerate, type RegenerateOption } from "./helper-regenerate";
import { useCreationHelper } from "./use-creation-helper";
import type { ChoiceOption } from "./helper-choice-button";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

export function CreationHelper() {
  const {
    universe,
    updateUniverse,
    addStat,
    addCharacter,
    addLocation,
    addItem,
    addMoment,
  } = useUniverseEditorStore();

  const helper = useCreationHelper();
  const [aiRegenerateOptions, setAiRegenerateOptions] = React.useState<
    RegenerateOption[]
  >([]);
  const [isLoadingAiOptions, setIsLoadingAiOptions] = React.useState(false);

  // Load AI regenerate options when selections change
  React.useEffect(() => {
    const loadAiOptions = async () => {
      if (helper.currentStepState.selectedValues.length === 0) {
        setAiRegenerateOptions([]);
        return;
      }

      setIsLoadingAiOptions(true);
      try {
        const response = await fetch(
          `${API_BASE}/api/editor/ai/helper/regenerate-options`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              step: helper.currentStep,
              currentSelections: helper.currentStepState.selectedValues,
              universe: universe
                ? { name: universe.name, theme: universe.theme }
                : null,
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          setAiRegenerateOptions(
            data.options.map((opt: { id: string; label: string }) => ({
              ...opt,
              isAiGenerated: true,
            }))
          );
        }
      } catch (error) {
        console.error("Failed to load AI regenerate options:", error);
      } finally {
        setIsLoadingAiOptions(false);
      }
    };

    const timeout = setTimeout(loadAiOptions, 500);
    return () => clearTimeout(timeout);
  }, [
    helper.currentStep,
    helper.currentStepState.selectedValues,
    universe?.name,
    universe?.theme,
  ]);

  const handleRequestMoreOptions = async () => {
    helper.setLoadingOptions(true);
    try {
      const response = await fetch(
        `${API_BASE}/api/editor/ai/helper/suggestions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            step: helper.currentStep,
            universe: universe
              ? {
                  name: universe.name,
                  theme: universe.theme,
                  description: universe.description,
                }
              : null,
            existingOptions: helper.currentStepState.options.map(
              (o) => o.label
            ),
            currentSelections: helper.currentStepState.selectedValues,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const newOptions: ChoiceOption[] = data.suggestions.map(
          (s: { id: string; label: string; description?: string }) => ({
            id: s.id,
            label: s.label,
            description: s.description,
          })
        );
        // Add new options to existing ones
        helper.setOptions([...helper.currentStepState.options, ...newOptions]);
      }
    } catch (error) {
      console.error("Failed to load more options:", error);
      helper.setError("Failed to load more options");
    } finally {
      helper.setLoadingOptions(false);
    }
  };

  const handleRegenerate = async (option: RegenerateOption) => {
    helper.setLoadingOptions(true);
    try {
      const response = await fetch(
        `${API_BASE}/api/editor/ai/helper/suggestions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            step: helper.currentStep,
            universe: universe
              ? {
                  name: universe.name,
                  theme: universe.theme,
                  description: universe.description,
                }
              : null,
            regenerateMode: option.id,
            currentSelections: helper.currentStepState.selectedValues,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const newOptions: ChoiceOption[] = data.suggestions.map(
          (s: { id: string; label: string; description?: string }) => ({
            id: s.id,
            label: s.label,
            description: s.description,
          })
        );
        helper.setOptions(newOptions);
      }
    } catch (error) {
      console.error("Failed to regenerate options:", error);
      helper.setError("Failed to regenerate options");
    } finally {
      helper.setLoadingOptions(false);
    }
  };

  const handleGenerate = async () => {
    if (!universe) return;

    helper.setGenerating(true);
    helper.setError(null);

    try {
      const response = await fetch(
        `${API_BASE}/api/editor/ai/helper/generate-content`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            step: helper.currentStep,
            selections: helper.currentStepState.selectedValues,
            freeformText: helper.currentStepState.freeformText,
            universe: {
              id: universe.id,
              name: universe.name,
              theme: universe.theme,
              description: universe.description,
              stats: universe.stats,
              characters: universe.characters,
              locations: universe.locations,
              items: universe.items,
              moments: universe.moments,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate content");
      }

      const data = await response.json();

      // Add generated content to universe based on step type
      switch (helper.currentStepConfig.entityType) {
        case "universe":
          updateUniverse({
            name: data.name || universe.name,
            theme: data.theme || universe.theme,
            description: data.description || universe.description,
          });
          break;
        case "stat":
          if (data.stats && Array.isArray(data.stats)) {
            for (const stat of data.stats) {
              addStat(stat);
            }
          }
          break;
        case "character":
          if (data.characters && Array.isArray(data.characters)) {
            for (const character of data.characters) {
              addCharacter(character);
            }
          }
          break;
        case "location":
          if (data.locations && Array.isArray(data.locations)) {
            for (const location of data.locations) {
              addLocation(location);
            }
          }
          break;
        case "item":
          if (data.items && Array.isArray(data.items)) {
            for (const item of data.items) {
              addItem(item);
            }
          }
          break;
        case "moment":
          if (data.moments && Array.isArray(data.moments)) {
            for (const moment of data.moments) {
              addMoment(moment);
            }
          }
          break;
      }

      // Mark step as completed and optionally move to next
      helper.markCompleted();
    } catch (error) {
      console.error("Failed to generate content:", error);
      helper.setError("Failed to generate content. Please try again.");
    } finally {
      helper.setGenerating(false);
    }
  };

  const handleSkip = () => {
    helper.markCompleted();
    helper.goToNext();
  };

  if (!universe) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        No universe loaded
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-10em)] flex-col">
      {/* Progress bar */}
      <div className="border-b bg-card/50 px-6 py-4">
        <HelperProgress
          currentStep={helper.currentStep}
          completedSteps={helper.completedSteps}
          onStepClick={helper.goToStep}
        />
      </div>

      {/* Main content */}
      <div className="flex flex-1 min-h-0">
        {/* Left: Input area */}
        <div className="flex-1 flex flex-col min-w-0">
          <ScrollArea className="flex-1 overflow-hidden">
            <div className="max-w-4xl mx-auto px-6 py-8">
              <HelperInput
                mode={helper.currentStepConfig.inputMode}
                question={helper.currentStepConfig.question}
                description={helper.currentStepConfig.description}
                options={helper.currentStepState.options}
                selectedValues={helper.currentStepState.selectedValues}
                onSelectionChange={helper.setSelections}
                textValue={helper.currentStepState.freeformText}
                onTextChange={helper.setFreeformText}
                placeholder={helper.currentStepConfig.placeholder}
                isLoading={helper.isLoadingOptions}
                aiSuggestions={helper.currentStepState.aiSuggestions}
                onRequestMoreOptions={handleRequestMoreOptions}
              />

              {/* Regenerate options */}
              <div className="mt-8">
                <HelperRegenerate
                  onRegenerate={handleRegenerate}
                  aiOptions={aiRegenerateOptions}
                  isLoading={helper.isLoadingOptions}
                  isLoadingAiOptions={isLoadingAiOptions}
                />
              </div>
            </div>
          </ScrollArea>

          {/* Navigation */}
          <div className="border-t bg-card/50 px-6 py-3 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={helper.goToPrevious}
              disabled={!helper.canGoPrevious}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Step {helper.stepIndex + 1} of {helper.totalSteps}
            </span>
            <Button
              variant="ghost"
              onClick={helper.goToNext}
              disabled={!helper.canGoNext}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>

        {/* Right: Preview panel */}
        <div className="w-80 border-l bg-muted/30 p-4 flex flex-col min-h-0">
          <HelperPreview
            stepId={helper.currentStep}
            selectedValues={helper.currentStepState.selectedValues}
            freeformText={helper.currentStepState.freeformText}
            isLoading={helper.isGenerating}
            onGenerate={handleGenerate}
            onSkip={handleSkip}
            canGenerate={helper.hasSelections && !helper.isGenerating}
            canSkip={helper.canGoNext}
            error={helper.error}
          />
        </div>
      </div>
    </div>
  );
}
