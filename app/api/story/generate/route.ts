import { NextResponse } from "next/server"
import { heroJourneySteps } from "@/lib/data/hero-journey"
import type { GameEvent, GameOption, HeroJourneyStep } from "@/lib/schemas/game-schema"

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
      { title: "Approach with Confidence", description: "Stand tall and meet their gaze directly, showing no fear." },
      { title: "Observe from Afar", description: "Keep your distance and watch for any signs of danger." },
      { title: "Offer a Greeting", description: "Extend an open hand in peace, hoping to learn their purpose." },
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
      { title: "Take the Sunlit Path", description: "Follow the well-worn road where others have traveled before." },
      { title: "Enter the Dark Woods", description: "Brave the unknown shadows where few dare to venture." },
      { title: "Forge Your Own Way", description: "Cut through the wilderness, making a new path entirely." },
    ],
  },
  {
    beats: [
      {
        title: "Echoes of the Past",
        content: "A memory stirs, unbidden yet powerful. The faces of those you've left behind flash before your eyes.",
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
      { title: "Embrace the Memory", description: "Let the past guide your present decisions and actions." },
      { title: "Push Forward", description: "Leave the past where it belongs and focus on what lies ahead." },
      { title: "Seek Understanding", description: "Meditate on the vision to uncover its deeper meaning." },
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
      { title: "Find Shelter", description: "Seek refuge and wait for the danger to pass." },
      { title: "Press Onward", description: "Challenge the elements and continue your journey despite the odds." },
      { title: "Use the Chaos", description: "Turn the storm to your advantage, letting it mask your movements." },
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
        title: "Trust's Currency",
        content:
          "They extend their hand, waiting. Every instinct screams caution, yet something in their eyes speaks of desperation that mirrors your own.",
      },
    ],
    options: [
      { title: "Accept Their Aid", description: "Take a leap of faith and welcome this potential companion." },
      { title: "Decline Politely", description: "Thank them but continue alone, keeping your suspicions close." },
      { title: "Test Their Loyalty", description: "Propose a small task to prove their intentions before committing." },
    ],
  },
]

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const currentStep: HeroJourneyStep = body.currentHeroStep || "ordinary-world"
    const stepData = heroJourneySteps.find((s) => s.id === currentStep)

    const result = generateDemoContent(currentStep, stepData, body.nodeCount || 0)
    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Story generation error:", error)
    return NextResponse.json(generateDemoContent("ordinary-world", heroJourneySteps[0], 0))
  }
}

function generateDemoContent(step: string, stepData: (typeof heroJourneySteps)[0] | undefined, nodeCount: number) {
  // Use nodeCount to select different story segments for variety
  const segmentIndex = Math.floor(nodeCount / 4) % storySegments.length
  const segment = storySegments[segmentIndex]

  // Create truly unique IDs using timestamp + random suffix
  const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

  // Mix in hero journey step context for the first beat
  const stepExample = stepData?.examples[Math.floor(Math.random() * stepData.examples.length)]

  const events: GameEvent[] = segment.beats.map((beat, index) => ({
    id: `evt-${uniqueId}-${index}`,
    type: "narrative",
    title: index === 0 && stepData ? stepData.name : beat.title,
    content: index === 0 && stepExample ? `${beat.content}\n\n${stepExample}` : beat.content,
    heroJourneyStep: step as HeroJourneyStep,
  }))

  const lastEventId = events[events.length - 1].id

  const options: GameOption[] = segment.options.map((opt, index) => ({
    id: `opt-${uniqueId}-${index}`,
    eventId: lastEventId,
    title: opt.title,
    description: opt.description,
  }))

  return { events, options }
}
