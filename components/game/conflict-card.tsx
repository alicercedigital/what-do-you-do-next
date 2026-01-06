"use client";

import type React from "react";

import { Badge } from "@/components/ui/badge";
import { CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import type {
    ConflictEvent,
    ConflictOutcome
} from "@/lib/schemas/conflict-event-schema";
import { AnimatePresence, motion } from "framer-motion";
import {
    GraduationCap,
    MessageSquare, Scale, Skull, Swords,
    Timer, Trophy, Zap
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CardWrapper } from "./card-wrapper";

const conflictIcons: Record<string, React.ReactNode> = {
  swords: <Swords className="h-4 w-4" />,
  timer: <Timer className="h-4 w-4" />,
  "graduation-cap": <GraduationCap className="h-4 w-4" />,
  "message-square": <MessageSquare className="h-4 w-4" />,
  trophy: <Trophy className="h-4 w-4" />,
  skull: <Skull className="h-4 w-4" />,
  scale: <Scale className="h-4 w-4" />,
  zap: <Zap className="h-4 w-4" />,
};

export interface ConflictLogEntry {
  id: string;
  message: string;
  type: "action" | "damage" | "info" | "success" | "failure";
  timestamp: number;
}

export interface ConflictRoleState {
  roleId: string;
  roleName: string;
  entityName: string;
  portrait?: string;
  attributes: Record<string, number>;
  maxAttributes: Record<string, number>;
}

interface ConflictCardProps {
  conflict: ConflictEvent;
  roleStates: ConflictRoleState[];
  logs: ConflictLogEntry[];
  currentCycle: number;
  isComplete: boolean;
  outcome?: ConflictOutcome;
  isNew?: boolean;
  characterPortrait?: string;
}

export function ConflictCard({
  conflict,
  roleStates,
  logs,
  currentCycle,
  isComplete,
  outcome,
  isNew = false,
  characterPortrait,
}: ConflictCardProps) {
  const logEndRef = useRef<HTMLDivElement>(null);
  const [displayedLogs, setDisplayedLogs] = useState<ConflictLogEntry[]>([]);

  // Animate logs appearing one by one
  useEffect(() => {
    if (logs.length > displayedLogs.length) {
      const timer = setTimeout(() => {
        setDisplayedLogs(logs.slice(0, displayedLogs.length + 1));
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [logs, displayedLogs]);

  // Auto-scroll to bottom of logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayedLogs]);

  const playerRole =
    roleStates.find((r) => r.roleId === "player") || roleStates[0];
  const opponentRole =
    roleStates.find(
      (r) => r.roleId !== "player" && r.roleId !== playerRole?.roleId
    ) || roleStates[1];

  return (
    <CardWrapper
      type="conflict"
      isNew={isNew}
      className="!py-0"
      borderColor={
        isComplete
          ? outcome?.type === "success"
            ? "border-green-500/50"
            : "border-red-500/50"
          : "border-primary/50"
      }
      characterPortrait={characterPortrait}
      animateFrom="right"
    >
      {/* Header with conflict type */}
      <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {conflictIcons[conflict.icon] || <Swords className="h-4 w-4" />}
            <span className="text-xs uppercase tracking-wider font-mono text-muted-foreground">
              {conflict.name}
            </span>
          </div>
          <Badge variant="outline" className="font-mono text-xs">
            Cycle {currentCycle}
          </Badge>
        </div>
      </div>

      {/* Combatants Section */}
      <div className="p-3 border-b border-border bg-secondary/20">
        <div className="flex items-center justify-between gap-4">
          {/* Player side */}
          {playerRole && (
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-full border-2 border-primary overflow-hidden bg-secondary">
                  {playerRole.portrait ? (
                    <img
                      src={playerRole.portrait}
                      alt={playerRole.entityName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold">
                      {playerRole.entityName[0]}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {playerRole.entityName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {playerRole.roleName}
                  </p>
                </div>
              </div>
              {/* Key attribute bars */}
              {Object.entries(playerRole.attributes)
                .slice(0, 2)
                .map(([attrId, value]) => {
                  const max = playerRole.maxAttributes[attrId] || 100;
                  const percentage = Math.max(
                    0,
                    Math.min(100, (value / max) * 100)
                  );
                  return (
                    <div key={attrId} className="mb-1">
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="text-muted-foreground capitalize">
                          {attrId.replace(/_/g, " ")}
                        </span>
                        <span className="font-mono">
                          {Math.round(value)}/{max}
                        </span>
                      </div>
                      <Progress value={percentage} className="h-1.5" />
                    </div>
                  );
                })}
            </div>
          )}

          {/* VS indicator */}
          <div className="flex flex-col items-center px-2">
            <span className="text-lg font-bold text-primary">VS</span>
          </div>

          {/* Opponent side */}
          {opponentRole && (
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-row-reverse">
                <div className="w-10 h-10 rounded-full border-2 border-destructive overflow-hidden bg-secondary">
                  {opponentRole.portrait ? (
                    <img
                      src={opponentRole.portrait}
                      alt={opponentRole.entityName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold">
                      {opponentRole.entityName[0]}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 text-right">
                  <p className="text-sm font-medium truncate">
                    {opponentRole.entityName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {opponentRole.roleName}
                  </p>
                </div>
              </div>
              {/* Key attribute bars */}
              {Object.entries(opponentRole.attributes)
                .slice(0, 2)
                .map(([attrId, value]) => {
                  const max = opponentRole.maxAttributes[attrId] || 100;
                  const percentage = Math.max(
                    0,
                    Math.min(100, (value / max) * 100)
                  );
                  return (
                    <div key={attrId} className="mb-1">
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="text-muted-foreground capitalize">
                          {attrId.replace(/_/g, " ")}
                        </span>
                        <span className="font-mono">
                          {Math.round(value)}/{max}
                        </span>
                      </div>
                      <Progress value={percentage} className="h-1.5" />
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* Battle Log */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-[200px] px-3 py-2">
          <div className="space-y-1.5 font-mono text-xs">
            <AnimatePresence>
              {displayedLogs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-1.5 rounded ${
                    log.type === "damage"
                      ? "bg-red-500/10 text-red-400"
                      : log.type === "success"
                      ? "bg-green-500/10 text-green-400"
                      : log.type === "failure"
                      ? "bg-red-500/10 text-red-400"
                      : log.type === "action"
                      ? "bg-primary/10 text-primary"
                      : "bg-secondary/50 text-muted-foreground"
                  }`}
                >
                  {log.message}
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={logEndRef} />
          </div>
        </ScrollArea>
      </CardContent>

      {/* Outcome Footer */}
      {isComplete && outcome && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 border-t ${
            outcome.type === "success"
              ? "bg-green-500/20 border-green-500/30"
              : outcome.type === "failure"
              ? "bg-red-500/20 border-red-500/30"
              : "bg-secondary border-border"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            {outcome.type === "success" ? (
              <Trophy className="h-5 w-5 text-green-500" />
            ) : outcome.type === "failure" ? (
              <Skull className="h-5 w-5 text-red-500" />
            ) : (
              <Scale className="h-5 w-5 text-muted-foreground" />
            )}
            <span
              className={`font-bold text-lg ${
                outcome.type === "success"
                  ? "text-green-500"
                  : outcome.type === "failure"
                  ? "text-red-500"
                  : "text-muted-foreground"
              }`}
            >
              {outcome.name}
            </span>
          </div>
          <p className="text-xs text-center text-muted-foreground mt-1">
            {outcome.description}
          </p>
        </motion.div>
      )}
    </CardWrapper>
  );
}
