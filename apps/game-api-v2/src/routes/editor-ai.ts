import { Router } from "express";
import { generateText } from "ai";
import { getModel, isAIConfigured } from "../ai/client";

const router = Router();

// Types for generation requests
interface FieldGenerationRequest {
  action: string;
  value: string;
  prompt: string;
  context: Record<string, unknown>;
  entityType: string;
  field: string;
}

interface EntityGenerationRequest {
  universe: {
    name: string;
    theme: string;
    description?: string;
    config?: {
      equipmentSlots?: string[];
    };
  };
  hints: Record<string, unknown>;
  existingEntities: Array<{ id: string; name?: string; title?: string }>;
  stats?: Array<{ id: string; name: string; type: string }>;
}

/**
 * Generate or improve field content
 * POST /api/ai/smart-input
 */
router.post("/smart-input", async (req, res) => {
  try {
    if (!isAIConfigured()) {
      return res.status(503).json({ error: "AI not configured" });
    }

    const { action, value, prompt, context, entityType, field } =
      req.body as FieldGenerationRequest;

    if (!prompt) {
      return res.status(400).json({ error: "prompt is required" });
    }

    const systemPrompt = buildFieldSystemPrompt(entityType, field, context);

    const { text } = await generateText({
      model: getModel(),
      system: systemPrompt,
      prompt: prompt,
      temperature: action === "suggestions" ? 0.9 : 0.7,
      maxTokens: action === "expand" ? 500 : 200,
    });

    return res.json({ result: text.trim() });
  } catch (error) {
    console.error("Field generation failed:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Generation failed",
    });
  }
});

/**
 * Generate a stat
 * POST /api/editor/ai/generate/stat
 */
router.post("/generate/stat", async (req, res) => {
  try {
    if (!isAIConfigured()) {
      return res.status(503).json({ error: "AI not configured" });
    }

    const { universe, hints, existingEntities } = req.body as EntityGenerationRequest;

    const systemPrompt = `You are a game designer creating stats for an interactive fiction universe.
Universe: "${universe.name}"
Theme: ${universe.theme}
${universe.description ? `Description: ${universe.description}` : ""}

Existing stats: ${existingEntities.map((e) => e.name).join(", ") || "None"}

Generate a unique stat that fits this universe. Return ONLY valid JSON matching this structure:
{
  "id": "stat_shortname_xxxx",
  "name": "Display Name",
  "shortName": "SHORT",
  "description": "What this stat represents",
  "type": "${hints.type || "number"}",
  "base": ${hints.type === "boolean" ? "false" : hints.type === "text" ? '""' : "0"},
  ${hints.type === "number" ? '"min": 0,\n  "max": 100,' : ""}
  "color": "#hexcolor"
}`;

    const userPrompt = `Create a ${hints.category || "attribute"} stat.
${hints.hints ? `Additional context: ${hints.hints}` : ""}
Make it unique from existing stats.`;

    const { text } = await generateText({
      model: getModel(),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.8,
      maxTokens: 300,
    });

    const entity = parseJSON(text);
    if (!entity) {
      return res.status(500).json({ error: "Failed to parse generated entity" });
    }

    // Ensure ID is properly formatted
    entity.id = `stat_${slugify(entity.name)}_${randomId()}`;

    return res.json({ entity });
  } catch (error) {
    console.error("Stat generation failed:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Generation failed",
    });
  }
});

/**
 * Generate a character
 * POST /api/editor/ai/generate/character
 */
router.post("/generate/character", async (req, res) => {
  try {
    if (!isAIConfigured()) {
      return res.status(503).json({ error: "AI not configured" });
    }

    const { universe, hints, existingEntities, stats } =
      req.body as EntityGenerationRequest;

    const systemPrompt = `You are a creative writer designing characters for an interactive fiction universe.
Universe: "${universe.name}"
Theme: ${universe.theme}
${universe.description ? `Description: ${universe.description}` : ""}

Existing characters: ${existingEntities.map((e) => e.name).join(", ") || "None"}
Available stats: ${stats?.map((s) => s.name).join(", ") || "None"}

Generate a unique character. Return ONLY valid JSON:
{
  "id": "char_name_xxxx",
  "name": "Character Name",
  "description": "Character background and appearance",
  "isPlayer": false,
  "playable": ${hints.isPlayable || false},
  "personality": {
    "traits": ["trait1", "trait2", "trait3"],
    "values": ["value1", "value2"],
    "fears": ["fear1"],
    "desires": ["desire1", "desire2"]
  },
  "memories": ["A significant memory or background detail"],
  "stats": {},
  "disposition": {}
}`;

    const userPrompt = `Create a ${hints.role || "ally"} character with ${hints.archetype || "unique"} archetype.
${hints.hints ? `Additional context: ${hints.hints}` : ""}
Make them distinct from existing characters.`;

    const { text } = await generateText({
      model: getModel(),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.85,
      maxTokens: 600,
    });

    const entity = parseJSON(text);
    if (!entity) {
      return res.status(500).json({ error: "Failed to parse generated entity" });
    }

    entity.id = `char_${slugify(entity.name)}_${randomId()}`;

    return res.json({ entity });
  } catch (error) {
    console.error("Character generation failed:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Generation failed",
    });
  }
});

