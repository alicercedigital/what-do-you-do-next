import { generateText, Output } from "ai";
import { z } from "zod";

// New Stat schema for the API
const StatSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  short: z.string().optional(),
  description: z.string(),
  type: z.enum(["core", "computed"]),
  display: z.object({
    icon: z.string(),
    color: z.string(),
    style: z.enum(["number", "bar"]),
    barColor: z.string().optional(),
    showInCreator: z.boolean().optional(),
    showInSheet: z.boolean().optional(),
    order: z.number().optional(),
  }),
  range: z
    .object({
      min: z.number(),
      max: z.number(),
    })
    .optional(),
  calculation: z.array(z.any()).optional(),
  clamp: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
    })
    .optional(),
});

export async function POST(request: Request) {
  try {
    const { attributeName, genreSetting } = await request.json();

    if (!attributeName || !genreSetting) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { output } = await generateText({
      model: "openai/gpt-4o-mini",
      system: `You are an expert RPG Game Designer.
Attributes are core characteristics that players use to perform actions and Tests (dice rolls).
Your task is to create a complete attribute definition.`,
      prompt: `Create a complete attribute for the name "${attributeName}" in this setting: "${genreSetting}"

Requirements:
1. Provide a clear summary explaining what the attribute represents
2. Make it appropriate for the genre setting
3. Include display configuration (icon, color, style)
4. Set appropriate min/max range (1-20 for core stats)`,
      output: Output.object({
        schema: StatSchema.omit({ id: true }).extend({
          id: StatSchema.shape.id.optional(),
        }),
      }),
    });

    if (!output) {
      return Response.json(
        { error: "Failed to generate attribute" },
        { status: 500 }
      );
    }

    // Add a generated ID
    const attribute = {
      ...output,
      id: crypto.randomUUID(),
    };

    return Response.json({ attribute });
  } catch (error) {
    console.error("Error generating attribute:", error);
    return Response.json(
      { error: "Failed to generate attribute" },
      { status: 500 }
    );
  }
}
