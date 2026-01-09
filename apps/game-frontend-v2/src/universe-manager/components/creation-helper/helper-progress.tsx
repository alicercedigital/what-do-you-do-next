import { Check } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { HELPER_STEPS, type HelperStepId } from "./helper-steps";

interface HelperProgressProps {
  currentStep: HelperStepId;
  completedSteps: HelperStepId[];
  onStepClick: (stepId: HelperStepId) => void;
}

export function HelperProgress({
  currentStep,
  completedSteps,
  onStepClick,
}: HelperProgressProps) {
  const currentIndex = HELPER_STEPS.findIndex((s) => s.id === currentStep);

  return (
    <nav className="w-full">
      <ol className="flex items-center justify-center gap-2">
        {HELPER_STEPS.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = step.id === currentStep;
          const isClickable = isCompleted || index <= currentIndex;

          return (
            <li key={step.id} className="flex items-center">
              {/* Connector line */}
              {index > 0 && (
                <div
                  className={cn(
                    "h-0.5 w-8 transition-colors",
                    index <= currentIndex ? "bg-primary" : "bg-muted"
                  )}
                />
              )}

              {/* Step button */}
              <button
                type="button"
                onClick={() => isClickable && onStepClick(step.id)}
                disabled={!isClickable}
                className={cn(
                  "group flex flex-col items-center gap-1",
                  isClickable ? "cursor-pointer" : "cursor-not-allowed"
                )}
              >
                {/* Circle */}
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-all",
                    isCurrent
                      ? "border-primary bg-primary text-primary-foreground"
                      : isCompleted
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-muted text-muted-foreground",
                    isClickable && !isCurrent && "group-hover:border-primary/50"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>

                {/* Label */}
                <span
                  className={cn(
                    "text-xs font-medium transition-colors",
                    isCurrent
                      ? "text-primary"
                      : isCompleted
                        ? "text-foreground"
                        : "text-muted-foreground",
                    isClickable && !isCurrent && "group-hover:text-foreground"
                  )}
                >
                  {step.name}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
