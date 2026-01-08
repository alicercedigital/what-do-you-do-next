# Design Decisions

> **Note:** The decisions below (v1) are superseded by the "System Redesign v2" section starting at line 380. Key terminology changes:
> - "Card/StoryCard" → **Moment**
> - "Path" → **Choice**
> - "Effect" → **Consequence**
> - "Flags" → eliminated (now just boolean Stats)
>
> v1 decisions are kept for historical reference. When in doubt, v2 is authoritative.

---

# v1 Decisions (Historical)

## Condition Expression System

**Question:** How should conditions be expressed - custom DSL using Token[] or external evaluator?

**Decision:** Use an external expression evaluator (expr-eval) for string-based expressions. This allows writing conditions like `player.stats.strength > 10 && flags.met_king` rather than building complex Token[] arrays. String expressions are more readable, easier to author, and leverage battle-tested parsing. The Token[] system can remain for stat calculations where it works well, while the expression evaluator handles the more complex conditional logic needed for choice visibility, effect triggers, faction influences, and skill check outcomes.

## Expression Context Variables

**Question:** What should the expression path structure look like for accessing entity properties?

**Decision:** Full explicit paths that mirror the actual data structure:
- `player.stats.strength` - access current player's strength stat
- `character.elena.stats.charisma` - access character Elena's charisma stat
- `character.elena.relationships.player.trust` - access Elena's trust toward player
- `location.market.factionInfluences` - access location properties
- `faction.thieves_guild.resources.gold` - access faction resources
- `flags.met_king` - access global flags

Full explicit paths are more verbose but eliminate ambiguity and mirror the actual data model, making debugging easier.

## Effect Structure

**Question:** What should the effect structure look like for modifying game state?

**Decision:** Expression-based effects using a single string that specifies both target and operation:
- `player.stats.strength += 5` - add to a stat
- `flags.met_king = true` - set a flag
- `character.elena.relationships.player.trust += 10` - modify relationship
- `player.inventory.gold += $result * 100` - use special variables like dice result

With a separate condition field for conditional execution:

```typescript
interface Effect {
  expression: string;      // "player.stats.strength += 5"
  condition?: string;      // "player.stats.level >= 10"
}
```

This keeps the 'when' (condition) separate from the 'what' (expression), making effects easier to read and author.

## Skill Check Difficulty System

**Question:** How should skill check difficulty thresholds be determined?

**Decision:** Named difficulty levels defined at the universe level. The universe specifies 5 difficulty tiers (e.g., Trivial, Easy, Medium, Hard, Legendary) with fixed target numbers. Each skill check then references a difficulty tier by name rather than specifying custom thresholds.

```typescript
// In Universe config
difficultyTiers: {
  trivial: { target: 5, critSuccessBonus: 5 },
  easy: { target: 8, critSuccessBonus: 7 },
  medium: { target: 12, critSuccessBonus: 8 },
  hard: { target: 16, critSuccessBonus: 10 },
  legendary: { target: 20, critSuccessBonus: 12 }
}

// In a skill check
{ stat: "agility", difficulty: "medium", outcomes: {...} }
```

This keeps skill check authoring simple while allowing universe creators to tune the numbers for their system.

## Choice Data Structure

**Question:** Should choices be embedded directly in StoryCards or referenced by ID?

**Decision:** Choices are embedded directly within the StoryCard. Choices only specify text, visibility conditions, and which card comes next. Effects are NOT applied by choices - they are applied by the next card when it resolves:

```typescript
interface StoryCard {
  // ... other fields
  choices?: Choice[];
}

interface Choice {
  id: string;
  text: string;
  description?: string;
  visible?: string;        // Condition expression - if false, choice is hidden
  enabled?: string;        // Condition expression - if false, choice is shown but disabled
  disabledReason?: string; // Shown when hovering disabled choice
  nextCardId?: string;     // If set, this card comes next; if not, AI generates
}
```

Embedding keeps all the information about a story moment in one place. Effects remain on cards (the consequence cards that choices lead to), keeping a clear separation between "what you can do" (choices) and "what happens" (cards with effects).

## Faction Resource Structure

**Question:** How should faction resources be structured?

**Decision:** Use the same Stat structure as characters. Faction resources like gold, influence, and troops will use the existing Stat type with display configuration, ranges, and potentially computed values. This creates consistency across the system - the same expression syntax and effect system works for both character stats and faction resources.

