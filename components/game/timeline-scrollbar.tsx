"use client";

import type React from "react";

import type { CanvasNode } from "@/lib/schemas/game-schema";
import { useMemo } from "react";

interface TimelineScrollbarProps {
  nodes: CanvasNode[];
  onSeek: (positionX: number) => void;
  currentPositionX: number;
}

export function TimelineScrollbar({
  nodes,
  onSeek,
  currentPositionX,
}: TimelineScrollbarProps) {
  // Calculate timeline metrics
  const { minX, maxX, range, marks } = useMemo(() => {
    if (nodes.length === 0) {
      return { minX: 0, maxX: 1000, range: 1000, marks: [] };
    }

    const positions = nodes.map((n) => n.position.x);
    const minX = Math.min(...positions);
    const maxX = Math.max(...positions);
    const range = maxX - minX || 1000;

    // Create marks for each node
    const marks = nodes.map((node) => {
      const eventData = node.type === "event" ? node.data : null;
      const stepChange = null;

      return {
        id: node.id,
        type: node.type as "event" | "option",
        position: ((node.position.x - minX) / range) * 100, // Percentage
        selected: node.selected,
        greyedOut: node.greyedOut,
        stepChange: stepChange,
      };
    });

    return { minX, maxX, range, marks };
  }, [nodes]);

  // Calculate current position percentage
  const currentPercent = ((currentPositionX - minX) / range) * 100;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickPercent = (clickX / rect.width) * 100;

    // Convert back to canvas X position
    const targetX = minX + (clickPercent / 100) * range;
    onSeek(targetX);
  };

  return (
    <div
      onClick={handleClick}
      className="relative h-8 bg-card border border-border/50 rounded-md overflow-hidden cursor-pointer hover:bg-card/95 transition-colors group"
      style={{ width: "100%" }}
    >
      {/* Timeline track */}
      <div className="absolute inset-0 flex items-center px-2">
        <div className="relative w-full h-0.5 bg-muted/30 rounded-full overflow-visible">
          {/* Marks */}
          {marks.map((mark) => (
            <div
              key={mark.id}
              className="absolute"
              style={{ left: `${mark.position}%` }}
            >
              {/* Step change indicator - larger vertical line */}
              {mark.stepChange !== null && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="w-0.5 h-6 bg-primary/60 rounded-full" />
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-[8px] font-mono text-primary whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    {mark.stepChange + 1}
                  </div>
                </div>
              )}

              {/* Event mark - circle */}
              {mark.type === "event" && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary border border-background" />
              )}

              {/* Option mark - diamond */}
              {mark.type === "option" && (
                <div
                  className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rotate-45 border border-background ${
                    mark.selected
                      ? "bg-green-500"
                      : mark.greyedOut
                      ? "bg-muted-foreground/30"
                      : "bg-muted-foreground"
                  }`}
                />
              )}
            </div>
          ))}

          {nodes.length > 0 && (
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-300"
              style={{ left: `${currentPercent}%` }}
            >
              {/* Outer pulse ring */}
              <div className="absolute inset-0 w-5 h-5 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
              </div>
              {/* Inner dot */}
              <div className="relative w-3 h-3 border-2 border-primary bg-primary/80 rounded-full shadow-lg shadow-primary/50" />
            </div>
          )}
        </div>
      </div>

      {/* Labels on hover */}
      <div className="absolute bottom-0.5 left-2 right-2 text-[8px] text-muted-foreground/70 font-mono opacity-0 group-hover:opacity-100 transition-opacity flex justify-between pointer-events-none">
        <span>Start</span>
        <span>Timeline</span>
      </div>
    </div>
  );
}
