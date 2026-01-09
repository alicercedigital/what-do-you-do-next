import type { EvaluationContext, PathNode, ResolvedPath } from "./types";

/**
 * Resolves path expressions against the evaluation context
 *
 * Handles:
 *   - $player -> resolves to player character ID
 *   - $self -> resolves to current moment
 *   - $roll, $round, $turn, $base -> special context variables
 *   - character.elena.stats.gold -> nested path access
 *   - moment.tavern_fight-* -> wildcard matching
 */
export class PathResolver {
  constructor(private context: EvaluationContext) {}

  /**
   * Resolve a path to its value(s)
   * Returns array for wildcards, single ResolvedPath otherwise
   */
  resolve(path: PathNode): ResolvedPath | ResolvedPath[] {
    const segments = this.expandSpecialVars(path.segments);

    if (path.hasWildcard) {
      return this.resolveWildcard(segments);
    }

    return this.resolveSingle(segments);
  }

  /**
   * Set a value at a path
   * Returns the mutated context (does not modify original)
   */
  setValue(path: PathNode, value: unknown): EvaluationContext {
    const segments = this.expandSpecialVars(path.segments);

    if (path.hasWildcard) {
      return this.setWildcardValue(segments, value);
    }

    return this.setSingleValue(segments, value);
  }

  private expandSpecialVars(segments: string[]): string[] {
    return segments.map((segment) => {
      // Handle special variables
      if (segment === "$player") {
        const player = this.context.characters.find((c) => c.isPlayer);
        if (!player) {
          throw new Error("No player character found in context");
        }
        return player.id;
      }

      if (segment === "$self") {
        if (!this.context.self) {
          throw new Error("$self referenced but no self context provided");
        }
        return this.context.self.id;
      }

      return segment;
    });
  }

  private resolveSingle(segments: string[]): ResolvedPath {
    // Handle special context variables that aren't paths
    if (segments.length === 1) {
      const first = segments[0];
      if (first === "$roll" && this.context.roll !== undefined) {
        return { path: segments, value: this.context.roll, exists: true };
      }
      if (first === "$round" && this.context.round !== undefined) {
        return { path: segments, value: this.context.round, exists: true };
      }
      if (first === "$turn" && this.context.turn !== undefined) {
        return { path: segments, value: this.context.turn, exists: true };
      }
      if (first === "$base" && this.context.base !== undefined) {
        return { path: segments, value: this.context.base, exists: true };
      }
    }

    // Navigate the path
    let current: unknown = this.getRoot(segments[0]);
    const pathSoFar: string[] = [segments[0]];

    if (current === undefined) {
      return { path: segments, value: undefined, exists: false };
    }

    for (let i = 1; i < segments.length; i++) {
      if (current === null || current === undefined) {
        return { path: segments, value: undefined, exists: false };
      }

      const segment = segments[i];
      pathSoFar.push(segment);

      if (typeof current === "object" && current !== null) {
        current = (current as Record<string, unknown>)[segment];
      } else {
        return { path: segments, value: undefined, exists: false };
      }
    }

    return { path: segments, value: current, exists: current !== undefined };
  }

  private resolveWildcard(segments: string[]): ResolvedPath[] {
    const results: ResolvedPath[] = [];

    // Find the wildcard segment
    const wildcardIndex = segments.findIndex((s) => s.includes("*"));
    if (wildcardIndex === -1) {
      return [this.resolveSingle(segments)];
    }

    const beforeWildcard = segments.slice(0, wildcardIndex);
    const wildcardPattern = segments[wildcardIndex];
    const afterWildcard = segments.slice(wildcardIndex + 1);

    // Get the collection to search
    const collectionPath =
      beforeWildcard.length > 0
        ? this.resolveSingle(beforeWildcard)
        : { path: [], value: this.getCollectionForWildcard(wildcardPattern), exists: true };

    if (!collectionPath.exists || !Array.isArray(collectionPath.value)) {
      // Try to match in the appropriate collection based on the wildcard pattern
      const collection = this.getCollectionForWildcard(wildcardPattern);
      if (!collection) return [];

      // Extract the base pattern (before the -*)
      const basePattern = wildcardPattern.replace("-*", "");

      for (const item of collection) {
        if (typeof item === "object" && item !== null && "id" in item) {
          const id = (item as { id: string }).id;
          // Match items whose ID starts with the base pattern
          if (id.startsWith(basePattern + "-") || id === basePattern) {
            const fullPath = [...beforeWildcard, id, ...afterWildcard];
            const resolved = this.resolveSingle(fullPath);
            if (resolved.exists) {
              results.push(resolved);
            }
          }
        }
      }
    }

    return results;
  }

