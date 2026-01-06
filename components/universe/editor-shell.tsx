"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";

interface EditorShellProps {
  title: string;
  subtitle?: string;
  isEditing: boolean;
  onSave: () => void;
  onCancel: () => void;
  canSave: boolean;
  children: React.ReactNode;
}

export function EditorShell({
  title,
  subtitle,
  isEditing,
  onSave,
  onCancel,
  canSave,
  children,
}: EditorShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">
                {isEditing ? `Edit ${title}` : `Create ${title}`}
              </h1>
              {subtitle && (
                <p className="text-muted-foreground text-sm">{subtitle}</p>
              )}
            </div>
          </div>
          <Button onClick={onSave} disabled={!canSave} className="gap-2">
            <Save className="h-4 w-4" />
            Save {title}
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
