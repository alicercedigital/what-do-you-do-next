import type { ChoiceOption } from "./helper-choice-button";

export type HelperStepId =
  | "core-idea"
  | "world-rules"
  | "places"
  | "characters"
  | "things"
  | "first-moments";

export type InputMode = "multiple" | "single" | "open";

export interface HelperStepConfig {
  id: HelperStepId;
  name: string;
  question: string;
  description: string;
  inputMode: InputMode;
  placeholder: string;
  defaultOptions: ChoiceOption[];
  entityType: "universe" | "stat" | "location" | "character" | "item" | "moment";
}

export const HELPER_STEPS: HelperStepConfig[] = [
  {
    id: "core-idea",
    name: "Core Idea",
    question: "What's your universe about?",
    description: "Pick genres, themes, or describe your unique concept",
    inputMode: "multiple",
    placeholder: "Describe your universe idea...",
    entityType: "universe",
    defaultOptions: [
      { id: "fantasy", label: "Fantasy", description: "Magic, mythical creatures, medieval worlds" },
      { id: "sci-fi", label: "Sci-Fi", description: "Space, technology, future societies" },
      { id: "horror", label: "Horror", description: "Fear, supernatural threats, survival" },
      { id: "mystery", label: "Mystery", description: "Puzzles, investigations, secrets" },
      { id: "romance", label: "Romance", description: "Love, relationships, emotional journeys" },
      { id: "post-apocalyptic", label: "Post-Apocalyptic", description: "Survival after civilization's fall" },
      { id: "cyberpunk", label: "Cyberpunk", description: "High tech, low life, corporate dystopia" },
      { id: "steampunk", label: "Steampunk", description: "Victorian era meets steam technology" },
      { id: "urban-fantasy", label: "Urban Fantasy", description: "Magic hidden in modern cities" },
      { id: "dark-fantasy", label: "Dark Fantasy", description: "Grim, morally complex fantasy" },
      { id: "space-opera", label: "Space Opera", description: "Epic adventures across galaxies" },
      { id: "supernatural", label: "Supernatural", description: "Ghosts, demons, otherworldly beings" },
    ],
  },
  {
    id: "world-rules",
    name: "World Rules",
    question: "How does your world work?",
    description: "Define the stats, resources, and mechanics players will track",
    inputMode: "multiple",
    placeholder: "Describe special rules or mechanics...",
    entityType: "stat",
    defaultOptions: [
      { id: "health", label: "Health", description: "Physical wellbeing, damage tracking" },
      { id: "gold", label: "Gold/Currency", description: "Money or trading resources" },
      { id: "reputation", label: "Reputation", description: "How others perceive the player" },
      { id: "magic", label: "Magic/Mana", description: "Supernatural power resource" },
      { id: "sanity", label: "Sanity", description: "Mental stability, horror games" },
      { id: "hunger", label: "Hunger/Survival", description: "Basic needs tracking" },
      { id: "relationships", label: "Relationships", description: "Bonds with NPCs" },
      { id: "karma", label: "Karma", description: "Moral alignment tracking" },
      { id: "time", label: "Time/Days", description: "Passage of time matters" },
      { id: "skills", label: "Skills", description: "Learnable abilities" },
    ],
  },
  {
    id: "places",
    name: "Places",
    question: "Where does the story happen?",
    description: "Create locations players can explore",
    inputMode: "multiple",
    placeholder: "Describe a unique location...",
    entityType: "location",
    defaultOptions: [
      { id: "tavern", label: "Tavern/Inn", description: "Social hub, rumors, rest" },
      { id: "marketplace", label: "Marketplace", description: "Trade, shops, crowds" },
      { id: "forest", label: "Dark Forest", description: "Mysterious, dangerous wilderness" },
      { id: "castle", label: "Castle/Palace", description: "Power, nobility, intrigue" },
      { id: "dungeon", label: "Dungeon", description: "Danger, treasure, monsters" },
      { id: "village", label: "Village", description: "Quiet community, simple folk" },
      { id: "city", label: "City Streets", description: "Urban bustle, crime, opportunity" },
      { id: "temple", label: "Temple/Shrine", description: "Sacred, healing, mystery" },
      { id: "ship", label: "Ship/Vehicle", description: "Travel, adventure, confined" },
      { id: "ruins", label: "Ancient Ruins", description: "Lost civilization, secrets" },
    ],
  },
  {
    id: "characters",
    name: "Characters",
    question: "Who lives in this world?",
    description: "Create NPCs the player will meet",
    inputMode: "multiple",
    placeholder: "Describe a unique character...",
    entityType: "character",
    defaultOptions: [
      { id: "mentor", label: "Wise Mentor", description: "Guide, teacher, mysterious past" },
      { id: "merchant", label: "Merchant", description: "Trader, deals, information" },
      { id: "rival", label: "Rival", description: "Competition, tension, respect" },
      { id: "villain", label: "Villain", description: "Antagonist, threat, complex motives" },
      { id: "ally", label: "Loyal Ally", description: "Friend, support, backup" },
      { id: "trickster", label: "Trickster", description: "Unreliable, fun, chaotic" },
      { id: "guardian", label: "Guardian", description: "Protector, gatekeeper, test" },
      { id: "innocent", label: "Innocent", description: "Needs protection, pure heart" },
      { id: "authority", label: "Authority Figure", description: "Power, rules, judgment" },
      { id: "outcast", label: "Outcast", description: "Rejected, hidden knowledge, bitter" },
    ],
  },
  {
    id: "things",
    name: "Things",
    question: "What can players find and use?",
    description: "Create items, equipment, and consumables",
    inputMode: "multiple",
    placeholder: "Describe a unique item...",
    entityType: "item",
    defaultOptions: [
      { id: "weapon", label: "Weapon", description: "Tools for combat" },
      { id: "armor", label: "Armor", description: "Protection from harm" },
      { id: "potion", label: "Potion", description: "Consumable with effects" },
      { id: "key", label: "Key/Access", description: "Opens new areas or options" },
      { id: "artifact", label: "Artifact", description: "Powerful, unique, plot-related" },
      { id: "tool", label: "Tool", description: "Enables specific actions" },
      { id: "treasure", label: "Treasure", description: "Valuable, tradeable" },
      { id: "document", label: "Document", description: "Information, clues, lore" },
      { id: "food", label: "Food/Supplies", description: "Survival resources" },
      { id: "magical", label: "Magical Item", description: "Enchanted with powers" },
    ],
  },
  {
    id: "first-moments",
    name: "First Moments",
    question: "How does the story begin?",
    description: "Create the opening scenario and initial choices",
    inputMode: "multiple",
    placeholder: "Describe how the adventure starts...",
    entityType: "moment",
    defaultOptions: [
      { id: "awakening", label: "Mysterious Awakening", description: "Player wakes with questions" },
      { id: "arrival", label: "Arrival", description: "Coming to a new place" },
      { id: "summons", label: "The Summons", description: "Called to action by someone" },
      { id: "discovery", label: "Strange Discovery", description: "Finding something unusual" },
      { id: "escape", label: "Escape", description: "Fleeing from danger" },
      { id: "mission", label: "Given a Mission", description: "Tasked with a goal" },
      { id: "accident", label: "Wrong Place, Wrong Time", description: "Caught up in events" },
      { id: "choice", label: "Moral Dilemma", description: "Immediate difficult choice" },
      { id: "meeting", label: "Fateful Meeting", description: "Encounter that changes everything" },
      { id: "inheritance", label: "Inheritance", description: "Receiving something unexpected" },
    ],
  },
];

export function getStepById(id: HelperStepId): HelperStepConfig | undefined {
  return HELPER_STEPS.find((step) => step.id === id);
}

export function getStepIndex(id: HelperStepId): number {
  return HELPER_STEPS.findIndex((step) => step.id === id);
}

export function getNextStep(id: HelperStepId): HelperStepConfig | undefined {
  const index = getStepIndex(id);
  return HELPER_STEPS[index + 1];
}

export function getPreviousStep(id: HelperStepId): HelperStepConfig | undefined {
  const index = getStepIndex(id);
  return HELPER_STEPS[index - 1];
}
