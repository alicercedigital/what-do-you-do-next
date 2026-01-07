import { Router } from "express";
import { generateText, Output } from "ai";
import { z } from "zod";
import type { GenerateBenchmarksRequest } from "@wdydn/shared";

export const attributesBenchmarksRouter = Router();

const BenchmarkSchema = z.object({
  value: z.number(),
  label: z.string(),
  description: z.string(),
});

const BenchmarksSchema = z.object({
  benchmarks: z.array(BenchmarkSchema),
});

attributesBenchmarksRouter.post("/generate-benchmarks", async (req, res) => {
  try {
    const body = req.body as GenerateBenchmarksRequest;
    const { attributeName, attributeSummary, genreSetting } = body;

    if (!attributeName || !attributeSummary || !genreSetting) {
      return res.status(400).json({ error: "Missing required fields" });
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
    });

    if (!output?.benchmarks) {
      return res.status(500).json({ error: "Failed to generate benchmarks" });
    }

    return res.json({ benchmarks: output.benchmarks });
  } catch (error) {
    console.error("Error generating benchmarks:", error);
    return res.status(500).json({ error: "Failed to generate benchmarks" });
  }
});
