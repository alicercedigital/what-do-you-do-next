import type { v2 } from "@wdydn/shared";

type Universe = v2.Universe;

/**
 * Context that will be sent to the AI
 */
export interface AIContext {
  universe: {
    name: string;
    theme: string;
    description: string;
  };
  relatedEntities?: {
    characters?: Array<{ id: string; name: string }>;
    locations?: Array<{ id: string; name: string }>;
    items?: Array<{ id: string; name: string }>;
    stats?: Array<{ id: string; name: string; type: string }>;
  };
  currentEntity?: Record<string, unknown>;
}

/**
 * Human-readable description of what context the AI will use
 */
export interface AIContextSummary {
  summary: string;
  items: string[];
}

/**
 * Build context for a field in a specific entity type
 */
export function buildFieldContext(
  entityType: string,
  _field: string,
  universe: Universe,
  currentEntity?: Record<string, unknown>
): AIContext {
  const context: AIContext = {
    universe: {
      name: universe.name,
      theme: universe.theme,
      description: universe.description,
    },
  };

  // Add related entities based on what's relevant for the field
  switch (entityType) {
    case "character":
      context.relatedEntities = {
        characters: universe.characters
          .slice(0, 10)
          .map((c) => ({ id: c.id, name: c.name })),
        locations: universe.locations
          .slice(0, 5)
          .map((l) => ({ id: l.id, name: l.name })),
        stats: universe.stats
          .slice(0, 10)
          .map((s) => ({ id: s.id, name: s.name, type: s.type })),
      };
      break;

    case "location":
      context.relatedEntities = {
        locations: universe.locations
          .slice(0, 10)
          .map((l) => ({ id: l.id, name: l.name })),
        characters: universe.characters
          .slice(0, 5)
          .map((c) => ({ id: c.id, name: c.name })),
      };
      break;

    case "item":
      context.relatedEntities = {
        items: universe.items
          .slice(0, 10)
          .map((i) => ({ id: i.id, name: i.name })),
        stats: universe.stats
          .filter((s) => s.type === "number")
          .slice(0, 10)
          .map((s) => ({ id: s.id, name: s.name, type: s.type })),
      };
      break;

    case "moment":
      context.relatedEntities = {
        characters: universe.characters
          .slice(0, 10)
          .map((c) => ({ id: c.id, name: c.name })),
        locations: universe.locations
          .slice(0, 10)
          .map((l) => ({ id: l.id, name: l.name })),
      };
      break;

    case "stat":
      context.relatedEntities = {
        stats: universe.stats
          .slice(0, 15)
          .map((s) => ({ id: s.id, name: s.name, type: s.type })),
      };
      break;

    case "challenge":
      context.relatedEntities = {
        stats: universe.stats
          .filter((s) => s.type === "number")
          .slice(0, 10)
          .map((s) => ({ id: s.id, name: s.name, type: s.type })),
        characters: universe.characters
          .slice(0, 5)
          .map((c) => ({ id: c.id, name: c.name })),
      };
      break;
  }

  // Include current entity for context (e.g., when improving existing content)
  if (currentEntity) {
    context.currentEntity = sanitizeEntity(currentEntity);
  }

  return context;
}

/**
 * Get a human-readable summary of what context the AI will use
 */
