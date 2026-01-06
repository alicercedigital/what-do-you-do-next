"use client"

import { useEffect, useCallback } from "react"
import { useGameStore } from "./store"
import { StoryStack } from "./story-stack"
import { CharacterSheet } from "./character-sheet"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw, Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function Game() {
  const {
    universe,
    game,
    challenge,
    isGenerating,
    addCard,
    selectChoice,
    setIsGenerating,
    advanceChallenge,
    endChallenge,
  } = useGameStore()

  // Auto-advance challenge rounds
  useEffect(() => {
    if (!challenge || challenge.outcome) return

    const template = universe?.challenges.find((c) => c.id === challenge.templateId)
    if (!template) return

    const timer = setTimeout(() => {
      advanceChallenge()
    }, template.display.roundDelay)

    return () => clearTimeout(timer)
  }, [challenge, universe, advanceChallenge])

  // End challenge when outcome is reached
  useEffect(() => {
    if (!challenge?.outcome) return

    const timer = setTimeout(() => {
      endChallenge()
    }, 2000)

    return () => clearTimeout(timer)
  }, [challenge?.outcome, endChallenge])

  const handleChoice = useCallback(
    async (optionId: string) => {
      if (!game || !universe) return

      selectChoice(optionId)
      setIsGenerating(true)

      try {
        // Here you would call your AI API to generate the next story beat
        // For now, we'll add a placeholder
        await new Promise((r) => setTimeout(r, 1500))

        addCard({
          id: crypto.randomUUID(),
          type: "story",
          title: "The Story Continues...",
          content:
            "Your choice echoes through the narrative, shaping the world around you. What happens next is yet to be written...",
          timestamp: Date.now(),
        })
      } finally {
        setIsGenerating(false)
      }
    },
    [game, universe, selectChoice, setIsGenerating, addCard],
  )

  const handleContinue = useCallback(async () => {
    if (!game || !universe || isGenerating) return

    setIsGenerating(true)

    try {
      // Generate initial story beat
      await new Promise((r) => setTimeout(r, 1500))

      addCard({
        id: crypto.randomUUID(),
        type: "story",
        title: "A New Beginning",
        content: `${game.character.name} sets forth on their journey. The ${universe.theme} world awaits, full of mystery and adventure.`,
        timestamp: Date.now(),
      })

      addCard({
        id: crypto.randomUUID(),
        type: "choice",
        prompt: "How do you begin your adventure?",
        options: [
          { id: "explore", text: "Explore the area", description: "Look around and gather information" },
          { id: "talk", text: "Talk to nearby people", description: "Seek out locals for guidance" },
          { id: "action", text: "Take immediate action", description: "Jump straight into adventure" },
        ],
        timestamp: Date.now(),
      })
    } finally {
      setIsGenerating(false)
    }
  }, [game, universe, isGenerating, setIsGenerating, addCard])

  if (!universe || !game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">No game loaded</p>
      </div>
    )
  }

  const hasStory = game.story.length > 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center justify-between p-4 max-w-4xl mx-auto">
          <div>
            <h1 className="font-bold">{universe.name}</h1>
            <p className="text-xs text-muted-foreground">
              {game.character.name} - Level {game.character.level}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isGenerating && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <CharacterSheet universe={universe} character={game.character} />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-24">
        {!hasStory ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Ready to Begin?</h2>
              <p className="text-muted-foreground">Your adventure in {universe.name} awaits.</p>
            </div>
            <Button onClick={handleContinue} disabled={isGenerating} size="lg">
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Start Adventure
                </>
              )}
            </Button>
          </div>
        ) : (
          <StoryStack cards={game.story} onChoice={handleChoice} />
        )}
      </main>

      {/* Continue Button (when last card is not a choice) */}
      {hasStory && !isGenerating && game.story.at(-1)?.type !== "choice" && !challenge && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background to-transparent">
          <div className="max-w-2xl mx-auto">
            <Button onClick={handleContinue} className="w-full" size="lg">
              Continue Story
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
