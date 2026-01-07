import { Hono } from "hono"
import type { StoryCard, ChoiceCard, StoryGenerateRequest } from "@wdydn/shared"

export const storyGenerate = new Hono()

const storySegments = [
  {
    beats: [
      {
        title: "A Fateful Encounter",
        content:
          "The air grows thick with tension as an unexpected figure emerges from the shadows. Their eyes hold secrets that could change everything you thought you knew about your journey.",
      },
      {
        title: "Words Unspoken",
        content:
          "The stranger pauses, studying you with an intensity that makes your skin prickle. When they finally speak, their voice carries the weight of ages.",
      },
      {
        title: "The Revelation",
        content:
          '"I have watched you from afar," they say, "and I know what you seek. But the path ahead is treacherous, and not all who walk it return unchanged."',
      },
    ],
    options: [
      {
        title: "Approach with Confidence",
        description:
          "Stand tall and meet their gaze directly, showing no fear.",
        hasTest: true,
        difficulty: 12,
      },
      {
        title: "Observe from Afar",
        description: "Keep your distance and watch for any signs of danger.",
      },
      {
        title: "Offer a Greeting",
        description:
          "Extend an open hand in peace, hoping to learn their purpose.",
      },
    ],
  },
  {
    beats: [
      {
        title: "The Crossroads",
        content:
          "Before you lies a choice that will define your path. Two roads diverge, each whispering promises of different destinies.",
      },
      {
        title: "Echoes of Warning",
        content:
          "Ancient markers line the roadside, their inscriptions worn but still legible. They speak of those who came before—some who triumphed, others who vanished into legend.",
      },
      {
        title: "The Weight of Choice",
        content:
          "The wind carries whispers from both directions. One promises safety but mediocrity. The other offers glory at the risk of everything you hold dear.",
      },
    ],
    options: [
      {
        title: "Take the Sunlit Path",
        description:
          "Follow the well-worn road where others have traveled before.",
      },
      {
        title: "Enter the Dark Woods",
        description: "Brave the unknown shadows where few dare to venture.",
        hasTest: true,
        difficulty: 15,
      },
      {
        title: "Forge Your Own Way",
        description: "Cut through the wilderness, making a new path entirely.",
      },
    ],
  },
  {
    beats: [
      {
        title: "Echoes of the Past",
        content:
          "A memory stirs, unbidden yet powerful. The faces of those you've left behind flash before your eyes.",
      },
      {
        title: "Voices from Memory",
        content:
          "You hear them speaking—words of encouragement, warnings unheeded, promises made and broken. Each voice carries a lesson you're only now beginning to understand.",
      },
      {
        title: "The Present Awakens",
        content:
          "The vision fades, but its meaning remains crystal clear. What you do next will honor those memories—or betray them entirely.",
      },
    ],
    options: [
      {
        title: "Embrace the Memory",
        description: "Let the past guide your present decisions and actions.",
      },
      {
        title: "Push Forward",
        description:
          "Leave the past where it belongs and focus on what lies ahead.",
      },
      {
        title: "Seek Understanding",
        description: "Meditate on the vision to uncover its deeper meaning.",
        hasTest: true,
        difficulty: 10,
      },
    ],
  },
  {
    beats: [
      {
        title: "The Rising Storm",
        content:
          "Dark clouds gather on the horizon as nature itself seems to mirror the turmoil ahead. Lightning splits the sky in the distance.",
      },
      {
        title: "Elements Unleashed",
        content:
          "The first drops of rain fall like omens, each one cold against your skin. Thunder rumbles, growing closer with each heartbeat.",
      },
      {
        title: "The Tempest Arrives",
        content:
          "The full fury of the storm breaks upon you. In this chaos, you must decide—flee, fight, or find another way entirely.",
      },
    ],
    options: [
      {
        title: "Find Shelter",
        description: "Seek refuge and wait for the danger to pass.",
      },
      {
        title: "Press Onward",
        description:
          "Challenge the elements and continue your journey despite the odds.",
        hasTest: true,
        difficulty: 18,
      },
      {
        title: "Use the Chaos",
        description:
          "Turn the storm to your advantage, letting it mask your movements.",
      },
    ],
  },
  {
    beats: [
      {
        title: "An Unexpected Ally",
        content:
          "From the most unlikely of places, a figure approaches. Their manner suggests neither friend nor foe, but something in between.",
      },
      {
        title: "The Proposition",
        content:
          '"We share a common enemy," they say, their voice barely above a whisper. "Apart, we will surely fail. Together... perhaps we have a chance."',
      },
      {
        title: "Trust\'s Currency",
        content:
          "They extend their hand, waiting. Every instinct screams caution, yet something in their eyes speaks of desperation that mirrors your own.",
      },
    ],
    options: [
      {
        title: "Accept Their Aid",
        description:
          "Take a leap of faith and welcome this potential companion.",
      },
      {
        title: "Decline Politely",
        description:
          "Thank them but continue alone, keeping your suspicions close.",
      },
      {
        title: "Test Their Loyalty",
        description:
          "Propose a small task to prove their intentions before committing.",
        hasTest: true,
        difficulty: 14,
      },
    ],
  },
  {
    beats: [
      {
        title: "Shadows in the Mist",
        content:
          "The path ahead narrows as an unnatural fog rolls in. Through the haze, you glimpse movement—something large, something hungry.",
      },
      {
        title: "The Creature Emerges",
        content:
          "A guttural growl cuts through the silence. From the mist emerges a twisted figure, its eyes gleaming with malevolent intelligence. There is no reasoning with this beast.",
      },
      {
        title: "Battle Begins",
        content:
          "The creature lunges! You have no choice but to fight for your survival. Steel your nerves and prepare for combat.",
      },
    ],
    options: [
      {
        title: "Aggressive Assault",
        description:
          "Strike first and strike hard, overwhelming your foe with ferocity.",
      },
      {
        title: "Defensive Stance",
        description: "Weather the initial assault and look for an opening.",
      },
      {
        title: "Attempt to Flee",
        description:
          "Try to escape into the fog before the creature can attack.",
        hasTest: true,
        difficulty: 16,
      },
    ],
  },
]

