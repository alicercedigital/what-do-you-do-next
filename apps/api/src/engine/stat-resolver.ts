import type { v2 } from "@wdydn/shared";
type Character = v2.Character;
type Stat = v2.Stat;
type Universe = v2.Universe;
import { evaluate } from "./expression";
import type { EvaluationContext } from "./expression";

/**
 * Resolves computed stats for a character, including:
 * - Base stat values
 * - Equipment bonuses (whileEquipped)
 * - Formula-based computed stats
 * - Range clamping
 */
export function resolveCharacterStats(
  character: Character,
  universe: Universe
): Record<string, number | boolean | string> {
  const resolved: Record<string, number | boolean | string> = {};
  const statDefs = universe.stats;
  const items = universe.items;

  // Phase 1: Start with base stat values
  for (const statDef of statDefs) {
    const baseValue = character.stats[statDef.id];
    if (baseValue !== undefined) {
      resolved[statDef.id] = baseValue;
    } else if (statDef.base !== undefined) {
      resolved[statDef.id] = statDef.base;
    }
  }

  // Phase 2: Apply equipment bonuses
  if (character.equipment) {
    for (const [_slot, itemId] of Object.entries(character.equipment)) {
      if (!itemId) continue;

      const item = items.find((i) => i.id === itemId);
      if (!item?.whileEquipped) continue;

      for (const bonus of item.whileEquipped) {
        const current = resolved[bonus.statId];
        if (typeof current === "number") {
          resolved[bonus.statId] = current + bonus.amount;
        }
      }
    }
  }

  // Phase 3: Evaluate formula-based stats
  // Sort stats by dependency order (stats without formulas first)
  const formulaStats = statDefs.filter((s) => s.formula);
  const sortedFormulaStats = topologicalSort(formulaStats, statDefs);

  for (const statDef of sortedFormulaStats) {
    if (!statDef.formula) continue;

    const baseValue = character.stats[statDef.id] ?? statDef.base ?? 0;

    // Build evaluation context for stat formulas
    const context: EvaluationContext = {
      characters: [{ ...character, stats: resolved, isPlayer: character.isPlayer }],
      moments: [],
      globalStats: {},
      base: typeof baseValue === "number" ? baseValue : 0,
    };

    try {
      const result = evaluate(statDef.formula, context);
      if (result.value !== undefined) {
        resolved[statDef.id] = result.value as number | boolean | string;
      }
    } catch (error) {
      console.warn(
        `Failed to evaluate formula for stat ${statDef.id}: ${error}`
      );
    }
  }

  // Phase 4: Apply range constraints
  for (const statDef of statDefs) {
    if (statDef.range && typeof resolved[statDef.id] === "number") {
      const value = resolved[statDef.id] as number;
      resolved[statDef.id] = Math.min(
        Math.max(value, statDef.range.min),
        statDef.range.max
      );
    }
  }

  return resolved;
}

/**
 * Topologically sort stats by formula dependencies
 */
function topologicalSort(formulaStats: Stat[], allStats: Stat[]): Stat[] {
  const statIds = new Set(allStats.map((s) => s.id));
  const sorted: Stat[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();

  function visit(stat: Stat) {
    if (visited.has(stat.id)) return;
    if (visiting.has(stat.id)) {
      // Circular dependency - just proceed
      console.warn(`Circular dependency detected in stat: ${stat.id}`);
      return;
    }

    visiting.add(stat.id);

    if (stat.formula) {
      // Find dependencies in formula
      const deps = findStatDependencies(stat.formula, statIds);
      for (const depId of deps) {
        const depStat = formulaStats.find((s) => s.id === depId);
        if (depStat) {
          visit(depStat);
        }
      }
    }

    visiting.delete(stat.id);
    visited.add(stat.id);
    sorted.push(stat);
  }

  for (const stat of formulaStats) {
    visit(stat);
  }

  return sorted;
}

/**
 * Find stat IDs referenced in a formula
 */
function findStatDependencies(formula: string, validStatIds: Set<string>): string[] {
  const deps: string[] = [];

  // Match patterns like "stats.strength" or just "strength"
  const regex = /(?:stats\.)?([a-zA-Z_][a-zA-Z0-9_]*)/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(formula)) !== null) {
    const id = match[1];
    if (validStatIds.has(id) && !deps.includes(id)) {
      deps.push(id);
    }
  }

  return deps;
}

/**
 * Resolve all character stats in a game state
 */
export function resolveAllCharacterStats(
  characters: Character[],
  universe: Universe
): Map<string, Record<string, number | boolean | string>> {
  const resolved = new Map<string, Record<string, number | boolean | string>>();

  for (const character of characters) {
    resolved.set(character.id, resolveCharacterStats(character, universe));
  }

  return resolved;
}
