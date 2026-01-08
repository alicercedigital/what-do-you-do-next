# Design Decisions

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