  private getCollectionForWildcard(pattern: string): unknown[] | null {
    // Determine which collection based on the path context
    // moment.tavern_fight-* -> moments collection
    // character.* -> characters collection
    if (pattern.includes("-*")) {
      // This is likely a moment pattern
      return this.context.moments;
    }
    return null;
  }

  private getRoot(segment: string): unknown {
    // Handle root-level access
    switch (segment) {
      case "character":
        // Return a proxy object that allows .id access
        return new Proxy(
          {},
          {
            get: (_, prop: string) => {
              return this.context.characters.find((c) => c.id === prop);
            },
          }
        );

      case "moment":
        return new Proxy(
          {},
          {
            get: (_, prop: string) => {
              return this.context.moments.find((m) => m.id === prop);
            },
          }
        );

      case "globalStats":
        return this.context.globalStats;

      case "stats":
        // Shorthand for player stats (used in stat formulas)
        const player = this.context.characters.find((c) => c.isPlayer);
        return player?.stats;

      default:
        // Could be a direct character/moment ID access
        const char = this.context.characters.find((c) => c.id === segment);
        if (char) return char;

        const mom = this.context.moments.find((m) => m.id === segment);
        if (mom) return mom;

        // Check globalStats
        if (segment in this.context.globalStats) {
          return this.context.globalStats[segment];
        }

        return undefined;
    }
  }

  private setSingleValue(segments: string[], value: unknown): EvaluationContext {
    // Deep clone the context
    const newContext = structuredClone(this.context);

    // Navigate to the parent and set the value
    const parentPath = segments.slice(0, -1);
    const key = segments[segments.length - 1];

    let parent: unknown;

    if (parentPath.length === 0) {
      // Setting a top-level value
      if (segments[0] in newContext.globalStats || segments[0].startsWith("$")) {
        newContext.globalStats[segments[0]] = value as number | boolean | string;
        return newContext;
      }
    }

    // Find the parent object
    const rootSegment = parentPath[0] || segments[0];

    if (rootSegment === "character") {
      const charId = parentPath[1];
      const char = newContext.characters.find((c) => c.id === charId);
      if (!char) throw new Error(`Character ${charId} not found`);

      parent = this.navigateTo(char, parentPath.slice(2));
    } else if (rootSegment === "moment") {
      const momentId = parentPath[1];
      const moment = newContext.moments.find((m) => m.id === momentId);
      if (!moment) throw new Error(`Moment ${momentId} not found`);

      parent = this.navigateTo(moment, parentPath.slice(2));
    } else if (rootSegment === "globalStats") {
      parent = this.navigateTo(newContext.globalStats, parentPath.slice(1));
    } else {
      // Try to find as character or moment ID directly
      const char = newContext.characters.find((c) => c.id === rootSegment);
      if (char) {
        parent = this.navigateTo(char, parentPath.slice(1));
      } else {
        const moment = newContext.moments.find((m) => m.id === rootSegment);
        if (moment) {
          parent = this.navigateTo(moment, parentPath.slice(1));
        }
      }
    }

    if (parent && typeof parent === "object") {
      (parent as Record<string, unknown>)[key] = value;
    }

    return newContext;
  }

  private setWildcardValue(segments: string[], value: unknown): EvaluationContext {
    // Resolve all matching paths and set value on each
    const matches = this.resolveWildcard(segments);
    let context = this.context;

    for (const match of matches) {
      context = new PathResolver(context).setSingleValue(match.path, value);
    }

    return context;
  }

  private navigateTo(obj: unknown, path: string[]): unknown {
    let current = obj;

    for (const segment of path) {
      if (current === null || current === undefined) return undefined;
      if (typeof current === "object") {
        current = (current as Record<string, unknown>)[segment];
      } else {
        return undefined;
      }
    }

    return current;
  }
}

/**
 * Resolve a path expression
 */
export function resolvePath(
  path: PathNode,
  context: EvaluationContext
): ResolvedPath | ResolvedPath[] {
  return new PathResolver(context).resolve(path);
}

/**
 * Set a value at a path
 */
export function setPathValue(
  path: PathNode,
  value: unknown,
  context: EvaluationContext
): EvaluationContext {
  return new PathResolver(context).setValue(path, value);
}
