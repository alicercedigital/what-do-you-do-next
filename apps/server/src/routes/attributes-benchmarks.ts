import { Hono } from "hono"
import { generateText, Output } from "ai"
import { z } from "zod"
import type { GenerateBenchmarksRequest } from "@wdydn/shared"

export const attributesBenchmarks = new Hono()

const BenchmarkSchema = z.object({
  value: z.number(),
  label: z.string(),
  description: z.string(),
})

const BenchmarksSchema = z.object({
  benchmarks: z.array(BenchmarkSchema),
})

attributesBenchmarks.post("/generate-benchmarks", async (c) => {
  try {
    const body = await c.req.json<GenerateBenchmarksRequest>()
    const { attributeName, attributeSummary, genreSetting } = body

    if (!attributeName || !attributeSummary || !genreSetting) {
      return c.json({ error: "Missing required fields" }, 400)
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
        schema: BenchmarksSchema,
      }),
    })

    if (!output?.benchmarks) {
      return c.json({ error: "Failed to generate benchmarks" }, 500)
    }

    return c.json({ benchmarks: output.benchmarks })
  } catch (error) {
    console.error("Error generating benchmarks:", error)
    return c.json({ error: "Failed to generate benchmarks" }, 500)
  }
})