```typescript
interface Faction {
  id: string;
  name: string;
  description: string;

  stats: Stat[];           // Reuse the Stat type for resources

  // Faction-specific fields
  modifiers: FactionModifier[];  // Effects applied to locations they influence
  goals?: string[];              // AI narrative hints
}
```

This means `faction.thieves_guild.stats.influence` in expressions, consistent with character stat access.

## Challenge Visualization Slots

**Question:** How should challenge visualization slots be structured?

**Decision:** A standard slot system with flexible named slots that mix positional and functional purposes. This covers different challenge types (combat, races, social encounters, puzzles) across different genres:

Standard slots:
- `left_actor` - left side character/entity position
- `right_actor` - right side character/entity position
- `center_stage` - central focal point
- `top_status` - for progress bars, round counters, status indicators
- `bottom` - lower content area
- `background` - scene backdrop/environment

Challenge templates map their roles to these standard slots:

```typescript
interface ChallengeTemplate {
  // ... other fields
  visualization: {
    slotMapping: Record<string, string>;  // role ID -> slot name
    components: {
      slot: string;                        // which slot
      type: 'character' | 'stat_bar' | 'text' | 'custom';
      props: Record<string, unknown>;      // component-specific config
    }[];
  }
}
```

Templates assign roles to standard slots, making the system flexible while keeping a predictable layout structure.

## Story Authoring Unit

**Question:** When authoring stories, what's the primary unit of structure - individual cards, scenes, or something more abstract?

**Decision:** Cards are the only structural unit. No "scene" abstraction - just cards with paths between them. A card that ends with multiple paths naturally presents as choices. This keeps the model simple: the story is a graph of cards connected by paths (choices). When a card has no next path defined, AI can generate continuation.

## Path Structure

**Question:** What information does a path (choice) carry?

**Decision:** Paths carry more than just pointers - they can have immediate effects and visibility logic:

```typescript
interface Path {
  id: string;
  text: string;                // Display text for the choice
  description?: string;        // Optional tooltip/detail
  nextCardId?: string;         // Destination card (or undefined for AI generation)
  visible?: string;            // Condition - if false, path is hidden
  enabled?: string;            // Condition - if false, path shown but disabled
  disabledReason?: string;     // Text shown when hovering disabled path
  effects?: Effect[];          // Applied immediately when path is clicked
}
```

Path effects apply on click (before destination card resolves). This allows costs like "Costs 10 gold" to be deducted immediately. Destination card effects apply when that card resolves - two distinct moments. This differs from the earlier Choice decision which put all effects on cards; paths now handle immediate costs/changes while cards handle consequences.

## Unified Card Type

**Question:** Should there be separate card types (StoryCard, ChoiceCard, DiceCard, ChallengeCard) or one unified Card type?

**Decision:** Merge into one unified Card type. A card has:
- Narrative content (title, text, image)
- Effects that resolve when the card becomes active
- Paths that lead to other cards or AI generation
- Tags for categorization/filtering

Dice rolls and challenges are NOT separate card types - they're triggered by effects. This simplifies the model: cards are narrative moments with effects and paths.

## Effect Execution Model

**Question:** How do effects that require user interaction (dice rolls, challenges) integrate with the effect system?

**Decision:** Effect queue with pauses. Effects execute sequentially. When an effect requires interaction (rolling dice, running a challenge), it:
1. Pauses the effect queue
2. Shows the appropriate UI (dice roller, challenge view)
3. Waits for resolution
4. Stores the result in a variable (accessible via `$roll`, `$challengeOutcome`, etc.)
5. Continues executing remaining effects

This means a card's effects can include: `roll('1d20', 'stealth')` followed by conditional effects that use `$roll` to branch. The UI handles the pause naturally - player sees dice, clicks to roll, result appears, then effects continue.

---

# System Redesign - Objective Definition

## Core Purpose

**Question:** What is the primary experience you want users to have when using WDYDN?

**Decision:** Create & share universes. Users primarily design game worlds, rule systems, and story frameworks that others can then play. The system is a creative tool first, a game engine second.

## Universe Definition

**Question:** When someone creates a universe, what are they primarily defining?

