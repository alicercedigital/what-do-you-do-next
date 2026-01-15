import * as React from "react";
import { Loader2, Sparkles, RefreshCw, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { ScrollArea } from "@/shared/components/ui/scroll-area";

interface EntityGeneratorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  children: React.ReactNode;
  preview: React.ReactNode | null;
  isGenerating: boolean;
  hasPreview: boolean;
  onGenerate: () => void;
  onAccept: () => void;
  onRegenerate: () => void;
}

export function EntityGeneratorDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  preview,
  isGenerating,
  hasPreview,
  onGenerate,
  onAccept,
  onRegenerate,
}: EntityGeneratorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 flex flex-col gap-4">
          {/* Configuration panel */}
          <div className="space-y-4">{children}</div>

          {/* Preview panel */}
          {(hasPreview || isGenerating) && (
            <div className="flex-1 min-h-0 border rounded-lg">
              <div className="flex items-center justify-between border-b px-3 py-2">
                <span className="text-sm font-medium">Preview</span>
                {hasPreview && !isGenerating && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRegenerate}
                    className="h-7 text-xs"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Regenerate
                  </Button>
                )}
              </div>
              <ScrollArea className="h-[200px]">
                <div className="p-3">
                  {isGenerating ? (
                    <div className="flex items-center justify-center h-full py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      <span className="ml-2 text-sm text-muted-foreground">
                        Generating...
                      </span>
                    </div>
                  ) : (
                    preview
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {!hasPreview ? (
            <Button onClick={onGenerate} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
          ) : (
            <Button onClick={onAccept} disabled={isGenerating}>
              <Check className="h-4 w-4 mr-2" />
              Accept & Create
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
