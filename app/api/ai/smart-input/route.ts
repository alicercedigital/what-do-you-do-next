import { generateText } from "ai";
import { NextResponse } from "next/server";

// AI Context type for the new architecture
interface AIContext {
  universeName?: string;
  setting?: string;
  statName?: string;
  itemName?: string;
  challengeName?: string;
}

const buildGeneratePrompt = (fieldType: string, context: AIContext) => {
  switch (fieldType) {
    case "universe-name":
      return `Generate a creative name for a ${
        context.setting || "fantasy"
      } universe. Make it evocative and memorable.`;
    case "universe-description":
      return `Generate a brief description for a universe called "${
        context.universeName || "Unknown"
      }" with setting ${context.setting || "fantasy"}.`;
    case "stat-name":
      return `Generate a creative name for a character stat in a ${
        context.setting || "fantasy"
      } setting.`;
    case "item-name":
      return `Generate a creative name for an item in a ${
        context.setting || "fantasy"
      } setting.`;
    case "challenge-name":
      return `Generate a creative name for a challenge in a ${
        context.setting || "fantasy"
      } setting.`;
    default:
      return `Generate content for ${fieldType}`;
  }
};

const buildExpandPrompt = (
  value: string,
  fieldType: string,
  context: AIContext
) => {
  return `Expand on this ${fieldType}: "${value}". Make it more detailed and descriptive while keeping it appropriate for a ${
    context.setting || "fantasy"
  } setting.`;
};

const buildImprovePrompt = (
  value: string,
  fieldType: string,
  context: AIContext
) => {
  return `Improve this ${fieldType}: "${value}". Make it more engaging and professional while maintaining the ${
    context.setting || "fantasy"
  } theme.`;
};

const buildSummarizePrompt = (
  value: string,
  fieldType: string,
  context: AIContext
) => {
  return `Summarize this ${fieldType}: "${value}". Keep it concise but informative.`;
};

const buildSuggestNamesPrompt = (fieldType: string, context: AIContext) => {
  return `Suggest 5 creative names for ${fieldType} in a ${
    context.setting || "fantasy"
  } setting. Format as a JSON array of strings.`;
};

export async function POST(request: Request) {
  try {
    const { action, value, context, fieldType } = await request.json();

    let prompt = "";

    switch (action) {
      case "generate":
        prompt = buildGeneratePrompt(fieldType, context as AIContext);
        break;
      case "expand":
        prompt = buildExpandPrompt(value, fieldType, context as AIContext);
        break;
      case "improve":
        prompt = buildImprovePrompt(value, fieldType, context as AIContext);
        break;
      case "summarize":
        prompt = buildSummarizePrompt(value, fieldType, context as AIContext);
        break;
      case "suggest-names":
        prompt = buildSuggestNamesPrompt(fieldType, context as AIContext);
        break;
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
    });

    return NextResponse.json({ result: text.trim() });
  } catch (error) {
    console.error("[v0] Smart input API error:", error);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}
