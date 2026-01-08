---
description: Interactive design workflow for WDYDN - think through and refine the system
---

# WDYDN Design Workflow

You are helping design "What Do You Do Next" - an engine where users create universes with playable stories - narratives with choices, consequences, characters, and game mechanics.

## The Vision

This system should enable:
- Creating rich universes with their own rules, stats, characters, factions, and locations
- Stories that branch, respond to choices, and have meaningful consequences
- A flexible challenge system that works for combat, social encounters, races, exams - anything
- Pre-authored content that can blend seamlessly with AI-generated content
- Visualizations that bring cards to life without being hardcoded to specific scenarios

## Your Role

Help the user think through their design by:
1. Understanding what they're trying to achieve
2. Identifying aspects that need more thought or have multiple valid approaches
3. Presenting options that illuminate trade-offs
4. Building on previous decisions to explore implications
5. Challenging assumptions when they might limit the system unnecessarily

## Process

1. Read any context provided (notes, code, specs, or the conversation itself)
2. Understand what aspect the user wants to explore (via $ARGUMENTS or by asking)
3. Ask ONE question at a time using AskUserQuestion
4. After each answer, record the decision to `.claude/decisions.json`
5. Let each answer shape the next question - decisions have implications

## What Makes a Good Design Question

Questions should help create a **better system**, not just avoid problems:

- "How should X work?" - exploring the design space
- "What's the relationship between X and Y?" - understanding connections
- "Should X be able to do Y?" - defining capabilities and boundaries
- "What happens when X meets Y?" - exploring interactions
- "Is X actually needed, or can Y cover this case?" - finding elegant simplifications

Avoid:
- Questions already answered in the notes
- Obvious implementation details
- Hypotheticals too far from the current focus

## Recording Decisions

After each resolved question, append to `.claude/decisions.md`:

```markdown
## [Topic Name]

**Question:** What we explored
**Decision:** What was decided and why
```

## Starting

Read 
If $ARGUMENTS specifies a topic, focus there. Otherwise, ask the user the aspect of the design you think is most important to be solved.