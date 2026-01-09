# Codebase

## Structure

```
├── apps
│   ├── game-api
│   │   ├── src
│   │   │   ├── __tests__
│   │   │   │   └── server.test.ts
│   │   │   ├── routes
│   │   │   │   ├── attributes-benchmarks.ts
│   │   │   │   ├── attributes-generate.ts
│   │   │   │   ├── smart-input.ts
│   │   │   │   └── story-generate.ts
│   │   │   ├── index.ts
│   │   │   └── server.ts
│   │   ├── eslint.config.js
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── tsup.config.ts
│   │   └── turbo.json
│   └── game-frontend
│       ├── src
│       │   ├── character
│       │   │   └── components
│       │   │       └── character-creator.tsx
│       │   ├── game
│       │   │   ├── cards
│       │   │   │   ├── challenge-card.tsx
│       │   │   │   ├── choice-card.tsx
│       │   │   │   ├── dice-card.tsx
│       │   │   │   ├── outcome-card.tsx
│       │   │   │   └── story-card.tsx
│       │   │   ├── components
│       │   │   │   ├── character-sheet.tsx
│       │   │   │   ├── game-session.tsx
│       │   │   │   ├── main-menu.tsx
│       │   │   │   └── story-stack.tsx
│       │   │   ├── engine
│       │   │   │   ├── engine.ts
│       │   │   │   └── templates.ts
│       │   │   └── store.ts
│       │   ├── pages
│       │   │   ├── home.tsx
│       │   │   ├── play.tsx
│       │   │   ├── universe-edit.tsx
│       │   │   ├── universe-new.tsx
│       │   │   └── universes.tsx
│       │   ├── shared
│       │   │   ├── components
│       │   │   │   ├── ui
│       │   │   │   │   ├── alert-dialog.tsx
│       │   │   │   │   ├── badge.tsx
│       │   │   │   │   ├── button.tsx
│       │   │   │   │   ├── card.tsx
│       │   │   │   │   ├── collapsible.tsx
│       │   │   │   │   ├── dialog.tsx
│       │   │   │   │   ├── dropdown-menu.tsx
│       │   │   │   │   ├── input.tsx
│       │   │   │   │   ├── label.tsx
│       │   │   │   │   ├── popover.tsx
│       │   │   │   │   ├── progress.tsx
│       │   │   │   │   ├── scroll-area.tsx
│       │   │   │   │   ├── select.tsx
│       │   │   │   │   ├── sheet.tsx
│       │   │   │   │   ├── slider.tsx
│       │   │   │   │   ├── smart-input.tsx
│       │   │   │   │   ├── switch.tsx
│       │   │   │   │   ├── tabs.tsx
│       │   │   │   │   └── textarea.tsx
│       │   │   │   └── theme-provider.tsx
│       │   │   ├── data
│       │   │   │   └── starter-universes.ts
│       │   │   └── lib
│       │   │       ├── calc.ts
│       │   │       ├── storage.ts
│       │   │       └── utils.ts
│       │   ├── universe
│       │   │   ├── calculation-builder.tsx
│       │   │   ├── challenge-editor.tsx
│       │   │   ├── item-editor.tsx
│       │   │   ├── stat-editor.tsx
│       │   │   ├── universe-card.tsx
│       │   │   └── universe-editor.tsx
│       │   ├── globals.css
│       │   └── main.tsx
│       ├── components.json
│       ├── eslint.config.js
│       ├── index.html
│       ├── package.json
│       ├── tsconfig.json
│       ├── tsconfig.node.json
│       ├── turbo.json
│       └── vite.config.ts
├── packages
│   ├── logger
│   │   ├── src
│   │   │   ├── __tests__
│   │   │   │   └── log.test.ts
│   │   │   └── index.ts
│   │   ├── eslint.config.js
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── turbo.json
│   └── shared
│       ├── src
│       │   ├── api.ts
│       │   ├── index.ts
│       │   ├── types-v2.ts
│       │   └── types.ts
│       ├── package.json
│       └── tsconfig.json
├── .gitignore
├── .npmrc
├── package.json
└── turbo.json
```

## Files

### .gitignore

```
.DS_Store
node_modules
.turbo
*.log
.next
dist
dist-ssr
*.local
.env
.cache
server/dist
public/dist
```

### .npmrc

```
auto-install-peers = true
```

### apps/game-api/eslint.config.js

```javascript
import { config } from "@wdydn/config/eslint";

/** @type {import("eslint").Linter.Config} */
export default config;
```

### apps/game-api/package.json

```json
{
  "name": "@wdydn/game-api",
  "version": "0.0.0",
  "type": "module",
  "private": true,
  "scripts": {
    "start": "node dist/index.js",
    "dev": "tsup --watch --onSuccess \"node dist/index.cjs\"",
    "build": "tsup",
    "check-types": "tsc --noEmit",
    "lint": "eslint src/ --max-warnings 0",
    "test": "jest --detectOpenHandles"
  },
  "jest": {
    "preset": "@wdydn/config/jest/node"
  },
  "dependencies": {
    "@wdydn/logger": "*",
    "@wdydn/shared": "*",
    "ai": "^6.0.0",
    "body-parser": "^1.20.3",
    "cors": "^2.8.5",
    "express": "4.21.2",
    "morgan": "^1.10.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@jest/globals": "^29.7.0",
    "@wdydn/config": "*",
    "@types/body-parser": "^1.19.5",
    "@types/cors": "^2.8.17",
    "@types/express": "4.17.21",
    "@types/morgan": "^1.9.9",
    "@types/node": "^22.15.3",
    "@types/supertest": "^6.0.2",
    "eslint": "^9.39.0",
    "jest": "^29.7.0",
    "supertest": "^7.1.0",
    "tsup": "^8.5.0",
    "typescript": "5.9.3"
  }
}
```

### apps/game-api/src/__tests__/server.test.ts

```typescript
import supertest from "supertest";
import { describe, it, expect } from "@jest/globals";
import { createServer } from "../server";

describe("Server", () => {
  it("health check returns 200", async () => {
    await supertest(createServer())
      .get("/status")
      .expect(200)
      .then((res) => {
        expect(res.ok).toBe(true);
      });
  });

  it("message endpoint says hello", async () => {
    await supertest(createServer())
      .get("/message/jared")
      .expect(200)
      .then((res) => {
        expect(res.body).toEqual({ message: "hello jared" });
      });
  });
});
```

### apps/game-api/src/index.ts

```typescript
import { log } from "@wdydn/logger";
import { createServer } from "./server";

const port = process.env.PORT || 3001;
const server = createServer();

server.listen(port, () => {
  log(`api running on ${port}`);
});
```

### apps/game-api/src/routes/attributes-benchmarks.ts

```typescript
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
```

### apps/game-api/src/routes/attributes-generate.ts

```typescript
import { Router } from "express";
import { generateText, Output } from "ai";
import { z } from "zod";
import type { GenerateAttributeRequest } from "@wdydn/shared";

export const attributesGenerateRouter = Router();

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

attributesGenerateRouter.post("/generate", async (req, res) => {
  try {
    const body = req.body as GenerateAttributeRequest;
    const { attributeName, genreSetting } = body;

    if (!attributeName || !genreSetting) {
      return res.status(400).json({ error: "Missing required fields" });
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
      return res.status(500).json({ error: "Failed to generate attribute" });
    }

    const attribute = {
      ...output,
      id: crypto.randomUUID(),
    };

    return res.json({ attribute });
  } catch (error) {
    console.error("Error generating attribute:", error);
    return res.status(500).json({ error: "Failed to generate attribute" });
  }
});
```

### apps/game-api/src/routes/smart-input.ts

```typescript
import { Router } from "express";
import { generateText } from "ai";
import type { SmartInputRequest, AIContext } from "@wdydn/shared";

export const smartInputRouter = Router();

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

const buildSummarizePrompt = (value: string, fieldType: string) => {
  return `Summarize this ${fieldType}: "${value}". Keep it concise but informative.`;
};

const buildSuggestNamesPrompt = (fieldType: string, context: AIContext) => {
  return `Suggest 5 creative names for ${fieldType} in a ${
    context.setting || "fantasy"
  } setting. Format as a JSON array of strings.`;
};

smartInputRouter.post("/smart-input", async (req, res) => {
  try {
    const body = req.body as SmartInputRequest;
    const { action, value, context, fieldType } = body;

    let prompt = "";
    const ctx = context || {};

    switch (action) {
      case "generate":
        prompt = buildGeneratePrompt(fieldType, ctx);
        break;
      case "expand":
        prompt = buildExpandPrompt(value || "", fieldType, ctx);
        break;
      case "improve":
        prompt = buildImprovePrompt(value || "", fieldType, ctx);
        break;
      case "summarize":
        prompt = buildSummarizePrompt(value || "", fieldType);
        break;
      case "suggest-names":
        prompt = buildSuggestNamesPrompt(fieldType, ctx);
        break;
      default:
        return res.status(400).json({ error: "Unknown action" });
    }

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
    });

    return res.json({ result: text.trim() });
  } catch (error) {
    console.error("[Server] Smart input API error:", error);
    return res.status(500).json({ error: "Failed to generate content" });
  }
});
```

### apps/game-api/src/routes/story-generate.ts

```typescript
import { Router } from "express";
import type { StoryCard, ChoiceCard, StoryGenerateRequest } from "@wdydn/shared";

export const storyGenerateRouter = Router();

const storySegments = [
  {
    beats: [
      {
        title: "A Fateful Encounter",
        content:
          "The air grows thick with tension as an unexpected figure emerges from the shadows. Their eyes hold secrets that could change everything you thought you knew about your journey.",
      },
      {
        title: "Words Unspoken",
        content:
          "The stranger pauses, studying you with an intensity that makes your skin prickle. When they finally speak, their voice carries the weight of ages.",
      },
      {
        title: "The Revelation",
        content:
          '"I have watched you from afar," they say, "and I know what you seek. But the path ahead is treacherous, and not all who walk it return unchanged."',
      },
    ],
    options: [
      {
        title: "Approach with Confidence",
        description:
          "Stand tall and meet their gaze directly, showing no fear.",
        hasTest: true,
        difficulty: 12,
      },
      {
        title: "Observe from Afar",
        description: "Keep your distance and watch for any signs of danger.",
      },
      {
        title: "Offer a Greeting",
        description:
          "Extend an open hand in peace, hoping to learn their purpose.",
      },
    ],
  },
  {
    beats: [
      {
        title: "The Crossroads",
        content:
          "Before you lies a choice that will define your path. Two roads diverge, each whispering promises of different destinies.",
      },
      {
        title: "Echoes of Warning",
        content:
          "Ancient markers line the roadside, their inscriptions worn but still legible. They speak of those who came before—some who triumphed, others who vanished into legend.",
      },
      {
        title: "The Weight of Choice",
        content:
          "The wind carries whispers from both directions. One promises safety but mediocrity. The other offers glory at the risk of everything you hold dear.",
      },
    ],
    options: [
      {
        title: "Take the Sunlit Path",
        description:
          "Follow the well-worn road where others have traveled before.",
      },
      {
        title: "Enter the Dark Woods",
        description: "Brave the unknown shadows where few dare to venture.",
        hasTest: true,
        difficulty: 15,
      },
      {
        title: "Forge Your Own Way",
        description: "Cut through the wilderness, making a new path entirely.",
      },
    ],
  },
  {
    beats: [
      {
        title: "Echoes of the Past",
        content:
          "A memory stirs, unbidden yet powerful. The faces of those you've left behind flash before your eyes.",
      },
      {
        title: "Voices from Memory",
        content:
          "You hear them speaking—words of encouragement, warnings unheeded, promises made and broken. Each voice carries a lesson you're only now beginning to understand.",
      },
      {
        title: "The Present Awakens",
        content:
          "The vision fades, but its meaning remains crystal clear. What you do next will honor those memories—or betray them entirely.",
      },
    ],
    options: [
      {
        title: "Embrace the Memory",
        description: "Let the past guide your present decisions and actions.",
      },
      {
        title: "Push Forward",
        description:
          "Leave the past where it belongs and focus on what lies ahead.",
      },
      {
        title: "Seek Understanding",
        description: "Meditate on the vision to uncover its deeper meaning.",
        hasTest: true,
        difficulty: 10,
      },
    ],
  },
  {
    beats: [
      {
        title: "The Rising Storm",
        content:
          "Dark clouds gather on the horizon as nature itself seems to mirror the turmoil ahead. Lightning splits the sky in the distance.",
      },
      {
        title: "Elements Unleashed",
        content:
          "The first drops of rain fall like omens, each one cold against your skin. Thunder rumbles, growing closer with each heartbeat.",
      },
      {
        title: "The Tempest Arrives",
        content:
          "The full fury of the storm breaks upon you. In this chaos, you must decide—flee, fight, or find another way entirely.",
      },
    ],
    options: [
      {
        title: "Find Shelter",
        description: "Seek refuge and wait for the danger to pass.",
      },
      {
        title: "Press Onward",
        description:
          "Challenge the elements and continue your journey despite the odds.",
        hasTest: true,
        difficulty: 18,
      },
      {
        title: "Use the Chaos",
        description:
          "Turn the storm to your advantage, letting it mask your movements.",
      },
    ],
  },
  {
    beats: [
      {
        title: "An Unexpected Ally",
        content:
          "From the most unlikely of places, a figure approaches. Their manner suggests neither friend nor foe, but something in between.",
      },
      {
        title: "The Proposition",
        content:
          '"We share a common enemy," they say, their voice barely above a whisper. "Apart, we will surely fail. Together... perhaps we have a chance."',
      },
      {
        title: "Trust's Currency",
        content:
          "They extend their hand, waiting. Every instinct screams caution, yet something in their eyes speaks of desperation that mirrors your own.",
      },
    ],
    options: [
      {
        title: "Accept Their Aid",
        description:
          "Take a leap of faith and welcome this potential companion.",
      },
      {
        title: "Decline Politely",
        description:
          "Thank them but continue alone, keeping your suspicions close.",
      },
      {
        title: "Test Their Loyalty",
        description:
          "Propose a small task to prove their intentions before committing.",
        hasTest: true,
        difficulty: 14,
      },
    ],
  },
  {
    beats: [
      {
        title: "Shadows in the Mist",
        content:
          "The path ahead narrows as an unnatural fog rolls in. Through the haze, you glimpse movement—something large, something hungry.",
      },
      {
        title: "The Creature Emerges",
        content:
          "A guttural growl cuts through the silence. From the mist emerges a twisted figure, its eyes gleaming with malevolent intelligence. There is no reasoning with this beast.",
      },
      {
        title: "Battle Begins",
        content:
          "The creature lunges! You have no choice but to fight for your survival. Steel your nerves and prepare for combat.",
      },
    ],
    options: [
      {
        title: "Aggressive Assault",
        description:
          "Strike first and strike hard, overwhelming your foe with ferocity.",
      },
      {
        title: "Defensive Stance",
        description: "Weather the initial assault and look for an opening.",
      },
      {
        title: "Attempt to Flee",
        description:
          "Try to escape into the fog before the creature can attack.",
        hasTest: true,
        difficulty: 16,
      },
    ],
  },
];

function generateDemoContent(
  step: string,
  stepData: { name: string; examples: string[] } | undefined,
  nodeCount: number
) {
  const segmentIndex = Math.floor(nodeCount / 4) % storySegments.length;
  const segment = storySegments[segmentIndex];

  const uniqueId = `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 9)}`;

  const stepExample =
    stepData?.examples[Math.floor(Math.random() * stepData.examples.length)];

  const events: StoryCard[] = segment.beats.map((beat, index) => {
    return {
      id: `evt-${uniqueId}-${index}`,
      type: "story" as const,
      title: index === 0 && stepData ? stepData.name : beat.title,
      content:
        index === 0 && stepExample
          ? `${beat.content}\n\n${stepExample}`
          : beat.content,
      timestamp: Date.now(),
    };
  });

  const choiceCard: ChoiceCard = {
    id: `choice-${uniqueId}`,
    type: "choice" as const,
    prompt: "What do you do?",
    options: segment.options.map((opt, index) => {
      const option: {
        id: string;
        text: string;
        description?: string;
        skillCheck?: {
          statId: string;
          difficulty: number;
        };
      } = {
        id: `opt-${uniqueId}-${index}`,
        text: opt.title,
        description: opt.description,
      };

      if (opt.hasTest && opt.difficulty) {
        option.skillCheck = {
          statId: "strength",
          difficulty: opt.difficulty,
        };
      }

      return option;
    }),
    timestamp: Date.now(),
  };

  return { events: [...events, choiceCard] };
}

storyGenerateRouter.post("/generate", async (req, res) => {
  try {
    const body = req.body as StoryGenerateRequest;
    const currentStep = body.currentHeroStep || "ordinary-world";

    const result = generateDemoContent(currentStep, undefined, body.nodeCount || 0);
    return res.json(result);
  } catch (error) {
    console.error("[Server] Story generation error:", error);
    return res.json(generateDemoContent("ordinary-world", undefined, 0));
  }
});
```

### apps/game-api/src/server.ts

```typescript
import { json, urlencoded } from "body-parser";
import express, { type Express } from "express";
import morgan from "morgan";
import cors from "cors";
import { smartInputRouter } from "./routes/smart-input";
import { storyGenerateRouter } from "./routes/story-generate";
import { attributesGenerateRouter } from "./routes/attributes-generate";
import { attributesBenchmarksRouter } from "./routes/attributes-benchmarks";

export const createServer = (): Express => {
  const app = express();
  app
    .disable("x-powered-by")
    .use(morgan("dev"))
    .use(urlencoded({ extended: true }))
    .use(json())
    .use(
      cors({
        origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
      })
    );

  // Health check
  app.get("/api/health", (_, res) => {
    return res.json({ status: "ok" });
  });

  // API Routes
  app.use("/api/ai", smartInputRouter);
  app.use("/api/story", storyGenerateRouter);
  app.use("/api/attributes", attributesGenerateRouter);
  app.use("/api/attributes", attributesBenchmarksRouter);

  return app;
};
```

### apps/game-api/tsconfig.json

```json
{
  "extends": "@wdydn/config/typescript/base.json",
  "compilerOptions": {
    "lib": ["ES2015"],
    "outDir": "./dist"
  },
  "exclude": ["node_modules"],
  "include": ["."]
}
```

### apps/game-api/tsup.config.ts

```typescript
import { defineConfig, type Options } from "tsup";

export default defineConfig((options: Options) => ({
  entry: ["src/**/*"],
  clean: true,
  format: ["cjs"],
  ...options,
}));
```

### apps/game-api/turbo.json

```json
{
  "extends": ["//"],
  "tasks": {
    "build": {
      "env": ["PORT"],
      "outputs": ["dist/**"]
    }
  }
}
```

### apps/game-frontend/components.json

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

### apps/game-frontend/eslint.config.js

```javascript
/** @type {import("eslint").Linter.Config} */
import config from "@wdydn/config/eslint/vite";

export default config;
```

### apps/game-frontend/index.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>What Do You Do Next?</title>
    <link rel="icon" type="image/svg+xml" href="/icon.svg" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### apps/game-frontend/package.json

```json
{
  "name": "@wdydn/game-frontend",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "vite build",
    "dev": "vite --clearScreen false",
    "check-types": "tsc --noEmit",
    "lint": "eslint src/ --max-warnings 0"
  },
  "dependencies": {
    "@wdydn/shared": "*",
    "@emotion/is-prop-valid": "latest",
    "@hookform/resolvers": "^5.2.2",
    "@radix-ui/react-accordion": "1.2.12",
    "@radix-ui/react-alert-dialog": "1.1.15",
    "@radix-ui/react-aspect-ratio": "1.1.8",
    "@radix-ui/react-avatar": "1.1.11",
    "@radix-ui/react-checkbox": "1.3.3",
    "@radix-ui/react-collapsible": "1.1.12",
    "@radix-ui/react-context-menu": "2.2.16",
    "@radix-ui/react-dialog": "1.1.15",
    "@radix-ui/react-dropdown-menu": "2.1.16",
    "@radix-ui/react-hover-card": "1.1.15",
    "@radix-ui/react-label": "2.1.8",
    "@radix-ui/react-menubar": "1.1.16",
    "@radix-ui/react-navigation-menu": "1.2.14",
    "@radix-ui/react-popover": "1.1.15",
    "@radix-ui/react-progress": "1.1.8",
    "@radix-ui/react-radio-group": "1.3.8",
    "@radix-ui/react-scroll-area": "1.2.10",
    "@radix-ui/react-select": "2.2.6",
    "@radix-ui/react-separator": "1.1.8",
    "@radix-ui/react-slider": "1.3.6",
    "@radix-ui/react-slot": "1.2.4",
    "@radix-ui/react-switch": "1.2.6",
    "@radix-ui/react-tabs": "1.1.13",
    "@radix-ui/react-toast": "1.2.15",
    "@radix-ui/react-toggle": "1.1.10",
    "@radix-ui/react-toggle-group": "1.1.11",
    "@radix-ui/react-tooltip": "1.2.8",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "1.1.1",
    "date-fns": "4.1.0",
    "embla-carousel-react": "8.6.0",
    "framer-motion": "12.24.0",
    "immer": "latest",
    "input-otp": "1.4.2",
    "lucide-react": "^0.562.0",
    "next-themes": "^0.4.6",
    "react": "^19.0.0",
    "react-day-picker": "9.13.0",
    "react-dom": "^19.0.0",
    "react-hook-form": "^7.70.0",
    "react-resizable-panels": "^4.2.2",
    "react-router-dom": "^7.1.0",
    "react-zoom-pan-pinch": "3.7.0",
    "reactflow": "11.11.4",
    "recharts": "3.6.0",
    "sonner": "^2.0.7",
    "tailwind-merge": "^3.4.0",
    "tailwindcss-animate": "^1.0.7",
    "vaul": "^1.1.2",
    "zod": "^3.23.0",
    "zustand": "^5.0.0"
  },
  "devDependencies": {
    "@wdydn/config": "*",
    "@tailwindcss/vite": "^4.1.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "tailwindcss": "^4.1.0",
    "tw-animate-css": "1.4.0",
    "typescript": "^5.9",
    "vite": "^6.0.0"
  }
}
```

