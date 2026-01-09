# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**WDYDN (What Do You Do Next)** is an interactive fiction platform for creating and sharing story-driven game universes. Creators build universes with narratives, characters, and mechanics; players experience choice-driven branching stories. AI serves as both a creation helper and runtime gap-filler when authored content ends.

## Development Commands

```bash
# Root commands (run from monorepo root)
bun install          # Install all dependencies
bun run dev          # Start all apps in development mode
bun run build        # Build all packages and apps
bun run lint         # Lint all packages
bun run test         # Run all tests
bun run check-types  # Type-check all packages
bun run format       # Format code with Prettier

# Run a single package
bun run --filter @wdydn/game-api-v2 dev
bun run --filter @wdydn/game-frontend-v2 dev

# Run a single test file (in a package directory)
cd apps/game-api-v2 && bun run test -- path/to/test.spec.ts
```

## Monorepo Structure

- **apps/game-api-v2** - Express API server with AI integration (Anthropic/OpenAI via Vercel AI SDK)
- **apps/game-frontend-v2** - React frontend (Vite, Tailwind v4, Zustand, shadcn/ui components)
- **packages/shared** - Shared types (Universe, GameState, Moment, Character, etc.)
- **packages/config** - Shared ESLint, TypeScript, and Jest configurations
- **packages/scripts** - Build/utility scripts

## Core Domain Concepts (v2.2)

See [.claude/decisions.md](.claude/decisions.md) for the full decision log. Key terminology:

| Term | Definition |
|------|------------|
| **Universe** | Complete game package: rules, entities, content |
| **Moment** | Unit of narrative experience (replaces "Card" and "Choice" - moments ARE choices) |
| **Consequence** | State change expression (replaces "Effect") |
| **Stat** | Any tracked value - number, boolean, or text (replaces separate "Flags") |
| **Challenge** | Round-based encounter (combat, race, exam, etc.) |

### Moment Status Flow

Moments have a `status` field that is the single source of truth:
- `hidden` → `locked` → `available` → `active` → `lived`
- `available` → `passed` (if urgent and not chosen)

GameState.moments is an ordered array. Filter by status to get:
- Available choices: `status === 'available'`
- Current moment: `status === 'active'`
- History: `status === 'lived'`

### Expression System

All game logic uses string expressions evaluated at runtime:
```typescript
// Access paths
'character.$player.stats.gold += 100'           // Player stat
'character.elena.stats.charisma'                // NPC stat
'moment.tavern_fight-0.status = available'      // Specific moment
'moment.tavern_fight-*.status = passed'         // All instances of template

// Special variables
$player  // Player character ID
$self    // Current moment (in transitions)
$turn    // Current game turn
$roll    // Dice result (in challenges)

// AI conditions
'$self.status = available when ai(player visits a place that sells lottery tickets)'
```

### Transitions System

Moments define transitions keyed by their current status:
```typescript
transitions: {
  locked: ['$self.status = available when character.$player.stats.gold >= 10'],
  available: ['$self.status = passed when $turn > 3'],
  active: ['character.$player.stats.reputation += 5', '$self.status = lived']
}
```

## Architecture Notes

### API Routes (game-api-v2)
- `/api/game/*` - Game session management
- `/api/moments/*` - Moment operations
- `/api/challenges/*` - Challenge execution
- `/api/ai/*` - AI generation endpoints

### Frontend State (game-frontend-v2)
- **Zustand store** at `src/store/game-store.ts` - Central game state
- **Selectors** at `src/store/selectors.ts` - Derived state (available moments, history, current moment)
- **Components** use shadcn/ui with Radix primitives

### Shared Types
All domain types live in `packages/shared/src/types-v2.ts`. Key exports:
- `Universe`, `GameState`, `Moment`, `Character`, `Location`, `Item`, `Challenge`
- `Expression`, `Consequence`, `MomentStatus`, `MomentTransitions`