export function getContextSummary(
  entityType: string,
  _field: string,
  universe: Universe,
  currentEntity?: Record<string, unknown>
): AIContextSummary {
  const items: string[] = [
    `Universe: "${universe.name}"`,
    `Theme: ${universe.theme}`,
  ];

  switch (entityType) {
    case "character":
      if (universe.characters.length > 0) {
        items.push(`${universe.characters.length} existing characters`);
      }
      if (universe.stats.length > 0) {
        items.push(`${universe.stats.length} stat definitions`);
      }
      break;

    case "location":
      if (universe.locations.length > 0) {
        items.push(`${universe.locations.length} existing locations`);
      }
      break;

    case "item":
      if (universe.items.length > 0) {
        items.push(`${universe.items.length} existing items`);
      }
      if (universe.config.equipmentSlots.length > 0) {
        items.push(`Equipment slots: ${universe.config.equipmentSlots.join(", ")}`);
      }
      break;

    case "moment":
      if (universe.characters.length > 0) {
        items.push(`${universe.characters.length} characters`);
      }
      if (universe.locations.length > 0) {
        items.push(`${universe.locations.length} locations`);
      }
      if (currentEntity && "locationId" in currentEntity) {
        const loc = universe.locations.find(
          (l) => l.id === currentEntity.locationId
        );
        if (loc) {
          items.push(`Current location: ${loc.name}`);
        }
      }
      break;

    case "stat":
      if (universe.stats.length > 0) {
        items.push(`${universe.stats.length} existing stats`);
      }
      break;

    case "challenge":
      if (universe.stats.length > 0) {
        items.push(`${universe.stats.length} stats for conditions`);
      }
      break;
  }

  if (currentEntity) {
    const entityName =
      "name" in currentEntity
        ? currentEntity.name
        : "title" in currentEntity
        ? currentEntity.title
        : "Current entity";
    items.push(`Entity: ${entityName}`);
  }

  return {
    summary: `Using: ${items.slice(0, 3).join(", ")}`,
    items,
  };
}

/**
 * Sanitize entity data to remove unnecessary fields before sending to AI
 */
function sanitizeEntity(entity: Record<string, unknown>): Record<string, unknown> {
  const { id, ...rest } = entity;
  return rest;
}

/**
 * Build full context for entity generation (creating new entities)
 */
export function buildEntityGenerationContext(
  entityType: string,
  universe: Universe,
  hints?: {
    role?: string;
    archetype?: string;
    locationType?: string;
    itemKind?: string;
    rarity?: string;
    difficulty?: string;
    momentType?: string;
    statCategory?: string;
  }
): AIContext {
  const context: AIContext = {
    universe: {
      name: universe.name,
      theme: universe.theme,
      description: universe.description,
    },
    relatedEntities: {},
  };

  // Add all relevant entities for generation
  switch (entityType) {
    case "character":
      context.relatedEntities = {
        characters: universe.characters.map((c) => ({ id: c.id, name: c.name })),
        stats: universe.stats.map((s) => ({
          id: s.id,
          name: s.name,
          type: s.type,
        })),
      };
      if (hints?.role || hints?.archetype) {
        context.currentEntity = { hints };
      }
      break;

    case "location":
      context.relatedEntities = {
        locations: universe.locations.map((l) => ({ id: l.id, name: l.name })),
      };
      if (hints?.locationType) {
        context.currentEntity = { hints };
      }
      break;

    case "item":
      context.relatedEntities = {
        items: universe.items.map((i) => ({ id: i.id, name: i.name })),
        stats: universe.stats
          .filter((s) => s.type === "number")
          .map((s) => ({ id: s.id, name: s.name, type: s.type })),
      };
      if (hints?.itemKind || hints?.rarity) {
        context.currentEntity = {
          hints,
          equipmentSlots: universe.config.equipmentSlots,
        };
      }
      break;

    case "moment":
      context.relatedEntities = {
        characters: universe.characters.map((c) => ({ id: c.id, name: c.name })),
        locations: universe.locations.map((l) => ({ id: l.id, name: l.name })),
      };
      if (hints?.momentType) {
        context.currentEntity = { hints };
      }
      break;

    case "stat":
      context.relatedEntities = {
        stats: universe.stats.map((s) => ({
          id: s.id,
          name: s.name,
          type: s.type,
        })),
      };
      if (hints?.statCategory) {
        context.currentEntity = { hints };
      }
      break;

    case "challenge":
      context.relatedEntities = {
        stats: universe.stats
          .filter((s) => s.type === "number")
          .map((s) => ({ id: s.id, name: s.name, type: s.type })),
      };
      if (hints?.difficulty) {
        context.currentEntity = { hints };
      }
      break;
  }

  return context;
}
