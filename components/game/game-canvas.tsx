"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  type Node,
  type Edge,
  Panel,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, RefreshCw, Menu, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGameStore } from "@/lib/store/game-store";
import { EventCard } from "./event-card";
import { OptionCard } from "./option-card";
import { DiceRollCard } from "./dice-roll-card";
import { ConflictCard } from "./conflict-card";
import { TimelineScrollbar } from "./timeline-scrollbar";
import { SaveLoadMenu } from "./save-load-menu";
import { heroJourneySteps } from "@/lib/data/hero-journey";
import type { GameEvent, GameOption } from "@/lib/schemas/game-schema";
import {
  calculateNodeDimensions,
  mapToFlowNodes,
} from "@/lib/utils/game-helpers";
import { useGameController } from "@/lib/hooks/use-game-controller";
import { useConflictRunner } from "@/lib/hooks/use-conflict-runner";

// Node Components
const EventNode = ({ data }: { data: any }) => (
  <div className="pointer-events-auto">
    <EventCard
      event={data.event}
      isNew={data.isNew}
      isActive={data.isActive}
      characterPortrait={data.characterPortrait}
      locationImage={data.locationImage}
    />
  </div>
);

const OptionNode = ({ data }: { data: any }) => (
  <div className="pointer-events-auto">
    <OptionCard
      option={data.option}
      onClick={data.onClick}
      selected={data.selected}
      greyedOut={data.greyedOut}
      isNew={data.isNew}
    />
  </div>
);

const DiceRollNode = ({ data }: { data: any }) => (
  <div className="pointer-events-auto">
    <DiceRollCard
      attributeName={data.attributeName}
      targetNumber={data.targetNumber}
      attributeValue={data.attributeValue}
      diceRoll={data.diceRoll}
      success={data.success}
      characterPortrait={data.characterPortrait}
      isNew={data.isNew}
    />
  </div>
);

const ConflictNode = ({ data }: { data: any }) => (
  <div className="pointer-events-auto">
    <ConflictCard
      conflict={data.conflict}
      roleStates={data.roleStates}
      logs={data.logs}
      currentCycle={data.currentCycle}
      isComplete={data.isComplete}
      outcome={data.outcome}
      isNew={data.isNew}
      characterPortrait={data.characterPortrait}
    />
  </div>
);

const nodeTypes = {
  event: EventNode,
  option: OptionNode,
  diceRoll: DiceRollNode,
  conflict: ConflictNode,
};

function AnimatedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
}: any) {
  const [edgePath] = require("reactflow").getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 16,
  });

  const isActive = data?.active ?? true;
  const strokeColor = isActive ? "#d4a574" : "#6b7280";

  return (
    <>
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth={2}
        markerEnd={markerEnd}
      />
      {isActive && (
        <circle r="4" fill="#d4a574">
          <animateMotion dur="2s" repeatCount="indefinite" path={edgePath} />
        </circle>
      )}
    </>
  );
}

const edgeTypes = {
  animated: AnimatedEdge,
};

