# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
# Install dependencies (uses Bun as package manager)
bun install

# Run all apps in development mode
bun run dev

# Run individual apps
bun run --filter @wdydn/game-frontend dev   # Frontend on :5173
bun run --filter @wdydn/game-api dev        # API on :3001

# Build all packages
bun run build

# Type checking
bun run check-types

# Lint
bun run lint

# Run tests (API only currently)
bun run test

# Run single test file
bun run --filter @wdydn/game-api test -- path/to/test.ts

# Format code
bun run format
```

## Architecture Overview

This is a **"What Do You Do Next" (WDYDN)** - an interactive RPG game engine built as a Turborepo monorepo.

### Monorepo Structure

```
apps/
  game-frontend/    # React 19 + Vite + Tailwind CSS v4 + React Router v7
  game-api/         # Express + Vercel AI SDK (OpenAI integration)
packages/
  shared/           # Type definitions and API contracts (no runtime code)
  logger/           # Console logging wrapper
  config-eslint/    # Shared ESLint configurations
  config-typescript/# Shared TypeScript configurations
  jest-presets/     # Jest testing presets
```

### Frontend Architecture (game-frontend)

**State Management:** Single Zustand store at `src/game/store.ts` manages all game state:
- `phase`: "menu" | "select" | "create" | "play"
- `universe`: Selected game world definition
- `game`: Current playthrough (character, story cards)
- `challenge`: Active combat/encounter state

**Key Directories:**
- `src/game/` - Core game logic, store, and components
- `src/game/engine/` - Challenge execution engine and templates
- `src/game/cards/` - Story, Choice, Dice, Challenge, Outcome cards
- `src/universe/` - Universe creation/editing components
- `src/character/` - Character creation components
- `src/shared/components/ui/` - Radix UI component library
- `src/shared/lib/calc.ts` - Expression evaluation (shunting-yard algorithm)
- `src/shared/lib/storage.ts` - localStorage persistence layer

**Path Alias:** `@/` maps to `src/`

### Backend Architecture (game-api)

Express server with AI-powered content generation routes:
- `POST /api/ai/smart-input` - Generate/expand/improve text
- `POST /api/story/generate` - Generate story segments
- `POST /api/attributes/generate` - Create stat definitions
- `POST /api/attributes/generate-benchmarks` - Create difficulty benchmarks

Frontend proxies `/api/*` to backend via Vite config.

### Shared Package

`@wdydn/shared` contains:
- `types.ts` - Core domain types (Universe, GameState, Card, Character, etc.)
- `api.ts` - API request/response interfaces with Zod schemas

Both frontend and backend import types from this package.

## Key Domain Concepts

**Universe:** Complete game rule set containing stats, items, challenges, NPCs, locations.

**Stats:** Two types - `core` (player-assigned at character creation) and `computed` (calculated from formulas).

**Challenge System:** Data-driven encounters using templates (Combat, Race, Exam). Engine executes rounds with actions: `damage`, `check`, `log`, `roll`.

**Cards:** Story unfolds as a stack - StoryCard, ChoiceCard, DiceCard, ChallengeCard, OutcomeCard.

**Expression Tokens:** Stats use `Token[]` arrays (not string formulas) for safe evaluation:
```typescript
calculation: [
  {type: "stat", id: "strength"},
  {type: "op", value: "*"},
  {type: "number", value: 2}
]
```

## Important Patterns

**Type-Driven:** All types defined in shared package, imported by both apps.

**Local-First:** All universes and game state stored in localStorage. No backend database.

**Challenge Templates:** Logic in `engine.ts`, behavior defined in template data structures.

**Zustand Persistence:** Game state auto-saves to localStorage key `"rpg-game-v2"`.
