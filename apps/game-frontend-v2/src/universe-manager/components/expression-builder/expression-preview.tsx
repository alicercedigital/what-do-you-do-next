import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface ExpressionPreviewProps {
  expression: string;
  mode: "formula" | "condition" | "consequence" | "transition";
}

interface ValidationResult {
  isValid: boolean;
  message: string;
  type: "success" | "error" | "warning";
}

// Simple expression validator (basic syntax checking)
function validateExpression(
  expression: string,
  mode: string
): ValidationResult {
  if (!expression.trim()) {
    return {
      isValid: true,
      message: "Enter an expression",
      type: "warning",
    };
  }

  // Check for balanced parentheses
  let parenCount = 0;
  for (const char of expression) {
    if (char === "(") parenCount++;
    if (char === ")") parenCount--;
    if (parenCount < 0) {
      return {
        isValid: false,
        message: "Unbalanced parentheses: extra closing parenthesis",
        type: "error",
      };
    }
  }
  if (parenCount > 0) {
    return {
      isValid: false,
      message: "Unbalanced parentheses: missing closing parenthesis",
      type: "error",
    };
  }

  // Check for balanced quotes
  const singleQuotes = (expression.match(/'/g) || []).length;
  const doubleQuotes = (expression.match(/"/g) || []).length;
  if (singleQuotes % 2 !== 0) {
    return {
      isValid: false,
      message: "Unbalanced single quotes",
      type: "error",
    };
  }
  if (doubleQuotes % 2 !== 0) {
    return {
      isValid: false,
      message: "Unbalanced double quotes",
      type: "error",
    };
  }

  // Mode-specific validation
  if (mode === "transition" && expression.includes("when")) {
    // Should have something before and after "when"
    const parts = expression.split(/\s+when\s+/);
    if (parts.length === 2) {
      if (!parts[0].trim()) {
        return {
          isValid: false,
          message: 'Missing consequence before "when"',
          type: "error",
        };
      }
      if (!parts[1].trim()) {
        return {
          isValid: false,
          message: 'Missing condition after "when"',
          type: "error",
        };
      }
    }
  }

  // Check for common patterns
  const hasPath = /\b(character|moment|stats|globalStats)\./i.test(expression);
  const hasVariable = /\$\w+/.test(expression);
  const hasFunction = /\b(min|max|floor|ceil|round|abs|clamp|roll|random)\s*\(/i.test(
    expression
  );

  // Warn if expression looks incomplete
  if (!hasPath && !hasVariable && !hasFunction && mode !== "formula") {
    return {
      isValid: true,
      message: "Expression may need a path or variable (e.g., $player, character.X)",
      type: "warning",
    };
  }

  // Check for assignment in formula mode (not allowed)
  if (mode === "formula" && /[^=!<>]=(?!=)/.test(expression)) {
    return {
      isValid: false,
      message: "Formulas cannot contain assignments (use consequence mode)",
      type: "error",
    };
  }

  // Success
  return {
    isValid: true,
    message: "Expression looks valid",
    type: "success",
  };
}

export function ExpressionPreview({ expression, mode }: ExpressionPreviewProps) {
  const result = validateExpression(expression, mode);

  const Icon =
    result.type === "success"
      ? CheckCircle2
      : result.type === "error"
      ? XCircle
      : AlertCircle;

  const colorClass =
    result.type === "success"
      ? "text-green-500"
      : result.type === "error"
      ? "text-red-500"
      : "text-amber-500";

  return (
    <div>
      <div className="mb-2 text-xs font-medium text-muted-foreground">
        Validation
      </div>
      <div
        className={cn(
          "flex items-start gap-2 rounded border p-2",
          result.type === "success" && "border-green-500/30 bg-green-500/5",
          result.type === "error" && "border-red-500/30 bg-red-500/5",
          result.type === "warning" && "border-amber-500/30 bg-amber-500/5"
        )}
      >
        <Icon className={cn("h-4 w-4 shrink-0 mt-0.5", colorClass)} />
        <span className="text-xs">{result.message}</span>
      </div>

      {/* Show parsed structure for valid expressions */}
      {result.isValid && expression.trim() && (
        <div className="mt-2 text-[10px] text-muted-foreground">
          <span className="font-medium">Structure: </span>
          {expression.includes("when") ? (
            <>
              <span className="text-blue-400">consequence</span>
              <span> when </span>
              <span className="text-green-400">condition</span>
            </>
          ) : mode === "condition" ? (
            <span className="text-green-400">condition (boolean)</span>
          ) : mode === "consequence" ? (
            <span className="text-blue-400">assignment/mutation</span>
          ) : (
            <span className="text-purple-400">value expression</span>
          )}
        </div>
      )}
    </div>
  );
}