function GameCanvasInner() {
  const [showSidebar, setShowSidebar] = useState(false);
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Use new hooks
  const {
    isGenerating,
    isWaitingForContinue,
    handleGenerateStory,
    handleOptionClick,
    handleContinue,
    handleStartConflict,
  } = useGameController();

  const {
    isRunning: isConflictRunning,
    currentCycle,
    logs,
    outcome,
    isComplete,
    stop: stopConflict,
  } = useConflictRunner();

  const {
    gameState,
    selectedUniverse,
    character,
    newNodeIds,
    newConnectionIds,
    resetGame,
    clearNewFlags,
    autoSave,
  } = useGameStore();

  const { fitBounds, setCenter } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Error handling effect (same as before)
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (
        event.message?.includes(
          "ResizeObserver loop completed with undelivered notifications"
        )
      ) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (
        event.reason?.message?.includes(
          "ResizeObserver loop completed with undelivered notifications"
        )
      ) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );
    };
  }, []);

  // Center on node helper
  const centerOnNode = useCallback(
    (
      node: { position: { x: number; y: number }; type: string; data?: any },
      connectedNodes: {
        position: { x: number; y: number };
        type: string;
      }[] = []
    ) => {
      const { width: nodeWidth, height: nodeHeight } = calculateNodeDimensions(
        node.type,
        node.type === "event" ? (node.data as GameEvent)?.type : undefined
      );

      if (connectedNodes.length > 0) {
        const allNodes = [node, ...connectedNodes];
        const minX = Math.min(...allNodes.map((n) => n.position.x));
        const maxX = Math.max(
          node.position.x + nodeWidth,
          ...connectedNodes.map((n) => {
            const dims = calculateNodeDimensions(n.type);
            return n.position.x + dims.width;
          })
        );
        const minY = Math.min(...allNodes.map((n) => n.position.y));
        const maxY = Math.max(
          node.position.y + nodeHeight,
          ...connectedNodes.map((n) => {
            const dims = calculateNodeDimensions(n.type);
            return n.position.y + dims.height;
          })
        );

        const padding = 150;
        fitBounds(
          {
            x: minX - padding,
            y: minY - padding,
            width: maxX - minX + padding * 2,
            height: maxY - minY + padding * 2,
          },
          { duration: 800, padding: 80 }
        );
      } else {
        const centerX = node.position.x + nodeWidth / 2;
        const centerY = node.position.y + nodeHeight / 2;
        setCenter(centerX, centerY, { zoom: 0.75, duration: 800 });
      }
    },
    [fitBounds, setCenter]
  );

  const centerOnLastEvent = useCallback(() => {
    const currentGameState = useGameStore.getState().gameState;
    if (!currentGameState) return;

    const eventNodes = currentGameState.nodes.filter((n) => n.type === "event");
    if (eventNodes.length === 0) return;

    const lastEvent = eventNodes[eventNodes.length - 1];
    const connectedOptionIds = currentGameState.connections
      .filter((conn) => conn.fromNodeId === lastEvent.id)
      .map((conn) => conn.toNodeId);

    const connectedOptions = currentGameState.nodes.filter(
      (n) => n.type === "option" && connectedOptionIds.includes(n.id)
    );

    centerOnNode(lastEvent, connectedOptions);
  }, [centerOnNode]);

  // Update handleContinue to use the hook
  const handleContinueClick = useCallback(() => {
    centerOnLastEvent();
    setTimeout(() => {
      handleContinue();
    }, 500);
  }, [handleContinue, centerOnLastEvent]);

  // Update nodes and edges when game state changes
  useEffect(() => {
    if (!gameState) return;

    const flowNodes: Node[] = mapToFlowNodes(
      {
        ...gameState,
        character,
        selectedUniverse,
        currentEventId: gameState.currentEventId,
      },
      newNodeIds,
      useGameStore.getState().activeConflictState,
      {
        onOptionClick: handleOptionClick,
        onConflictEnd: stopConflict,
      }
    );

    const validNodeIds = new Set(gameState.nodes.map((n) => n.id));

    const flowEdges: Edge[] = gameState.connections
      .filter(
        (conn) =>
          validNodeIds.has(conn.fromNodeId) && validNodeIds.has(conn.toNodeId)
      )
      .map((conn) => ({
        id: conn.id,
        source: conn.fromNodeId,
        target: conn.toNodeId,
        type: "animated",
        animated: true,
        style: { stroke: conn.active ? "#d4a574" : "#6b7280", strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: conn.active ? "#d4a574" : "#6b7280",
        },
        data: { active: conn.active },
      }));

    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [
    gameState,
    newNodeIds,
    newConnectionIds,
    setNodes,
    setEdges,
    character,
    useGameStore.getState().activeConflictState,
    selectedUniverse,
    handleOptionClick,
    stopConflict,
  ]);

  // Auto-generate initial story
  useEffect(() => {
    if (gameState && gameState.nodes.length === 0 && !isGenerating) {
      handleGenerateStory();
    }
  }, [gameState, isGenerating, handleGenerateStory]);

  // Clear new flags after animation
  useEffect(() => {
    if (newNodeIds.size > 0 || newConnectionIds.size > 0) {
      const timer = setTimeout(() => {
        clearNewFlags();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [newNodeIds, newConnectionIds, clearNewFlags]);

  // Auto-save
  useEffect(() => {
    if (gameState && gameState.nodes.length > 0) {
      autoSaveIntervalRef.current = setInterval(() => {
        autoSave();
      }, 30000);

      return () => {
        if (autoSaveIntervalRef.current) {
          clearInterval(autoSaveIntervalRef.current);
        }
      };
    }
  }, [gameState, autoSave]);

  // Scrollbar seek callback
  const handleScrollbarSeekCallback = useCallback(
    (targetX: number) => {
      if (!gameState) return;

      const nearestNode = gameState.nodes.reduce((closest, node) => {
        const currentDist = Math.abs(node.position.x - targetX);
        const closestDist = Math.abs(closest.position.x - targetX);
        return currentDist < closestDist ? node : closest;
      });

      if (nearestNode) {
        const { width: nodeWidth, height: nodeHeight } =
          calculateNodeDimensions(
            nearestNode.type,
            nearestNode.type === "event"
              ? (nearestNode.data as GameEvent)?.type
              : undefined
          );
        const centerX = nearestNode.position.x + nodeWidth / 2;
        const centerY = nearestNode.position.y + nodeHeight / 2;
        setCenter(centerX, centerY, { zoom: 0.75, duration: 600 });
      }
    },
    [gameState, setCenter]
  );

  if (!gameState || !selectedUniverse || !character) return null;

  const currentStep = heroJourneySteps.find(
    (s) => s.id === gameState.currentHeroStep
  );
  const eventNodes = gameState.nodes.filter((n) => n.type === "event");
  const lastEventNode = eventNodes[eventNodes.length - 1];
  const currentScrollPosition = lastEventNode ? lastEventNode.position.x : 0;
  const isWaitingForContinueState =
    gameState.isWaitingForContinue &&
    (gameState.pendingEvents?.length ?? 0) > 0;

  return (
    <div className="fixed inset-0 bg-background overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-background/80 backdrop-blur-sm border-b border-border p-4">
        <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSidebar(!showSidebar)}
            >
              {showSidebar ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
            <div>
              <h1 className="font-bold">{character.name}</h1>
              <p className="text-xs text-muted-foreground">
                {selectedUniverse.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {currentStep && (
              <Badge variant="outline" className="hidden sm:flex">
                Step {heroJourneySteps.indexOf(currentStep) + 1}:{" "}
                {currentStep.name}
              </Badge>
            )}
            {isGenerating && (
              <div className="flex items-center gap-2 text-primary">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Generating story...</span>
              </div>
            )}
            {isConflictRunning && (
              <div className="flex items-center gap-2 text-destructive">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Conflict in progress...</span>
              </div>
            )}
            <SaveLoadMenu />
            <Button variant="outline" size="sm" onClick={resetGame}>
              <RefreshCw className="h-4 w-4 mr-2" />
              New Game
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="absolute top-16 left-0 bottom-0 w-72 bg-card border-r border-border z-10 p-4 overflow-y-auto"
          >
            <h3 className="font-semibold mb-4">Character Stats</h3>
            <div className="space-y-3">
              {selectedUniverse.attributes
                ?.filter((attr) => attr.category === "distributable")
                .map((attr) => (
                  <div key={attr.id} className="p-3 rounded-lg bg-secondary/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{attr.name}</span>
                      <span className="text-lg font-bold text-primary">
                        {character.baseAttributes[attr.id] || 0}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {
                        attr.distributableConfig?.benchmarks.find(
                          (b) =>
                            b.value === (character.baseAttributes[attr.id] || 0)
                        )?.label
                      }
                    </p>
                  </div>
                ))}
            </div>

            <h3 className="font-semibold mt-6 mb-4">Hero's Journey</h3>
            <div className="space-y-2">
              {heroJourneySteps.map((step, index) => (
                <div
                  key={step.id}
                  className={`p-2 rounded text-xs ${
                    step.id === gameState.currentHeroStep
                      ? "bg-primary/20 text-primary"
                      : index <
                        heroJourneySteps.findIndex(
                          (s) => s.id === gameState.currentHeroStep
                        )
                      ? "text-muted-foreground line-through"
                      : "text-muted-foreground/50"
                  }`}
                >
                  {index + 1}. {step.name}
                </div>
              ))}
            </div>

            {/* Conflict Events */}
            {selectedUniverse.conflictEvents &&
              selectedUniverse.conflictEvents.length > 0 && (
                <>
                  <h3 className="font-semibold mt-6 mb-4">
                    Available Conflicts
                  </h3>
                  <div className="space-y-2">
                    {selectedUniverse.conflictEvents.map((conflict) => (
                      <div
                        key={conflict.id}
                        className="p-2 rounded text-xs bg-secondary/30"
                      >
                        {conflict.name}
                      </div>
                    ))}
                  </div>
                </>
              )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Canvas */}
      <div className="absolute inset-0 pt-16">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          nodesDraggable={false}
          nodesConnectable={false}
          nodesFocusable={false}
          edgesFocusable={false}
          elementsSelectable={false}
          fitView
          fitViewOptions={{
            padding: 0.3,
            maxZoom: 0.75,
            minZoom: 0.3,
          }}
          minZoom={0.3}
          maxZoom={2}
          defaultViewport={{ x: 0, y: 0, zoom: 0.75 }}
          proOptions={{ hideAttribution: true }}
        >
          <Background />

          <Panel position="bottom-center" className="m-0! bottom-6!">
            <div className="flex items-center gap-3 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
              <div className="w-80">
                <TimelineScrollbar
                  nodes={gameState?.nodes || []}
                  onSeek={handleScrollbarSeekCallback}
                  currentPositionX={currentScrollPosition}
                />
              </div>

              <AnimatePresence>
                {isWaitingForContinueState && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Button
                      onClick={handleContinueClick}
                      className="group font-mono"
                      variant="default"
                    >
                      Continue
                      <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {useGameStore.getState().activeConflictState?.isComplete && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Button
                      onClick={stopConflict}
                      className="group font-mono"
                      variant="default"
                    >
                      Continue Story
                      <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Panel>

          <Controls className="!bottom-24" />
        </ReactFlow>
      </div>
    </div>
  );
}

export function GameCanvas() {
  return (
    <ReactFlowProvider>
      <GameCanvasInner />
    </ReactFlowProvider>
  );
}
