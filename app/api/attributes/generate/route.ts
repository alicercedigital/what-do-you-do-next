import { generateText, Output } from "ai"
import { GameAttributeSchema } from "@/lib/schemas/game-schema"

export async function POST(request: Request) {
  try {
    const { attributeName, genreSetting } = await request.json()

    if (!attributeName || !genreSetting) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { output } = await generateText({
      model: "openai/gpt-4o-mini",
      system: `You are an expert RPG Game Designer.
Attributes are core characteristics that players use to perform actions and Tests (dice rolls).
Your task is to create a complete attribute definition with 5 benchmark levels.`,
      prompt: `Create a complete attribute for the name "${attributeName}" in this setting: "${genreSetting}"

Requirements:
1. Provide a clear summary explaining what the attribute represents
2. Create exactly 5 benchmarks with values 1-5
3. Each benchmark must have:
   - A progressive label (e.g., Novice → Apprentice → Adept → Expert → Master)
   - A concrete description of capabilities at that level
4. Benchmarks should show clear progression from low to high
5. Make it appropriate for the genre setting`,
      output: Output.object({
        schema: GameAttributeSchema.omit({ id: true }).extend({
          id: GameAttributeSchema.shape.id.optional(),
        }),
      }),
    })

    if (!output) {
      return Response.json({ error: "Failed to generate attribute" }, { status: 500 })
    }

    // Add a generated ID
    const attribute = {
      ...output,
      id: crypto.randomUUID(),
    }

    return Response.json({ attribute })
  } catch (error) {
    console.error("Error generating attribute:", error)
    return Response.json({ error: "Failed to generate attribute" }, { status: 500 })
  }
}
