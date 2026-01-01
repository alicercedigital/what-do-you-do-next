import { generateText, Output } from "ai"
import { GameGenreSchema } from "@/lib/schemas/game-schema"

export async function POST(request: Request) {
  try {
    const { genreName, genreTheme } = await request.json()

    if (!genreName) {
      return Response.json({ error: "Missing genre name" }, { status: 400 })
    }

    const themeContext = genreTheme ? `\n\nAdditional context: ${genreTheme}` : ""

    const { output } = await generateText({
      model: "openai/gpt-4o-mini",
      system: `You are an expert RPG Game Designer creating immersive game genres.
Your task is to create a complete game genre with description, setting, and 4 core attributes.
Each attribute must have exactly 5 benchmark levels showing clear progression.`,
      prompt: `Create a complete RPG game genre for: "${genreName}"${themeContext}

Requirements:

1. **Description**: 1-2 sentences explaining the genre and what makes it unique
2. **Setting**: 2-3 sentences describing the world, time period, and atmosphere
3. **Attributes**: Exactly 4 core attributes that define characters in this genre
   - Each attribute needs a name, summary, and 5 benchmarks (values 1-5)
   - Benchmark labels should show progression (e.g., Novice → Expert → Master)
   - Descriptions should be concrete and specific to the genre
   - Attributes should be diverse and cover different aspects of gameplay

Make it creative, engaging, and appropriate for the genre concept.`,
      output: Output.object({
        schema: GameGenreSchema.omit({ id: true }).extend({
          id: GameGenreSchema.shape.id.optional(),
        }),
      }),
    })

    if (!output) {
      return Response.json({ error: "Failed to generate genre" }, { status: 500 })
    }

    // Add a generated ID
    const genre = {
      ...output,
      id: crypto.randomUUID(),
    }

    return Response.json({ genre })
  } catch (error) {
    console.error("Error generating genre:", error)
    return Response.json({ error: "Failed to generate genre" }, { status: 500 })
  }
}