/**
 * Generate a location
 * POST /api/editor/ai/generate/location
 */
router.post("/generate/location", async (req, res) => {
  try {
    if (!isAIConfigured()) {
      return res.status(503).json({ error: "AI not configured" });
    }

    const { universe, hints, existingEntities } = req.body as EntityGenerationRequest;

    const connectedLocation = hints.connectedTo
      ? existingEntities.find((e) => e.id === hints.connectedTo)?.name
      : null;

    const systemPrompt = `You are a world builder creating locations for an interactive fiction universe.
Universe: "${universe.name}"
Theme: ${universe.theme}
${universe.description ? `Description: ${universe.description}` : ""}

Existing locations: ${existingEntities.map((e) => e.name).join(", ") || "None"}

Generate a unique location. Return ONLY valid JSON:
{
  "id": "loc_name_xxxx",
  "name": "Location Name",
  "description": "Detailed description of this place",
  "tags": ["tag1", "tag2"],
  "connections": ${hints.connectedTo ? `[{ "targetId": "${hints.connectedTo}", "description": "path description" }]` : "[]"},
  "requirements": []
}`;

    const userPrompt = `Create a ${hints.type || "outdoor"} location with ${hints.mood || "neutral"} mood.
${connectedLocation ? `This location should connect to "${connectedLocation}".` : ""}
${hints.hints ? `Additional context: ${hints.hints}` : ""}`;

    const { text } = await generateText({
      model: getModel(),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.85,
      maxTokens: 500,
    });

    const entity = parseJSON(text);
    if (!entity) {
      return res.status(500).json({ error: "Failed to parse generated entity" });
    }

    entity.id = `loc_${slugify(entity.name)}_${randomId()}`;

    return res.json({ entity });
  } catch (error) {
    console.error("Location generation failed:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Generation failed",
    });
  }
});

/**
 * Generate an item
 * POST /api/editor/ai/generate/item
 */
router.post("/generate/item", async (req, res) => {
  try {
    if (!isAIConfigured()) {
      return res.status(503).json({ error: "AI not configured" });
    }

    const { universe, hints, existingEntities, stats } =
      req.body as EntityGenerationRequest;

    const equipmentSlots = universe.config?.equipmentSlots || [];

    const systemPrompt = `You are a game designer creating items for an interactive fiction universe.
Universe: "${universe.name}"
Theme: ${universe.theme}
${universe.description ? `Description: ${universe.description}` : ""}

Existing items: ${existingEntities.map((e) => e.name).join(", ") || "None"}
Available stats: ${stats?.map((s) => `${s.name} (${s.type})`).join(", ") || "None"}
Equipment slots: ${equipmentSlots.join(", ") || "None defined"}

Generate a unique item. Return ONLY valid JSON:
{
  "id": "item_name_xxxx",
  "name": "Item Name",
  "description": "Item description and lore",
  "kind": "${hints.kind || "equipment"}",
  "rarity": "${hints.rarity || "common"}"${
      hints.kind === "equipment"
        ? `,
  "slot": "${hints.slot || equipmentSlots[0] || ""}",
  "whileEquipped": []`
        : ""
    }${
      hints.kind === "consumable"
        ? `,
  "onUse": [],
  "stackable": true,
  "maxStack": 99`
        : ""
    }
}`;

    const userPrompt = `Create a ${hints.rarity || "common"} ${hints.kind || "equipment"} item for ${hints.purpose || "general use"}.
${hints.slot ? `Equipment slot: ${hints.slot}` : ""}
${hints.hints ? `Additional context: ${hints.hints}` : ""}`;

    const { text } = await generateText({
      model: getModel(),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.85,
      maxTokens: 400,
    });

    const entity = parseJSON(text);
    if (!entity) {
      return res.status(500).json({ error: "Failed to parse generated entity" });
    }

    entity.id = `item_${slugify(entity.name)}_${randomId()}`;

    return res.json({ entity });
  } catch (error) {
    console.error("Item generation failed:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Generation failed",
    });
  }
});

/**
 * Generate a challenge
 * POST /api/editor/ai/generate/challenge
 */
