import type { GameGenre } from "@/lib/schemas/game-schema"

export const defaultGenres: GameGenre[] = [
  {
    id: "dark-fantasy",
    name: "Dark Fantasy",
    description:
      "A world of ancient magic, cursed lands, and moral ambiguity where heroes must confront both external monsters and their inner darkness.",
    setting: "A medieval realm shrouded in perpetual twilight, where kingdoms crumble and eldritch powers stir.",
    attributes: [
      {
        id: "strength",
        name: "Strength",
        summary: "Physical power and combat prowess",
        benchmarks: [
          { value: 1, label: "Feeble", description: "Struggles with basic physical tasks" },
          { value: 2, label: "Average", description: "Can handle everyday labor" },
          { value: 3, label: "Strong", description: "Capable warrior in training" },
          { value: 4, label: "Mighty", description: "Feared combatant, can cleave through armor" },
          { value: 5, label: "Legendary", description: "Strength rivaling mythical heroes" },
        ],
      },
      {
        id: "cunning",
        name: "Cunning",
        summary: "Intelligence, wit, and tactical thinking",
        benchmarks: [
          { value: 1, label: "Simpleton", description: "Often misses obvious solutions" },
          { value: 2, label: "Sharp", description: "Can solve common puzzles and riddles" },
          { value: 3, label: "Clever", description: "Outsmarts most opponents" },
          { value: 4, label: "Brilliant", description: "Master strategist and planner" },
          { value: 5, label: "Genius", description: "Sees patterns invisible to others" },
        ],
      },
      {
        id: "willpower",
        name: "Willpower",
        summary: "Mental fortitude and resistance to corruption",
        benchmarks: [
          { value: 1, label: "Fragile", description: "Easily swayed or broken" },
          { value: 2, label: "Steady", description: "Can resist minor temptations" },
          { value: 3, label: "Resolute", description: "Stands firm under pressure" },
          { value: 4, label: "Indomitable", description: "Resists even magical compulsion" },
          { value: 5, label: "Unbreakable", description: "Cannot be corrupted or controlled" },
        ],
      },
      {
        id: "arcana",
        name: "Arcana",
        summary: "Connection to magical forces and forbidden knowledge",
        benchmarks: [
          { value: 1, label: "Mundane", description: "No magical aptitude" },
          { value: 2, label: "Touched", description: "Senses magical presence" },
          { value: 3, label: "Adept", description: "Can cast minor spells" },
          { value: 4, label: "Sorcerer", description: "Commands powerful magic" },
          { value: 5, label: "Archmage", description: "Bends reality itself" },
        ],
      },
    ],
  },
  {
    id: "cyberpunk-noir",
    name: "Cyberpunk Noir",
    description:
      "A rain-soaked metropolis of neon and chrome, where megacorporations rule and the line between human and machine blurs.",
    setting: "Neo-Tokyo 2087, a sprawling megacity where data is currency and everyone has a price.",
    attributes: [
      {
        id: "combat",
        name: "Combat",
        summary: "Fighting skills with weapons and augmentations",
        benchmarks: [
          { value: 1, label: "Civilian", description: "No combat training" },
          { value: 2, label: "Street", description: "Can handle themselves in a brawl" },
          { value: 3, label: "Enforcer", description: "Professional-grade combat skills" },
          { value: 4, label: "Spec Ops", description: "Elite military training" },
          { value: 5, label: "Killing Machine", description: "Legendary wetwork operative" },
        ],
      },
      {
        id: "hacking",
        name: "Hacking",
        summary: "Ability to infiltrate networks and manipulate data",
        benchmarks: [
          { value: 1, label: "Script Kiddie", description: "Can barely use public exploits" },
          { value: 2, label: "Cracker", description: "Bypasses consumer security" },
          { value: 3, label: "Netrunner", description: "Professional hacker for hire" },
          { value: 4, label: "Ghost", description: "Leaves no trace in any system" },
          { value: 5, label: "Digital God", description: "Can crash entire networks" },
        ],
      },
      {
        id: "streetwise",
        name: "Streetwise",
        summary: "Knowledge of the criminal underworld and survival instincts",
        benchmarks: [
          { value: 1, label: "Outsider", description: "Doesn't know the local gangs" },
          { value: 2, label: "Connected", description: "Has a few useful contacts" },
          { value: 3, label: "Player", description: "Respected in criminal circles" },
          { value: 4, label: "Fixer", description: "Can arrange anything for the right price" },
          { value: 5, label: "Kingpin", description: "Controls territory and crews" },
        ],
      },
      {
        id: "chrome",
        name: "Chrome",
        summary: "Cybernetic augmentations and transhumanist modifications",
        benchmarks: [
          { value: 1, label: "Organic", description: "No augmentations" },
          { value: 2, label: "Modded", description: "Basic neural interface" },
          { value: 3, label: "Cyborg", description: "Significant body modifications" },
          { value: 4, label: "Full Borg", description: "More machine than human" },
          { value: 5, label: "Transcendent", description: "Bleeding-edge experimental tech" },
        ],
      },
    ],
  },
  {
    id: "cosmic-horror",
    name: "Cosmic Horror",
    description:
      "Humanity is insignificant before incomprehensible entities. Sanity is fragile, and the truth is maddening.",
    setting: "1920s New England, where ancient cults stir and reality frays at the edges.",
    attributes: [
      {
        id: "investigation",
        name: "Investigation",
        summary: "Ability to find clues and piece together mysteries",
        benchmarks: [
          { value: 1, label: "Oblivious", description: "Misses obvious evidence" },
          { value: 2, label: "Observant", description: "Notices unusual details" },
          { value: 3, label: "Detective", description: "Professional investigator" },
          { value: 4, label: "Sleuth", description: "Uncovers hidden connections" },
          { value: 5, label: "Mastermind", description: "Solves impossible cases" },
        ],
      },
      {
        id: "sanity",
        name: "Sanity",
        summary: "Mental stability when faced with cosmic truths",
        benchmarks: [
          { value: 1, label: "Unstable", description: "Already teetering on the edge" },
          { value: 2, label: "Nervous", description: "Easily shaken by horrors" },
          { value: 3, label: "Composed", description: "Can function under stress" },
          { value: 4, label: "Hardened", description: "Has seen things and survived" },
          { value: 5, label: "Enlightened", description: "Glimpsed the truth and adapted" },
        ],
      },
      {
        id: "occult",
        name: "Occult",
        summary: "Knowledge of forbidden lore and eldritch rituals",
        benchmarks: [
          { value: 1, label: "Ignorant", description: "Knows nothing of the occult" },
          { value: 2, label: "Curious", description: "Has read some forbidden texts" },
          { value: 3, label: "Scholar", description: "Understands ritual basics" },
          { value: 4, label: "Cultist", description: "Can perform dark ceremonies" },
          { value: 5, label: "Prophet", description: "Communes with outer beings" },
        ],
      },
      {
        id: "influence",
        name: "Influence",
        summary: "Social standing and ability to gather resources",
        benchmarks: [
          { value: 1, label: "Nobody", description: "No connections or resources" },
          { value: 2, label: "Local", description: "Known in the community" },
          { value: 3, label: "Notable", description: "Has useful contacts" },
          { value: 4, label: "Prominent", description: "Commands respect and resources" },
          { value: 5, label: "Elite", description: "Moves in the highest circles" },
        ],
      },
    ],
  },
]
