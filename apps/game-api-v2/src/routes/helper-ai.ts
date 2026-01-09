import { Router } from "express";
import { generateText } from "ai";
import { getModel, isAIConfigured } from "../ai/client";

const router = Router();

type HelperStep =
  | "core-idea"
  | "world-rules"
  | "places"
  | "characters"
  | "things"
  | "first-moments";

interface SuggestionsRequest {
  step: HelperStep;
  universe?: {
    name: string;
    theme: string;
    description?: string;
  };
  existingOptions?: string[];
  currentSelections?: string[];
  regenerateMode?: string;
}

interface RegenerateOptionsRequest {
  step: HelperStep;
  currentSelections: string[];
  universe?: {
    name: string;
    theme: string;
  };
}

interface GenerateContentRequest {
  step: HelperStep;
  selections: string[];
  freeformText: string;
  universe: {
    id: string;
    name: string;
    theme: string;
    description?: string;
    genres?: string[];
    stats?: Array<{ id: string; name: string }>;
    characters?: Array<{ id: string; name: string }>;
    locations?: Array<{ id: string; name: string }>;
    items?: Array<{ id: string; name: string }>;
    moments?: Array<{ id: string; title: string }>;
  };
}

/**
 * Generate suggestion options for a helper step
 * POST /api/editor/ai/helper/suggestions
 */
router.post("/suggestions", async (req, res) => {
  try {
    if (!isAIConfigured()) {
      return res.status(503).json({ error: "AI not configured" });
    }

    const {
      step,
      universe,
      existingOptions = [],
      currentSelections = [],
      regenerateMode,
    } = req.body as SuggestionsRequest;

    const systemPrompt = buildSuggestionsSystemPrompt(step, universe);
    const userPrompt = buildSuggestionsUserPrompt(
      step,
      existingOptions,
      currentSelections,
      regenerateMode
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const model = getModel() as any;
    const { text } = await generateText({
      model,
      prompt: `${systemPrompt}\n\n${userPrompt}`,
      maxOutputTokens: 500,
      temperature: 0.9,
    });

    const suggestions = parseSuggestions(text);

    return res.json({ suggestions });
  } catch (error) {
    console.error("Suggestions generation failed:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Generation failed",
    });
  }
});

/**
 * Generate contextual regenerate options
 * POST /api/editor/ai/helper/regenerate-options
 */
router.post("/regenerate-options", async (req, res) => {
  try {
    if (!isAIConfigured()) {
      return res.status(503).json({ error: "AI not configured" });
    }

    const { step, currentSelections, universe } =
      req.body as RegenerateOptionsRequest;

    if (currentSelections.length === 0) {
      return res.json({ options: [] });
    }

    const systemPrompt = `You are helping a user create an interactive fiction universe.
They are on the "${getStepName(step)}" step and have selected: ${currentSelections.join(", ")}.
${universe ? `Universe: "${universe.name}" (${universe.theme})` : ""}

Generate 2-3 short regeneration suggestions based on their selections.
These should be alternative directions or refinements, like "Darker tone", "More magical", "Add mystery elements".

Return ONLY a JSON array of objects: [{"id": "short-id", "label": "Short Label"}]
Keep labels to 2-3 words maximum.`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const model = getModel() as any;
    const { text } = await generateText({
      model,
      prompt: `${systemPrompt}\n\nGenerate regeneration suggestions.`,
      maxOutputTokens: 200,
      temperature: 0.8,
    });

    const options = parseJsonArray(text);

    return res.json({ options });
  } catch (error) {
    console.error("Regenerate options generation failed:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Generation failed",
    });
  }
});

/**
 * Generate actual content for the universe
 * POST /api/editor/ai/helper/generate-content
 */
router.post("/generate-content", async (req, res) => {
  try {
    if (!isAIConfigured()) {
      return res.status(503).json({ error: "AI not configured" });
    }

    const { step, selections, freeformText, universe } =
      req.body as GenerateContentRequest;

    const systemPrompt = buildContentSystemPrompt(step, universe);
    const userPrompt = buildContentUserPrompt(step, selections, freeformText);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const model = getModel() as any;
    const { text } = await generateText({
      model,
      prompt: `${systemPrompt}\n\n${userPrompt}`,
      maxOutputTokens: 2000,
      temperature: 0.7,
    });

    const content = parseGeneratedContent(step, text);

    return res.json(content);
  } catch (error) {
    console.error("Content generation failed:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Generation failed",
    });
  }
});