router.post("/generate/challenge", async (req, res) => {
  try {
    if (!isAIConfigured()) {
      return res.status(503).json({ error: "AI not configured" });
    }

    const { universe, hints, existingEntities, stats } =
      req.body as EntityGenerationRequest;

    const systemPrompt = `You are a game designer creating challenges for an interactive fiction universe.
Universe: "${universe.name}"
Theme: ${universe.theme}
${universe.description ? `Description: ${universe.description}` : ""}

Existing challenges: ${existingEntities.map((e) => e.name).join(", ") || "None"}
Available stats: ${stats?.map((s) => s.name).join(", ") || "None"}

Generate a unique challenge. Return ONLY valid JSON:
{
  "id": "challenge_name_xxxx",
  "name": "Challenge Name",
  "description": "What this challenge represents",
  "totalTurns": 5,
  "sides": [{ "id": "player", "name": "Player" }, { "id": "opponent", "name": "Opponent" }],
  "roles": [
    { "id": "role1", "name": "Role Name", "sideId": "player", "statWeights": {} }
  ],
  "roundActions": [],
  "outcomes": [
    { "type": "win", "condition": "player score > opponent score", "consequences": [] },
    { "type": "lose", "condition": "player score <= opponent score", "consequences": [] }
  ]
}`;

    const userPrompt = `Create a ${hints.type || "combat"} challenge with ${hints.difficulty || "normal"} difficulty.
Number of roles: ${hints.roleCount || 2}
${hints.hints ? `Additional context: ${hints.hints}` : ""}`;

    const { text } = await generateText({
      model: getModel(),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.8,
      maxTokens: 800,
    });

    const entity = parseJSON(text);
    if (!entity) {
      return res.status(500).json({ error: "Failed to parse generated entity" });
    }

    entity.id = `challenge_${slugify(entity.name)}_${randomId()}`;

    return res.json({ entity });
  } catch (error) {
    console.error("Challenge generation failed:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Generation failed",
    });
  }
});

/**
 * Generate a moment
 * POST /api/editor/ai/generate/moment
 */
router.post("/generate/moment", async (req, res) => {
  try {
    if (!isAIConfigured()) {
      return res.status(503).json({ error: "AI not configured" });
    }

    const { universe, hints, existingEntities } = req.body as EntityGenerationRequest;

    const systemPrompt = `You are a narrative designer creating story moments for an interactive fiction universe.
Universe: "${universe.name}"
Theme: ${universe.theme}
${universe.description ? `Description: ${universe.description}` : ""}

Existing moments: ${existingEntities.slice(0, 10).map((e) => e.title || e.name).join(", ") || "None"}

Generate a unique moment. Return ONLY valid JSON:
{
  "id": "moment_title_xxxx",
  "title": "Moment Title",
  "preview": "Brief preview text shown as choice",
  "text": "Full narrative text for this moment",
  ${hints.locationId ? `"locationId": "${hints.locationId}",` : ""}
  ${hints.speakerId ? `"speakerId": "${hints.speakerId}",` : ""}
  "urgent": ${hints.isUrgent || false},
  "transitions": {
    "locked": ["$self.status = available when true"],
    "active": ["$self.status = lived"]
  }
}`;

    const userPrompt = `Create a ${hints.type || "story"} moment with ${hints.mood || "neutral"} mood.
${hints.connectTo ? `This moment should flow from or connect to another moment.` : ""}
${hints.hints ? `Additional context: ${hints.hints}` : ""}`;

    const { text } = await generateText({
      model: getModel(),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.85,
      maxTokens: 600,
    });

    const entity = parseJSON(text);
    if (!entity) {
      return res.status(500).json({ error: "Failed to parse generated entity" });
    }

    entity.id = `moment_${slugify(entity.title)}_${randomId()}`;

    return res.json({ entity });
  } catch (error) {
    console.error("Moment generation failed:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Generation failed",
    });
  }
});

// Helper functions

function buildFieldSystemPrompt(
  entityType: string,
  field: string,
  context: Record<string, unknown>
): string {
  const universeInfo = context.universe as { name?: string; theme?: string } | undefined;

  return `You are a creative assistant helping design content for an interactive fiction game.
Universe: "${universeInfo?.name || "Unknown"}"
Theme: ${universeInfo?.theme || "fantasy"}

You are generating content for a ${entityType}'s ${field} field.
Be creative but consistent with the universe's theme.
Keep responses concise and direct - return only the generated content without explanations.`;
}

function parseJSON(text: string): Record<string, unknown> | null {
  try {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : text;

    return JSON.parse(jsonStr.trim());
  } catch {
    // Try to find JSON object in the text
    const objectMatch = text.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      try {
        return JSON.parse(objectMatch[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 20);
}

function randomId(): string {
  return Math.random().toString(36).slice(2, 8);
}

export { router as editorAIRouter };
