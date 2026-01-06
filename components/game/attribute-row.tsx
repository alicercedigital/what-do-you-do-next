import { getIconComponent } from "@/components/universe/icon-picker";
import { cn } from "@/lib/utils";
import type { GameAttribute } from "@/lib/schemas/game-entity-schema";

interface AttributeRowProps {
  attribute: GameAttribute;
  value: number;
  benchmarkLabel?: string;
  className?: string;
  // Optional slots for buttons (like + / - in creator)
  actions?: React.ReactNode;
}

export function AttributeRow({
  attribute,
  value,
  benchmarkLabel,
  className,
  actions,
}: AttributeRowProps) {
  const Icon = getIconComponent(attribute.display?.icon || "circle");

  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-lg bg-secondary/30",
        className
      )}
    >
      <div
        className={cn(
          "p-2 rounded-lg bg-background",
          attribute.display?.iconColor || "text-foreground"
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="font-medium">
            {attribute.name}
            {attribute.shortName && (
              <span className="text-muted-foreground text-sm ml-1">
                ({attribute.shortName})
              </span>
            )}
          </span>
          <span className="text-2xl font-bold text-primary">{value}</span>
        </div>
        <p className="text-xs text-muted-foreground">{attribute.summary}</p>
        {benchmarkLabel && (
          <p className="text-xs text-primary/70 mt-1">{benchmarkLabel}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