// Helper functions

function getStepName(step: HelperStep): string {
  const names: Record<HelperStep, string> = {
    "core-idea": "Core Idea",
    "world-rules": "World Rules",
    places: "Places",
    characters: "Characters",
    things: "Things",
    "first-moments": "First Moments",
  };
  return names[step] || step;
}

function buildSuggestionsSystemPrompt(
  step: HelperStep,
  universe?: SuggestionsRequest["universe"]
): string {
  const baseContext = universe
    ? `You are helping create content for an interactive fiction universe called "${universe.name}".
Theme: ${universe.theme}
${universe.description ? `Description: ${universe.description}` : ""}`
    : "You are helping create content for a new interactive fiction universe.";

  const stepInstructions: Record<HelperStep, string> = {
    "core-idea": `Generate creative genre and theme suggestions for the universe.
Include unique combinations and twists on classic genres.
Examples: "Dark Fantasy", "Sci-Fi Noir", "Cozy Mystery", "Apocalyptic Romance"`,
    "world-rules": `Generate game stat and mechanic suggestions.
Include both standard RPG stats and unique thematic ones.
Examples: "Sanity", "Reputation", "Magic Power", "Street Cred", "Karma"`,
    places: `Generate location suggestions that fit the universe theme.
Include both common and unique locations.
Examples: "Haunted Library", "Underground Market", "Crystal Caves", "Floating City"`,
    characters: `Generate NPC archetype suggestions.
Include a mix of roles and personality types.
Examples: "Mysterious Mentor", "Reluctant Ally", "Charming Trickster", "Vengeful Noble"`,
    things: `Generate item suggestions that fit the universe.
Include equipment, consumables, and unique artifacts.
Examples: "Ancient Sword", "Healing Potion", "Mysterious Map", "Cursed Amulet"`,
    "first-moments": `Generate opening scenario suggestions.
These should be compelling hooks to start the adventure.
Examples: "Mysterious Letter", "Strange Discovery", "Unexpected Inheritance", "Wrong Place, Wrong Time"`,
  };

  return `${baseContext}

${stepInstructions[step]}

Return suggestions as a JSON array: [{"id": "short-id", "label": "Display Name", "description": "Brief description"}]
Generate 6-10 unique suggestions.`;
}

function buildSuggestionsUserPrompt(
  step: HelperStep,
  existingOptions: string[],
  currentSelections: string[],
  regenerateMode?: string
): string {
  let prompt = `Generate ${getStepName(step)} suggestions.`;

  if (existingOptions.length > 0) {
    prompt += `\nAvoid these existing options: ${existingOptions.join(", ")}`;
  }

  if (currentSelections.length > 0) {
    prompt += `\nUser has selected: ${currentSelections.join(", ")}. Generate complementary options.`;
  }

  if (regenerateMode) {
    const modeInstructions: Record<string, string> = {
      "totally-different": "Generate completely different, unexpected options.",
      "more-specific":
        "Generate more specific, detailed variations of the theme.",
      simpler: "Generate simpler, more accessible options.",
      "more-of-these":
        "Generate more options in the same style as the selections.",
    };
    prompt += `\n${modeInstructions[regenerateMode] || `Focus on: ${regenerateMode}`}`;
  }

  return prompt;
}