**Decision:** A universe is a complete game world containing narrative definitions (lore, characters, locations, factions), game rules and mechanics (stats, items, challenges), AND stories (authored content that can be played). The term "universe" was chosen over "world" because a space exploration game might contain multiple worlds - the universe is the container for everything, even if that universe contains other universes within the fiction.

Key insight: AI serves two roles:
1. **Creation helper** - assists authors in building their universe
2. **Runtime continuity** - generates story content where the author hasn't written it, allowing the story to continue seamlessly

This means creators can play their own universes because AI fills gaps in authored content.

## Authored vs Generated Content (Gameplay)

**Question:** When a player plays through a universe, what's the ideal balance between authored content and AI-generated content?

**Decision:** AI is a fallback, not a primary generator. During gameplay:
- If the author has defined a path forward (next card, next scene), that authored content plays
- If there's no authored continuation (dead end, unexplored branch), AI generates what comes next
- AI can generate a single beat OR an entire sequence leading to a story checkpoint
- If an author scripts every possible path to completion, AI is never invoked during play

This is "authored-first" design - AI fills gaps rather than driving the experience. The more complete the authored content, the more controlled the experience.

## Target Users

**Question:** Who is the primary target user for creating universes?

**Decision:** Two distinct user types:
1. **Creators** - People who want to create interactive stories (varying skill levels, from hobbyists to professionals)
2. **Players** - People who want to play interactive stories

The system must serve both well. This implies the creation tools should be approachable (not requiring professional game design knowledge) while the play experience should be engaging regardless of how the universe was created.

## Interaction Model

**Question:** What makes a story 'interactive' in WDYDN? What's the core interaction model?

**Decision:** Choice-driven branching with game mechanics. All player interaction is through choices - no freeform text input.

However, choices aren't just narrative branches. They integrate with game mechanics:
- Choices can have requirements (need X strength to attempt)
- Choices can have costs (consumes time, resources)
- Choices can trigger dice rolls or skill checks
- Stats create gameplay where players must prepare/build up to access certain branches

Example: A "training" choice consumes time but increases strength. Later, a "break down the door" choice requires 10 strength. The game becomes about strategic choice-making to reach desired outcomes.

## Role of Randomness

**Question:** What role does randomness (dice rolls, chance) play in the experience?

**Decision:** Optional enhancement. Dice/randomness is a tool authors can use, not a core requirement. A universe can:
- Use pure deterministic stat checks (if strength >= 10, succeed)
- Use dice rolls for uncertainty (roll + strength vs difficulty)
- Mix both approaches
- Use no mechanics at all (pure narrative branching)

The system supports randomness but doesn't mandate it. Authors choose the level of chance that fits their universe's feel.

## Distribution Model

**Question:** How do creators share their universes with players?

**Decision:** Central marketplace. Universes are uploaded to a platform where players can:
- Browse and discover universes
- Download/play them
- Rate and review
- Comment and discuss

This implies the system needs:
- User accounts (for creators and players)
- A backend for storing universes
- Discovery features (search, categories, featured content)
- Social features (ratings, reviews, comments)

## Session Scope

**Question:** What's the expected scope/length of a single playthrough of a universe?

**Decision:** Short experiences (15-30 minutes). Universes are designed to be:
- Self-contained stories (like short stories or episodes)
- Quick to play through
- Easy to replay for different outcomes/branches

This has design implications:
- No complex save/resume system needed (can complete in one sitting)
- Emphasis on replayability and branching
- Simpler scope makes universe creation more achievable
- Players can try many universes rather than committing to one long experience

## Success Definition

**Question:** What would make WDYDN successful? What's the key metric or outcome you're aiming for?

**Decision:** Vibrant ecosystem. Success is measured by a healthy cycle:
1. Good universes attract players
2. Players enjoy experiences and share them
3. Some players become inspired to create
4. New creators publish universes
5. Cycle continues

This means both creation AND play experiences must be excellent. Neither can be sacrificed. The platform needs to:
- Make creation rewarding and achievable
- Make discovery easy
- Make play experiences consistently good
- Foster community and sharing

## Differentiators

**Question:** What makes WDYDN different from existing interactive fiction tools?

**Decision:** WDYDN differentiates on multiple axes:

**vs Twine/Choice of Games:**
- Has visuals (sprites, portraits, backgrounds, animations)
- Has game mechanics (stats, items, challenges)
- Has AI assistance

