"use client"

import { useRef, useState, useEffect, useCallback } from "react"
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
} from "reactflow"
import "reactflow/dist/style.css"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, RefreshCw, Menu, X, Crosshair } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useGameStore } from "@/lib/store/game-store"
import { EventCard } from "./event-card"
import { OptionCard } from "./option-card"
import { TimelineScrollbar } from "./timeline-scrollbar"
import { heroJourneySteps } from "@/lib/data/hero-journey"
import type { GameEvent, GameOption } from "@/lib/schemas/game-schema"
import useSWRMutation from "swr/mutation"

const EventNode = ({ data }: { data: any }) => {
  return (
    <div className="pointer-events-auto">
      <EventCard
        event={data.event}
        isNew={data.isNew}
        isActive={data.isActive}
        showContinue={data.showContinue}
        onContinue={data.onContinue}
      />
    </div>
  )
}

const OptionNode = ({ data }: { data: any }) => {
  return (
    <div className="pointer-events-auto">
      <OptionCard
        option={data.option}
        onClick={data.onClick}
        selected={data.selected}
        greyedOut={data.greyedOut}
        isNew={data.isNew}
      />
    </div>
  )
}

const nodeTypes = {
  event: EventNode,
  option: OptionNode,
}

async function generateStory(url: string, { arg }: { arg: { gameStateId: string; nodeCount: number } }) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(arg),
  })
  if (!res.ok) throw new Error("Failed to generate story")
  return res.json()
}

