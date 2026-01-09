import { Button } from "@/shared/components/ui/button";

interface OperatorPaletteProps {
  mode: "formula" | "condition" | "consequence" | "transition";
  onSelect: (operator: string) => void;
}

interface OperatorGroup {
  label: string;
  operators: { symbol: string; label: string; description: string }[];
}

export function OperatorPalette({ mode, onSelect }: OperatorPaletteProps) {
  const arithmeticOps = [
    { symbol: " + ", label: "+", description: "Add" },
    { symbol: " - ", label: "-", description: "Subtract" },
    { symbol: " * ", label: "*", description: "Multiply" },
    { symbol: " / ", label: "/", description: "Divide" },
    { symbol: " % ", label: "%", description: "Modulo" },
  ];

  const comparisonOps = [
    { symbol: " == ", label: "==", description: "Equal" },
    { symbol: " != ", label: "!=", description: "Not equal" },
    { symbol: " < ", label: "<", description: "Less than" },
    { symbol: " > ", label: ">", description: "Greater than" },
    { symbol: " <= ", label: "<=", description: "Less or equal" },
    { symbol: " >= ", label: ">=", description: "Greater or equal" },
  ];

  const logicalOps = [
    { symbol: " && ", label: "&&", description: "And" },
    { symbol: " || ", label: "||", description: "Or" },
    { symbol: "!", label: "!", description: "Not" },
  ];

  const assignmentOps = [
    { symbol: " = ", label: "=", description: "Assign" },
    { symbol: " += ", label: "+=", description: "Add & assign" },
    { symbol: " -= ", label: "-=", description: "Subtract & assign" },
    { symbol: " *= ", label: "*=", description: "Multiply & assign" },
    { symbol: " /= ", label: "/=", description: "Divide & assign" },
  ];

  const conditionalOps = [
    { symbol: " when ", label: "when", description: "Conditional execution" },
    { symbol: " when ai()", label: "when ai()", description: "AI-evaluated condition" },
  ];

  const getGroups = (): OperatorGroup[] => {
    const groups: OperatorGroup[] = [];

    if (mode === "formula") {
      groups.push({ label: "Arithmetic", operators: arithmeticOps });
    } else if (mode === "condition") {
      groups.push({ label: "Comparison", operators: comparisonOps });
      groups.push({ label: "Logical", operators: logicalOps });
      groups.push({ label: "Arithmetic", operators: arithmeticOps });
    } else if (mode === "consequence") {
      groups.push({ label: "Assignment", operators: assignmentOps });
      groups.push({ label: "Arithmetic", operators: arithmeticOps });
    } else if (mode === "transition") {
      groups.push({ label: "Assignment", operators: assignmentOps });
      groups.push({ label: "Conditional", operators: conditionalOps });
      groups.push({ label: "Comparison", operators: comparisonOps });
      groups.push({ label: "Logical", operators: logicalOps });
    }

    return groups;
  };

  const groups = getGroups();

  return (
    <div>
      <div className="mb-2 text-xs font-medium text-muted-foreground">
        Operators
      </div>
      <div className="space-y-2">
        {groups.map((group) => (
          <div key={group.label}>
            <div className="mb-1 text-[10px] text-muted-foreground">
              {group.label}
            </div>
            <div className="flex flex-wrap gap-1">
              {group.operators.map((op) => (
                <Button
                  key={op.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 min-w-[32px] px-2 text-xs font-mono"
                  onClick={() => onSelect(op.symbol)}
                  title={op.description}
                >
                  {op.label}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
