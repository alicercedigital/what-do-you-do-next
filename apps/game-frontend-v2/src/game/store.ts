import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Universe, GameState, Character, Card, ActiveChallenge } from "@wdydn/shared"
import { resolveStats } from "@/shared/lib/calc"
import { createChallenge, runRound } from "@/game/engine/engine"

type Phase = "menu" | "select" | "create" | "play"

interface GameStore {
  // Current state
  phase: Phase
  universe: Universe | null
  game: GameState | null
  challenge: ActiveChallenge | null
  isGenerating: boolean

  // Actions
  setPhase: (phase: Phase) => void
  selectUniverse: (universe: Universe) => void
  startGame: (character: Character) => void
  setIsGenerating: (value: boolean) => void

  // Story actions
  addCard: (card: Card) => void
  addCards: (cards: Card[]) => void
  selectChoice: (optionId: string) => void
  updatePhase: (phase: number) => void

  // Challenge actions
  startChallenge: (
    templateId: string,
    enemy: { name: string; stats: Record<string, number>; portrait?: string },
  ) => void
  advanceChallenge: () => void
  endChallenge: () => void

  // Utility
  getResolvedStats: () => Record<string, number>
  reset: () => void
  loadGame: (game: GameState, universe: Universe) => void
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      phase: "menu",
      universe: null,
      game: null,
      challenge: null,
      isGenerating: false,

      setPhase: (phase) => set({ phase }),

      selectUniverse: (universe) => set({ universe, phase: "create" }),

      startGame: (character) => {
        const { universe } = get()
        if (!universe) return

        set({
          phase: "play",
          game: {
            id: crypto.randomUUID(),
            universeId: universe.id,
            character,
            story: [],
            phase: 0,
            challenge: null,
          },
        })
      },

      setIsGenerating: (value) => set({ isGenerating: value }),

      addCard: (card) =>
        set((state) => ({
          game: state.game
            ? {
                ...state.game,
                story: [...state.game.story, card],
              }
            : null,
        })),

      addCards: (cards) =>
        set((state) => ({
          game: state.game
            ? {
                ...state.game,
                story: [...state.game.story, ...cards],
              }
            : null,
        })),

      selectChoice: (optionId) =>
        set((state) => {
          if (!state.game) return state

          const story = state.game.story.map((card) => {
            if (card.type !== "choice") return card
            // Only mark as selected on the last choice card
            const isLastChoice = state.game!.story.filter((c) => c.type === "choice").at(-1)?.id === card.id

            if (!isLastChoice) return card

            return {
              ...card,
              options: card.options.map((opt) => ({
                ...opt,
                selected: opt.id === optionId,
                disabled: opt.id !== optionId,
              })),
            }
          })

          return { game: { ...state.game, story } }
        }),

      updatePhase: (phase) =>
        set((state) => ({
          game: state.game ? { ...state.game, phase } : null,
        })),

      startChallenge: (templateId, enemy) => {
        const { universe, game } = get()
        if (!universe || !game) return

        const template = universe.challenges.find((c) => c.id === templateId)
        if (!template) return

        const playerStats = get().getResolvedStats()

        const challenge = createChallenge(template, {
          player: {
            name: game.character.name,
            stats: playerStats,
          },
          enemy: {
            name: enemy.name,
            stats: enemy.stats,
            portrait: enemy.portrait,
          },
        })

        set({ challenge })

        // Add challenge card to story
        get().addCard({
          id: crypto.randomUUID(),
          type: "challenge",
          challengeId: templateId,
          status: "active",
          timestamp: Date.now(),
        })
      },

      advanceChallenge: () => {
        const { universe, challenge } = get()
        if (!universe || !challenge) return

        const template = universe.challenges.find((c) => c.id === challenge.templateId)
        if (!template) return

        const next = runRound(challenge, template)
        set({ challenge: next })
      },

      endChallenge: () => {
        const { challenge, game } = get()
        if (!challenge || !game) return

        // Apply outcome effects to character if needed
        if (challenge.outcome?.rewards?.statChanges) {
          const newBase = { ...game.character.baseStats }
          for (const change of challenge.outcome.rewards.statChanges) {
            newBase[change.statId] = (newBase[change.statId] ?? 0) + change.amount
          }
          set({
            game: {
              ...game,
              character: { ...game.character, baseStats: newBase },
            },
          })
        }

        // Add outcome card
        if (challenge.outcome) {
          get().addCard({
            id: crypto.randomUUID(),
            type: "outcome",
            title: challenge.outcome.name,
            description: challenge.outcome.description,
            result: challenge.outcome.result,
            rewards: challenge.outcome.rewards?.experience
              ? [`+${challenge.outcome.rewards.experience} XP`]
              : undefined,
            timestamp: Date.now(),
          })
        }

        set({ challenge: null })
      },

      getResolvedStats: () => {
        const { universe, game } = get()
        if (!universe || !game) return {}

        // Calculate equipment bonuses
        const bonuses: Record<string, number> = {}
        for (const itemId of Object.values(game.character.equipment)) {
          if (!itemId) continue
          const item = universe.items.find((i) => i.id === itemId)
          if (!item?.bonuses) continue
          for (const bonus of item.bonuses) {
            bonuses[bonus.statId] = (bonuses[bonus.statId] ?? 0) + bonus.amount
          }
        }

        return resolveStats(universe.stats, game.character.baseStats, bonuses)
      },

      reset: () => set({ phase: "menu", universe: null, game: null, challenge: null }),

      loadGame: (game, universe) =>
        set({
          phase: "play",
          game,
          universe,
          challenge: null,
        }),
    }),
    { name: "rpg-game-v2" },
  ),
)
