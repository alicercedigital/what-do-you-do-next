/**
 * Centralized AI prompt templates for smart input generation
 */

export interface AIContext {
  universeName?: string;
  setting?: string;
  itemType?: string;
  rarity?: string;
  attributeCategory?: string;
  existingAttributes?: string[];
}

export function buildContextString(context: AIContext): string {
  const parts: string[] = [];

  if (context.universeName) {
    parts.push(`Universe: ${context.universeName}`);
  }
  if (context.setting) {
    parts.push(`Setting: ${context.setting}`);
  }
  if (context.itemType) {
    parts.push(`Item Type: ${context.itemType}`);
  }
  if (context.rarity) {
    parts.push(`Rarity: ${context.rarity}`);
  }
  if (context.attributeCategory) {
    parts.push(`Attribute Category: ${context.attributeCategory}`);
  }
  if (context.existingAttributes && Array.isArray(context.existingAttributes)) {
    parts.push(`Existing Attributes: ${context.existingAttributes.join(", ")}`);
  }

  return parts.length > 0 ? `\nContext:\n${parts.join("\n")}` : "";
}

export function buildGeneratePrompt(
  fieldType: string,
  context: AIContext
): string {
  const baseContext = buildContextString(context);

  switch (fieldType) {
    case "universe-name":
      return `Generate a creative and evocative name for an RPG game universe. ${baseContext}
      
Requirements:
- The name should be memorable and unique
- It should hint at the genre/setting if provided
- Keep it concise (1-4 words)

Respond with ONLY the name, no explanation.`;

    case "universe-description":
      return `Generate a compelling description for an RPG game universe. ${baseContext}

Requirements:
- Write 2-3 sentences that capture the essence of the world
- Include key themes, conflicts, or unique elements
- Make it engaging and evocative

Respond with ONLY the description, no additional commentary.`;

    case "attribute-name":
      return `Generate a creative attribute name for an RPG game. ${baseContext}

Requirements:
- The name should be clear and descriptive
- It should fit the universe's theme/setting
- Keep it to 1-2 words

Respond with ONLY the attribute name.`;

    case "attribute-summary":
      return `Generate a brief summary for an RPG attribute. ${baseContext}

Requirements:
- Explain what the attribute represents
- Keep it to 1-2 sentences
- Be specific about how it affects gameplay

Respond with ONLY the summary.`;

    case "item-name":
      return `Generate an item name for an RPG game. ${baseContext}

Requirements:
- The name should fit the item type and rarity
- It should be memorable and thematic
- Keep it concise (1-4 words)

Respond with ONLY the item name.`;

    case "item-description":
      return `Generate an item description for an RPG game. ${baseContext}

Requirements:
- Describe the item's appearance and purpose
- Hint at its magical/special properties if any
- Keep it to 2-3 sentences

Respond with ONLY the description.`;

    default:
      return `Generate appropriate content for a ${fieldType} field in an RPG game. ${baseContext}
      
Be concise and thematic. Respond with ONLY the content.`;
  }
}

export function buildExpandPrompt(
  value: string,
  fieldType: string,
  context: AIContext
): string {
  const baseContext = buildContextString(context);

  return `Expand and improve the following ${fieldType} content for an RPG game:

"${value}"

${baseContext}

Requirements:
- Build upon the existing content, don't replace it entirely
- Add more detail, depth, and evocative language
- Keep the same tone and style
- Maximum 3-4 sentences for descriptions

Respond with ONLY the expanded content.`;
}

export function buildImprovePrompt(
  value: string,
  fieldType: string,
  context: AIContext
): string {
  const baseContext = buildContextString(context);

  return `Improve the following ${fieldType} content for an RPG game:

"${value}"

${baseContext}

Requirements:
- Fix any grammar or clarity issues
- Make the language more engaging and evocative
- Keep a similar length
- Maintain the original meaning

Respond with ONLY the improved content.`;
}

export function buildSummarizePrompt(
  value: string,
  fieldType: string,
  context: AIContext
): string {
  const baseContext = buildContextString(context);

  return `Summarize the following ${fieldType} content for an RPG game:

"${value}"

${baseContext}

Requirements:
- Capture the key points in fewer words
- Keep essential information
- Make it concise but complete

Respond with ONLY the summary.`;
}

export function buildSuggestNamesPrompt(
  fieldType: string,
  context: AIContext
): string {
  const baseContext = buildContextString(context);

  return `Suggest 5 creative names for a ${fieldType} in an RPG game. ${baseContext}

Requirements:
- Each name should be unique and evocative
- Names should fit the setting/theme
- Keep names concise (1-4 words each)

Respond with ONLY the names, one per line.`;
}
