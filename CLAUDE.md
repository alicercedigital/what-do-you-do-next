# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

- **Development**: `npm run dev` - Start Next.js development server
- **Build**: `npm run build` - Create production build
- **Lint**: `npm run lint` - Run ESLint on codebase
- **Start**: `npm run start` - Start production server

## Project Architecture

This is a **story-driven RPG game** built with Next.js 16, React 19, TypeScript, and Tailwind CSS. The application uses a canvas-based visual storytelling approach where game events and player choices are represented as nodes connected by lines.

### Core Architecture

**State Management**: Zustand store (`lib/store/game-store.ts`) manages the entire game state including:
- Game flow (menu → universe selection → character creation → gameplay)
- Canvas state (nodes, connections, viewport)
- Conflict system execution
- Save/load functionality

**Game Flow**: Multi-step progression through `GameContainer` component:
1. Main menu
2. Universe selection (different game worlds/settings)
3. Character creation with attribute allocation
4. Canvas-based gameplay

### Key Systems

**Schema Architecture** (`lib/schemas/`):
- `game-schema.ts`: Core game entities (GameEvent, GameOption, PlayerCharacter, GameState)
- `game-entity-schema.ts`: Universe entities (locations, items, characters, conflicts)
- `conflict-event-schema.ts`: Combat/conflict system definitions

**Canvas System** (`components/game/game-canvas.tsx`):
- Visual representation of story progression as interconnected nodes
- Events are story beats, options are player choices
- Automatic layout with React Flow-like positioning

**Conflict System** (`lib/game-engine/conflict-system.ts`):
- Turn-based combat with customizable roles and cycles
- Formula-based attribute calculations and damage
- Integration with canvas storytelling

**Universe System**: Configurable game worlds with:
- Custom attributes, items, locations, characters
- Conflict definitions and outcomes
- Story generation prompts and themes

### Technical Details

**Path Aliases**: Uses `@/*` for absolute imports from project root

**State Structure**: Game state flows from universe selection → character creation → canvas gameplay with persistent save/load via localStorage

**AI Integration**: Multiple API endpoints for story generation, attribute suggestions, and smart input processing

**Component Organization**:
- `app/` - Next.js App Router pages and API routes
- `components/game/` - Core game UI components
- `components/universe/` - Universe editing and management
- `components/ui/` - Reusable UI components (Radix-based)
- `lib/` - Business logic, schemas, utilities, and game engine

**TypeScript Configuration**: Strict mode enabled with modern ES6+ target and Next.js optimizations
