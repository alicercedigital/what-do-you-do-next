# Architecture Redesign - Incremental Implementation

Based on the proposal in `evaluate-yTq42.tsx`, this tracks the incremental migration from the old architecture to the new simplified one.

## Phase 1: Core Foundation
- [x] **1.1** Create `core/types.ts` - All types in ONE file with new naming
- [x] **1.2** Create `core/calc.ts` - Simplified calculation evaluator 
- [x] **1.3** Create `core/storage.ts` - localStorage wrapper for universes/games

## Phase 2: Challenge System
- [x] **2.1** Challenge types already included in core/types.ts
- [x] **2.2** Create `challenge/engine.ts` - Pure challenge logic (createChallenge, runRound)
- [x] **2.3** Create `challenge/templates.ts` - Pre-built challenge templates (combat, race, exam)

## Phase 3: Game Layer
- [x] **3.1** Create `game/store.ts` - Zustand store with simplified state
- [x] **3.2** Create `game/cards/story-card.tsx` - Story card component
- [x] **3.3** Create `game/cards/choice-card.tsx` - Choice card component
- [x] **3.4** Create `game/cards/dice-card.tsx` - Dice roll card component
- [x] **3.5** Create `game/cards/challenge-card.tsx` - Challenge card component
- [x] **3.6** Create `game/cards/outcome-card.tsx` - Outcome card component
- [x] **3.7** Create `game/story-stack.tsx` - Simple card stack (replaces React Flow canvas)
- [x] **3.8** Create `game/character-creator.tsx` - New character creation
- [x] **3.9** Create `game/character-sheet.tsx` - Character stat display
- [x] **3.10** Create `game/game.tsx` - Main game component

## Phase 4: Editor Layer  
- [x] **4.1** Create `editor/stat-editor.tsx` - Stat editing with core/computed types
- [x] **4.2** Create `editor/item-editor.tsx` - Item editing
- [x] **4.3** Create `editor/challenge-editor.tsx` - Challenge template editing
- [x] **4.4** Create `editor/components/calculation-builder.tsx` - Token-based formula builder
- [x] **4.5** Create `editor/universe-editor.tsx` - Main universe editor

## Phase 5: Data Migration
- [x] **5.1** Create `data/starter-universes.ts` - Default universes in new format
- [ ] **5.2** Add migration utility - Convert old universe format to new

## Phase 6: Integration & Cleanup
- [ ] **6.1** Create new app pages - Main menu, universe select, edit pages
- [ ] **6.2** Wire up routing and navigation
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

## File Structure (Complete)

```
├── core/
│   ├── types.ts          ✅
│   ├── calc.ts           ✅
│   └── storage.ts        ✅
├── challenge/
│   ├── engine.ts         ✅
│   └── templates.ts      ✅
├── game/
│   ├── store.ts          ✅
│   ├── game.tsx          ✅
│   ├── story-stack.tsx   ✅
│   ├── character-creator.tsx ✅
│   ├── character-sheet.tsx ✅
│   └── cards/
│       ├── story-card.tsx ✅
│       ├── choice-card.tsx ✅
│       ├── dice-card.tsx ✅
│       ├── challenge-card.tsx ✅
│       └── outcome-card.tsx ✅
├── editor/
│   ├── universe-editor.tsx ✅
│   ├── stat-editor.tsx ✅
│   ├── item-editor.tsx ✅
│   ├── challenge-editor.tsx ✅
│   └── components/
│       └── calculation-builder.tsx ✅
└── data/
    └── starter-universes.ts ✅
```

## Current Status

All core architecture files have been created. Next step is Phase 6: Integration.
