import { generateText, Output } from "ai"
import { GameAttributeSchema } from "@/lib/schemas/game-schema"

export async function POST(request: Request) {
  try {
    const { attributeName, attributeSummary, genreSetting } = await request.json()

    if (!attributeName || !attributeSummary || !genreSetting) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { output } = await generateText({
      model: "openai/gpt-4o-mini",
      system: `You are an expert RPG Game Designer.
Benchmarks help the Game Master gauge difficulty and interpret roll results.
Your task is to create 5 progressive benchmark levels for an attribute.`,
      prompt: `Generate exactly 5 benchmarks for this attribute:

**Attribute**: ${attributeName}  
**Summary**: ${attributeSummary}  
**Setting**: ${genreSetting}

### DISCRETE SCALE
Generate exactly **5 benchmarks** with values: 1, 2, 3, 4, 5.

Requirements:
- Each MUST have a progressive label (e.g., Novice → Apprentice → Adept → Expert → Master)
- Descriptions are static text describing concrete capabilities
- Show clear progression from beginner to legendary levels
- Make it appropriate for the genre setting`,
      output: Output.object({
        schema: GameAttributeSchema.pick({ benchmarks: true }),
      }),
    })

    if (!output?.benchmarks) {
      return Response.json({ error: "Failed to generate benchmarks" }, { status: 500 })
    }

    return Response.json({ benchmarks: output.benchmarks })
  } catch (error) {
    console.error("Error generating benchmarks:", error)
    return Response.json({ error: "Failed to generate benchmarks" }, { status: 500 })
  }
}
