/**
 * Central prompt definitions for AI-assisted field generation
 *
 * Each field type has prompts for different actions:
 * - generate: Create new content from scratch
 * - improve: Enhance existing content
 * - expand: Expand brief content into more detail
 * - suggestions: Generate multiple alternatives
 */

export type AIAction = "generate" | "improve" | "expand" | "suggestions";

export interface FieldPrompt {
  generate?: string;
  improve?: string;
  expand?: string;
  suggestions?: string;
}

export interface EntityPrompts {
  [field: string]: FieldPrompt;
}

export const FIELD_PROMPTS: Record<string, EntityPrompts> = {
  // Character field prompts
  character: {
    name: {
      generate: `Generate a character name that fits the universe theme.
Consider the universe's setting, existing characters, and naming conventions.
Return only the name, no explanation.`,
      improve: `Improve this character name to better fit the universe theme and be more memorable.
Current name: {value}
Return only the improved name.`,
      suggestions: `Generate 5 alternative character names that fit the universe theme.
Return one name per line, no numbering or explanation.`,
    },
    description: {
      generate: `Write a character background description for the universe.
Include their role, personality hints, and how they fit into the world.
Keep it to 2-3 paragraphs.`,
      improve: `Improve this character description to be more engaging and detailed.
Current: {value}
Keep the core concept but enhance the writing quality and detail.`,
      expand: `Expand this brief character description into a fuller backstory.
Current: {value}
Add more detail about personality, history, and motivations. 2-3 paragraphs.`,
    },
    traits: {
      generate: `Generate 3-5 personality traits for this character.
Consider their role and description.
Return comma-separated traits (e.g., "brave, stubborn, loyal").`,
      suggestions: `Generate alternative personality trait combinations for this character.
Return 3 different sets of traits, each on a new line.`,
    },
  },

  // Location field prompts
  location: {
    name: {
      generate: `Generate a location name that fits the universe theme.
Consider the universe's setting and existing locations.
Return only the name.`,
      suggestions: `Generate 5 alternative location names that fit the universe theme.
Return one name per line.`,
    },
    description: {
      generate: `Write a vivid description of this location.
Include atmosphere, notable features, and what players might find there.
2-3 paragraphs.`,
      improve: `Improve this location description to be more immersive.
Current: {value}
Enhance sensory details and atmosphere.`,
      expand: `Expand this brief location description into a detailed scene.
Current: {value}
Add more sensory details, atmosphere, and points of interest.`,
    },
  },

  // Item field prompts
  item: {
    name: {
      generate: `Generate an item name that fits the universe theme and item type.
Consider the item's purpose and rarity.
Return only the name.`,
      suggestions: `Generate 5 alternative item names.
Return one name per line.`,
    },
    description: {
      generate: `Write an item description including its appearance and use.
Consider the item kind and rarity for appropriate detail level.
1-2 paragraphs.`,
      improve: `Improve this item description to be more interesting.
Current: {value}
Enhance the description to match the item's rarity.`,
    },
  },

  // Moment field prompts
  moment: {
    title: {
      generate: `Generate a compelling moment title that hints at the scene.
Return only the title, short and evocative.`,
      suggestions: `Generate 5 alternative moment titles.
Return one title per line.`,
    },
    preview: {
      generate: `Write a short preview text for this moment choice.
This appears as a button the player clicks. Should be intriguing and actionable.
One sentence only.`,
    },
    text: {
      generate: `Write the narrative content for this moment.
Use second person ("You..."). Set the scene, describe what happens.
Consider the location and characters on stage.
2-4 paragraphs.`,
      improve: `Improve this moment's narrative writing.
Current: {value}
Enhance the prose while maintaining the story beats.`,
      expand: `Expand this brief moment text into a fuller scene.
Current: {value}
Add more description, atmosphere, and detail. Keep second person.`,
    },
  },

  // Stat field prompts
  stat: {
    name: {
      generate: `Generate a stat name that fits the universe theme.
Consider whether it's an attribute, skill, or resource.
Return only the name.`,
      suggestions: `Generate 5 alternative stat names.
Return one name per line.`,
    },
    description: {
      generate: `Write a brief description of what this stat represents.
One sentence explaining its purpose and effect.`,
    },
  },

  // Challenge field prompts
  challenge: {
    name: {
      generate: `Generate a challenge name that describes the encounter type.
Return only the name.`,
      suggestions: `Generate 5 alternative challenge names.
Return one name per line.`,
    },
    description: {
      generate: `Write a brief description of this challenge type.
Explain what kind of encounter it is and how it plays out.
1-2 sentences.`,
    },
  },
};

/**
 * Get the prompt for a specific field and action
 */
export function getFieldPrompt(
  entityType: string,
  field: string,
  action: AIAction
): string | undefined {
  return FIELD_PROMPTS[entityType]?.[field]?.[action];
}

/**
 * Entity generation prompts (for generating entire entities)
 */
export const ENTITY_GENERATION_PROMPTS = {
  character: `Generate a complete character for this universe.
Include:
- name: A fitting name
- description: Background and role (2 paragraphs)
- personality.traits: 3-5 personality traits
- personality.values: 2-3 core values
- personality.fears: 1-2 fears
- personality.desires: 1-2 desires

Consider the universe theme and existing characters.
Return as JSON matching the Character type.`,

  location: `Generate a complete location for this universe.
Include:
- name: A fitting location name
- description: Detailed description (2-3 paragraphs)

Consider the universe theme and existing locations.
Return as JSON matching the Location type.`,

  item: `Generate a complete item for this universe.
Include:
- name: A fitting item name
- description: What it looks like and does
- kind: equipment, consumable, or object
- rarity: common, uncommon, rare, epic, or legendary

Consider the universe theme and item purpose.
Return as JSON matching the Item type.`,

  stat: `Generate a complete stat definition for this universe.
Include:
- name: The stat name
- type: number, boolean, or text
- base: Default value
- description: What it represents

Consider the universe theme and existing stats.
Return as JSON matching the Stat type.`,

  moment: `Generate a complete story moment for this universe.
Include:
- title: Evocative moment title
- preview: Choice button text (short, actionable)
- text: Narrative content in second person (2-3 paragraphs)
- status: Initial status (usually "hidden" or "locked")

Consider the universe theme and existing moments.
Return as JSON matching the Moment type.`,

  challenge: `Generate a complete challenge template for this universe.
Include:
- name: Challenge name
- description: What kind of encounter
- roles: Array of roles (at least player and one opponent)
- outcomes: Victory and defeat conditions

Consider the universe theme.
Return as JSON matching the Challenge type.`,
};