function buildContentSystemPrompt(
  step: HelperStep,
  universe: GenerateContentRequest["universe"]
): string {
  const existingContext = [];
  if (universe.stats?.length) {
    existingContext.push(
      `Existing stats: ${universe.stats.map((s) => s.name).join(", ")}`
    );
  }
  if (universe.characters?.length) {
    existingContext.push(
      `Existing characters: ${universe.characters.map((c) => c.name).join(", ")}`
    );
  }
  if (universe.locations?.length) {
    existingContext.push(
      `Existing locations: ${universe.locations.map((l) => l.name).join(", ")}`
    );
  }

  const stepSchemas: Record<HelperStep, string> = {
    "core-idea": `Generate universe metadata. Return JSON:
{
  "name": "Universe Name",
  "theme": "Brief theme description",
  "description": "2-3 sentence universe description",
  "genres": ["genre1", "genre2"]
}`,
    "world-rules": `Generate game stats. Return JSON:
{
  "stats": [
    {
      "id": "stat_name_xxxx",
      "name": "Stat Name",
      "shortName": "STAT",
      "description": "What this stat represents",
      "type": "number",
      "base": 50,
      "min": 0,
      "max": 100,
      "color": "#hexcolor"
    }
  ]
}`,
    places: `Generate locations. Return JSON:
{
  "locations": [
    {
      "id": "loc_name_xxxx",
      "name": "Location Name",
      "description": "2-3 sentence description",
      "tags": ["tag1", "tag2"]
    }
  ]
}`,
    characters: `Generate characters. Return JSON:
{
  "characters": [
    {
      "id": "char_name_xxxx",
      "name": "Character Name",
      "description": "2-3 sentence description",
      "role": "ally|antagonist|neutral|merchant|quest-giver",
      "isPlayable": false,
      "stats": {},
      "values": ["value1"],
      "fears": ["fear1"],
      "desires": ["desire1"]
    }
  ]
}`,
    things: `Generate items. Return JSON:
{
  "items": [
    {
      "id": "item_name_xxxx",
      "name": "Item Name",
      "description": "Brief description",
      "type": "equipment|consumable",
      "rarity": "common|uncommon|rare|legendary",
      "effects": []
    }
  ]
}`,
    "first-moments": `Generate opening moments. Return JSON:
{
  "moments": [
    {
      "id": "moment_name_xxxx",
      "title": "Moment Title",
      "text": "2-3 paragraphs of narrative in second person",
      "preview": "Brief teaser shown as choice",
      "status": "available",
      "transitions": {
        "active": ["$self.status = lived"]
      }
    }
  ]
}`,
  };

  return `You are generating content for an interactive fiction universe.
Universe: "${universe.name}"
Theme: ${universe.theme}
${universe.description ? `Description: ${universe.description}` : ""}
${universe.genres?.length ? `Genres: ${universe.genres.join(", ")}` : ""}
${existingContext.join("\n")}

${stepSchemas[step]}

Generate unique content that fits the universe theme. Be creative and specific.
Return ONLY valid JSON, no markdown or explanation.`;
}

function buildContentUserPrompt(
  step: HelperStep,
  selections: string[],
  freeformText: string
): string {
  let prompt = `Generate ${getStepName(step)} content based on:`;

  if (selections.length > 0) {
    prompt += `\nSelected options: ${selections.join(", ")}`;
  }

  if (freeformText.trim()) {
    prompt += `\nUser description: "${freeformText}"`;
  }

  prompt += "\n\nCreate content that incorporates all of these elements.";

  return prompt;
}

function parseSuggestions(
  text: string
): Array<{ id: string; label: string; description?: string }> {
  try {
    // Try to extract JSON array from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch {
    console.error("Failed to parse suggestions:", text);
    return [];
  }
}

function parseJsonArray(text: string): Array<{ id: string; label: string }> {
  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch {
    console.error("Failed to parse JSON array:", text);
    return [];
  }
}

function parseGeneratedContent(
  step: HelperStep,
  text: string
): Record<string, unknown> {
  try {
    // Try to extract JSON object from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);

      // Generate unique IDs if not provided
      const generateId = (prefix: string, name: string) => {
        const slug = name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "_")
          .slice(0, 20);
        const random = Math.random().toString(36).slice(2, 6);
        return `${prefix}_${slug}_${random}`;
      };

      // Process based on step type
      if (parsed.stats) {
        parsed.stats = parsed.stats.map(
          (s: { id?: string; name: string }) => ({
            ...s,
            id: s.id || generateId("stat", s.name),
          })
        );
      }
      if (parsed.characters) {
        parsed.characters = parsed.characters.map(
          (c: { id?: string; name: string }) => ({
            ...c,
            id: c.id || generateId("char", c.name),
          })
        );
      }
      if (parsed.locations) {
        parsed.locations = parsed.locations.map(
          (l: { id?: string; name: string }) => ({
            ...l,
            id: l.id || generateId("loc", l.name),
          })
        );
      }
      if (parsed.items) {
        parsed.items = parsed.items.map(
          (i: { id?: string; name: string }) => ({
            ...i,
            id: i.id || generateId("item", i.name),
          })
        );
      }
      if (parsed.moments) {
        parsed.moments = parsed.moments.map(
          (m: { id?: string; title: string }) => ({
            ...m,
            id: m.id || generateId("moment", m.title),
          })
        );
      }

      return parsed;
    }
    return {};
  } catch (error) {
    console.error("Failed to parse generated content:", text, error);
    return {};
  }
}

export { router as helperAIRouter };