### apps/game-frontend/src/character/components/character-creator.tsx

```tsx
import { useState, useMemo } from "react";
import type { Universe, Character, Stat } from "@wdydn/shared";
import { resolveStats } from "@/shared/lib/calc";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Progress } from "@/shared/components/ui/progress";
import { cn } from "@/shared/lib/utils";
import { Minus, Plus, Sparkles, ArrowLeft } from "lucide-react";

interface Props {
  universe: Universe;
  onComplete: (character: Character) => void;
  onBack: () => void;
}

export function CharacterCreator({ universe, onComplete, onBack }: Props) {
  const [name, setName] = useState("");
  const [baseStats, setBaseStats] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    for (const stat of universe.stats.filter((s) => s.type === "core")) {
      initial[stat.id] = stat.range?.min ?? 0;
    }
    return initial;
  });

  const coreStats = universe.stats.filter(
    (s) => s.type === "core" && s.display.showInCreator !== false
  );
  const computedStats = universe.stats.filter(
    (s) => s.type === "computed" && s.display.showInCreator !== false
  );

  const usedPoints = useMemo(() => {
    return Object.entries(baseStats).reduce((sum, [statId, value]) => {
      const stat = universe.stats.find((s) => s.id === statId);
      const min = stat?.range?.min ?? 0;
      return sum + (value - min);
    }, 0);
  }, [baseStats, universe.stats]);

  const remainingPoints = universe.config.startingPoints - usedPoints;

  const resolved = useMemo(() => {
    return resolveStats(universe.stats, baseStats);
  }, [universe.stats, baseStats]);

  const adjustStat = (statId: string, delta: number) => {
    const stat = universe.stats.find((s) => s.id === statId);
    if (!stat) return;

    const current = baseStats[statId] ?? stat.range?.min ?? 0;
    const min = stat.range?.min ?? 0;
    const max = stat.range?.max ?? 100;

    const newValue = Math.max(min, Math.min(max, current + delta));

    // Check if we have points available when increasing
    if (delta > 0 && remainingPoints < delta) return;

    setBaseStats((prev) => ({ ...prev, [statId]: newValue }));
  };

  const canSubmit = name.trim().length > 0 && remainingPoints >= 0;

  const handleSubmit = () => {
    if (!canSubmit) return;

    const character: Character = {
      id: crypto.randomUUID(),
      name: name.trim(),
      level: 1,
      baseStats,
      equipment: {},
      inventory: [],
      points: {
        total: universe.config.startingPoints,
        used: usedPoints,
      },
    };

    onComplete(character);
  };

  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle>Create Your Character</CardTitle>
              <CardDescription>for {universe.name}</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="name">Character Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter a name..."
              autoFocus
            />
          </div>

          {/* Points Remaining */}
          <div
            className={cn(
              "p-3 rounded-lg border",
              remainingPoints < 0
                ? "border-red-500 bg-red-500/10"
                : "bg-muted/50"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Points Remaining
              </span>
              <span
                className={cn(
                  "font-bold text-lg",
                  remainingPoints < 0 && "text-red-500"
                )}
              >
                {remainingPoints}
              </span>
            </div>
            <Progress
              value={
                ((universe.config.startingPoints - remainingPoints) /
                  universe.config.startingPoints) *
                100
              }
              className="mt-2 h-2"
            />
          </div>

          {/* Core Stats */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              Core Stats
            </h4>
            {coreStats.map((stat) => (
              <StatRow
                key={stat.id}
                stat={stat}
                value={baseStats[stat.id] ?? stat.range?.min ?? 0}
                onAdjust={(delta) => adjustStat(stat.id, delta)}
                canIncrease={remainingPoints > 0}
              />
            ))}
          </div>

          {/* Computed Stats Preview */}
          {computedStats.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Computed Stats
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {computedStats.map((stat) => (
                  <div
                    key={stat.id}
                    className="p-2 rounded bg-muted/50 flex items-center justify-between"
                  >
                    <span className="text-sm">{stat.name}</span>
                    <span className="font-mono font-bold">
                      {resolved[stat.id] ?? 0}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full"
          >
            Begin Adventure
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function StatRow({
  stat,
  value,
  onAdjust,
  canIncrease,
}: {
  stat: Stat;
  value: number;
  onAdjust: (delta: number) => void;
  canIncrease: boolean;
}) {
  const min = stat.range?.min ?? 0;
  const max = stat.range?.max ?? 100;
  const canDecrease = value > min;

  return (
    <div className="flex items-center gap-3 p-2 rounded bg-muted/30">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{stat.name}</span>
          {stat.short && (
            <span className="text-xs text-muted-foreground">
              ({stat.short})
            </span>
          )}
        </div>
        {stat.description && (
          <p className="text-xs text-muted-foreground">{stat.description}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 bg-transparent"
          onClick={() => onAdjust(-1)}
          disabled={!canDecrease}
        >
          <Minus className="h-3 w-3" />
        </Button>

        <span className="font-mono font-bold w-8 text-center">{value}</span>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 bg-transparent"
          onClick={() => onAdjust(1)}
          disabled={!canIncrease || value >= max}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
```

### apps/game-frontend/src/game/cards/challenge-card.tsx

```tsx
import type { ChallengeCard as ChallengeCardType, ActiveChallenge, ChallengeTemplate } from "@wdydn/shared"
import { Card, CardHeader, CardContent } from "@/shared/components/ui/card"
import { Progress } from "@/shared/components/ui/progress"
import { useGameStore } from "@/game/store"
import { cn } from "@/shared/lib/utils"
import { Swords, Timer, GraduationCap } from "lucide-react"

interface Props {
  card: ChallengeCardType
}

const themeIcons = {
  combat: Swords,
  race: Timer,
  academic: GraduationCap,
  social: Swords,
}

export function ChallengeCard({ card }: Props) {
  const { universe, challenge } = useGameStore()

  if (!challenge || !universe) return null

  const template = universe.challenges.find((c) => c.id === card.challengeId)
  if (!template) return null

  const Icon = themeIcons[template.display.theme || "combat"]

  return (
    <Card
      className={cn(
        "transition-colors",
        challenge.outcome?.result === "win" && "border-green-500/50",
        challenge.outcome?.result === "lose" && "border-red-500/50",
      )}
    >
      <CardHeader className="border-b pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">{template.name}</h3>
          </div>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">Round {challenge.round}</span>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Participants */}
        <div className="flex justify-between gap-4">
          {Object.entries(challenge.participants).map(([roleId, participant]) => (
            <ParticipantView key={roleId} roleId={roleId} participant={participant} tracked={template.trackedStats} />
          ))}
        </div>

        {/* Battle Log */}
        {template.display.showLog && challenge.log.length > 0 && (
          <div className="max-h-40 overflow-y-auto space-y-1 text-xs font-mono bg-muted/50 rounded-lg p-2">
            {challenge.log.slice(-10).map((entry) => (
              <div
                key={entry.id}
                className={cn(
                  "px-2 py-1 rounded",
                  entry.type === "damage" && "bg-red-500/10 text-red-400",
                  entry.type === "heal" && "bg-green-500/10 text-green-400",
                  entry.type === "result" && "bg-primary/10 text-primary font-bold",
                  entry.type === "info" && "text-muted-foreground",
                )}
              >
                {entry.message}
              </div>
            ))}
          </div>
        )}

        {/* Outcome */}
        {challenge.outcome && (
          <div
            className={cn(
              "text-center p-4 rounded-lg",
              challenge.outcome.result === "win" && "bg-green-500/20",
              challenge.outcome.result === "lose" && "bg-red-500/20",
              challenge.outcome.result === "draw" && "bg-muted",
            )}
          >
            <p className="font-bold text-lg">{challenge.outcome.name}</p>
            <p className="text-sm text-muted-foreground">{challenge.outcome.description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ParticipantView({
  roleId,
  participant,
  tracked,
}: {
  roleId: string
  participant: ActiveChallenge["participants"][string]
  tracked: ChallengeTemplate["trackedStats"]
}) {
  const isPlayer = roleId === "player"

  return (
    <div className={cn("flex-1", !isPlayer && "text-right")}>
      <div className={cn("flex items-center gap-2 mb-2", !isPlayer && "flex-row-reverse")}>
        {participant.portrait && (
          <div className="w-10 h-10 rounded-full overflow-hidden bg-muted border-2 border-border">
            <img src={participant.portrait || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <span className="font-medium">{participant.name}</span>
      </div>

      <div className="space-y-2">
        {tracked.map(({ statId, showAs, label }) => {
          const current = participant.stats[statId] ?? 0
          const max = participant.maxStats[statId] ?? 100
          const percent = Math.max(0, Math.min(100, (current / max) * 100))

          return (
            <div key={statId}>
              <div className={cn("flex justify-between text-xs mb-1", !isPlayer && "flex-row-reverse")}>
                <span className="text-muted-foreground">{label ?? statId}</span>
                <span className="font-mono">
                  {Math.round(current)}/{max}
                </span>
              </div>
              {showAs === "bar" && (
                <Progress
                  value={percent}
                  className={cn(
                    "h-2",
                    percent < 25 && "bg-red-500/20",
                    percent >= 25 && percent < 50 && "bg-yellow-500/20",
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

### apps/game-frontend/src/game/cards/choice-card.tsx

```tsx
import type { ChoiceCard as ChoiceCardType } from "@wdydn/shared"
import { Card, CardContent } from "@/shared/components/ui/card"
import { cn } from "@/shared/lib/utils"
import { Dices, Check } from "lucide-react"

interface Props {
  card: ChoiceCardType
  onSelect?: (id: string) => void
  disabled?: boolean
}

