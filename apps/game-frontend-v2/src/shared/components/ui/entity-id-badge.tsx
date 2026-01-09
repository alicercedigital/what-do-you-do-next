import { Copy, Check } from "lucide-react";
import * as React from "react";
import { cn } from "@/shared/lib/utils";

interface EntityIdBadgeProps {
  id: string;
  className?: string;
}

export function EntityIdBadge({ id, className }: EntityIdBadgeProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center gap-1 rounded bg-muted/50 px-2 py-0.5 font-mono text-[10px] text-muted-foreground hover:bg-muted transition-colors cursor-pointer",
        className
      )}
      title={`ID: ${id} (click to copy)`}
    >
      <span className="truncate max-w-[180px]">{id}</span>
      {copied ? (
        <Check className="h-3 w-3 text-green-500 shrink-0" />
      ) : (
        <Copy className="h-3 w-3 shrink-0 opacity-50" />
      )}
    </button>
  );
}