function GameCanvasInner() {
  const [showSidebar, setShowSidebar] = useState(false)
  const initialGenerationStarted = useRef(false)
  const handleContinueRef = useRef<() => void>(() => {})
  const handleOptionClickRef = useRef<(optionId: string) => void>(() => {})

  const { fitBounds, setCenter } = useReactFlow()
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  const {
    gameState,
    selectedGenre,
    character,
    isGenerating,
    newNodeIds,
    newConnectionIds,
    selectOption,
    setIsGenerating,
    resetGame,
    clearNewFlags,
    setPendingContent,
    showNextEvent,
  } = useGameStore()

  const { trigger: triggerGeneration } = useSWRMutation("/api/story/generate", generateStory)

  const handleGenerateStory = useCallback(async () => {
    if (!gameState || isGenerating) return

    setIsGenerating(true)
    try {
      const result = await triggerGeneration({
        gameStateId: gameState.id,
        nodeCount: gameState.nodes.length,
      })

      if (result.events && result.options) {
        setPendingContent(result.events, result.options)
        setTimeout(() => {
          showNextEvent()
        }, 100)
      }
    } catch (error) {
      console.error("Failed to generate story:", error)
    } finally {
      setIsGenerating(false)
    }
  }, [gameState, isGenerating, triggerGeneration, setIsGenerating, setPendingContent, showNextEvent])

  const centerOnLastEvent = useCallback(() => {
    if (!gameState) return

    const eventNodes = gameState.nodes.filter((n) => n.type === "event")
    if (eventNodes.length === 0) return

    const lastEvent = eventNodes[eventNodes.length - 1]

    const connectedOptionIds = gameState.connections
      .filter((conn) => conn.fromNodeId === lastEvent.id)
      .map((conn) => conn.toNodeId)

    const connectedOptions = gameState.nodes.filter((n) => n.type === "option" && connectedOptionIds.includes(n.id))

    const EVENT_WIDTH = 320
    const EVENT_HEIGHT = 200
    const OPTION_WIDTH = 280
    const OPTION_HEIGHT = 140

    if (connectedOptions.length > 0) {
      const minX = Math.min(lastEvent.position.x, ...connectedOptions.map((n) => n.position.x))
      const maxX = Math.max(
        lastEvent.position.x + EVENT_WIDTH,
        ...connectedOptions.map((n) => n.position.x + OPTION_WIDTH),
      )
      const minY = Math.min(lastEvent.position.y, ...connectedOptions.map((n) => n.position.y))
      const maxY = Math.max(
        lastEvent.position.y + EVENT_HEIGHT,
        ...connectedOptions.map((n) => n.position.y + OPTION_HEIGHT),
      )

      const padding = 80
      fitBounds(
        {
          x: minX - padding,
          y: minY - padding,
          width: maxX - minX + padding * 2,
          height: maxY - minY + padding * 2,
        },
        { duration: 800 },
      )
    } else {
      const centerX = lastEvent.position.x + EVENT_WIDTH / 2
      const centerY = lastEvent.position.y + EVENT_HEIGHT / 2
      setCenter(centerX, centerY, { zoom: 1, duration: 800 })
    }
  }, [gameState, fitBounds, setCenter])

  const handleContinue = useCallback(() => {
    console.log("[v0] handleContinue called")
    showNextEvent()
    setTimeout(() => {
      centerOnLastEvent()
    }, 200)
  }, [showNextEvent, centerOnLastEvent])

  const handleOptionClick = useCallback(
    (optionId: string) => {
      console.log("[v0] handleOptionClick called:", optionId)
      selectOption(optionId)
      setTimeout(() => {
        handleGenerateStory()
      }, 800)
    },
    [selectOption, handleGenerateStory],
  )

  useEffect(() => {
    handleContinueRef.current = handleContinue
    handleOptionClickRef.current = handleOptionClick
  }, [handleContinue, handleOptionClick])

  useEffect(() => {
    if (!gameState) return

    const eventNodes = gameState.nodes.filter((n) => n.type === "event")
    const lastEventNodeId = eventNodes.length > 0 ? eventNodes[eventNodes.length - 1].id : null
    const activeEventId = gameState.currentEventId || lastEventNodeId
    const isWaitingForContinue = gameState.isWaitingForContinue && (gameState.pendingEvents?.length ?? 0) > 0

    const flowNodes: Node[] = gameState.nodes.map((node) => {
      const isNew = newNodeIds.has(node.id)

      if (node.type === "event") {
        return {
          id: node.id,
          type: "event",
          position: node.position,
          draggable: false,
          selectable: false,
          focusable: false,
          data: {
            event: node.data as GameEvent,
            isNew,
            isActive: node.id === activeEventId,
            showContinue: isWaitingForContinue && node.id === lastEventNodeId,
            onContinue: () => handleContinueRef.current(),
          },
        }
      } else {
        return {
          id: node.id,
          type: "option",
          position: node.position,
          draggable: false,
          selectable: false,
          focusable: false,
          data: {
            option: node.data as GameOption,
            onClick: () => handleOptionClickRef.current(node.id),
            selected: node.selected,
            greyedOut: node.greyedOut,
            isNew,
          },
        }
      }
    })

    const flowEdges: Edge[] = gameState.connections.map((conn) => ({
      id: conn.id,
      source: conn.fromNodeId,
      target: conn.toNodeId,
      animated: conn.active || newConnectionIds.has(conn.id),
      style: {
        stroke: conn.active ? "hsl(var(--primary))" : "hsl(var(--border))",
        strokeWidth: 2,
      },
      type: "smoothstep",
    }))

    setNodes(flowNodes)
    setEdges(flowEdges)
  }, [gameState, newNodeIds, newConnectionIds, setNodes, setEdges])

  const handleScrollbarSeek = useCallback(
    (targetX: number) => {
      setCenter(targetX, 200, { zoom: 1, duration: 800 })
    },
    [setCenter],
  )

  useEffect(() => {
    if (gameState && gameState.nodes.length === 0 && !isGenerating && !initialGenerationStarted.current) {
      initialGenerationStarted.current = true
      handleGenerateStory()
    }
    if (gameState && gameState.nodes.length > 0) {
      initialGenerationStarted.current = false
    }
  }, [gameState])

  useEffect(() => {
    if (newNodeIds.size > 0 || newConnectionIds.size > 0) {
      const timer = setTimeout(() => {
        clearNewFlags()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [newNodeIds, newConnectionIds, clearNewFlags])

  if (!gameState || !selectedGenre || !character) return null

  const currentStep = heroJourneySteps.find((s) => s.id === gameState.currentHeroStep)

  return (
    <div className="fixed inset-0 bg-background overflow-hidden">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-background/80 backdrop-blur-sm border-b border-border p-4">
        <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setShowSidebar(!showSidebar)}>
              {showSidebar ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div>
              <h1 className="font-bold">{character.name}</h1>
              <p className="text-xs text-muted-foreground">{selectedGenre.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {currentStep && (
              <Badge variant="outline" className="hidden sm:flex">
                Step {heroJourneySteps.indexOf(currentStep) + 1}: {currentStep.name}
              </Badge>
            )}
            {isGenerating && (
              <div className="flex items-center gap-2 text-primary">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Generating story...</span>
              </div>
            )}
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
              {selectedGenre.attributes.map((attr) => (
                <div key={attr.id} className="p-3 rounded-lg bg-secondary/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{attr.name}</span>
                    <span className="text-lg font-bold text-primary">{character.attributes[attr.id]}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {attr.benchmarks.find((b) => b.value === character.attributes[attr.id])?.label}
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
                      : index < heroJourneySteps.findIndex((s) => s.id === gameState.currentHeroStep)
                        ? "text-muted-foreground line-through"
                        : "text-muted-foreground/50"
                  }`}
                >
                  {index + 1}. {step.name}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-0 pt-16">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          nodesDraggable={false}
          nodesConnectable={false}
          nodesFocusable={false}
          edgesFocusable={false}
          elementsSelectable={false}
          fitView
          minZoom={0.3}
          maxZoom={2}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          proOptions={{ hideAttribution: true }}
        >
          <Background />

          <Panel position="bottom-center" className="!m-0 !bottom-6">
            <div className="flex items-center gap-3 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
              <div className="w-96">
                <TimelineScrollbar
                  nodes={gameState?.nodes || []}
                  onSeek={handleScrollbarSeek}
                  currentPositionX={gameState?.nodes.filter((n) => n.type === "event").slice(-1)[0]?.position.x || 0}
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={centerOnLastEvent}
                className="shrink-0 bg-transparent"
                title="Center on latest event"
              >
                <Crosshair className="h-4 w-4 mr-2" />
                Center
              </Button>
            </div>
          </Panel>

          <Controls className="!bottom-24" />
        </ReactFlow>
      </div>
    </div>
  )
}

export function GameCanvas() {
  return (
    <ReactFlowProvider>
      <GameCanvasInner />
    </ReactFlowProvider>
  )
}