**vs Inkle:**
- More accessible (not a game engine for developers)
- Integrated platform with marketplace

**vs AI Dungeon:**
- Pre-authored experience (not purely AI-generated)
- Gamified with clear beginnings/endings
- Visual presentation (sprites, music, sounds)
- Choice-based (not open text input)
- **Collaborative refinement**: AI-generated content becomes part of the authored story. If AI fills a gap, that content is saved - future players see it without regeneration. The story improves over time with user feedback.

**Key visual element:** Narrative presented through:
- Character portraits with emotions
- Background scenes
- Object sprites
- Animations
- Music and sound effects

This makes it a multimedia experience, not just text.

## AI Content Curation

**Question:** When AI generates content to fill a gap, who decides if that content becomes permanent in the universe?

**Decision:** Automatic adoption with community moderation. The flow:

1. Player hits a gap → AI generates content → content is automatically saved
2. Future players see that content without regeneration
3. Players can vote up/down on AI-generated content
4. If content gets too many downvotes AND author hasn't approved it → auto-disabled
5. Author can at any time: approve, edit, remove, or regenerate

**Status levels for AI content:**
- **Unapproved** (default): Subject to community downvote disabling
- **Approved**: Author endorsed, immune to auto-disable
- **Disabled**: Hidden from players, can be re-enabled or regenerated

This creates a self-improving system where bad generations get filtered out by the community, while authors maintain ultimate control.

## Visual Asset Sources

**Question:** Where do the visual assets (sprites, portraits, backgrounds) come from?

**Decision:** All three sources supported:
1. **Built-in library**: Platform provides stock assets (character bases, backgrounds, items, effects) for quick creation
2. **User uploads**: Creators can upload custom art for unique universes
3. **AI generation**: AI can generate visuals from descriptions for accessibility

This layered approach means:
- New creators can start immediately with library assets
- Experienced creators can add custom art
- AI fills gaps when specific visuals are needed but not available
- Universes can mix all three sources

---

# System Redesign v2 - Foundational Vocabulary

## Core Terminology: Content Unit

**Question:** What is the fundamental unit of content that players experience?

**Decision:** **Moment**. A moment is a discrete unit of narrative experience. It can contain:
- Narrative content (text, visuals, audio)
- Choices that lead to other moments
- Effects that modify game state

Rationale: "Moment" is clear, emotionally resonant, and not overloaded in typical codebases (unlike "Event"). It captures the temporal, experiential nature of what players encounter.

## Core Terminology: World Container

**Question:** What do we call the complete package containing rules, entities, and content?

**Decision:** **Universe** (keep current). A universe contains everything needed to play: stats, items, characters, locations, factions, and the moment graph.

Rationale: "Universe" works for any scale or genre (including sci-fi with multiple planets). "Create universes" is compelling language for creators. No need to change what works.

## Core Terminology: Player Options

**Question:** What do we call the options players choose from in a Moment?

**Decision:** **Choice**. When a moment presents options, they are "choices" the player can make.

Rationale: Players are selecting between options - "make a choice" is natural language. While "action" answers "what do you do?", "choice" better describes the selection mechanic. The narrative describes what happens as a result of their choice.

## Core Terminology: State Changes

**Question:** What do we call the modifications to game state that result from moments/choices?

**Decision:** **Consequence**. Every choice can have consequences that modify stats, set flags, change relationships, etc.

Rationale: "Consequence" emphasizes that choices matter - core to the WDYDN experience. Used consistently in both code (`consequences: [...]`) and UI ("Your choices have consequences"). Aligns with the narrative focus of the system.

## Core Terminology: Character Attributes

**Question:** What do we call numeric character attributes like Strength, HP, etc.?

**Decision:** **Stat** (keep current). Stats are numeric values that define character capabilities and resources.

Rationale: Universal gaming terminology, short, clear. "Stat" works for both core values (Strength: 15) and derived/computed values (HP: 100). Everyone understands what a "stat" is.

Note: Personality traits (Brave, Cunning) are separate from stats - they're textual descriptors stored in `personality.traits: string[]` and used for narrative/AI purposes.

## Core Terminology: Interactive Encounters

**Question:** What do we call combat, races, exams, and other interactive encounters?

**Decision:** **Challenge** (keep current). Challenges are phased interactions with different outcomes based on conditions.

