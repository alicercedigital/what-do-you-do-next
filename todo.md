# Architecture Redesign - Incremental Implementation

Based on the proposal in `evaluate-yTq42.tsx`, this tracks the incremental migration from the old architecture to the new simplified one.

## Phase 1: Core Foundation
- [x] **1.1** Create `core/types.ts` - All types in ONE file with new naming
- [ ] **1.2** Create `core/calc.ts` - Simplified calculation evaluator 
- [ ] **1.3** Create `core/storage.ts` - localStorage wrapper for universes/games

## Phase 2: Challenge System
- [ ] **2.1** Create `challenge/types.ts` - Challenge-specific types (if not in core)
- [ ] **2.2** Create `challenge/engine.ts` - Pure challenge logic (createChallenge, runRound)
- [ ] **2.3** Create `challenge/templates.ts` - Pre-built challenge templates (combat, race, exam)

## Phase 3: Game Layer
- [ ] **3.1** Create `game/store.ts` - Zustand store with simplified state
- [ ] **3.2** Create `game/cards/story-card.tsx` - Story card component
- [ ] **3.3** Create `game/cards/choice-card.tsx` - Choice card component
- [ ] **3.4** Create `game/cards/dice-card.tsx` - Dice roll card component
- [ ] **3.5** Create `game/cards/challenge-card.tsx` - Challenge card component
- [ ] **3.6** Create `game/cards/outcome-card.tsx` - Outcome card component
- [ ] **3.7** Create `game/story-stack.tsx` - Simple card stack (replaces React Flow canvas)
- [ ] **3.8** Create `game/character-creator.tsx` - New character creation
- [ ] **3.9** Create `game/character-sheet.tsx` - Character stat display
- [ ] **3.10** Create `game/game.tsx` - Main game component

## Phase 4: Editor Layer  
- [ ] **4.1** Create `editor/stat-editor.tsx` - Stat editing with core/computed types
- [ ] **4.2** Create `editor/item-editor.tsx` - Item editing
- [ ] **4.3** Create `editor/challenge-editor.tsx` - Challenge template editing
- [ ] **4.4** Create `editor/components/calculation-builder.tsx` - Token-based formula builder
- [ ] **4.5** Create `editor/universe-editor.tsx` - Main universe editor

## Phase 5: Data Migration
- [ ] **5.1** Create `data/starter-universes.ts` - Default universes in new format
- [ ] **5.2** Add migration utility - Convert old universe format to new

## Phase 6: Integration & Cleanup
- [ ] **6.1** Update `app/page.tsx` - Use new game components
- [ ] **6.2** Update `app/universes/*` - Use new editor components
- [ ] **6.3** Update API routes - Use new types
- [ ] **6.4** Remove old files - Clean up deprecated code

---

## Naming Changes Reference

| Old (Confusing) | New (Clear) |
|-----------------|-------------|
| `distributable` | `core` |
| `derived` | `computed` |
| `conflict` | `challenge` |
| `cycle` | `round` |
| `formula` | `calculation` |
| `heroJourneyStep` | `storyPhase` |
| `pendingEvents` | `queue` |
| `attributeTest` | `skillCheck` |

## File Structure Target

```
src/
├── core/
│   ├── types.ts          # All types in ONE file
│   ├── calc.ts           # Calculation evaluator
│   └── storage.ts        # localStorage wrapper
├── challenge/
│   ├── engine.ts         # Pure challenge logic
│   └── templates.ts      # Pre-built templates
├── game/
│   ├── store.ts          # Zustand store
│   ├── game.tsx          # Main component
│   ├── story-stack.tsx   # Card stack
│   ├── character-creator.tsx
│   ├── character-sheet.tsx
│   └── cards/
│       ├── story-card.tsx
│       ├── choice-card.tsx
│       ├── dice-card.tsx
│       ├── challenge-card.tsx
│       └── outcome-card.tsx
├── editor/
│   ├── universe-editor.tsx
│   ├── stat-editor.tsx
│   ├── item-editor.tsx
│   ├── challenge-editor.tsx
│   └── components/
│       └── calculation-builder.tsx
└── data/
    └── starter-universes.ts
```

## Current Progress

Started: [DATE]
Last Updated: [DATE]
