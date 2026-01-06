import { generateText } from "ai";
import { NextResponse } from "next/server";
import {
  buildGeneratePrompt,
  buildExpandPrompt,
  buildImprovePrompt,
  buildSummarizePrompt,
  buildSuggestNamesPrompt,
  type AIContext,
} from "@/lib/utils/ai-prompts";

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