Rationale: Universal, works across genres and encounter types. A combat is a challenge, a race is a challenge, an exam is a challenge. Clear and flexible.

## Core Terminology: State Markers

**Question:** What do we call boolean/text markers that track story state?

**Decision:** They are also **Stats**. Stats can be any type (number, boolean, text) and can be computed via formulas. No separate "flags" concept.

Example: `met_king` is a boolean stat. `title` is a text stat.

## Core Terminology: Prerequisites

**Question:** What do we call the conditions that must be met for actions/consequences?

**Decision:** **Requirement**. "This action has requirements." Natural language that non-programmers understand.

Rationale: When players can't do something in games, they think "I need X" or "it requires Y". "Requirement" is the noun form of this everyday concept.

## Stat Model: Unified Formula Approach

**Question:** How should stat values be determined?

**Decision:** Unified formula system where every stat can optionally have a formula. Formulas can reference:
- `$base` - the default/starting value
- `$assigned` - points the player added (if assignable)
- Other stats - for derived calculations

Examples:
```typescript
// Simple fixed stat
{ id: "goblin_strength", type: "number", base: 5 }

// Player-assignable stat
{ id: "strength", type: "number", base: 1, assignable: true }

// Computed stat using other stats
{ id: "hp", type: "number", formula: "strength * 10" }

// Computed stat using base + assignments
{ id: "attack", type: "number", base: 5, assignable: true, formula: "$base + $assigned + (strength / 2)" }

// Computed boolean stat
{ id: "is_strong", type: "boolean", formula: "strength >= 10" }
```

This unifies the previous "core" vs "computed" distinction - any stat can be fixed, assignable, computed, or a combination.

## Entity Terminology (All Kept)

**Decision:** Keep current naming for entities:
- **Character** - People/beings in the universe (players, NPCs, monsters)
- **Faction** - Groups/organizations (Thieves Guild, The Empire)
- **Location** - Places in the universe (Forest, Castle, Market)
- **Item** - Objects that can be owned/used (Sword, Potion, Key)

Rationale: These are all standard gaming terms with clear meanings. No benefit to changing them.

## Moment Structure

**Question:** What is the structure of a Moment (the core content unit)?

**Decision:** Layered, slot-based, nothing required. A Moment is like a video frame - elements combine to create the presentation.