function generateDemoContent(
  step: string,
  stepData: { name: string; examples: string[] } | undefined,
  nodeCount: number
) {
  const segmentIndex = Math.floor(nodeCount / 4) % storySegments.length
  const segment = storySegments[segmentIndex]

  const uniqueId = `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 9)}`

  const stepExample =
    stepData?.examples[Math.floor(Math.random() * stepData.examples.length)]

  const events: StoryCard[] = segment.beats.map((beat, index) => {
    return {
      id: `evt-${uniqueId}-${index}`,
      type: "story" as const,
      title: index === 0 && stepData ? stepData.name : beat.title,
      content:
        index === 0 && stepExample
          ? `${beat.content}\n\n${stepExample}`
          : beat.content,
      timestamp: Date.now(),
    }
  })

  const choiceCard: ChoiceCard = {
    id: `choice-${uniqueId}`,
    type: "choice" as const,
    prompt: "What do you do?",
    options: segment.options.map((opt, index) => {
      const option: {
        id: string
        text: string
        description?: string
        skillCheck?: {
          statId: string
          difficulty: number
        }
      } = {
        id: `opt-${uniqueId}-${index}`,
        text: opt.title,
        description: opt.description,
      }

      if (opt.hasTest && opt.difficulty) {
        option.skillCheck = {
          statId: "strength",
          difficulty: opt.difficulty,
        }
      }

      return option
    }),
    timestamp: Date.now(),
  }

  return { events: [...events, choiceCard] }
}

storyGenerate.post("/generate", async (c) => {
  try {
    const body = await c.req.json<StoryGenerateRequest>()
    const currentStep = body.currentHeroStep || "ordinary-world"

    const result = generateDemoContent(currentStep, undefined, body.nodeCount || 0)
    return c.json(result)
  } catch (error) {
    console.error("[Server] Story generation error:", error)
    return c.json(generateDemoContent("ordinary-world", undefined, 0))
  }
})