export function ChoiceCard({ card, onSelect, disabled }: Props) {
  const hasSelection = card.options.some((o) => o.selected)

  return (
    <Card>
      <CardContent className="pt-6 space-y-3">
        <p className="text-sm text-muted-foreground font-medium">{card.prompt}</p>

        <div className="space-y-2">
          {card.options.map((option) => {
            const isDisabled = disabled || (hasSelection && !option.selected)

            return (
              <button
                key={option.id}
                onClick={() => !isDisabled && onSelect?.(option.id)}
                disabled={isDisabled}
                className={cn(
                  "w-full text-left p-3 rounded-lg border transition-all",
                  option.selected && "border-primary bg-primary/10 ring-1 ring-primary",
                  isDisabled && !option.selected && "opacity-40 cursor-not-allowed",
                  !isDisabled && "hover:border-primary/50 hover:bg-muted/50 cursor-pointer",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {option.selected && <Check className="h-4 w-4 text-primary shrink-0" />}
                      <p className="font-medium">{option.text}</p>
                    </div>
                    {option.description && (
                      <p className="text-sm text-muted-foreground mt-1 ml-6">{option.description}</p>
                    )}
                  </div>
                  {option.skillCheck && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                      <Dices className="h-3 w-3" />
                      <span>DC {option.skillCheck.difficulty}</span>
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
```

### apps/game-frontend/src/game/cards/dice-card.tsx

```tsx
import { useEffect, useState } from "react"
import type { DiceCard as DiceCardType } from "@wdydn/shared"
import { Card, CardContent } from "@/shared/components/ui/card"
import { cn } from "@/shared/lib/utils"
import { Dices } from "lucide-react"

interface Props {
  card: DiceCardType
}

export function DiceCard({ card }: Props) {
  const [showResult, setShowResult] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowResult(true), 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <Card
      className={cn(
        "transition-colors",
        showResult && card.success && "border-green-500/50 bg-green-500/5",
        showResult && !card.success && "border-red-500/50 bg-red-500/5",
      )}
    >
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center font-bold text-xl transition-all",
                !showResult && "bg-muted animate-pulse",
                showResult && card.success && "bg-green-500/20 text-green-400",
                showResult && !card.success && "bg-red-500/20 text-red-400",
              )}
            >
              {showResult ? card.roll : <Dices className="h-5 w-5 animate-spin" />}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{card.stat} Check</p>
              <p className="font-medium">
                {showResult ? (
                  <>
                    {card.roll} + {card.statValue} = {card.roll + card.statValue}
                  </>
                ) : (
                  "Rolling..."
                )}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Target: {card.target}</p>
            {showResult && (
              <p className={cn("font-bold", card.success ? "text-green-400" : "text-red-400")}>
                {card.success ? "Success!" : "Failed"}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

### apps/game-frontend/src/game/cards/outcome-card.tsx

```tsx
import type { OutcomeCard as OutcomeCardType } from "@wdydn/shared"
import { Card, CardContent } from "@/shared/components/ui/card"
import { cn } from "@/shared/lib/utils"
import { Trophy, Skull, Scale } from "lucide-react"

interface Props {
  card: OutcomeCardType
}

const resultIcons = {
  win: Trophy,
  lose: Skull,
  draw: Scale,
}

export function OutcomeCard({ card }: Props) {
  const Icon = resultIcons[card.result]

  return (
    <Card
      className={cn(
        "overflow-hidden",
        card.result === "win" && "border-green-500/50",
        card.result === "lose" && "border-red-500/50",
      )}
    >
      <div
        className={cn(
          "h-2",
          card.result === "win" && "bg-green-500",
          card.result === "lose" && "bg-red-500",
          card.result === "draw" && "bg-yellow-500",
        )}
      />
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
              card.result === "win" && "bg-green-500/20 text-green-400",
              card.result === "lose" && "bg-red-500/20 text-red-400",
              card.result === "draw" && "bg-yellow-500/20 text-yellow-400",
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg">{card.title}</h3>
            <p className="text-muted-foreground mt-1">{card.description}</p>
            {card.rewards && card.rewards.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {card.rewards.map((reward, i) => (
                  <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {reward}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

### apps/game-frontend/src/game/cards/story-card.tsx

```tsx
import type { StoryCard as StoryCardType } from "@wdydn/shared"
import { Card, CardHeader, CardContent } from "@/shared/components/ui/card"

interface Props {
  card: StoryCardType
}

export function StoryCard({ card }: Props) {
  return (
    <Card className="overflow-hidden">
      {card.image && (
        <div className="h-40 bg-muted overflow-hidden">
          <img src={card.image || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      <CardHeader className="pb-2">
        <h3 className="font-semibold text-lg">{card.title}</h3>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{card.content}</p>
      </CardContent>
    </Card>
  )
}
```

### apps/game-frontend/src/game/components/character-sheet.tsx

```tsx
import type { Universe, Character } from "@wdydn/shared"
import { resolveStats } from "@/shared/lib/calc"
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card"
import { Progress } from "@/shared/components/ui/progress"
import { cn } from "@/shared/lib/utils"
import { User, Package, Sparkles } from "lucide-react"

interface Props {
  universe: Universe
  character: Character
  className?: string
  compact?: boolean
}

export function CharacterSheet({ universe, character, className, compact = false }: Props) {
  // Calculate equipment bonuses
  const bonuses: Record<string, number> = {}
  for (const itemId of Object.values(character.equipment)) {
    if (!itemId) continue
    const item = universe.items.find((i) => i.id === itemId)
    if (!item?.bonuses) continue
    for (const bonus of item.bonuses) {
      bonuses[bonus.statId] = (bonuses[bonus.statId] ?? 0) + bonus.amount
    }
  }

  const resolved = resolveStats(universe.stats, character.baseStats, bonuses)

  const visibleStats = universe.stats.filter((s) => s.display.showInSheet !== false)
  const coreStats = visibleStats.filter((s) => s.type === "core")
  const computedStats = visibleStats.filter((s) => s.type === "computed")

  if (compact) {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        {visibleStats.slice(0, 4).map((stat) => (
          <div key={stat.id} className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded">
            <span className="text-muted-foreground">{stat.short || stat.name}:</span>
            <span className="font-mono font-bold">{resolved[stat.id] ?? 0}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg">{character.name}</CardTitle>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">Lvl {character.level}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Core Stats */}
        <div className="space-y-2">
          {coreStats.map((stat) => {
            const value = resolved[stat.id] ?? 0
            const max = stat.range?.max ?? 100
            const bonus = bonuses[stat.id]

            return (
              <div key={stat.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{stat.name}</span>
                  <span className="font-mono">
                    {value}
                    {bonus ? <span className="text-green-500 text-xs ml-1">(+{bonus})</span> : null}
                  </span>
                </div>
                {stat.display.style === "bar" && <Progress value={(value / max) * 100} className="h-1.5" />}
              </div>
            )
          })}
        </div>

        {/* Computed Stats */}
        {computedStats.length > 0 && (
          <div className="border-t pt-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
              <Sparkles className="h-3 w-3" />
              <span>Computed</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {computedStats.map((stat) => (
                <div key={stat.id} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{stat.name}</span>
                  <span className="font-mono font-bold">{resolved[stat.id] ?? 0}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inventory Summary */}
        {character.inventory.length > 0 && (
          <div className="border-t pt-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
              <Package className="h-3 w-3" />
              <span>Inventory ({character.inventory.length})</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

### apps/game-frontend/src/game/components/game-session.tsx

```tsx
import { useEffect, useCallback } from "react"
import { useGameStore } from "@/game/store"
import { StoryStack } from "./story-stack"
import { CharacterSheet } from "./character-sheet"
import { Button } from "@/shared/components/ui/button"
import { Loader2, RefreshCw, Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/shared/components/ui/sheet"

export function Game() {
  const {
    universe,
    game,
    challenge,
    isGenerating,
    addCard,
    selectChoice,
    setIsGenerating,
    advanceChallenge,
    endChallenge,
  } = useGameStore()

  // Auto-advance challenge rounds
  useEffect(() => {
    if (!challenge || challenge.outcome) return

    const template = universe?.challenges.find((c) => c.id === challenge.templateId)
    if (!template) return

    const timer = setTimeout(() => {
      advanceChallenge()
    }, template.display.roundDelay)

    return () => clearTimeout(timer)
  }, [challenge, universe, advanceChallenge])

  // End challenge when outcome is reached
  useEffect(() => {
    if (!challenge?.outcome) return

    const timer = setTimeout(() => {
      endChallenge()
    }, 2000)

    return () => clearTimeout(timer)
  }, [challenge?.outcome, endChallenge])

  const handleChoice = useCallback(
    async (optionId: string) => {
      if (!game || !universe) return

      selectChoice(optionId)
      setIsGenerating(true)

      try {
        // Here you would call your AI API to generate the next story beat
        // For now, we'll add a placeholder
        await new Promise((r) => setTimeout(r, 1500))

        addCard({
          id: crypto.randomUUID(),
          type: "story",
          title: "The Story Continues...",
          content:
            "Your choice echoes through the narrative, shaping the world around you. What happens next is yet to be written...",
          timestamp: Date.now(),
        })
      } finally {
        setIsGenerating(false)
      }
    },
    [game, universe, selectChoice, setIsGenerating, addCard],
  )

  const handleContinue = useCallback(async () => {
    if (!game || !universe || isGenerating) return

    setIsGenerating(true)

    try {
      // Generate initial story beat
      await new Promise((r) => setTimeout(r, 1500))

      addCard({
        id: crypto.randomUUID(),
        type: "story",
        title: "A New Beginning",
        content: `${game.character.name} sets forth on their journey. The ${universe.theme} world awaits, full of mystery and adventure.`,
        timestamp: Date.now(),
      })

      addCard({
        id: crypto.randomUUID(),
        type: "choice",
        prompt: "How do you begin your adventure?",
        options: [
          { id: "explore", text: "Explore the area", description: "Look around and gather information" },
          { id: "talk", text: "Talk to nearby people", description: "Seek out locals for guidance" },
          { id: "action", text: "Take immediate action", description: "Jump straight into adventure" },
        ],
        timestamp: Date.now(),
      })
    } finally {
      setIsGenerating(false)
    }
  }, [game, universe, isGenerating, setIsGenerating, addCard])

  if (!universe || !game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">No game loaded</p>
      </div>
    )
  }

  const hasStory = game.story.length > 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center justify-between p-4 max-w-4xl mx-auto">
          <div>
            <h1 className="font-bold">{universe.name}</h1>
            <p className="text-xs text-muted-foreground">
              {game.character.name} - Level {game.character.level}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isGenerating && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <CharacterSheet universe={universe} character={game.character} />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-24">
        {!hasStory ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Ready to Begin?</h2>
              <p className="text-muted-foreground">Your adventure in {universe.name} awaits.</p>
            </div>
            <Button onClick={handleContinue} disabled={isGenerating} size="lg">
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Start Adventure
                </>
              )}
            </Button>
          </div>
        ) : (
          <StoryStack cards={game.story} onChoice={handleChoice} />
        )}
      </main>

      {/* Continue Button (when last card is not a choice) */}
      {hasStory && !isGenerating && game.story.at(-1)?.type !== "choice" && !challenge && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background to-transparent">
          <div className="max-w-2xl mx-auto">
            <Button onClick={handleContinue} className="w-full" size="lg">
              Continue Story
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
```

### apps/game-frontend/src/game/components/main-menu.tsx

```tsx
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/shared/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { getGames, getUniverse, deleteGame } from "@/shared/lib/storage"
import { STARTER_UNIVERSES } from "@/shared/data/starter-universes"
import { useGameStore } from "../store"
import type { GameState, Universe } from "@wdydn/shared"
import {
  Play,
  Globe,
  Trash2,
  Swords,
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog"

interface SavedGameInfo {
  game: GameState
  universe: Universe
}

export function MainMenu() {
  const [savedGames, setSavedGames] = useState<SavedGameInfo[]>([])
  const { loadGame } = useGameStore()
  const navigate = useNavigate()

  useEffect(() => {
    loadSavedGames()
  }, [])

  const loadSavedGames = () => {
    const games = getGames()
    const gamesWithUniverses: SavedGameInfo[] = []

    for (const game of games) {
      // Try to find universe in storage first, then in starters
      let universe = getUniverse(game.universeId)
      if (!universe) {
        universe = STARTER_UNIVERSES.find((u) => u.id === game.universeId) ?? null
      }
      if (universe) {
        gamesWithUniverses.push({ game, universe })
      }
    }

    setSavedGames(gamesWithUniverses)
  }

  const handleContinueGame = (info: SavedGameInfo) => {
    loadGame(info.game, info.universe)
    navigate("/play")
  }

  const handleDeleteGame = (gameId: string) => {
    deleteGame(gameId)
    loadSavedGames()
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">What Do You Do Next?</h1>
          <p className="text-muted-foreground">A story-driven RPG adventure</p>
        </div>

        {/* Main Actions */}
        <div className="space-y-3">
          <Link to="/play" className="block">
            <Button className="w-full h-14 text-lg gap-3" size="lg">
              <Play className="h-5 w-5" />
              New Game
            </Button>
          </Link>

          <Link to="/universes" className="block">
            <Button variant="outline" className="w-full h-12 gap-3">
              <Globe className="h-5 w-5" />
              Universe Manager
            </Button>
          </Link>
        </div>

        {/* Saved Games */}
        {savedGames.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground px-1">Continue Playing</h2>
            {savedGames.map((info) => (
              <Card key={info.game.id} className="overflow-hidden">
                <div className="flex items-stretch">
                  <div
                    onClick={() => handleContinueGame(info)}
                    className="flex-1 hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <CardHeader className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Swords className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base truncate">
                            {info.game.character.name}
                          </CardTitle>
                          <CardDescription className="text-xs truncate">
                            {info.universe.name} - Level {info.game.character.level}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </div>
                  <div className="flex items-center px-2 border-l">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete saved game?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete {info.game.character.name}'s progress in {info.universe.name}. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteGame(info.game.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pt-4">
          <p>Create universes, build characters, and forge your own story</p>
        </div>
      </div>
    </div>
  )
}
```

### apps/game-frontend/src/game/components/story-stack.tsx

```tsx
import { useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { Card } from "@wdydn/shared"
import { StoryCard } from "@/game/cards/story-card"
import { ChoiceCard } from "@/game/cards/choice-card"
import { DiceCard } from "@/game/cards/dice-card"
import { ChallengeCard } from "@/game/cards/challenge-card"
import { OutcomeCard } from "@/game/cards/outcome-card"

interface Props {
  cards: Card[]
  onChoice?: (optionId: string) => void
}

export function StoryStack({ cards, onChoice }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new cards appear
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [cards.length])

  return (
    <div className="flex flex-col gap-4 p-4 max-w-2xl mx-auto">
      <AnimatePresence mode="popLayout">
        {cards.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <CardRenderer card={card} isLatest={index === cards.length - 1} onChoice={onChoice} />
          </motion.div>
        ))}
      </AnimatePresence>
      <div ref={bottomRef} />
    </div>
  )
}

function CardRenderer({
  card,
  isLatest,
  onChoice,
}: { card: Card; isLatest: boolean; onChoice?: (id: string) => void }) {
  switch (card.type) {
    case "story":
      return <StoryCard card={card} />
    case "choice":
      return <ChoiceCard card={card} onSelect={onChoice} disabled={!isLatest} />
    case "dice":
      return <DiceCard card={card} />
    case "challenge":
      return <ChallengeCard card={card} />
    case "outcome":
      return <OutcomeCard card={card} />
  }
}
```

### apps/game-frontend/src/game/engine/engine.ts

```typescript
import type { ChallengeTemplate, ActiveChallenge, RoundAction } from "@wdydn/shared"
import { evaluate } from "@/shared/lib/calc"

/**
 * Create a new challenge instance from a template
 */
export function createChallenge(
  template: ChallengeTemplate,
  participants: Record<string, { name: string; stats: Record<string, number>; portrait?: string }>,
): ActiveChallenge {
  return {
    templateId: template.id,
    round: 0,
    participants: Object.fromEntries(
      Object.entries(participants).map(([roleId, p]) => [
        roleId,
        {
          name: p.name,
          portrait: p.portrait,
          stats: { ...p.stats },
          maxStats: { ...p.stats },
        },
      ]),
    ),
    variables: {},
    log: [],
    outcome: null,
  }
}

/**
 * Execute one round of the challenge
 */
export function runRound(challenge: ActiveChallenge, template: ChallengeTemplate): ActiveChallenge {
  if (challenge.outcome) return challenge

  const next = structuredClone(challenge)
  next.round++

  const ctx = buildContext(next)

  for (const action of template.rounds) {
    if (next.outcome) break
    executeAction(next, action, template, ctx)
  }

  // Check max rounds
  if (!next.outcome && next.round >= template.maxRounds && template.defaultOutcome) {
    next.outcome = template.outcomes.find((o) => o.id === template.defaultOutcome) ?? null
  }

  return next
}

function buildContext(challenge: ActiveChallenge) {
  return {
    stats: {},
    roles: Object.fromEntries(Object.entries(challenge.participants).map(([id, p]) => [id, p.stats])),
    vars: challenge.variables,
  }
}

function executeAction(
  challenge: ActiveChallenge,
  action: RoundAction,
  template: ChallengeTemplate,
  ctx: ReturnType<typeof buildContext>,
) {
  switch (action.type) {
    case "damage": {
      const amount = Math.round(evaluate(action.amount, ctx))
      const target = challenge.participants[action.target]
      if (!target) break

      const oldValue = target.stats[action.stat] ?? 0
      target.stats[action.stat] = Math.max(0, oldValue - amount)

      const message = action.message
        ? interpolate(action.message, challenge, { amount })
        : `${target.name} loses ${amount} ${action.stat}`

      challenge.log.push({
        id: crypto.randomUUID(),
        message,
        type: "damage",
        timestamp: Date.now(),
      })
      break
    }

    case "check": {
      const result = evaluate(action.condition, ctx)
      if (result <= 0 && action.onTrue) {
        const outcome = template.outcomes.find((o) => o.id === action.onTrue)
        if (outcome) {
          challenge.outcome = outcome
          challenge.log.push({
            id: crypto.randomUUID(),
            message: outcome.name,
            type: "result",
            timestamp: Date.now(),
          })
        }
      } else if (result > 0 && action.onFalse) {
        const outcome = template.outcomes.find((o) => o.id === action.onFalse)
        if (outcome) {
          challenge.outcome = outcome
          challenge.log.push({
            id: crypto.randomUUID(),
            message: outcome.name,
            type: "result",
            timestamp: Date.now(),
          })
        }
      }
      break
    }

    case "log": {
      challenge.log.push({
        id: crypto.randomUUID(),
        message: interpolate(action.message, challenge),
        type: "info",
        timestamp: Date.now(),
      })
      break
    }

    case "roll": {
      const [countStr, sidesStr] = action.dice.split("d")
      const count = Number.parseInt(countStr, 10) || 1
      const sides = Number.parseInt(sidesStr, 10) || 6

      let total = 0
      for (let i = 0; i < count; i++) {
        total += Math.floor(Math.random() * sides) + 1
      }
      if (action.modifier) {
        total += Math.round(evaluate(action.modifier, ctx))
      }
      challenge.variables[action.saveAs] = total
      break
    }
  }
}

function interpolate(template: string, challenge: ActiveChallenge, extras: Record<string, unknown> = {}): string {
  return template.replace(/\{([^}]+)\}/g, (_, path) => {
    // Check extras first
    if (path in extras) return String(extras[path])

    // Check role.stat pattern
    const [role, stat] = path.split(".")
    if (stat) {
      const participant = challenge.participants[role]
      if (participant) {
        if (stat === "name") return participant.name
        return String(participant.stats[stat] ?? 0)
      }
    }

    // Check variables
    if (path in challenge.variables) {
      return String(challenge.variables[path])
    }

    return `{${path}}`
  })
}

/**
 * Run challenge to completion (for testing or instant mode)
 */
export function runToCompletion(challenge: ActiveChallenge, template: ChallengeTemplate): ActiveChallenge {
  let current = challenge
  while (!current.outcome && current.round < template.maxRounds) {
    current = runRound(current, template)
  }
  return current
}

/**
 * Check if challenge is over
 */
export function isComplete(challenge: ActiveChallenge): boolean {
  return challenge.outcome !== null
}

/**
 * Get the winner role ID (if any)
 */
export function getWinner(challenge: ActiveChallenge): string | null {
  if (!challenge.outcome || challenge.outcome.result !== "win") return null
  // Convention: player role is the winner on "win"
  return "player"
}
```

### apps/game-frontend/src/game/engine/templates.ts

```typescript
import type { ChallengeTemplate } from "@wdydn/shared"

export const COMBAT_TEMPLATE: ChallengeTemplate = {
  id: "combat",
  name: "Combat",
  description: "A battle to the death",
  icon: "swords",

  roles: [
    { id: "player", name: "Player", required: true },
    { id: "enemy", name: "Enemy", required: true },
  ],

  trackedStats: [{ statId: "hp", showAs: "bar", label: "Health" }],

  rounds: [
    // Player attacks
    {
      type: "damage",
      target: "enemy",
      stat: "hp",
      amount: [
        { type: "role", role: "player", stat: "strength" },
        { type: "op", value: "*" },
        { type: "number", value: 2 },
      ],
      message: "{player.name} attacks for {amount} damage!",
    },
    // Check enemy death
    {
      type: "check",
      condition: [{ type: "role", role: "enemy", stat: "hp" }],
      onTrue: "victory",
    },
    // Enemy attacks
    {
      type: "damage",
      target: "player",
      stat: "hp",
      amount: [
        { type: "role", role: "enemy", stat: "strength" },
        { type: "op", value: "*" },
        { type: "number", value: 2 },
      ],
      message: "{enemy.name} strikes back for {amount} damage!",
    },
    // Check player death
    {
      type: "check",
      condition: [{ type: "role", role: "player", stat: "hp" }],
      onTrue: "defeat",
    },
  ],

  outcomes: [
    {
      id: "victory",
      name: "Victory!",
      description: "You defeated your enemy.",
      result: "win",
      rewards: { experience: 50 },
    },
    {
      id: "defeat",
      name: "Defeated",
      description: "You have fallen in battle.",
      result: "lose",
      gameOver: true,
    },
  ],

  maxRounds: 50,
  defaultOutcome: "defeat",

  display: {
    roundDelay: 1000,
    showLog: true,
    theme: "combat",
  },
}

export const RACE_TEMPLATE: ChallengeTemplate = {
  id: "race",
  name: "Race",
  description: "A test of speed",
  icon: "timer",

  roles: [
    { id: "player", name: "You", required: true },
    { id: "opponent", name: "Opponent", required: true },
  ],

  trackedStats: [{ statId: "distance", showAs: "bar", label: "Progress" }],

  rounds: [
    {
      type: "roll",
      dice: "1d6",
      saveAs: "playerRoll",
      modifier: [
        { type: "role", role: "player", stat: "speed" },
        { type: "op", value: "/" },
        { type: "number", value: 5 },
      ],
    },
    {
      type: "roll",
      dice: "1d6",
      saveAs: "opponentRoll",
      modifier: [
        { type: "role", role: "opponent", stat: "speed" },
        { type: "op", value: "/" },
        { type: "number", value: 5 },
      ],
    },
    {
      type: "log",
      message: "You advance {playerRoll} steps, opponent advances {opponentRoll} steps!",
    },
  ],

  outcomes: [
    { id: "first", name: "First Place!", description: "You won the race!", result: "win" },
    { id: "second", name: "Second Place", description: "Close, but not enough.", result: "lose" },
  ],

  maxRounds: 10,
  defaultOutcome: "second",

  display: {
    roundDelay: 800,
    showLog: true,
    theme: "race",
  },
}

export const EXAM_TEMPLATE: ChallengeTemplate = {
  id: "exam",
  name: "Exam",
  description: "A test of knowledge",
  icon: "graduation-cap",

  roles: [{ id: "student", name: "You", required: true }],

  trackedStats: [
    { statId: "score", showAs: "number", label: "Score" },
    { statId: "questions", showAs: "number", label: "Questions Left" },
  ],

  rounds: [
    {
      type: "roll",
      dice: "1d20",
      saveAs: "attempt",
      modifier: [{ type: "role", role: "student", stat: "intelligence" }],
    },
    {
      type: "log",
      message: "You rolled {attempt} on the question...",
    },
  ],

  outcomes: [
    { id: "passed", name: "Passed!", description: "You passed the exam.", result: "win" },
    { id: "failed", name: "Failed", description: "Better luck next time.", result: "lose" },
  ],

  maxRounds: 5,
  defaultOutcome: "failed",

  display: {
    roundDelay: 1500,
    showLog: true,
    theme: "academic",
  },
}

export const DEFAULT_TEMPLATES = [COMBAT_TEMPLATE, RACE_TEMPLATE, EXAM_TEMPLATE]
```

### apps/game-frontend/src/game/store.ts

```typescript
import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Universe, GameState, Character, Card, ActiveChallenge } from "@wdydn/shared"
import { resolveStats } from "@/shared/lib/calc"
import { createChallenge, runRound } from "@/game/engine/engine"

type Phase = "menu" | "select" | "create" | "play"

interface GameStore {
  // Current state
  phase: Phase
  universe: Universe | null
  game: GameState | null
  challenge: ActiveChallenge | null
  isGenerating: boolean

  // Actions
  setPhase: (phase: Phase) => void
  selectUniverse: (universe: Universe) => void
  startGame: (character: Character) => void
  setIsGenerating: (value: boolean) => void

  // Story actions
  addCard: (card: Card) => void
  addCards: (cards: Card[]) => void
  selectChoice: (optionId: string) => void
  updatePhase: (phase: number) => void

  // Challenge actions
  startChallenge: (
    templateId: string,
    enemy: { name: string; stats: Record<string, number>; portrait?: string },
  ) => void
  advanceChallenge: () => void
  endChallenge: () => void

  // Utility
  getResolvedStats: () => Record<string, number>
  reset: () => void
  loadGame: (game: GameState, universe: Universe) => void
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      phase: "menu",
      universe: null,
      game: null,
      challenge: null,
      isGenerating: false,

      setPhase: (phase) => set({ phase }),

      selectUniverse: (universe) => set({ universe, phase: "create" }),

      startGame: (character) => {
        const { universe } = get()
        if (!universe) return

        set({
          phase: "play",
          game: {
            id: crypto.randomUUID(),
            universeId: universe.id,
            character,
            story: [],
            phase: 0,
            challenge: null,
          },
        })
      },

      setIsGenerating: (value) => set({ isGenerating: value }),

      addCard: (card) =>
        set((state) => ({
          game: state.game
            ? {
                ...state.game,
                story: [...state.game.story, card],
              }
            : null,
        })),

      addCards: (cards) =>
        set((state) => ({
          game: state.game
            ? {
                ...state.game,
                story: [...state.game.story, ...cards],
              }
            : null,
        })),

      selectChoice: (optionId) =>
        set((state) => {
          if (!state.game) return state

          const story = state.game.story.map((card) => {
            if (card.type !== "choice") return card
            // Only mark as selected on the last choice card
            const isLastChoice = state.game!.story.filter((c) => c.type === "choice").at(-1)?.id === card.id

            if (!isLastChoice) return card

            return {
              ...card,
              options: card.options.map((opt) => ({
                ...opt,
                selected: opt.id === optionId,
                disabled: opt.id !== optionId,
              })),
            }
          })

          return { game: { ...state.game, story } }
        }),

      updatePhase: (phase) =>
        set((state) => ({
          game: state.game ? { ...state.game, phase } : null,
        })),

      startChallenge: (templateId, enemy) => {
        const { universe, game } = get()
        if (!universe || !game) return

        const template = universe.challenges.find((c) => c.id === templateId)
        if (!template) return

        const playerStats = get().getResolvedStats()

        const challenge = createChallenge(template, {
          player: {
            name: game.character.name,
            stats: playerStats,
          },
          enemy: {
            name: enemy.name,
            stats: enemy.stats,
            portrait: enemy.portrait,
          },
        })

        set({ challenge })

        // Add challenge card to story
        get().addCard({
          id: crypto.randomUUID(),
          type: "challenge",
          challengeId: templateId,
          status: "active",
          timestamp: Date.now(),
        })
      },

      advanceChallenge: () => {
        const { universe, challenge } = get()
        if (!universe || !challenge) return

        const template = universe.challenges.find((c) => c.id === challenge.templateId)
        if (!template) return

        const next = runRound(challenge, template)
        set({ challenge: next })
      },

      endChallenge: () => {
        const { challenge, game } = get()
        if (!challenge || !game) return

        // Apply outcome effects to character if needed
        if (challenge.outcome?.rewards?.statChanges) {
          const newBase = { ...game.character.baseStats }
          for (const change of challenge.outcome.rewards.statChanges) {
            newBase[change.statId] = (newBase[change.statId] ?? 0) + change.amount
          }
          set({
            game: {
              ...game,
              character: { ...game.character, baseStats: newBase },
            },
          })
        }

        // Add outcome card
        if (challenge.outcome) {
          get().addCard({
            id: crypto.randomUUID(),
            type: "outcome",
            title: challenge.outcome.name,
            description: challenge.outcome.description,
            result: challenge.outcome.result,
            rewards: challenge.outcome.rewards?.experience
              ? [`+${challenge.outcome.rewards.experience} XP`]
              : undefined,
            timestamp: Date.now(),
          })
        }

        set({ challenge: null })
      },

      getResolvedStats: () => {
        const { universe, game } = get()
        if (!universe || !game) return {}

        // Calculate equipment bonuses
        const bonuses: Record<string, number> = {}
        for (const itemId of Object.values(game.character.equipment)) {
          if (!itemId) continue
          const item = universe.items.find((i) => i.id === itemId)
          if (!item?.bonuses) continue
          for (const bonus of item.bonuses) {
            bonuses[bonus.statId] = (bonuses[bonus.statId] ?? 0) + bonus.amount
          }
        }

        return resolveStats(universe.stats, game.character.baseStats, bonuses)
      },

      reset: () => set({ phase: "menu", universe: null, game: null, challenge: null }),

      loadGame: (game, universe) =>
        set({
          phase: "play",
          game,
          universe,
          challenge: null,
        }),
    }),
    { name: "rpg-game-v2" },
  ),
)
```

### apps/game-frontend/src/globals.css

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

/* Dark fantasy RPG theme with warm amber accents */
:root {
  --background: oklch(0.13 0.01 260);
  --foreground: oklch(0.95 0.01 60);
  --card: oklch(0.17 0.015 260);
  --card-foreground: oklch(0.95 0.01 60);
  --popover: oklch(0.15 0.012 260);
  --popover-foreground: oklch(0.95 0.01 60);
  --primary: oklch(0.75 0.15 55);
  --primary-foreground: oklch(0.13 0.01 260);
  --secondary: oklch(0.22 0.02 260);
  --secondary-foreground: oklch(0.85 0.02 60);
  --muted: oklch(0.2 0.015 260);
  --muted-foreground: oklch(0.65 0.02 60);
  --accent: oklch(0.65 0.18 30);
  --accent-foreground: oklch(0.98 0.01 60);
  --destructive: oklch(0.55 0.22 25);
  --destructive-foreground: oklch(0.98 0.01 60);
  --border: oklch(0.28 0.02 260);
  --input: oklch(0.22 0.02 260);
  --ring: oklch(0.75 0.15 55);
  --chart-1: oklch(0.75 0.15 55);
  --chart-2: oklch(0.65 0.18 30);
  --chart-3: oklch(0.55 0.12 200);
  --chart-4: oklch(0.7 0.14 140);
  --chart-5: oklch(0.6 0.16 280);
  --radius: 0.75rem;
  --sidebar: oklch(0.15 0.012 260);
  --sidebar-foreground: oklch(0.95 0.01 60);
  --sidebar-primary: oklch(0.75 0.15 55);
  --sidebar-primary-foreground: oklch(0.13 0.01 260);
  --sidebar-accent: oklch(0.22 0.02 260);
  --sidebar-accent-foreground: oklch(0.95 0.01 60);
  --sidebar-border: oklch(0.28 0.02 260);
  --sidebar-ring: oklch(0.75 0.15 55);
}

.dark {
  --background: oklch(0.13 0.01 260);
  --foreground: oklch(0.95 0.01 60);
  --card: oklch(0.17 0.015 260);
  --card-foreground: oklch(0.95 0.01 60);
  --popover: oklch(0.15 0.012 260);
  --popover-foreground: oklch(0.95 0.01 60);
  --primary: oklch(0.75 0.15 55);
  --primary-foreground: oklch(0.13 0.01 260);
  --secondary: oklch(0.22 0.02 260);
  --secondary-foreground: oklch(0.85 0.02 60);
  --muted: oklch(0.2 0.015 260);
  --muted-foreground: oklch(0.65 0.02 60);
  --accent: oklch(0.65 0.18 30);
  --accent-foreground: oklch(0.98 0.01 60);
  --destructive: oklch(0.55 0.22 25);
  --destructive-foreground: oklch(0.98 0.01 60);
  --border: oklch(0.28 0.02 260);
  --input: oklch(0.22 0.02 260);
  --ring: oklch(0.75 0.15 55);
  --chart-1: oklch(0.75 0.15 55);
  --chart-2: oklch(0.65 0.18 30);
  --chart-3: oklch(0.55 0.12 200);
  --chart-4: oklch(0.7 0.14 140);
  --chart-5: oklch(0.6 0.16 280);
  --sidebar: oklch(0.15 0.012 260);
  --sidebar-foreground: oklch(0.95 0.01 60);
  --sidebar-primary: oklch(0.75 0.15 55);
  --sidebar-primary-foreground: oklch(0.13 0.01 260);
  --sidebar-accent: oklch(0.22 0.02 260);
  --sidebar-accent-foreground: oklch(0.95 0.01 60);
  --sidebar-border: oklch(0.28 0.02 260);
  --sidebar-ring: oklch(0.75 0.15 55);
}

@theme inline {
  --font-sans: "Geist", "Geist Fallback";
  --font-mono: "Geist Mono", "Geist Mono Fallback";
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

### apps/game-frontend/src/main.tsx

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// Pages
import Home from "./pages/home";
import Play from "./pages/play";
import Universes from "./pages/universes";
import UniverseNew from "./pages/universe-new";
import UniverseEdit from "./pages/universe-edit";

import "./globals.css";
import { ThemeProvider } from "./shared/components/theme-provider";

const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/play", element: <Play /> },
  { path: "/universes", element: <Universes /> },
  { path: "/universes/new", element: <UniverseNew /> },
  { path: "/universes/:id", element: <UniverseEdit /> },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="dark">
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>
);
```

### apps/game-frontend/src/pages/home.tsx

```tsx
import { MainMenu } from "@/game/components/main-menu"

export default function HomePage() {
  return <MainMenu />;
}
```

### apps/game-frontend/src/pages/play.tsx

```tsx
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useGameStore } from "@/game/store"
import { Game } from "@/game/components/game-session"
import { CharacterCreator } from "@/character/components/character-creator"
import { getUniverses } from "@/shared/lib/storage"
import { STARTER_UNIVERSES } from "@/shared/data/starter-universes"
import type { Universe } from "@wdydn/shared"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { ArrowLeft, Sparkles, Globe } from "lucide-react"

export default function PlayPage() {
  const { phase, universe, selectUniverse, startGame, reset, setPhase } = useGameStore()
  const [universes, setUniverses] = useState<Universe[]>([])
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    // On first mount, if we're not already in a game (play phase with universe),
    // reset to the select phase to show universe selection
    if (!initialized) {
      if (phase !== "play" || !universe) {
        setPhase("select")
      }
      setInitialized(true)
    }
  }, [initialized, phase, universe, setPhase])

  useEffect(() => {
    // Load universes from storage + starters
    const stored = getUniverses()
    const all = [...STARTER_UNIVERSES]

    // Add stored universes that aren't duplicates of starters
    for (const u of stored) {
      if (!all.find((s) => s.id === u.id)) {
        all.push(u)
      }
    }

    setUniverses(all)
  }, [])

  // Already in a game - show the game
  if (phase === "play" && universe) {
    return <Game />
  }

  // Creating character
  if (phase === "create" && universe) {
    return <CharacterCreator universe={universe} onComplete={startGame} onBack={() => reset()} />
  }

  // Universe selection (menu or select phase)
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Choose Your Universe</h1>
            <p className="text-muted-foreground">Select a world to begin your adventure</p>
          </div>
        </div>

        <div className="grid gap-4">
          {universes.map((u) => (
            <Card
              key={u.id}
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => selectUniverse(u)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-muted-foreground" />
                      {u.name}
                    </CardTitle>
                    <CardDescription>{u.theme}</CardDescription>
                  </div>
                  {STARTER_UNIVERSES.find((s) => s.id === u.id) && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      Starter
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{u.description}</p>
                <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                  <span>{u.stats.length} stats</span>
                  <span>{u.items.length} items</span>
                  <span>{u.challenges.length} challenges</span>
                </div>
              </CardContent>
            </Card>
          ))}

          {universes.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No universes available</p>
                <Link to="/universes">
                  <Button variant="link">Create one in the editor</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
```

### apps/game-frontend/src/pages/universe-edit.tsx

```tsx
import { UniverseEditor } from "@/universe/universe-editor";
import { useParams } from "react-router-dom";

export default function EditUniversePage() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <div>Universe ID not found</div>;
  }

  return <UniverseEditor universeId={id} />;
}
```

### apps/game-frontend/src/pages/universe-new.tsx

```tsx
import { UniverseEditor } from "@/universe/universe-editor";

export default function NewUniversePage() {
  return <UniverseEditor universeId={crypto.randomUUID()} />;
}
```

### apps/game-frontend/src/pages/universes.tsx

```tsx
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import type { Universe } from "@wdydn/shared";
import { getUniverses, deleteUniverse } from "@/shared/lib/storage";
import { STARTER_UNIVERSES } from "@/shared/data/starter-universes";
import { motion } from "framer-motion";
import { ArrowLeft, Globe, Plus, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { UniverseCard } from "@/universe/universe-card";

export default function UniversesPage() {
  const [universes, setUniverses] = useState<Universe[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadUniverses();
  }, []);

  const loadUniverses = () => {
    const stored = getUniverses();
    const all = [...STARTER_UNIVERSES];

    // Add stored universes that aren't duplicates of starters
    for (const u of stored) {
      if (!all.find((s) => s.id === u.id)) {
        all.push(u);
      }
    }

    setUniverses(all);
  };

  const handleDeleteUniverse = (universeId: string) => {
    deleteUniverse(universeId);
    loadUniverses();
  };

  const filteredUniverses = universes.filter(
    (universe) =>
      universe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      universe.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Globe className="h-8 w-8 text-primary" />
                Universe Manager
              </h1>
              <p className="text-muted-foreground mt-1">
                Create and manage your game universes
              </p>
            </div>
          </div>
          <Link to="/universes/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Universe
            </Button>
          </Link>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search universes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUniverses.map((universe, index) => (
            <UniverseCard
              key={universe.id}
              universe={universe}
              index={index}
              onDelete={() => handleDeleteUniverse(universe.id)}
            />
          ))}
        </div>

        {filteredUniverses.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Globe className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No universes found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery
                ? "Try adjusting your search query"
                : "Create your first universe to get started"}
            </p>
            {!searchQuery && (
              <Link to="/universes/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Universe
                </Button>
              </Link>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
```

### apps/game-frontend/src/shared/components/theme-provider.tsx

```tsx
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

### apps/game-frontend/src/shared/components/ui/alert-dialog.tsx

```tsx
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'
import * as React from 'react'

import { buttonVariants } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'

function AlertDialog({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />
}

function AlertDialogTrigger({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return (
    <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
  )
}

function AlertDialogPortal({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  return (
    <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
  )
}

function AlertDialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn(
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50',
        className,
      )}
      {...props}
    />
  )
}

function AlertDialogContent({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Content>) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        className={cn(
          'bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg',
          className,
        )}
        {...props}
      />
    </AlertDialogPortal>
  )
}

function AlertDialogHeader({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn('flex flex-col gap-2 text-center sm:text-left', className)}
      {...props}
    />
  )
}

function AlertDialogFooter({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
        className,
      )}
      {...props}
    />
  )
}

function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn('text-lg font-semibold', className)}
      {...props}
    />
  )
}

function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
}

function AlertDialogAction({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action>) {
  return (
    <AlertDialogPrimitive.Action
      className={cn(buttonVariants(), className)}
      {...props}
    />
  )
}

function AlertDialogCancel({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel>) {
  return (
    <AlertDialogPrimitive.Cancel
      className={cn(buttonVariants({ variant: 'outline' }), className)}
      {...props}
    />
  )
}

export {
    AlertDialog,
    AlertDialogPortal,
    AlertDialogOverlay,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogAction,
    AlertDialogCancel,
}
```

### apps/game-frontend/src/shared/components/ui/badge.tsx

```tsx
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/shared/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
```

### apps/game-frontend/src/shared/components/ui/button.tsx

```tsx
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/shared/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive:
          'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost:
          'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
```

### apps/game-frontend/src/shared/components/ui/card.tsx

```tsx
import * as React from "react";

import { cn } from "@/shared/lib/utils";

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border shadow-sm py-4",
        className
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
```

### apps/game-frontend/src/shared/components/ui/collapsible.tsx

```tsx
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";

function Collapsible({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />;
}

function CollapsibleTrigger({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>) {
  return (
    <CollapsiblePrimitive.CollapsibleTrigger
      data-slot="collapsible-trigger"
      {...props}
    />
  );
}

function CollapsibleContent({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) {
  return (
    <CollapsiblePrimitive.CollapsibleContent
      data-slot="collapsible-content"
      {...props}
    />
  );
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
```

### apps/game-frontend/src/shared/components/ui/dialog.tsx

```tsx
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import * as React from "react";

import { cn } from "@/shared/lib/utils";

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean;
}) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
```

### apps/game-frontend/src/shared/components/ui/dropdown-menu.tsx

```tsx
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { CheckIcon, ChevronRightIcon, CircleIcon } from 'lucide-react'
import * as React from 'react'

import { cn } from '@/shared/lib/utils'

function DropdownMenu({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

function DropdownMenuPortal({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  return (
    <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
  )
}

function DropdownMenuTrigger({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return (
    <DropdownMenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      {...props}
    />
  )
}

function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn(
          'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md',
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

function DropdownMenuGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return (
    <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
  )
}

function DropdownMenuItem({
  className,
  inset,
  variant = 'default',
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean
  variant?: 'default' | 'destructive'
}) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  )
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  )
}

function DropdownMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
  return (
    <DropdownMenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  )
}

function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  )
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        'px-2 py-1.5 text-sm font-medium data-[inset]:pl-8',
        className,
      )}
      {...props}
    />
  )
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn('bg-border -mx-1 my-1 h-px', className)}
      {...props}
    />
  )
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        'text-muted-foreground ml-auto text-xs tracking-widest',
        className,
      )}
      {...props}
    />
  )
}

function DropdownMenuSub({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </DropdownMenuPrimitive.SubTrigger>
  )
}

function DropdownMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  return (
    <DropdownMenuPrimitive.SubContent
      data-slot="dropdown-menu-sub-content"
      className={cn(
        'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg',
        className,
      )}
      {...props}
    />
  )
}

export {
    DropdownMenu,
    DropdownMenuPortal,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuLabel,
    DropdownMenuItem,
    DropdownMenuCheckboxItem,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
}
```

### apps/game-frontend/src/shared/components/ui/input.tsx

```tsx
import * as React from 'react'

import { cn } from '@/shared/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
```

### apps/game-frontend/src/shared/components/ui/label.tsx

```tsx
import * as LabelPrimitive from '@radix-ui/react-label'
import * as React from 'react'

import { cn } from '@/shared/lib/utils'

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        'flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export { Label }
```

### apps/game-frontend/src/shared/components/ui/popover.tsx

```tsx
import * as PopoverPrimitive from '@radix-ui/react-popover'
import * as React from 'react'

import { cn } from '@/shared/lib/utils'

function Popover({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

function PopoverTrigger({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

function PopoverContent({
  className,
  align = 'center',
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden',
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
}

function PopoverAnchor({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }
```

### apps/game-frontend/src/shared/components/ui/progress.tsx

```tsx
import * as ProgressPrimitive from '@radix-ui/react-progress'
import * as React from 'react'

import { cn } from '@/shared/lib/utils'

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        'bg-primary/20 relative h-2 w-full overflow-hidden rounded-full',
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="bg-primary h-full w-full flex-1 transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
```

### apps/game-frontend/src/shared/components/ui/scroll-area.tsx

```tsx
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area'
import * as React from 'react'

import { cn } from '@/shared/lib/utils'

function ScrollArea({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Root>) {
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn('relative', className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        className="focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1"
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
}

function ScrollBar({
  className,
  orientation = 'vertical',
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(
        'flex touch-none p-px transition-colors select-none',
        orientation === 'vertical' &&
          'h-full w-2.5 border-l border-l-transparent',
        orientation === 'horizontal' &&
          'h-2.5 flex-col border-t border-t-transparent',
        className,
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        className="bg-border relative flex-1 rounded-full"
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  )
}

export { ScrollArea, ScrollBar }
```

### apps/game-frontend/src/shared/components/ui/select.tsx

```tsx
import * as SelectPrimitive from '@radix-ui/react-select'
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react'
import * as React from 'react'

import { cn } from '@/shared/lib/utils'

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectTrigger({
  className,
  size = 'default',
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: 'sm' | 'default'
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="size-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  position = 'popper',
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-md',
          position === 'popper' &&
            'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
          className,
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            'p-1',
            position === 'popper' &&
              'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1',
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn('text-muted-foreground px-2 py-1.5 text-xs', className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className,
      )}
      {...props}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn('bg-border pointer-events-none -mx-1 my-1 h-px', className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        'flex cursor-default items-center justify-center py-1',
        className,
      )}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        'flex cursor-default items-center justify-center py-1',
        className,
      )}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  )
}

export {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectScrollDownButton,
    SelectScrollUpButton,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
}
```

### apps/game-frontend/src/shared/components/ui/sheet.tsx

```tsx
import * as React from 'react'
import * as SheetPrimitive from '@radix-ui/react-dialog'
import { XIcon } from 'lucide-react'

import { cn } from '@/shared/lib/utils'

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50',
        className,
      )}
      {...props}
    />
  )
}

function SheetContent({
  className,
  children,
  side = 'right',
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: 'top' | 'right' | 'bottom' | 'left'
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          'bg-background data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500',
          side === 'right' &&
            'data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm',
          side === 'left' &&
            'data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm',
          side === 'top' &&
            'data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto border-b',
          side === 'bottom' &&
            'data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto border-t',
          className,
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none">
          <XIcon className="size-4" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sheet-header"
      className={cn('flex flex-col gap-1.5 p-4', className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn('mt-auto flex flex-col gap-2 p-4', className)}
      {...props}
    />
  )
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn('text-foreground font-semibold', className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
```

### apps/game-frontend/src/shared/components/ui/slider.tsx

```tsx
import * as SliderPrimitive from '@radix-ui/react-slider'
import * as React from 'react'

import { cn } from '@/shared/lib/utils'

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max],
  )

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        'relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col',
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={
          'bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5'
        }
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={
            'bg-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full'
          }
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className="border-primary ring-ring/50 block size-4 shrink-0 rounded-full border bg-white shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
        />
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }
```

### apps/game-frontend/src/shared/components/ui/smart-input.tsx

```tsx
import { Button } from "@/shared/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/shared/components/ui/dropdown-menu"
import { Input } from "@/shared/components/ui/input"
import { Textarea } from "@/shared/components/ui/textarea"
import { cn } from "@/shared/lib/utils"
import { AlignLeft, ChevronDown, FileText, Lightbulb, Loader2, Sparkles, Wand2 } from "lucide-react"
import type * as React from "react"
import { useCallback, useState } from "react"

export type SmartInputAction = {
  id: "generate" | "expand" | "improve" | "summarize" | "suggest-names"
  label: string
  icon: React.ElementType
  description?: string
  requiresValue?: boolean // If true, action only shows when there's existing content
}

export const DEFAULT_TEXT_ACTIONS: SmartInputAction[] = [
  { id: "generate", label: "Generate", icon: Sparkles, description: "AI generates content" },
  { id: "expand", label: "Expand", icon: Wand2, description: "Expand and improve", requiresValue: true },
  { id: "improve", label: "Improve", icon: Lightbulb, description: "Fix and enhance", requiresValue: true },
  { id: "summarize", label: "Summarize", icon: AlignLeft, description: "Make it concise", requiresValue: true },
]

export const DEFAULT_NAME_ACTIONS: SmartInputAction[] = [
  { id: "generate", label: "Generate", icon: Sparkles, description: "AI generates a name" },
  { id: "suggest-names", label: "Suggest Options", icon: FileText, description: "Get multiple suggestions" },
  { id: "improve", label: "Improve", icon: Lightbulb, description: "Refine the name", requiresValue: true },
]

interface SmartInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  inputClassName?: string
  multiline?: boolean
  rows?: number
  actions?: SmartInputAction[]
  fieldType: string // Used to customize AI prompts
  context?: Record<string, unknown> // Additional context for AI
  disabled?: boolean
  onSuggestionsReceived?: (suggestions: string[]) => void // For handling multiple suggestions
}

export function SmartInput({
  value,
  onChange,
  placeholder,
  className,
  inputClassName,
  multiline = false,
  rows = 3,
  actions = multiline ? DEFAULT_TEXT_ACTIONS : DEFAULT_NAME_ACTIONS,
  fieldType,
  context = {},
  disabled = false,
  onSuggestionsReceived,
}: SmartInputProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingAction, setLoadingAction] = useState<string | null>(null)

  const executeAction = useCallback(
    async (actionId: string) => {
      setIsLoading(true)
      setLoadingAction(actionId)

      try {
        const response = await fetch("/api/ai/smart-input", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: actionId,
            value,
            context,
            fieldType,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to generate content")
        }

        const data = await response.json()

        if (actionId === "suggest-names" && onSuggestionsReceived) {
          // Parse multiple suggestions (one per line)
          const suggestions = data.result
            .split("\n")
            .map((s: string) => s.trim())
            .filter((s: string) => s.length > 0)
          onSuggestionsReceived(suggestions)
        } else {
          onChange(data.result)
        }
      } catch (error) {
        console.error("[v0] Smart input error:", error)
      } finally {
        setIsLoading(false)
        setLoadingAction(null)
      }
    },
    [value, context, fieldType, onChange, onSuggestionsReceived],
  )

  const availableActions = actions.filter((action) => {
    if (action.requiresValue && !value.trim()) {
      return false
    }
    return true
  })

  const InputComponent = multiline ? Textarea : Input

  return (
    <div className={cn("relative flex items-start gap-2", className)}>
      <div className="relative flex-1">
        <InputComponent
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          rows={multiline ? rows : undefined}
          className={cn(inputClassName, isLoading && "opacity-70")}
        />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-md bg-background/50">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={disabled || isLoading || availableActions.length === 0}
            className="shrink-0 bg-transparent"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <ChevronDown className="absolute -bottom-0.5 -right-0.5 h-3 w-3" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="flex items-center gap-2 text-xs font-normal text-muted-foreground">
            <Sparkles className="h-3 w-3" />
            AI Actions
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {availableActions.map((action) => {
            const Icon = action.icon
            return (
              <DropdownMenuItem
                key={action.id}
                onClick={() => executeAction(action.id)}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {loadingAction === action.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
                <div className="flex flex-col">
                  <span>{action.label}</span>
                  {action.description && <span className="text-xs text-muted-foreground">{action.description}</span>}
                </div>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

// Wrapper component for handling name suggestions with a popover
interface SmartNameInputProps extends Omit<SmartInputProps, "multiline" | "onSuggestionsReceived"> {
  showSuggestions?: boolean
}

export function SmartNameInput({ showSuggestions = true, ...props }: SmartNameInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestionsDropdown, setShowSuggestionsDropdown] = useState(false)

  const handleSuggestionsReceived = useCallback((newSuggestions: string[]) => {
    setSuggestions(newSuggestions)
    setShowSuggestionsDropdown(true)
  }, [])

  const handleSelectSuggestion = useCallback(
    (suggestion: string) => {
      props.onChange(suggestion)
      setShowSuggestionsDropdown(false)
      setSuggestions([])
    },
    [props.onChange],
  )

  return (
    <div className="relative">
      <SmartInput
        {...props}
        multiline={false}
        onSuggestionsReceived={showSuggestions ? handleSuggestionsReceived : undefined}
      />

      {showSuggestionsDropdown && suggestions.length > 0 && (
        <div className="absolute top-full left-0 z-50 mt-1 w-full rounded-md border bg-popover p-1 shadow-md">
          <div className="mb-1 px-2 py-1 text-xs font-medium text-muted-foreground">Suggestions</div>
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelectSuggestion(suggestion)}
              className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
            >
              {suggestion}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowSuggestionsDropdown(false)}
            className="mt-1 w-full rounded-sm px-2 py-1 text-center text-xs text-muted-foreground hover:bg-accent"
          >
            Close
          </button>
        </div>
      )}
    </div>
  )
}
```

### apps/game-frontend/src/shared/components/ui/switch.tsx

```tsx
import * as SwitchPrimitive from '@radix-ui/react-switch'
import * as React from 'react'

import { cn } from '@/shared/lib/utils'

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={
          'bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block size-4 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0'
        }
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
```

### apps/game-frontend/src/shared/components/ui/tabs.tsx

```tsx
import * as TabsPrimitive from '@radix-ui/react-tabs'
import * as React from 'react'

import { cn } from '@/shared/lib/utils'

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn('flex flex-col gap-2', className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        'bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]',
        className,
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn('flex-1 outline-none', className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
```

### apps/game-frontend/src/shared/components/ui/textarea.tsx

```tsx
import * as React from 'react'

import { cn } from '@/shared/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
```

### apps/game-frontend/src/shared/data/starter-universes.ts

```typescript
import type { Universe } from "@wdydn/shared"
import { COMBAT_TEMPLATE } from "@/game/engine/templates"

export const FANTASY_UNIVERSE: Universe = {
  id: "fantasy-default",
  name: "Realm of Shadows",
  description: "A dark fantasy world where magic and steel clash in an eternal struggle.",
  theme: "dark fantasy",

  stats: [
    {
      id: "strength",
      name: "Strength",
      short: "STR",
      description: "Physical power and melee damage",
      type: "core",
      display: {
        icon: "sword",
        color: "text-red-500",
        style: "number",
        showInCreator: true,
        showInSheet: true,
        order: 1,
      },
      range: { min: 1, max: 20 },
    },
    {
      id: "agility",
      name: "Agility",
      short: "AGI",
      description: "Speed and reflexes",
      type: "core",
      display: {
        icon: "zap",
        color: "text-green-500",
        style: "number",
        showInCreator: true,
        showInSheet: true,
        order: 2,
      },
      range: { min: 1, max: 20 },
    },
    {
      id: "intelligence",
      name: "Intelligence",
      short: "INT",
      description: "Mental acuity and magic power",
      type: "core",
      display: {
        icon: "brain",
        color: "text-blue-500",
        style: "number",
        showInCreator: true,
        showInSheet: true,
        order: 3,
      },
      range: { min: 1, max: 20 },
    },
    {
      id: "vitality",
      name: "Vitality",
      short: "VIT",
      description: "Health and stamina",
      type: "core",
      display: {
        icon: "heart",
        color: "text-pink-500",
        style: "number",
        showInCreator: true,
        showInSheet: true,
        order: 4,
      },
      range: { min: 1, max: 20 },
    },
    {
      id: "hp",
      name: "Health Points",
      short: "HP",
      description: "Your life force",
      type: "computed",
      display: {
        icon: "heart-pulse",
        color: "text-red-500",
        style: "bar",
        barColor: "bg-red-500",
        showInSheet: true,
        order: 5,
      },
      calculation: [
        { type: "stat", id: "vitality" },
        { type: "op", value: "*" },
        { type: "number", value: 10 },
        { type: "op", value: "+" },
        { type: "number", value: 50 },
      ],
      clamp: { min: 1 },
    },
    {
      id: "attack",
      name: "Attack Power",
      short: "ATK",
      description: "Base damage dealt",
      type: "computed",
      display: {
        icon: "sword",
        color: "text-orange-500",
        style: "number",
        showInSheet: true,
        order: 6,
      },
      calculation: [
        { type: "stat", id: "strength" },
        { type: "op", value: "*" },
        { type: "number", value: 2 },
        { type: "op", value: "+" },
        { type: "stat", id: "agility" },
      ],
    },
    {
      id: "defense",
      name: "Defense",
      short: "DEF",
      description: "Damage reduction",
      type: "computed",
      display: {
        icon: "shield",
        color: "text-slate-500",
        style: "number",
        showInSheet: true,
        order: 7,
      },
      calculation: [
        { type: "stat", id: "vitality" },
        { type: "op", value: "+" },
        { type: "fn", name: "floor" },
        { type: "paren", value: "(" },
        { type: "stat", id: "strength" },
        { type: "op", value: "/" },
        { type: "number", value: 2 },
        { type: "paren", value: ")" },
      ],
    },
  ],

  items: [
    {
      id: "iron-sword",
      name: "Iron Sword",
      description: "A sturdy blade forged from iron.",
      icon: "sword",
      rarity: "common",
      kind: "equipment",
      slot: "weapon",
      bonuses: [{ statId: "strength", amount: 3 }],
    },
    {
      id: "leather-armor",
      name: "Leather Armor",
      description: "Basic protection made from treated leather.",
      icon: "shirt",
      rarity: "common",
      kind: "equipment",
      slot: "body",
      bonuses: [{ statId: "vitality", amount: 2 }],
    },
    {
      id: "health-potion",
      name: "Health Potion",
      description: "Restores 20 HP when consumed.",
      icon: "flask-round",
      rarity: "common",
      kind: "consumable",
      stackable: true,
      maxStack: 10,
      effect: [{ statId: "hp", amount: 20 }],
    },
  ],

  challenges: [
    {
      ...COMBAT_TEMPLATE,
      id: "fantasy-combat",
      trackedStats: [{ statId: "hp", showAs: "bar", label: "HP" }],
      rounds: [
        {
          type: "damage",
          target: "enemy",
          stat: "hp",
          amount: [
            { type: "role", role: "player", stat: "attack" },
            { type: "op", value: "-" },
            { type: "fn", name: "floor" },
            { type: "paren", value: "(" },
            { type: "role", role: "enemy", stat: "defense" },
            { type: "op", value: "/" },
            { type: "number", value: 2 },
            { type: "paren", value: ")" },
          ],
          message: "{player.name} strikes with their weapon for {amount} damage!",
        },
        {
          type: "check",
          condition: [{ type: "role", role: "enemy", stat: "hp" }],
          onTrue: "victory",
        },
        {
          type: "damage",
          target: "player",
          stat: "hp",
          amount: [
            { type: "role", role: "enemy", stat: "attack" },
            { type: "op", value: "-" },
            { type: "fn", name: "floor" },
            { type: "paren", value: "(" },
            { type: "role", role: "player", stat: "defense" },
            { type: "op", value: "/" },
            { type: "number", value: 2 },
            { type: "paren", value: ")" },
          ],
          message: "{enemy.name} retaliates for {amount} damage!",
        },
        {
          type: "check",
          condition: [{ type: "role", role: "player", stat: "hp" }],
          onTrue: "defeat",
        },
      ],
    },
  ],

  npcs: [
    {
      id: "goblin",
      name: "Goblin",
      description: "A small, cunning creature.",
      role: "enemy",
      stats: { hp: 30, attack: 8, defense: 2, strength: 4, agility: 6 },
    },
    {
      id: "skeleton",
      name: "Skeleton Warrior",
      description: "An undead soldier wielding a rusty blade.",
      role: "enemy",
      stats: { hp: 50, attack: 12, defense: 5, strength: 6, agility: 4 },
    },
    {
      id: "wise-elder",
      name: "Elder Moira",
      description: "A wise village elder who guides heroes.",
      role: "mentor",
      stats: { intelligence: 18 },
    },
  ],

  locations: [
    {
      id: "village",
      name: "Thornwood Village",
      description: "A small settlement at the edge of the dark forest.",
    },
    {
      id: "forest",
      name: "The Whispering Woods",
      description: "An ancient forest where shadows seem to move on their own.",
    },
    {
      id: "dungeon",
      name: "The Forgotten Crypt",
      description: "A crumbling tomb filled with restless dead.",
    },
  ],

  config: {
    startingPoints: 15,
    pointsPerLevel: 3,
    equipmentSlots: ["head", "body", "weapon", "accessory"],
  },
}

export const SCIFI_UNIVERSE: Universe = {
  id: "scifi-default",
  name: "Neon Frontier",
  description: "A cyberpunk future where corporations rule and hackers fight for freedom.",
  theme: "sci-fi cyberpunk",

  stats: [
    {
      id: "body",
      name: "Body",
      short: "BOD",
      description: "Physical capability and endurance",
      type: "core",
      display: {
        icon: "activity",
        color: "text-red-500",
        style: "number",
        showInCreator: true,
        showInSheet: true,
        order: 1,
      },
      range: { min: 1, max: 20 },
    },
    {
      id: "reflexes",
      name: "Reflexes",
      short: "REF",
      description: "Speed and reaction time",
      type: "core",
      display: {
        icon: "zap",
        color: "text-yellow-500",
        style: "number",
        showInCreator: true,
        showInSheet: true,
        order: 2,
      },
      range: { min: 1, max: 20 },
    },
    {
      id: "tech",
      name: "Tech",
      short: "TECH",
      description: "Technical ability and hacking skill",
      type: "core",
      display: {
        icon: "cpu",
        color: "text-cyan-500",
        style: "number",
        showInCreator: true,
        showInSheet: true,
        order: 3,
      },
      range: { min: 1, max: 20 },
    },
    {
      id: "cool",
      name: "Cool",
      short: "COOL",
      description: "Composure and social influence",
      type: "core",
      display: {
        icon: "smile",
        color: "text-purple-500",
        style: "number",
        showInCreator: true,
        showInSheet: true,
        order: 4,
      },
      range: { min: 1, max: 20 },
    },
    {
      id: "health",
      name: "Health",
      short: "HP",
      description: "Physical health",
      type: "computed",
      display: {
        icon: "heart-pulse",
        color: "text-red-500",
        style: "bar",
        showInSheet: true,
        order: 5,
      },
      calculation: [
        { type: "stat", id: "body" },
        { type: "op", value: "*" },
        { type: "number", value: 5 },
        { type: "op", value: "+" },
        { type: "number", value: 30 },
      ],
    },
    {
      id: "initiative",
      name: "Initiative",
      short: "INIT",
      description: "Combat turn order",
      type: "computed",
      display: {
        icon: "timer",
        color: "text-orange-500",
        style: "number",
        showInSheet: true,
        order: 6,
      },
      calculation: [
        { type: "stat", id: "reflexes" },
        { type: "op", value: "+" },
        { type: "stat", id: "cool" },
      ],
    },
  ],

  items: [
    {
      id: "cyber-pistol",
      name: "Smart Pistol",
      description: "A compact handgun with targeting assist.",
      icon: "crosshair",
      rarity: "common",
      kind: "equipment",
      slot: "weapon",
      bonuses: [{ statId: "reflexes", amount: 2 }],
    },
    {
      id: "stim-pack",
      name: "Stim Pack",
      description: "Emergency medical nano-injection.",
      icon: "syringe",
      rarity: "common",
      kind: "consumable",
      stackable: true,
      maxStack: 5,
      effect: [{ statId: "health", amount: 15 }],
    },
  ],

  challenges: [COMBAT_TEMPLATE],

  npcs: [
    {
      id: "corp-guard",
      name: "Corporate Security",
      description: "Armed guards protecting corporate interests.",
      role: "enemy",
      stats: { health: 40, body: 6, reflexes: 5 },
    },
    {
      id: "fixer",
      name: "The Fixer",
      description: "A mysterious contact who arranges jobs.",
      role: "ally",
      stats: { cool: 15, tech: 10 },
    },
  ],

  locations: [
    {
      id: "downtown",
      name: "Neon District",
      description: "The glowing heart of the megacity.",
    },
    {
      id: "undercity",
      name: "The Undercity",
      description: "Where the forgotten masses survive in the shadows.",
    },
  ],

  config: {
    startingPoints: 20,
    pointsPerLevel: 4,
    equipmentSlots: ["cyberware", "weapon", "armor", "gadget"],
  },
}

export const STARTER_UNIVERSES = [FANTASY_UNIVERSE, SCIFI_UNIVERSE]
```

### apps/game-frontend/src/shared/lib/calc.ts

```typescript
import type { Token, Stat } from "@wdydn/shared"

interface Context {
  stats: Record<string, number> // Resolved stat values
  roles?: Record<string, Record<string, number>> // For challenges
  vars?: Record<string, number> // Temporary variables
}

/**
 * Evaluate a calculation expression using shunting-yard algorithm
 */
export function evaluate(tokens: Token[], ctx: Context): number {
  if (!tokens.length) return 0

  const output: number[] = []
  const ops: string[] = []

  const precedence: Record<string, number> = { "+": 1, "-": 1, "*": 2, "/": 2 }

  const apply = () => {
    const op = ops.pop()!
    const b = output.pop()!
    const a = output.pop()!
    switch (op) {
      case "+":
        output.push(a + b)
        break
      case "-":
        output.push(a - b)
        break
      case "*":
        output.push(a * b)
        break
      case "/":
        output.push(b ? a / b : 0)
        break
    }
  }

  for (const token of tokens) {
    switch (token.type) {
      case "number":
        output.push(token.value)
        break

      case "stat":
        output.push(ctx.stats[token.id] ?? ctx.vars?.[token.id] ?? 0)
        break

      case "role":
        output.push(ctx.roles?.[token.role]?.[token.stat] ?? 0)
        break

      case "op":
        while (ops.length && ops.at(-1) !== "(" && precedence[ops.at(-1)!] >= precedence[token.value]) {
          apply()
        }
        ops.push(token.value)
        break

      case "paren":
        if (token.value === "(") {
          ops.push("(")
        } else {
          while (ops.at(-1) !== "(") apply()
          ops.pop()
          // Check for function
          if (["min", "max", "floor"].includes(ops.at(-1) ?? "")) {
            const fn = ops.pop()!
            const val = output.pop()!
            const prev = output.pop() ?? val
            switch (fn) {
              case "min":
                output.push(Math.min(prev, val))
                break
              case "max":
                output.push(Math.max(prev, val))
                break
              case "floor":
                output.push(Math.floor(val))
                break
            }
          }
        }
        break

      case "fn":
        ops.push(token.name)
        break
    }
  }

  while (ops.length) apply()
  return output[0] ?? 0
}

/**
 * Calculate all stats for a character
 */
export function resolveStats(
  definitions: Stat[],
  baseStats: Record<string, number>,
  equipmentBonuses: Record<string, number> = {},
): Record<string, number> {
  const result: Record<string, number> = {}

  // First: core stats with equipment
  for (const stat of definitions.filter((s) => s.type === "core")) {
    result[stat.id] = (baseStats[stat.id] ?? 0) + (equipmentBonuses[stat.id] ?? 0)
  }

  // Then: computed stats (may depend on core stats)
  for (const stat of definitions.filter((s) => s.type === "computed")) {
    if (!stat.calculation) continue

    let value = evaluate(stat.calculation, { stats: result })

    // Apply clamps
    if (stat.clamp?.min !== undefined) value = Math.max(stat.clamp.min, value)
    if (stat.clamp?.max !== undefined) value = Math.min(stat.clamp.max, value)

    result[stat.id] = Math.round(value)
  }

  return result
}

/**
 * Convert tokens to readable string for display
 */
export function toReadable(tokens: Token[], statNames: Record<string, string>): string {
  return tokens
    .map((t) => {
      switch (t.type) {
        case "stat":
          return statNames[t.id] ?? t.id
        case "number":
          return t.value.toString()
        case "op":
          return t.value
        case "paren":
          return t.value
        case "fn":
          return t.name + "("
        case "role":
          return `${t.role}.${statNames[t.stat] ?? t.stat}`
      }
    })
    .join(" ")
}

/**
 * Parse a simple expression string into tokens
 * e.g., "strength * 2 + 10" -> Token[]
 */
export function parseExpression(expr: string, validStats: string[]): Token[] {
  const tokens: Token[] = []
  const parts = expr.match(/(\w+\.?\w*|\d+|[+\-*/()])/g) || []

  for (const part of parts) {
    if (/^\d+$/.test(part)) {
      tokens.push({ type: "number", value: Number.parseInt(part, 10) })
    } else if (["+", "-", "*", "/"].includes(part)) {
      tokens.push({ type: "op", value: part as "+" | "-" | "*" | "/" })
    } else if (["(", ")"].includes(part)) {
      tokens.push({ type: "paren", value: part as "(" | ")" })
    } else if (["min", "max", "floor"].includes(part)) {
      tokens.push({ type: "fn", name: part as "min" | "max" | "floor" })
    } else if (part.includes(".")) {
      const [role, stat] = part.split(".")
      tokens.push({ type: "role", role, stat })
    } else if (validStats.includes(part)) {
      tokens.push({ type: "stat", id: part })
    }
  }

  return tokens
}
```

### apps/game-frontend/src/shared/lib/storage.ts

```typescript
import type { Universe, GameState } from "@wdydn/shared"

const UNIVERSES_KEY = "rpg-universes-v2"
const GAMES_KEY = "rpg-games-v2"

// ============================================
// UNIVERSE STORAGE
// ============================================

export function getUniverses(): Universe[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(UNIVERSES_KEY)
  return data ? JSON.parse(data) : []
}

export function getUniverse(id: string): Universe | null {
  return getUniverses().find((u) => u.id === id) ?? null
}

export function saveUniverse(universe: Universe): void {
  const universes = getUniverses()
  const index = universes.findIndex((u) => u.id === universe.id)

  if (index >= 0) {
    universes[index] = universe
  } else {
    universes.push(universe)
  }

  localStorage.setItem(UNIVERSES_KEY, JSON.stringify(universes))
}

export function deleteUniverse(id: string): void {
  const universes = getUniverses().filter((u) => u.id !== id)
  localStorage.setItem(UNIVERSES_KEY, JSON.stringify(universes))
}

export function duplicateUniverse(id: string): Universe | null {
  const original = getUniverse(id)
  if (!original) return null

  const copy: Universe = {
    ...structuredClone(original),
    id: crypto.randomUUID(),
    name: `${original.name} (Copy)`,
  }

  saveUniverse(copy)
  return copy
}

// ============================================
// GAME STATE STORAGE
// ============================================

export function getGames(): GameState[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(GAMES_KEY)
  return data ? JSON.parse(data) : []
}

export function getGame(id: string): GameState | null {
  return getGames().find((g) => g.id === id) ?? null
}

export function saveGame(game: GameState): void {
  const games = getGames()
  const index = games.findIndex((g) => g.id === game.id)

  if (index >= 0) {
    games[index] = game
  } else {
    games.push(game)
  }

  localStorage.setItem(GAMES_KEY, JSON.stringify(games))
}

export function deleteGame(id: string): void {
  const games = getGames().filter((g) => g.id !== id)
  localStorage.setItem(GAMES_KEY, JSON.stringify(games))
}

export function getGamesByUniverse(universeId: string): GameState[] {
  return getGames().filter((g) => g.universeId === universeId)
}

// ============================================
// EXPORT / IMPORT
// ============================================

export function exportUniverse(universe: Universe): string {
  return JSON.stringify(universe, null, 2)
}

export function importUniverse(json: string): Universe {
  const universe = JSON.parse(json) as Universe
  // Ensure new ID to avoid conflicts
  universe.id = crypto.randomUUID()
  saveUniverse(universe)
  return universe
}

export function exportAllData(): string {
  return JSON.stringify(
    {
      universes: getUniverses(),
      games: getGames(),
      exportedAt: new Date().toISOString(),
    },
    null,
    2,
  )
}

export function importAllData(json: string): void {
  const data = JSON.parse(json)
  if (data.universes) {
    localStorage.setItem(UNIVERSES_KEY, JSON.stringify(data.universes))
  }
  if (data.games) {
    localStorage.setItem(GAMES_KEY, JSON.stringify(data.games))
  }
}
```

### apps/game-frontend/src/shared/lib/utils.ts

```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### apps/game-frontend/src/universe/calculation-builder.tsx

```tsx
import { useState } from "react";
import { Plus, X, Calculator } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/shared/components/ui/popover";
import { toReadable } from "@/shared/lib/calc";
import { cn } from "@/shared/lib/utils";
import { type Token, type Stat } from "@wdydn/shared";

interface Props {
  tokens: Token[];
  onChange: (tokens: Token[]) => void;
  availableStats: Stat[];
  allowRoles?: boolean;
  roles?: string[];
  className?: string;
}

export function CalculationBuilder({
  tokens,
  onChange,
  availableStats,
  allowRoles = false,
  roles = [],
  className,
}: Props) {
  const [numberInput, setNumberInput] = useState("");

  const statNames = Object.fromEntries(
    availableStats.map((s) => [s.id, s.name])
  );

  const addToken = (token: Token) => {
    onChange([...tokens, token]);
  };

  const removeToken = (index: number) => {
    onChange(tokens.filter((_, i) => i !== index));
  };

  const addNumber = () => {
    const num = Number.parseFloat(numberInput);
    if (!isNaN(num)) {
      addToken({ type: "number", value: num });
      setNumberInput("");
    }
  };

  const readable = toReadable(tokens, statNames);

  return (
    <div className={cn("space-y-3", className)}>
      {/* Display current formula */}
      <div className="p-3 bg-muted rounded-lg min-h-[60px] flex flex-wrap items-center gap-1">
        {tokens.length === 0 ? (
          <span className="text-muted-foreground text-sm">
            Click below to build a calculation...
          </span>
        ) : (
          tokens.map((token, index) => (
            <TokenChip
              key={index}
              token={token}
              statNames={statNames}
              onRemove={() => removeToken(index)}
            />
          ))
        )}
      </div>

      {/* Preview */}
      {tokens.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calculator className="h-4 w-4" />
          <span className="font-mono">{readable}</span>
        </div>
      )}

      {/* Token buttons */}
      <div className="flex flex-wrap gap-2">
        {/* Stats */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-3 w-3 mr-1" />
              Stat
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2" align="start">
            <div className="space-y-1">
              {availableStats.map((stat) => (
                <Button
                  key={stat.id}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => addToken({ type: "stat", id: stat.id })}
                >
                  {stat.name}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Roles (for challenges) */}
        {allowRoles && roles.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-3 w-3 mr-1" />
                Role.Stat
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2" align="start">
              <div className="space-y-1">
                {roles.map((role) => (
                  <div key={role} className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground px-2">
                      {role}
                    </p>
                    {availableStats.map((stat) => (
                      <Button
                        key={`${role}.${stat.id}`}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() =>
                          addToken({ type: "role", role, stat: stat.id })
                        }
                      >
                        {role}.{stat.name}
                      </Button>
                    ))}
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Operators */}
        {["+", "-", "*", "/"].map((op) => (
          <Button
            key={op}
            variant="outline"
            size="sm"
            onClick={() =>
              addToken({ type: "op", value: op as "+" | "-" | "*" | "/" })
            }
          >
            {op}
          </Button>
        ))}

        {/* Parentheses */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => addToken({ type: "paren", value: "(" })}
        >
          (
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => addToken({ type: "paren", value: ")" })}
        >
          )
        </Button>

        {/* Functions */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              fn()
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-32 p-2" align="start">
            <div className="space-y-1">
              {(["min", "max", "floor"] as const).map((fn) => (
                <Button
                  key={fn}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => addToken({ type: "fn", name: fn })}
                >
                  {fn}()
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Number input */}
        <div className="flex items-center gap-1">
          <Input
            type="number"
            value={numberInput}
            onChange={(e) => setNumberInput(e.target.value)}
            placeholder="#"
            className="w-16 h-8 text-sm"
            onKeyDown={(e) => e.key === "Enter" && addNumber()}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={addNumber}
            disabled={!numberInput}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Clear */}
      {tokens.length > 0 && (
        <Button variant="ghost" size="sm" onClick={() => onChange([])}>
          Clear All
        </Button>
      )}
    </div>
  );
}

function TokenChip({
  token,
  statNames,
  onRemove,
}: {
  token: Token;
  statNames: Record<string, string>;
  onRemove: () => void;
}) {
  let label = "";
  let variant: "stat" | "number" | "op" | "fn" | "role" = "op";

  switch (token.type) {
    case "stat":
      label = statNames[token.id] ?? token.id;
      variant = "stat";
      break;
    case "number":
      label = token.value.toString();
      variant = "number";
      break;
    case "op":
      label = token.value;
      variant = "op";
      break;
    case "paren":
      label = token.value;
      variant = "op";
      break;
    case "fn":
      label = token.name + "(";
      variant = "fn";
      break;
    case "role":
      label = `${token.role}.${statNames[token.stat] ?? token.stat}`;
      variant = "role";
      break;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-1 rounded text-sm font-mono",
        variant === "stat" && "bg-blue-500/20 text-blue-400",
        variant === "number" && "bg-green-500/20 text-green-400",
        variant === "op" && "bg-muted text-foreground",
        variant === "fn" && "bg-purple-500/20 text-purple-400",
        variant === "role" && "bg-orange-500/20 text-orange-400"
      )}
    >
      {label}
      <button
        onClick={onRemove}
        className="hover:text-red-400 transition-colors"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}
```

### apps/game-frontend/src/universe/challenge-editor.tsx

```tsx
import { useState } from "react";
import type {
  ChallengeTemplate,
  Stat,
  RoundAction,
  Outcome,
} from "@wdydn/shared";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Switch } from "@/shared/components/ui/switch";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Swords,
  Play,
  Target,
  MessageSquare,
  Dices,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { CalculationBuilder } from "@/universe/calculation-builder";

interface Props {
  challenges: ChallengeTemplate[];
  onChange: (challenges: ChallengeTemplate[]) => void;
  stats: Stat[];
}

const DEFAULT_CHALLENGE: Omit<ChallengeTemplate, "id"> = {
  name: "New Challenge",
  description: "",
  icon: "swords",
  roles: [
    { id: "player", name: "Player", required: true },
    { id: "enemy", name: "Enemy", required: true },
  ],
  trackedStats: [],
  rounds: [],
  outcomes: [
    { id: "victory", name: "Victory", description: "You won!", result: "win" },
    { id: "defeat", name: "Defeat", description: "You lost.", result: "lose" },
  ],
  maxRounds: 50,
  display: {
    roundDelay: 1000,
    showLog: true,
    theme: "combat",
  },
};

export function ChallengeEditor({ challenges, onChange, stats }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const addChallenge = () => {
    const newChallenge: ChallengeTemplate = {
      ...DEFAULT_CHALLENGE,
      id: crypto.randomUUID(),
    };
    onChange([...challenges, newChallenge]);
    setExpandedId(newChallenge.id);
  };

  const updateChallenge = (id: string, updates: Partial<ChallengeTemplate>) => {
    onChange(challenges.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deleteChallenge = (id: string) => {
    onChange(challenges.filter((c) => c.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Swords className="h-4 w-4" />
          Challenges
          <span className="text-xs bg-muted px-2 py-0.5 rounded">
            {challenges.length}
          </span>
        </h3>
        <Button variant="outline" size="sm" onClick={addChallenge}>
          <Plus className="h-3 w-3 mr-1" />
          Add Challenge
        </Button>
      </div>

      <div className="space-y-2">
        {challenges.map((challenge) => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            stats={stats}
            expanded={expandedId === challenge.id}
            onToggle={() =>
              setExpandedId(expandedId === challenge.id ? null : challenge.id)
            }
            onChange={(updates) => updateChallenge(challenge.id, updates)}
            onDelete={() => deleteChallenge(challenge.id)}
          />
        ))}
        {challenges.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No challenges defined yet
          </p>
        )}
      </div>
    </div>
  );
}

function ChallengeCard({
  challenge,
  stats,
  expanded,
  onToggle,
  onChange,
  onDelete,
}: {
  challenge: ChallengeTemplate;
  stats: Stat[];
  expanded: boolean;
  onToggle: () => void;
  onChange: (updates: Partial<ChallengeTemplate>) => void;
  onDelete: () => void;
}) {
  const roleIds = challenge.roles.map((r) => r.id);

  return (
    <Collapsible open={expanded} onOpenChange={onToggle}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="p-3 cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded flex items-center justify-center bg-muted">
                <Swords className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-sm">{challenge.name}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {challenge.roles.length} roles, {challenge.rounds.length}{" "}
                  actions
                </p>
              </div>
              {expanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="basic" className="flex-1">
                  Basic
                </TabsTrigger>
                <TabsTrigger value="actions" className="flex-1">
                  Actions
                </TabsTrigger>
                <TabsTrigger value="outcomes" className="flex-1">
                  Outcomes
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Name</Label>
                    <Input
                      value={challenge.name}
                      onChange={(e) => onChange({ name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Theme</Label>
                    <Select
                      value={challenge.display.theme}
                      onValueChange={(
                        theme: Exclude<
                          ChallengeTemplate["display"]["theme"],
                          undefined
                        >
                      ) =>
                        onChange({ display: { ...challenge.display, theme } })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={"combat"}>Combat</SelectItem>
                        <SelectItem value={"race"}>Race</SelectItem>
                        <SelectItem value={"academic"}>Academic</SelectItem>
                        <SelectItem value={"social"}>Social</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Description</Label>
                  <Textarea
                    value={challenge.description}
                    onChange={(e) => onChange({ description: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Max Rounds</Label>
                    <Input
                      type="number"
                      value={challenge.maxRounds}
                      onChange={(e) =>
                        onChange({
                          maxRounds: Number.parseInt(e.target.value) || 50,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Round Delay (ms)</Label>
                    <Input
                      type="number"
                      value={challenge.display.roundDelay}
                      onChange={(e) =>
                        onChange({
                          display: {
                            ...challenge.display,
                            roundDelay: Number.parseInt(e.target.value) || 1000,
                          },
                        })
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-xs">Show Battle Log</Label>
                  <Switch
                    checked={challenge.display.showLog}
                    onCheckedChange={(showLog) =>
                      onChange({ display: { ...challenge.display, showLog } })
                    }
                  />
                </div>

                {/* Roles */}
                <div className="space-y-2 border-t pt-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground">
                      Roles
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        onChange({
                          roles: [
                            ...challenge.roles,
                            {
                              id: `role-${challenge.roles.length}`,
                              name: "New Role",
                              required: false,
                            },
                          ],
                        })
                      }
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  {challenge.roles.map((role, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={role.id}
                        onChange={(e) => {
                          const roles = [...challenge.roles];
                          roles[index] = { ...role, id: e.target.value };
                          onChange({ roles });
                        }}
                        placeholder="ID"
                        className="w-24"
                      />
                      <Input
                        value={role.name}
                        onChange={(e) => {
                          const roles = [...challenge.roles];
                          roles[index] = { ...role, name: e.target.value };
                          onChange({ roles });
                        }}
                        placeholder="Display Name"
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          onChange({
                            roles: challenge.roles.filter(
                              (_, i) => i !== index
                            ),
                          })
                        }
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="actions" className="space-y-4 pt-4">
                <RoundActionsEditor
                  actions={challenge.rounds}
                  onChange={(rounds) => onChange({ rounds })}
                  stats={stats}
                  roles={roleIds}
                  outcomes={challenge.outcomes}
                />
              </TabsContent>

              <TabsContent value="outcomes" className="space-y-4 pt-4">
                <OutcomesEditor
                  outcomes={challenge.outcomes}
                  onChange={(outcomes) => onChange({ outcomes })}
                  stats={stats}
                />
              </TabsContent>
            </Tabs>

            <Button
              variant="destructive"
              size="sm"
              onClick={onDelete}
              className="w-full mt-4"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Delete Challenge
            </Button>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

function RoundActionsEditor({
  actions,
  onChange,
  stats,
  roles,
  outcomes,
}: {
  actions: RoundAction[];
  onChange: (actions: RoundAction[]) => void;
  stats: Stat[];
  roles: string[];
  outcomes: Outcome[];
}) {
  const addAction = (type: RoundAction["type"]) => {
    let newAction: RoundAction;
    switch (type) {
      case "damage":
        newAction = {
          type: "damage",
          target: roles[0] ?? "player",
          stat: "hp",
          amount: [],
          message: "",
        };
        break;
      case "check":
        newAction = { type: "check", condition: [] };
        break;
      case "log":
        newAction = { type: "log", message: "" };
        break;
      case "roll":
        newAction = { type: "roll", dice: "1d20", saveAs: "roll" };
        break;
      default:
        return;
    }
    onChange([...actions, newAction]);
  };

  const updateAction = (index: number, updates: Partial<RoundAction>) => {
    const newActions = [...actions];
    newActions[index] = { ...newActions[index], ...updates } as RoundAction;
    onChange(newActions);
  };

  const removeAction = (index: number) => {
    onChange(actions.filter((_, i) => i !== index));
  };

  const ActionIcon = {
    damage: Target,
    check: Play,
    log: MessageSquare,
    roll: Dices,
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => addAction("damage")}>
          <Target className="h-3 w-3 mr-1" />
          Damage
        </Button>
        <Button variant="outline" size="sm" onClick={() => addAction("check")}>
          <Play className="h-3 w-3 mr-1" />
          Check
        </Button>
        <Button variant="outline" size="sm" onClick={() => addAction("log")}>
          <MessageSquare className="h-3 w-3 mr-1" />
          Log
        </Button>
        <Button variant="outline" size="sm" onClick={() => addAction("roll")}>
          <Dices className="h-3 w-3 mr-1" />
          Roll
        </Button>
      </div>

      {actions.map((action, index) => {
        const Icon = ActionIcon[action.type];
        return (
          <Card key={index} className="p-3">
            <div className="flex items-start gap-2">
              <Icon className="h-4 w-4 mt-1 text-muted-foreground shrink-0" />
              <div className="flex-1 space-y-2">
                {action.type === "damage" && (
                  <>
                    <div className="flex items-center gap-2">
                      <Select
                        value={action.target}
                        onValueChange={(target) =>
                          updateAction(index, { target })
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((r) => (
                            <SelectItem key={r} value={r}>
                              {r}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span className="text-sm text-muted-foreground">
                        loses
                      </span>
                      <Input
                        value={action.stat}
                        onChange={(e) =>
                          updateAction(index, { stat: e.target.value })
                        }
                        className="w-20"
                        placeholder="stat"
                      />
                    </div>
                    <CalculationBuilder
                      tokens={action.amount}
                      onChange={(amount) => updateAction(index, { amount })}
                      availableStats={stats}
                      allowRoles
                      roles={roles}
                    />
                    <Input
                      value={action.message ?? ""}
                      onChange={(e) =>
                        updateAction(index, { message: e.target.value })
                      }
                      placeholder="Message template..."
                    />
                  </>
                )}

                {action.type === "check" && (
                  <>
                    <p className="text-xs text-muted-foreground">
                      Condition (triggers outcome if value {"<="} 0):
                    </p>
                    <CalculationBuilder
                      tokens={action.condition}
                      onChange={(condition) =>
                        updateAction(index, { condition })
                      }
                      availableStats={stats}
                      allowRoles
                      roles={roles}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Select
                        value={action.onTrue ?? "none"}
                        onValueChange={(onTrue) =>
                          updateAction(index, { onTrue })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="On True" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {outcomes.map((o) => (
                            <SelectItem key={o.id} value={o.id}>
                              {o.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={action.onFalse ?? "none"}
                        onValueChange={(onFalse) =>
                          updateAction(index, { onFalse })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="On False" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {outcomes.map((o) => (
                            <SelectItem key={o.id} value={o.id}>
                              {o.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {action.type === "log" && (
                  <Input
                    value={action.message}
                    onChange={(e) =>
                      updateAction(index, { message: e.target.value })
                    }
                    placeholder="Message template with {role.stat} placeholders..."
                  />
                )}

                {action.type === "roll" && (
                  <div className="flex items-center gap-2">
                    <Input
                      value={action.dice}
                      onChange={(e) =>
                        updateAction(index, { dice: e.target.value })
                      }
                      placeholder="1d20"
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">
                      save as
                    </span>
                    <Input
                      value={action.saveAs}
                      onChange={(e) =>
                        updateAction(index, { saveAs: e.target.value })
                      }
                      placeholder="variable"
                      className="w-24"
                    />
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeAction(index)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </Card>
        );
      })}

      {actions.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No round actions defined
        </p>
      )}
    </div>
  );
}

function OutcomesEditor({
  outcomes,
  onChange,
  stats,
}: {
  outcomes: Outcome[];
  onChange: (outcomes: Outcome[]) => void;
  stats: Stat[];
}) {
  const addOutcome = () => {
    onChange([
      ...outcomes,
      {
        id: crypto.randomUUID(),
        name: "New Outcome",
        description: "",
        result: "draw",
      },
    ]);
  };

  const updateOutcome = (index: number, updates: Partial<Outcome>) => {
    const newOutcomes = [...outcomes];
    newOutcomes[index] = { ...newOutcomes[index], ...updates };
    onChange(newOutcomes);
  };

  const removeOutcome = (index: number) => {
    onChange(outcomes.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <Button variant="outline" size="sm" onClick={addOutcome}>
        <Plus className="h-3 w-3 mr-1" />
        Add Outcome
      </Button>

      {outcomes.map((outcome, index) => (
        <Card key={index} className="p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Input
              value={outcome.id}
              onChange={(e) => updateOutcome(index, { id: e.target.value })}
              placeholder="ID"
              className="w-24"
            />
            <Input
              value={outcome.name}
              onChange={(e) => updateOutcome(index, { name: e.target.value })}
              placeholder="Name"
              className="flex-1"
            />
            <Select
              value={outcome.result}
              onValueChange={(result: Outcome["result"]) =>
                updateOutcome(index, { result })
              }
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="win">Win</SelectItem>
                <SelectItem value="lose">Lose</SelectItem>
                <SelectItem value="draw">Draw</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeOutcome(index)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
          <Input
            value={outcome.description}
            onChange={(e) =>
              updateOutcome(index, { description: e.target.value })
            }
            placeholder="Description"
          />
          <div className="flex items-center gap-2">
            <Label className="text-xs">XP Reward:</Label>
            <Input
              type="number"
              value={outcome.rewards?.experience ?? 0}
              onChange={(e) =>
                updateOutcome(index, {
                  rewards: {
                    ...outcome.rewards,
                    experience: Number.parseInt(e.target.value) || 0,
                  },
                })
              }
              className="w-20"
            />
            <Label className="text-xs ml-2">Game Over:</Label>
            <Switch
              checked={outcome.gameOver ?? false}
              onCheckedChange={(gameOver) => updateOutcome(index, { gameOver })}
            />
          </div>
        </Card>
      ))}
    </div>
  );
}
```

### apps/game-frontend/src/universe/item-editor.tsx

```tsx
import { useState } from "react"
import type { Item, Stat } from "@wdydn/shared"
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Textarea } from "@/shared/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { Switch } from "@/shared/components/ui/switch"
import { cn } from "@/shared/lib/utils"
import { Plus, Trash2, ChevronDown, ChevronRight, Package, Sword, FlaskRound, Key } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/shared/components/ui/collapsible"

interface Props {
  items: Item[]
  onChange: (items: Item[]) => void
  stats: Stat[]
  equipmentSlots: string[]
}

const DEFAULT_ITEM: Omit<Item, "id"> = {
  name: "",
  description: "",
  icon: "package",
  rarity: "common",
  kind: "equipment",
}

const RARITY_OPTIONS: Item["rarity"][] = ["common", "uncommon", "rare", "epic", "legendary"]

const RARITY_COLORS = {
  common: "text-gray-400",
  uncommon: "text-green-400",
  rare: "text-blue-400",
  epic: "text-purple-400",
  legendary: "text-orange-400",
}

const KIND_ICONS = {
  equipment: Sword,
  consumable: FlaskRound,
  key: Key,
}

export function ItemEditor({ items, onChange, stats, equipmentSlots }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const addItem = () => {
    const newItem: Item = {
      ...DEFAULT_ITEM,
      id: crypto.randomUUID(),
      name: "New Item",
    }
    onChange([...items, newItem])
    setExpandedId(newItem.id)
  }

  const updateItem = (id: string, updates: Partial<Item>) => {
    onChange(items.map((i) => (i.id === id ? { ...i, ...updates } : i)))
  }

  const deleteItem = (id: string) => {
    onChange(items.filter((i) => i.id !== id))
    if (expandedId === id) setExpandedId(null)
  }

  const groupedItems = {
    equipment: items.filter((i) => i.kind === "equipment"),
    consumable: items.filter((i) => i.kind === "consumable"),
    key: items.filter((i) => i.kind === "key"),
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Package className="h-4 w-4" />
          Items
          <span className="text-xs bg-muted px-2 py-0.5 rounded">{items.length}</span>
        </h3>
        <Button variant="outline" size="sm" onClick={addItem}>
          <Plus className="h-3 w-3 mr-1" />
          Add Item
        </Button>
      </div>

      {Object.entries(groupedItems).map(([kind, kindItems]) => {
        if (kindItems.length === 0) return null
        const Icon = KIND_ICONS[kind as keyof typeof KIND_ICONS]

        return (
          <div key={kind} className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-2 capitalize">
              <Icon className="h-3 w-3" />
              {kind} ({kindItems.length})
            </p>
            {kindItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                stats={stats}
                equipmentSlots={equipmentSlots}
                expanded={expandedId === item.id}
                onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
                onChange={(updates) => updateItem(item.id, updates)}
                onDelete={() => deleteItem(item.id)}
              />
            ))}
          </div>
        )
      })}

      {items.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No items defined yet</p>}
    </div>
  )
}

function ItemCard({
  item,
  stats,
  equipmentSlots,
  expanded,
  onToggle,
  onChange,
  onDelete,
}: {
  item: Item
  stats: Stat[]
  equipmentSlots: string[]
  expanded: boolean
  onToggle: () => void
  onChange: (updates: Partial<Item>) => void
  onDelete: () => void
}) {
  const Icon = KIND_ICONS[item.kind]

  const addBonus = () => {
    const bonuses = item.bonuses ?? []
    onChange({ bonuses: [...bonuses, { statId: stats[0]?.id ?? "", amount: 1 }] })
  }

  const updateBonus = (index: number, updates: Partial<{ statId: string; amount: number }>) => {
    const bonuses = [...(item.bonuses ?? [])]
    bonuses[index] = { ...bonuses[index], ...updates }
    onChange({ bonuses })
  }

  const removeBonus = (index: number) => {
    const bonuses = (item.bonuses ?? []).filter((_, i) => i !== index)
    onChange({ bonuses: bonuses.length > 0 ? bonuses : undefined })
  }

  return (
    <Collapsible open={expanded} onOpenChange={onToggle}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="p-3 cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div
                className={cn("w-8 h-8 rounded flex items-center justify-center bg-muted", RARITY_COLORS[item.rarity])}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <CardTitle className={cn("text-sm", RARITY_COLORS[item.rarity])}>{item.name || "Unnamed"}</CardTitle>
                <p className="text-xs text-muted-foreground capitalize">
                  {item.rarity} {item.kind}
                </p>
              </div>
              {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Name</Label>
                <Input value={item.name} onChange={(e) => onChange({ name: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Rarity</Label>
                <Select value={item.rarity} onValueChange={(rarity: Item["rarity"]) => onChange({ rarity })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RARITY_OPTIONS.map((r) => (
                      <SelectItem key={r} value={r}>
                        <span className={cn("capitalize", RARITY_COLORS[r])}>{r}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Description</Label>
              <Textarea value={item.description} onChange={(e) => onChange({ description: e.target.value })} rows={2} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Kind</Label>
                <Select value={item.kind} onValueChange={(kind: Item["kind"]) => onChange({ kind })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equipment">Equipment</SelectItem>
                    <SelectItem value="consumable">Consumable</SelectItem>
                    <SelectItem value="key">Key Item</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {item.kind === "equipment" && (
                <div className="space-y-1">
                  <Label className="text-xs">Slot</Label>
                  <Select value={item.slot ?? ""} onValueChange={(slot) => onChange({ slot })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {equipmentSlots.map((slot) => (
                        <SelectItem key={slot} value={slot}>
                          {slot}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Consumable options */}
            {item.kind === "consumable" && (
              <div className="space-y-3 border-t pt-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Stackable</Label>
                  <Switch checked={item.stackable ?? false} onCheckedChange={(stackable) => onChange({ stackable })} />
                </div>
                {item.stackable && (
                  <div className="space-y-1">
                    <Label className="text-xs">Max Stack</Label>
                    <Input
                      type="number"
                      value={item.maxStack ?? 10}
                      onChange={(e) => onChange({ maxStack: Number.parseInt(e.target.value) || 10 })}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Stat Bonuses */}
            {item.kind === "equipment" && (
              <div className="space-y-3 border-t pt-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">Stat Bonuses</p>
                  <Button variant="outline" size="sm" onClick={addBonus}>
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>
                {(item.bonuses ?? []).map((bonus, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Select value={bonus.statId} onValueChange={(statId) => updateBonus(index, { statId })}>
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {stats.map((stat) => (
                          <SelectItem key={stat.id} value={stat.id}>
                            {stat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      value={bonus.amount}
                      onChange={(e) => updateBonus(index, { amount: Number.parseInt(e.target.value) || 0 })}
                      className="w-20"
                    />
                    <Button variant="ghost" size="icon" onClick={() => removeBonus(index)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Delete */}
            <Button variant="destructive" size="sm" onClick={onDelete} className="w-full">
              <Trash2 className="h-3 w-3 mr-1" />
              Delete Item
            </Button>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
```

### apps/game-frontend/src/universe/stat-editor.tsx

```tsx
import { useState } from "react";
import type { Stat } from "@wdydn/shared";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Switch } from "@/shared/components/ui/switch";
import { cn } from "@/shared/lib/utils";
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Settings2,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible";
import { CalculationBuilder } from "@/universe/calculation-builder";

interface Props {
  stats: Stat[];
  onChange: (stats: Stat[]) => void;
}

const DEFAULT_STAT: Omit<Stat, "id"> = {
  name: "",
  description: "",
  type: "core",
  display: {
    icon: "circle",
    color: "text-gray-500",
    style: "number",
    showInCreator: true,
    showInSheet: true,
    order: 0,
  },
  range: { min: 1, max: 20 },
};

const ICON_OPTIONS = [
  "sword",
  "shield",
  "heart",
  "brain",
  "zap",
  "eye",
  "hand",
  "footprints",
  "flame",
  "droplet",
  "wind",
  "leaf",
  "star",
  "moon",
  "sun",
  "skull",
  "target",
  "crosshair",
  "activity",
  "cpu",
  "smile",
  "frown",
];

const COLOR_OPTIONS = [
  { value: "text-red-500", label: "Red" },
  { value: "text-orange-500", label: "Orange" },
  { value: "text-yellow-500", label: "Yellow" },
  { value: "text-green-500", label: "Green" },
  { value: "text-cyan-500", label: "Cyan" },
  { value: "text-blue-500", label: "Blue" },
  { value: "text-purple-500", label: "Purple" },
  { value: "text-pink-500", label: "Pink" },
  { value: "text-gray-500", label: "Gray" },
];

export function StatEditor({ stats, onChange }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const coreStats = stats.filter((s) => s.type === "core");
  const computedStats = stats.filter((s) => s.type === "computed");

  const addStat = (type: "core" | "computed") => {
    const newStat: Stat = {
      ...DEFAULT_STAT,
      id: crypto.randomUUID(),
      name: type === "core" ? "New Stat" : "New Computed",
      type,
      display: {
        ...DEFAULT_STAT.display,
        order: stats.length,
      },
      calculation: type === "computed" ? [] : undefined,
    };
    onChange([...stats, newStat]);
    setExpandedId(newStat.id);
  };

  const updateStat = (id: string, updates: Partial<Stat>) => {
    onChange(stats.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const deleteStat = (id: string) => {
    onChange(stats.filter((s) => s.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  return (
    <div className="space-y-6">
      {/* Core Stats */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            Core Stats
            <span className="text-xs bg-muted px-2 py-0.5 rounded">
              {coreStats.length}
            </span>
          </h3>
          <Button variant="outline" size="sm" onClick={() => addStat("core")}>
            <Plus className="h-3 w-3 mr-1" />
            Add Core
          </Button>
        </div>

        <div className="space-y-2">
          {coreStats.map((stat) => (
            <StatCard
              key={stat.id}
              stat={stat}
              allStats={stats}
              expanded={expandedId === stat.id}
              onToggle={() =>
                setExpandedId(expandedId === stat.id ? null : stat.id)
              }
              onChange={(updates) => updateStat(stat.id, updates)}
              onDelete={() => deleteStat(stat.id)}
            />
          ))}
          {coreStats.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No core stats defined yet
            </p>
          )}
        </div>
      </div>

      {/* Computed Stats */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Computed Stats
            <span className="text-xs bg-muted px-2 py-0.5 rounded">
              {computedStats.length}
            </span>
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addStat("computed")}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Computed
          </Button>
        </div>

        <div className="space-y-2">
          {computedStats.map((stat) => (
            <StatCard
              key={stat.id}
              stat={stat}
              allStats={stats}
              expanded={expandedId === stat.id}
              onToggle={() =>
                setExpandedId(expandedId === stat.id ? null : stat.id)
              }
              onChange={(updates) => updateStat(stat.id, updates)}
              onDelete={() => deleteStat(stat.id)}
            />
          ))}
          {computedStats.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No computed stats defined yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  stat,
  allStats,
  expanded,
  onToggle,
  onChange,
  onDelete,
}: {
  stat: Stat;
  allStats: Stat[];
  expanded: boolean;
  onToggle: () => void;
  onChange: (updates: Partial<Stat>) => void;
  onDelete: () => void;
}) {
  const coreStats = allStats.filter((s) => s.type === "core");

  return (
    <Collapsible open={expanded} onOpenChange={onToggle}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="p-3 cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              <div
                className={cn(
                  "w-8 h-8 rounded flex items-center justify-center bg-muted",
                  stat.display.color
                )}
              >
                {stat.short?.[0] || stat.name[0] || "?"}
              </div>
              <div className="flex-1">
                <CardTitle className="text-sm">
                  {stat.name || "Unnamed"}
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {stat.type === "core"
                    ? `Range: ${stat.range?.min}-${stat.range?.max}`
                    : "Calculated"}
                </p>
              </div>
              {expanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Name</Label>
                <Input
                  value={stat.name}
                  onChange={(e) => onChange({ name: e.target.value })}
                  placeholder="Stat name"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Short Name</Label>
                <Input
                  value={stat.short ?? ""}
                  onChange={(e) =>
                    onChange({ short: e.target.value || undefined })
                  }
                  placeholder="STR"
                  maxLength={4}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Description</Label>
              <Textarea
                value={stat.description}
                onChange={(e) => onChange({ description: e.target.value })}
                placeholder="What this stat represents..."
                rows={2}
              />
            </div>

            {/* Core stat: Range */}
            {stat.type === "core" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Min Value</Label>
                  <Input
                    type="number"
                    value={stat.range?.min ?? 1}
                    onChange={(e) =>
                      onChange({
                        range: {
                          ...stat.range,
                          min: Number.parseInt(e.target.value) || 0,
                          max: stat.range?.max ?? 20,
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Max Value</Label>
                  <Input
                    type="number"
                    value={stat.range?.max ?? 20}
                    onChange={(e) =>
                      onChange({
                        range: {
                          min: stat.range?.min ?? 1,
                          max: Number.parseInt(e.target.value) || 100,
                        },
                      })
                    }
                  />
                </div>
              </div>
            )}

            {/* Computed stat: Calculation */}
            {stat.type === "computed" && (
              <div className="space-y-1">
                <Label className="text-xs">Calculation</Label>
                <CalculationBuilder
                  tokens={stat.calculation ?? []}
                  onChange={(calculation) => onChange({ calculation })}
                  availableStats={coreStats}
                />
              </div>
            )}

            {/* Display Options */}
            <div className="space-y-3 border-t pt-3">
              <p className="text-xs font-medium text-muted-foreground">
                Display Options
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Icon</Label>
                  <Select
                    value={stat.display.icon}
                    onValueChange={(icon) =>
                      onChange({ display: { ...stat.display, icon } })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ICON_OPTIONS.map((icon) => (
                        <SelectItem key={icon} value={icon}>
                          {icon}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Color</Label>
                  <Select
                    value={stat.display.color}
                    onValueChange={(color) =>
                      onChange({ display: { ...stat.display, color } })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COLOR_OPTIONS.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          <span className={c.value}>{c.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-xs">Show in Character Creator</Label>
                <Switch
                  checked={stat.display.showInCreator !== false}
                  onCheckedChange={(showInCreator) =>
                    onChange({ display: { ...stat.display, showInCreator } })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-xs">Show in Character Sheet</Label>
                <Switch
                  checked={stat.display.showInSheet !== false}
                  onCheckedChange={(showInSheet) =>
                    onChange({ display: { ...stat.display, showInSheet } })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-xs">Display Style</Label>
                <Select
                  value={stat.display.style}
                  onValueChange={(style: "number" | "bar") =>
                    onChange({ display: { ...stat.display, style } })
                  }
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="bar">Bar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Delete */}
            <Button
              variant="destructive"
              size="sm"
              onClick={onDelete}
              className="w-full"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Delete Stat
            </Button>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
```

### apps/game-frontend/src/universe/universe-card.tsx

```tsx
import { Link } from "react-router-dom"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/shared/components/ui/alert-dialog"
import { Button } from "@/shared/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/shared/components/ui/card"
import type { Universe } from "@wdydn/shared"
import { STARTER_UNIVERSES } from "@/shared/data/starter-universes"
import { motion } from "framer-motion"
import { MapPin, Pencil, Trash2, Swords, Sparkles } from "lucide-react"

interface UniverseCardProps {
  universe: Universe
  index: number
  onDelete?: () => void
  onSelect?: () => void
  mode?: "manage" | "select"
}

export function UniverseCard({
  universe,
  index,
  onDelete,
  onSelect,
  mode = "manage",
}: UniverseCardProps) {
  const isStarter = STARTER_UNIVERSES.some((u) => u.id === universe.id)
  const canStart = universe.stats.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card
        className={`group h-full flex flex-col ${
          mode === "select"
            ? "cursor-pointer hover:border-primary/50 transition-all duration-300 bg-card/50 backdrop-blur-sm"
            : "bg-card/50 hover:bg-card/80 transition-colors"
        }`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle
                  className={mode === "select" ? "text-xl" : "text-lg"}
                >
                  {universe.name}
                </CardTitle>
                {isStarter && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Starter
                  </span>
                )}
                {!isStarter && mode === "select" && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                    Custom
                  </span>
                )}
              </div>
              <CardDescription className="line-clamp-2 text-sm">
                {universe.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1.5">
              <Swords className="h-4 w-4" />
              <span>{universe.challenges.length}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              <span>{universe.locations.length}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs">
                {universe.stats.length} stats
              </span>
            </div>
          </div>

          {mode === "select" && (
            <div className="space-y-3 flex-1">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Stats
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {universe.stats.length > 0 ? (
                    universe.stats.filter(s => s.type === "core").slice(0, 4).map((stat) => (
                      <span
                        key={stat.id}
                        className="px-2 py-0.5 text-xs rounded-md bg-secondary text-secondary-foreground"
                      >
                        {stat.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground italic">
                      No stats defined
                    </span>
                  )}
                  {universe.stats.filter(s => s.type === "core").length > 4 && (
                    <span className="px-2 py-0.5 text-xs rounded-md bg-secondary/50 text-muted-foreground">
                      +{universe.stats.filter(s => s.type === "core").length - 4} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-auto pt-4">
            {mode === "manage" ? (
              <>
                <Link to={`/universes/${universe.id}`} className="flex-1">
                  <Button variant="secondary" className="w-full gap-2">
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                </Link>
                {!isStarter && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-destructive hover:text-destructive bg-transparent"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Universe?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete "{universe.name}" and all
                          its data. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={onDelete}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </>
            ) : (
              <Button
                onClick={onSelect}
                className="w-full"
                disabled={!canStart}
              >
                {canStart ? "Select Universe" : "Add Stats First"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
```

### apps/game-frontend/src/universe/universe-editor.tsx

```tsx
import { useState, useEffect } from "react"
import type { Universe } from "@wdydn/shared"
import { getUniverse, saveUniverse } from "@/shared/lib/storage"
import { STARTER_UNIVERSES } from "@/shared/data/starter-universes"
import { StatEditor } from "./stat-editor"
import { ItemEditor } from "./item-editor"
import { ChallengeEditor } from "./challenge-editor"
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Textarea } from "@/shared/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { ArrowLeft, Save, Settings2, Package, Swords, Users, MapPin } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface Props {
  universeId: string
}

export function UniverseEditor({ universeId }: Props) {
  const navigate = useNavigate()
  const [universe, setUniverse] = useState<Universe | null>(null)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    // Try loading from storage first
    let loaded = getUniverse(universeId)

    // If not in storage, check if it's a starter universe
    if (!loaded) {
      loaded = STARTER_UNIVERSES.find(u => u.id === universeId) || null
    }

    if (loaded) {
      setUniverse(loaded)
    } else {
      // Create a new universe with defaults
      const newUniverse: Universe = {
        id: universeId,
        name: "New Universe",
        description: "",
        theme: "",
        stats: [],
        items: [],
        challenges: [],
        npcs: [],
        locations: [],
        config: {
          startingPoints: 10,
          pointsPerLevel: 3,
          equipmentSlots: ["head", "body", "weapon", "accessory"],
        },
      }
      setUniverse(newUniverse)
      setHasChanges(true) // Mark as having changes so user can save
    }
  }, [universeId])

  const handleChange = (updates: Partial<Universe>) => {
    if (!universe) return
    setUniverse({ ...universe, ...updates })
    setHasChanges(true)
  }

  const handleSave = async () => {
    if (!universe) return
    setSaving(true)
    try {
      saveUniverse(universe)
      setHasChanges(false)
    } finally {
      setSaving(false)
    }
  }

  if (!universe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Universe not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center justify-between p-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/universes")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="font-bold">{universe.name}</h1>
              <p className="text-xs text-muted-foreground">{universe.theme}</p>
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving || !hasChanges}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : hasChanges ? "Save Changes" : "Saved"}
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto p-4">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="w-full grid grid-cols-5">
            <TabsTrigger value="general" className="flex items-center gap-1">
              <Settings2 className="h-3 w-3" />
              <span className="hidden sm:inline">General</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-1">
              <Settings2 className="h-3 w-3" />
              <span className="hidden sm:inline">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="items" className="flex items-center gap-1">
              <Package className="h-3 w-3" />
              <span className="hidden sm:inline">Items</span>
            </TabsTrigger>
            <TabsTrigger value="challenges" className="flex items-center gap-1">
              <Swords className="h-3 w-3" />
              <span className="hidden sm:inline">Challenges</span>
            </TabsTrigger>
            <TabsTrigger value="world" className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span className="hidden sm:inline">World</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Universe Name</Label>
                  <Input
                    value={universe.name}
                    onChange={(e) => handleChange({ name: e.target.value })}
                    placeholder="My Universe"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Input
                    value={universe.theme}
                    onChange={(e) => handleChange({ theme: e.target.value })}
                    placeholder="dark fantasy, sci-fi, etc."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={universe.description}
                    onChange={(e) => handleChange({ description: e.target.value })}
                    placeholder="Describe your universe..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Starting Points</Label>
                    <Input
                      type="number"
                      value={universe.config.startingPoints}
                      onChange={(e) =>
                        handleChange({
                          config: { ...universe.config, startingPoints: Number.parseInt(e.target.value) || 10 },
                        })
                      }
                    />
                    <p className="text-xs text-muted-foreground">Points to distribute at character creation</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Points Per Level</Label>
                    <Input
                      type="number"
                      value={universe.config.pointsPerLevel}
                      onChange={(e) =>
                        handleChange({
                          config: { ...universe.config, pointsPerLevel: Number.parseInt(e.target.value) || 3 },
                        })
                      }
                    />
                    <p className="text-xs text-muted-foreground">Points gained when leveling up</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Equipment Slots</Label>
                  <Input
                    value={universe.config.equipmentSlots.join(", ")}
                    onChange={(e) =>
                      handleChange({
                        config: {
                          ...universe.config,
                          equipmentSlots: e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        },
                      })
                    }
                    placeholder="head, body, weapon, accessory"
                  />
                  <p className="text-xs text-muted-foreground">Comma-separated list of equipment slots</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="mt-6">
            <StatEditor stats={universe.stats} onChange={(stats) => handleChange({ stats })} />
          </TabsContent>

          <TabsContent value="items" className="mt-6">
            <ItemEditor
              items={universe.items}
              onChange={(items) => handleChange({ items })}
              stats={universe.stats}
              equipmentSlots={universe.config.equipmentSlots}
            />
          </TabsContent>

          <TabsContent value="challenges" className="mt-6">
            <ChallengeEditor
              challenges={universe.challenges}
              onChange={(challenges) => handleChange({ challenges })}
              stats={universe.stats}
            />
          </TabsContent>

          <TabsContent value="world" className="mt-6 space-y-6">
            <NPCEditor npcs={universe.npcs} onChange={(npcs) => handleChange({ npcs })} stats={universe.stats} />
            <LocationEditor locations={universe.locations} onChange={(locations) => handleChange({ locations })} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

// Simple NPC Editor
function NPCEditor({
  npcs,
  onChange,
  stats,
}: {
  npcs: Universe["npcs"]
  onChange: (npcs: Universe["npcs"]) => void
  stats: Universe["stats"]
}) {
  const addNPC = () => {
    onChange([
      ...npcs,
      {
        id: crypto.randomUUID(),
        name: "New NPC",
        description: "",
        role: "ally",
        stats: {},
      },
    ])
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            NPCs
          </CardTitle>
          <Button variant="outline" size="sm" onClick={addNPC}>
            Add NPC
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {npcs.map((npc, index) => (
          <div key={npc.id} className="flex items-center gap-2 p-2 rounded bg-muted/50">
            <Input
              value={npc.name}
              onChange={(e) => {
                const newNpcs = [...npcs]
                newNpcs[index] = { ...npc, name: e.target.value }
                onChange(newNpcs)
              }}
              className="flex-1"
            />
            <Input
              value={npc.role}
              onChange={(e) => {
                const newNpcs = [...npcs]
                newNpcs[index] = { ...npc, role: e.target.value }
                onChange(newNpcs)
              }}
              placeholder="role"
              className="w-24"
            />
            <Button variant="ghost" size="icon" onClick={() => onChange(npcs.filter((_, i) => i !== index))}>
              <Settings2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
        {npcs.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No NPCs defined</p>}
      </CardContent>
    </Card>
  )
}

// Simple Location Editor
function LocationEditor({
  locations,
  onChange,
}: {
  locations: Universe["locations"]
  onChange: (locations: Universe["locations"]) => void
}) {
  const addLocation = () => {
    onChange([
      ...locations,
      {
        id: crypto.randomUUID(),
        name: "New Location",
        description: "",
      },
    ])
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Locations
          </CardTitle>
          <Button variant="outline" size="sm" onClick={addLocation}>
            Add Location
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {locations.map((location, index) => (
          <div key={location.id} className="flex items-center gap-2 p-2 rounded bg-muted/50">
            <Input
              value={location.name}
              onChange={(e) => {
                const newLocations = [...locations]
                newLocations[index] = { ...location, name: e.target.value }
                onChange(newLocations)
              }}
              className="flex-1"
            />
            <Button variant="ghost" size="icon" onClick={() => onChange(locations.filter((_, i) => i !== index))}>
              <Settings2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
        {locations.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No locations defined</p>
        )}
      </CardContent>
    </Card>
  )
}
```

### apps/game-frontend/tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### apps/game-frontend/tsconfig.node.json

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,

    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["vite.config.ts"]
}
```

### apps/game-frontend/turbo.json

```json
{
  "extends": [
    "//"
  ],
  "tasks": {
    "build": {
      "outputs": [
        "dist/**"
      ]
    }
  }
}
```

### apps/game-frontend/vite.config.ts

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
```

### package.json

```json
{
  "name": "kitchen-sink",
  "private": true,
  "scripts": {
    "build": "turbo run build",
    "clean": "turbo run clean",
    "dev": "turbo run dev",
    "format": "prettier --write \"**/*.{ts,tsx,md}\"",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "check-types": "turbo run check-types",
    "gather": "bun run --filter @wdydn/scripts gather"
  },
  "devDependencies": {
    "prettier": "^3.6.0",
    "turbo": "^2.7.3"
  },
  "engines": {
    "node": ">=18"
  },
  "packageManager": "bun@1.2.18",
  "workspaces": [
    "apps/*",
    "packages/*"
  ]
}
```

### packages/logger/eslint.config.js

```javascript
import { config } from "@wdydn/config/eslint";

/** @type {import("eslint").Linter.Config} */
export default config;
```

### packages/logger/package.json

```json
{
  "name": "@wdydn/logger",
  "version": "0.0.0",
  "type": "module",
  "private": true,
  "files": [
    "dist"
  ],
  "main": "./dist/es/index.js",
  "module": "./dist/es/index.js",
  "types": "./dist/es/index.d.ts",
  "exports": {
    ".": {
      "import": {
        "types": "./dist/es/index.d.ts",
        "default": "./dist/es/index.js"
      },
      "require": {
        "types": "./dist/cjs/index.d.cts",
        "default": "./dist/cjs/index.cjs"
      }
    }
  },
  "scripts": {
    "build": "bunchee",
    "dev": "bunchee --watch",
    "lint": "eslint src/",
    "check-types": "tsc --noEmit",
    "test": "jest"
  },
  "jest": {
    "preset": "@wdydn/config/jest/node"
  },
  "devDependencies": {
    "@jest/globals": "^29.7.0",
    "@wdydn/config": "*",
    "@types/node": "^22.15.3",
    "bunchee": "^6.4.0",
    "eslint": "^9.39.0",
    "jest": "^29.7.0",
    "typescript": "5.9.3"
  }
}
```

### packages/logger/src/__tests__/log.test.ts

```typescript
import { describe, it, expect, jest } from "@jest/globals";
import { log } from "..";

jest.spyOn(global.console, "log");

describe("@wdydn/logger", () => {
  it("prints a message", () => {
    log("hello");
    expect(console.log).toBeCalledWith("LOGGER: ", "hello");
  });
});
```

### packages/logger/src/index.ts

```typescript
export const log = (...args: unknown[]): void => {
  // eslint-disable-next-line no-console -- logger
  console.log("LOGGER: ", ...args);
};
```

### packages/logger/tsconfig.json

```json
{
  "extends": "@wdydn/config/typescript/base.json",
  "compilerOptions": {
    "lib": ["ES2015"],
    "outDir": "./dist",
    "types": ["jest", "node"]
  },
  "include": ["."],
  "exclude": ["node_modules", "dist"]
}
```

### packages/logger/turbo.json

```json
{
  "extends": [
    "//"
  ],
  "tasks": {
    "build": {
      "outputs": [
        "dist/**"
      ]
    }
  }
}
```

### packages/shared/package.json

```json
{
  "name": "@wdydn/shared",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  },
  "scripts": {
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "@wdydn/config": "*",
    "typescript": "^5.9"
  }
}
```

### packages/shared/src/api.ts

```typescript
// ============================================
// API Request/Response Types
// ============================================

// Smart Input API
export interface AIContext {
  universeName?: string
  setting?: string
  statName?: string
  itemName?: string
  challengeName?: string
}

export interface SmartInputRequest {
  action: "generate" | "expand" | "improve" | "summarize" | "suggest-names"
  value?: string
  fieldType: string
  context?: AIContext
}

export interface SmartInputResponse {
  result: string
}

// Attributes Generate API
export interface GenerateAttributeRequest {
  attributeName: string
  genreSetting: string
}

export interface GenerateAttributeResponse {
  attribute: {
    id: string
    name: string
    short?: string
    description: string
    type: "core" | "computed"
    display: {
      icon: string
      color: string
      style: "number" | "bar"
      barColor?: string
      showInCreator?: boolean
      showInSheet?: boolean
      order?: number
    }
    range?: {
      min: number
      max: number
    }
  }
}

// Attributes Benchmarks API
export interface GenerateBenchmarksRequest {
  attributeName: string
  attributeSummary: string
  genreSetting: string
}

export interface Benchmark {
  value: number
  label: string
  description: string
}

export interface GenerateBenchmarksResponse {
  benchmarks: Benchmark[]
}

// Story Generate API
export interface StoryGenerateRequest {
  currentHeroStep?: string
  nodeCount?: number
}

export interface StoryGenerateResponse {
  events: import("./types").Card[]
}
```

### packages/shared/src/index.ts

```typescript
// Types
export * from "./types"

// API Types
export * from "./api"
```

### packages/shared/src/types-v2.ts

```typescript
// ============================================================================
// WDYDN Type System v2.2
// ============================================================================

// ============================================================================
// EXPRESSION SYSTEM
// ============================================================================

/**
 * Expression string evaluated at runtime.
 *
 * Access paths:
 *   character.$player.stats.X           - player character stats
 *   character.elena.stats.Y             - NPC by ID
 *   character.$player.disposition.elena - player's disposition toward elena
 *   moment.tavern_fight-0.status        - specific moment instance by instanceId
 *   moment.tavern_fight-*.status        - wildcard for all instances of template
 *   globalStats.X                       - global stats
 *
 * Special vars:
 *   $player - resolves to player character ID (character with isPlayer: true)
 *   $self   - reference to the moment this expression belongs to (in transitions)
 *   $roll   - dice roll result (in challenges)
 *   $round  - current challenge round (in challenges)
 *   $turn   - current game turn
 *
 * In stat formulas only:
 *   $base   - base value of the stat being calculated
 *   stats.X - shorthand for other stats of the same character
 *
 * Conditions:
 *   expression when condition
 *   expression when ai(natural language hint for AI to evaluate)
 *
 * Examples:
 *   'character.$player.stats.gold += 100'
 *   '$self.status = available when character.$player.stats.gold >= 10'
 *   '$self.status = available when ai(player visits a place that sells lottery tickets)'
 *   'moment.tavern_fight-0.status = available'
 *   'moment.tavern_fight-*.status = passed'
 */
export type Expression = string;

/**
 * A consequence is an expression that modifies game state.
 */
export type Consequence = Expression;

// ============================================================================
// STAT SYSTEM
// ============================================================================

export type StatType = "number" | "boolean" | "text";

/**
 * Stat definition for a universe.
 *
 * Formulas are evaluated in context of the character that owns the stat.
 * Use shorthand paths (no character prefix needed):
 *   "$base + stats.strength / 2"
 *   "stats.strength * 10"
 *
 * Special vars in stat formulas:
 *   $base - the base value of THIS stat
 *   stats.X - other stats of the same character (shorthand)
 *
 * Common stats to define: level, experience, availablePoints
 */
export interface Stat {
  id: string;
  name: string;
  short?: string;
  description?: string;
  type: StatType;
  base?: number | boolean | string;
  formula?: Expression; // e.g., "$base + stats.strength / 2"
  range?: { min: number; max: number };
  display?: {
    icon?: string;
    color?: string;
    style?: "number" | "bar" | "badge" | "hidden";
    showInCreator?: boolean;
    showInSheet?: boolean;
    order?: number;
  };
}

// ============================================================================
// ENTITIES
// ============================================================================

export type Emotion =
  | "neutral"
  | "happy"
  | "joy"
  | "anger"
  | "sad"
  | "fear"
  | "thinking"
  | "confused"
  | "embarrassed"
  | "confident";

/**
 * A Character is any person/being in the universe.
 * The player character has isPlayer: true.
 *
 * Level, points, and other progression are tracked as stats:
 *   stats: { level: 1, experience: 0, availablePoints: 5, ... }
 */
export interface Character {
  id: string;
  name: string;
  description?: string;
  isPlayer?: boolean;   // true for the player character
  playable?: boolean;   // true if selectable at game start
  stats: Record<string, number | boolean | string>;
  disposition: Record<string, number>;
  memories: string[];
  personality: {
    traits: string[];
    values: string[];
    fears: string[];
    desires: string[];
  };
  images?: Partial<Record<Emotion, string>>;
  equipment?: Record<string, string | null>;
  inventory?: Array<{ itemId: string; quantity: number }>;
}

export interface Location {
  id: string;
  name: string;
  description: string;
  background?: string;
  music?: string;
  ambientSound?: string;
  requirements?: Expression[];
}

export interface Item {
  id: string;
  name: string;
  description: string;
  kind: "equipment" | "consumable" | "object";
  rarity?: "common" | "uncommon" | "rare" | "epic" | "legendary";
  slot?: string;
  whileEquipped?: Array<{ statId: string; amount: number }>;
  onUse?: Consequence[];
  stackable?: boolean;
  maxStack?: number;
  icon?: string;
}

// ============================================================================
// MOMENT SYSTEM
// ============================================================================

/**
 * Status of a moment in the game.
 *
 * - available: Can be chosen by player (appears as choice)
 * - active: Currently being experienced (only one at a time)
 * - lived: Was chosen and experienced
 * - passed: Was available but opportunity expired (urgent moments not chosen)
 * - hidden: Exists but not shown to player
 * - locked: Shown but cannot be chosen
 */
export type MomentStatus =
  | "available"
  | "active"
  | "lived"
  | "passed"
  | "hidden"
  | "locked";

/**
 * Transitions define expressions that run based on the moment's current status.
 * The key is the status the moment must be in for those expressions to evaluate.
 *
 * Example:
 * ```
 * transitions: {
 *   locked: ['$self.status = available when character.$player.stats.gold >= 10'],
 *   available: ['$self.status = passed when $turn > 3'],
 *   active: ['character.$player.stats.reputation += 5', '$self.status = lived']
 * }
 * ```
 */
export type MomentTransitions = Partial<Record<MomentStatus, Expression[]>>;

/**
 * A Moment is a discrete unit of narrative experience.
 * Moments serve as both content AND choices - there is no separate Choice type.
 *
 * In Universe.moments (templates): id is simple, e.g., "tavern_fight"
 * In GameState.moments (instances): id has suffix, e.g., "tavern_fight-0", "tavern_fight-1"
 *
 * Expression paths reference instances: moment.tavern_fight-0.status
 * Wildcard references all instances: moment.tavern_fight-*.status
 */
export interface Moment {
  id: string; // Template: "tavern_fight", Instance: "tavern_fight-0"

  // Display
  title?: string; // Full title when viewing the moment
  text?: string; // Narrative text content
  preview?: string; // Short text shown as choice button when available

  // Status (single source of truth)
  status?: MomentStatus;

  // Location and stage presentation
  locationId?: string;
  stage?: Record<
    "left" | "center" | "right",
    { characterId: string; emotion?: Emotion; speaking?: boolean } | undefined
  >;

  // Status transitions and consequences
  transitions?: MomentTransitions;

  // Challenge (if this moment triggers one)
  // Copied from Universe.challenges template, not a reference
  challenge?: Challenge;

  // Metadata
  tags?: string[];
  urgent?: boolean; // If true and not selected, can transition to 'passed'
}

// ============================================================================
// CHALLENGE SYSTEM
// ============================================================================

export interface ChallengeRole {
  id: string;
  name: string;
  required: boolean;
}

export interface ChallengeOutcome {
  id: string;
  name: string;
  condition: Expression;
  consequences?: Consequence[];
}

export interface Challenge {
  id: string;
  name: string;
  description?: string;
  roles: ChallengeRole[];
  roundActions: Consequence[];
  outcomes: ChallengeOutcome[];
  maxRounds?: number;
  trackedStats?: Array<{
    statId: string;
    showAs: "bar" | "number";
    label?: string;
  }>;
  display?: {
    theme?: string;
    roundDelay?: number;
  };
}

// ============================================================================
// UNIVERSE
// ============================================================================

/**
 * Universe configuration for game rules.
 *
 * Progression system:
 *   - Characters have stats: level, experience, availablePoints
 *   - When experience >= experiencePerLevel * level, character levels up
 *   - On level up: level += 1, availablePoints += pointsPerLevel
 */
export interface UniverseConfig {
  startingPoints: number;      // Initial availablePoints for new characters
  pointsPerLevel: number;      // Points gained per level up
  experiencePerLevel: number;  // Experience needed per level (multiplied by current level)
  equipmentSlots: string[];    // Available equipment slots (e.g., ["weapon", "armor", "accessory"])
}

/**
 * A Universe is a complete game package containing rules, entities, and content.
 *
 * Moments with status: 'available' in the template are starting moments.
 * No separate startingMomentIds needed.
 */
export interface Universe {
  id: string;
  name: string;
  description: string;
  theme: string;
  version: number;
  config: UniverseConfig;
  stats: Stat[];
  items: Item[];
  characters: Character[];
  locations: Location[];
  challenges: Challenge[];  // Template palette - copied to moments when authoring
  moments: Moment[];        // Templates - moments with status:'available' are starting moments
}

// ============================================================================
// GAME STATE
// ============================================================================

/**
 * GameState is the single source of truth for a game session.
 *
 * Characters array includes the player (isPlayer: true).
 * Find player: characters.find(c => c.isPlayer)
 *
 * The moments array holds all runtime moment instances.
 * - Filter by status === 'available' to get chooseable moments
 * - Filter by status === 'active' to get current moment
 * - Filter by status === 'lived' to get history (in order)
 * - Array order is chronological (when moments entered play)
 *
 * Moments are deep-copied from Universe templates when they enter play.
 * Instance IDs follow pattern: "momentId-0", "momentId-1", etc.
 */
export interface GameState {
  id: string;
  universeId: string;
  createdAt: number;
  savedAt: number;
  seed: number; // For deterministic randomness

  // Entities (copied from templates, mutated during play)
  // Player character has isPlayer: true
  characters: Character[];

  // Global state (includes boolean flags)
  globalStats: Record<string, number | boolean | string>;

  // Moments - THE source of truth for narrative state
  moments: Moment[];
}
```

### packages/shared/src/types.ts

```typescript
// ============================================
// UNIVERSE - Defines the rules of your world
// ============================================

export interface Universe {
  id: string
  name: string
  description: string
  theme: string // "dark fantasy", "sci-fi", etc.

  stats: Stat[]
  items: Item[]
  challenges: ChallengeTemplate[]
  npcs: NPC[]
  locations: Location[]

  config: {
    startingPoints: number // Points to distribute at creation
    pointsPerLevel: number
    equipmentSlots: string[] // ["head", "body", "weapon", "accessory"]
  }
}

// ============================================
// STATS - Character attributes
// ============================================

export interface Stat {
  id: string
  name: string
  short?: string // "STR", "HP", etc.
  description: string

  type: "core" | "computed" // core = player assigns, computed = calculated

  // Display configuration
  display: {
    icon: string // Lucide icon name
    color: string // Tailwind color class
    style: "number" | "bar" // How to show it
    barColor?: string // For bar style
    showInCreator?: boolean // Show during character creation
    showInSheet?: boolean // Show in character sheet
    order?: number // Display order
  }

  // For 'core' stats
  range?: {
    min: number
    max: number
  }

  // For 'computed' stats
  calculation?: Token[]
  clamp?: {
    // Optional min/max for computed values
    min?: number
    max?: number
  }
}

// Calculation tokens - simple and clear
export type Token =
  | { type: "stat"; id: string } // Reference another stat
  | { type: "number"; value: number } // Literal number
  | { type: "op"; value: "+" | "-" | "*" | "/" } // Operator
  | { type: "paren"; value: "(" | ")" } // Grouping
  | { type: "fn"; name: "min" | "max" | "floor" } // Functions
  | { type: "role"; role: string; stat: string } // For challenges: "attacker.strength"

// ============================================
// ITEMS - Things characters can have
// ============================================

export interface Item {
  id: string
  name: string
  description: string
  icon: string
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary"

  kind: "equipment" | "consumable" | "key"

  // For equipment
  slot?: string
  bonuses?: { statId: string; amount: number }[]

  // For consumables
  stackable?: boolean
  maxStack?: number
  effect?: { statId: string; amount: number }[] // Permanent changes when used
}

// ============================================
// CHALLENGES - Timed events (battles, races, exams, etc.)
// ============================================

export interface ChallengeTemplate {
  id: string
  name: string // "Combat", "Race", "Exam"
  description: string
  icon: string

  // Who participates
  roles: {
    id: string // "player", "enemy", "opponent"
    name: string // Display name
    required: boolean
  }[]

  // What stats matter in this challenge (for display)
  trackedStats: {
    statId: string
    showAs: "bar" | "number"
    label?: string // Override display name
  }[]

  // What happens each round
  rounds: RoundAction[]

  // How it can end
  outcomes: Outcome[]

  // Safety limits
  maxRounds: number
  defaultOutcome?: string // If max rounds hit

  // UI customization
  display: {
    roundDelay: number // ms between rounds
    showLog: boolean
    theme?: "combat" | "race" | "academic" | "social"
  }
}

export type RoundAction =
  | {
      type: "damage"
      target: string // Role ID
      stat: string // Which stat to reduce
      amount: Token[] // Calculation for damage
      message?: string // "{attacker} hits {target} for {amount}!"
    }
  | {
      type: "check"
      condition: Token[] // Must evaluate to truthy
      onTrue?: string // Outcome ID to trigger
      onFalse?: string
    }
  | {
      type: "log"
      message: string // Template with {role.stat} placeholders
    }
  | {
      type: "roll"
      dice: string // "1d20", "2d6"
      saveAs: string // Variable name to store result
      modifier?: Token[]
    }

export interface Outcome {
  id: string
  name: string // "Victory", "Defeat", "First Place"
  description: string
  result: "win" | "lose" | "draw"

  // Rewards/consequences
  rewards?: {
    experience?: number
    items?: { itemId: string; chance: number }[]
    statChanges?: { statId: string; amount: number }[]
  }

  gameOver?: boolean
}

// ============================================
// TEMPLATES - NPCs and Locations
// ============================================

export interface NPC {
  id: string
  name: string
  description: string
  role: string // "mentor", "villain", "ally"
  stats: Record<string, number>
  portrait?: string
}

export interface Location {
  id: string
  name: string
  description: string
  image?: string
}

// ============================================
// GAME STATE - Active playthrough
// ============================================

export interface GameState {
  id: string
  universeId: string

  character: Character

  // Story is just a stack of cards
  story: Card[]

  // Current story phase (0-11 for hero's journey)
  phase: number

  // If we're in a challenge
  challenge: ActiveChallenge | null
}

export interface Character {
  id: string
  name: string
  level: number

  // Core stats (what player assigned + permanent bonuses)
  baseStats: Record<string, number>

  // Equipment slots -> item IDs
  equipment: Record<string, string | null>

  // Inventory
  inventory: { itemId: string; quantity: number }[]

  // Points tracking
  points: {
    total: number
    used: number
  }
}

// ============================================
// CARDS - What appears in the story stack
// ============================================

export type Card = StoryCard | ChoiceCard | DiceCard | ChallengeCard | OutcomeCard

interface BaseCard {
  id: string
  timestamp: number
}

export interface StoryCard extends BaseCard {
  type: "story"
  title: string
  content: string
  image?: string
}

export interface ChoiceCard extends BaseCard {
  type: "choice"
  prompt: string
  options: {
    id: string
    text: string
    description?: string
    skillCheck?: {
      statId: string
      difficulty: number
    }
    selected?: boolean
    disabled?: boolean
  }[]
}

export interface DiceCard extends BaseCard {
  type: "dice"
  stat: string
  statValue: number
  roll: number
  target: number
  success: boolean
}

export interface ChallengeCard extends BaseCard {
  type: "challenge"
  challengeId: string
  status: "active" | "complete"
  outcomeId?: string
}

export interface OutcomeCard extends BaseCard {
  type: "outcome"
  title: string
  description: string
  result: "win" | "lose" | "draw"
  rewards?: string[]
}

// ============================================
// ACTIVE CHALLENGE - Running challenge state
// ============================================

export interface ActiveChallenge {
  templateId: string
  round: number

  participants: Record<
    string,
    {
      name: string
      portrait?: string
      stats: Record<string, number>
      maxStats: Record<string, number>
    }
  >

  variables: Record<string, number>
  log: LogEntry[]

  outcome: Outcome | null
}

export interface LogEntry {
  id: string
  message: string
  type: "action" | "damage" | "heal" | "info" | "result"
  timestamp: number
}
```

### packages/shared/tsconfig.json

```json
{
  "extends": "@wdydn/config/typescript/base.json",
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### turbo.json

```json
{
  "$schema": "https://turborepo.com/schema.json",
  "ui": "tui",
  "tasks": {
    "build": {
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "dependsOn": ["^build"],
      "outputs": [
        "build/**",
        ".vercel/**",
        "dist/**",
        ".next/**",
        "!.next/cache/**"
      ]
    },
    "test": {
      "outputs": ["coverage/**"],
      "dependsOn": []
    },
    "lint": {
      "dependsOn": ["^build", "^lint"]
    },
    "check-types": {
      "dependsOn": ["^build", "^check-types"]
    },
    "dev": {
      "dependsOn": ["^build"],
      "cache": false,
      "persistent": true
    }
  }
}
```