A Moment can contain:
- **Narrative:** title, text, speaker (character who's speaking)
- **Visual (slot-based):** background, positioned characters with expressions
- **Audio:** music, sound effects
- **Mechanics:** consequences (applied when moment resolves), choices

**No choices behavior:** If a Moment has no choices, player clicks "continue" and AI generates the next moment.

## Choice Structure

**Question:** What should a Choice contain?

**Decision:** Full structure with text, requirements, consequences, and destination.

A Choice contains:
- **Display:** text, optional description
- **Requirements:** visibility condition, enabled condition, disabled reason
- **Costs:** immediate consequences applied on selection
- **Destination:** next moment ID, or skill check, or neither (AI generates)

## Skill Check System

**Question:** How do skill checks fit into the system?

**Decision:** Both inline (on Choice) and dramatic (as Moment type) approaches available. Authors choose what fits.

- **Quick check:** Attached to Choice, rolls immediately on selection
- **Dramatic check:** Moment with type 'check', can have text/visuals for buildup

A skill check specifies:
- Which stat to test
- Difficulty tier (references universe-defined difficulty levels)
- Outcomes: moment IDs for critical success, success, failure, critical failure

**Outcome levels:** Four levels - critical success, success, failure, critical failure.

## Challenge System

**Question:** What is the structure of the Challenge system (combat, races, exams, etc.)?

**Decision:** Challenges are round-based encounters that run until a condition is met.

**Core loop:** Rounds execute until an outcome condition is true or max rounds reached.

**Round execution:** Each round is a list of expressions that execute in order. Same expression system as Consequences - can modify values, roll dice, compare stats.

**Participants:** Flexible role definitions. Authors define whatever roles fit their challenge type: 'attacker'/'defender' for combat, 'racer1'/'racer2' for races, 'student'/'examiner' for exams.

**Outcomes:** Defined as condition expressions checked each round:
- Win condition: `enemy.hp <= 0`
- Lose condition: `player.hp <= 0`
- Draw condition: `round >= maxRounds`

**Visualization:** Inherits from Moment system. Challenges use same visual slots (background, positioned characters) as regular Moments. This keeps the system consistent and simple.

**Tracked stats:** Challenge template specifies which stats to display (HP bars, progress meters, etc.) and how.


---

# Vocabulary Summary (v2)

## Core Concepts

| Term | Definition |
|------|------------|
| **Universe** | Complete game package: rules, entities, content. "Create universes." |
| **Moment** | Unit of player experience. Contains narrative, visuals, audio, mechanics. |
| **Choice** | Option the player can select in a Moment. Has requirements, costs, destination. |
| **Consequence** | State change that results from moments/choices. Expression-based. |
| **Stat** | Any tracked value (number, boolean, text). Can be fixed, assignable, or computed. |
| **Requirement** | Condition that must be met for something to happen. |
| **Challenge** | Round-based interactive encounter (combat, race, exam, etc.). |

## Entities

| Term | Definition |
|------|------------|
| **Character** | People/beings (players, NPCs, monsters) |
| **Faction** | Groups/organizations (guilds, empires, cults) |
| **Location** | Places (forests, castles, cities) |
| **Item** | Objects that can be owned/used (weapons, potions, keys) |

## System Principles

1. **Expression-based mechanics** - Consequences, requirements, and challenge actions all use the same expression system
2. **Layered, optional content** - Nothing is required in a Moment; elements combine to create presentation
3. **Slot-based visuals** - Background + positioned characters with expressions
4. **Unified stats** - Any type (number/boolean/text), any source (fixed/assigned/computed)
5. **Four-level skill checks** - Critical success, success, failure, critical failure
6. **Authored-first, AI fallback** - Pre-authored content plays; AI fills gaps when no next moment defined

---

# Type System Simplification (v2.1)

This section documents decisions made to simplify the type system in `types-v2.ts`.

## Expression & Consequence System

**Decision:** Simplify to type aliases.
- `Expression` is a string evaluated at runtime
- `Consequence` is a type alias for `Expression` (semantic naming)
- Removed separate `Requirement` type - just use `Expression`
- Removed `Consequence.condition` field - condition logic goes inside the expression itself

**Rationale:** One unified expression system handles everything. No need for separate types that are functionally identical.

## Relationship System

**Decision:** Simplified from 4 relationship axes to single `disposition` number.

**Before:** `Relationship { trust, affection, respect, fear }`
**After:** `disposition: Record<string, number>` on Character

**Rationale:** 4 axes is hard to meaningfully use in gameplay. Single disposition (-100 to 100) is sufficient for most narrative purposes.

## Character.personality

**Decision:** Keep 4 arrays: `traits`, `values`, `fears`, `desires`

**Rationale:** These map well to narrative AI prompts and need to be displayed separately in UI. Each serves a distinct purpose:
- **traits**: How they behave (brave, cunning, stubborn)
- **values**: What they prioritize (honor, family, wealth)
- **fears**: What they avoid (death, betrayal, failure)
- **desires**: What they pursue (power, love, redemption)

## Stat System

**Decision:** Keep only `range`, remove `clamp`.

**Rationale:** Redundant. `range: { min, max }` implies clamping behavior.

## Deferred Features (Removed)

**Decision:** Remove these types entirely - defer to later:
- `Faction` and `FactionModifier` - complex system not needed for MVP
- `StoryArc` - premature abstraction
- `DifficultyTier` - use predefined constants, not per-universe config

**Rationale:** YAGNI. Add back when actually needed.

## Location

**Decision:** Location defines presentation context:
```typescript
interface Location {
  id: string;
  name: string;
  description: string;
  background?: string;      // Background image URL
  music?: string;           // Music track URL
  ambientSound?: string;    // Ambient audio URL (renamed from "ambience")
  requirements?: Expression[]; // Access control conditions
}
```

**Removed:** `connections` - not needed, navigation handled by narrative flow.

**Rationale:** Location is the source of truth for presentation. Moment references location via `locationId`.

## Moment Simplification

**Decision:** Streamlined Moment structure:
- Removed `speakerId` - replaced with `speaking: boolean` on stage character
- Removed `background`, `audio` - comes from Location via `locationId`
- Removed AI curation fields (`aiTriggerHint`, `aiRequirements`, `source`, `approvalStatus`) - premature
- Added `urgent: boolean` - for moment pool priority

**Stage structure:** Inlined as Record, no separate `StageCharacter` type:
```typescript
stage?: Record<
  "left" | "center" | "right",
  { characterId: string; emotion?: Emotion; speaking?: boolean } | undefined
>;
```

**Rationale:** Simpler structure. If `locationId` is null, moment is "locationless" (dream sequences, abstract scenes).

## Moment Pool Navigation

**Decision:** Choices don't navigate directly. Instead:
1. Choice consequences can add moments to a pool
2. Player selects from available moments in pool
3. Moments can be marked `urgent` - if not selected, they're lost

**Removed:** `Choice.nextMomentId`, `ChallengeOutcome.nextMomentId`

**GameState tracks:**
```typescript
momentPool: Array<{ momentId: string; addedAt: number }>;
```

**Rationale:** More flexible than direct navigation. Enables "what do you do next?" gameplay where player has multiple options at any time.

## Choice Simplification

**Decision:** Minimal Choice structure:
```typescript
interface Choice {
  id: string;
  text: string;
  description?: string;
  visible?: Expression;   // Show/hide condition
  enabled?: Expression;   // Enable/disable condition
}
```

**Removed:**
- `nextMomentId` - navigation via moment pool
- `skillCheck` - handled by expressions or challenge on moment
- `disabledReason` - not needed
- `costs`/`requirements` consequences - choices just enable/disable, don't apply effects directly

**Rationale:** Choices are just selection UI. Effects happen on Moment consequences.

## Item System

**Decision:** Clear separation between passive and active effects:
```typescript
interface Item {
  kind: "equipment" | "consumable" | "object";
  whileEquipped?: Array<{ statId: string; amount: number }>; // Passive, calculated dynamically
  onUse?: Consequence[];  // Active effects when used
}
```

**Naming rationale:**
- `"object"` for non-equipment, non-consumable items (keys, quest items, collectibles)
- `whileEquipped` is self-documenting - only applies while item is worn
- `onUse` for active effects (avoids confusion with React's useEffect)

**How equipment bonuses work:** `whileEquipped` stats are calculated dynamically when resolving stats - no mutation on equip/unequip. This avoids the problem of needing inverse operations.

## Character & PlayerCharacter

**Decision:** PlayerCharacter extends Character:
```typescript
interface Character {
  // ... base fields
  equipment?: Record<string, string | null>;
  inventory?: Array<{ itemId: string; quantity: number }>;
}

interface PlayerCharacter extends Character {
  templateId: string;
  level: number;
  assignedPoints: Record<string, number>;
  points: { total: number; used: number };
}
```

**Rationale:**
- No "starting" prefix on equipment/inventory - it's just current state
- When game starts, copy playable character template to PlayerCharacter
- NPCs also have equipment/inventory that can change during play

## GameState Simplification

**Decision:** Minimal runtime state:
```typescript
interface GameState {
  id: string;
  universeId: string;
  createdAt: number;
  savedAt: number;
  seed: number;
  player: PlayerCharacter;
  characters: Character[];                              // Copied from templates, mutated during play
  globalStats: Record<string, number | boolean | string>; // Includes boolean "flags"
  momentPool: PooledMoment[];
  storyPath: StoryPathEntry[];
  currentMomentId: string | null;
}
```

**Removed:**
- `currentLocationId`, `visitedLocationIds` - derived from current moment's location
- `flags` - use boolean `globalStats`
- `phase` - derived from state
- `challenge: ActiveChallenge` - challenge state lives in characters/globalStats

**Rationale:** No duplicate information. Template → copy to game state → that's the source of truth.

## Challenge System

**Decision:** Simplified challenge structure:
- Renamed `ChallengeTemplate` to `Challenge`
- Added `trackedStats` for UI visualization (HP bars, progress meters)
- Removed `ActiveChallenge` type - runtime state uses characters/globalStats
- Removed `ChallengeOutcome.nextMomentId` - navigation via consequences

**Rationale:** Challenge state (round number, HP, etc.) is just stat values. No need for separate runtime type.

## Asset Management

**Decision:** Direct URLs everywhere. No `Universe.assets` registry.

**Rationale:** Simpler. Location/Item just stores the actual URL/path to the asset.