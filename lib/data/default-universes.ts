import type { GameUniverse } from "@/lib/schemas/game-entity-schema";

export const defaultUniverses: GameUniverse[] = [
  {
    id: "dark-fantasy",
    name: "Dark Fantasy",
    description:
      "A grim world where ancient evils stir in forgotten ruins and heroes rise from the ashes of fallen kingdoms.",
    setting:
      "A medieval realm shrouded in perpetual twilight, where cursed forests border crumbling citadels and the line between the living and dead grows thin.",
    thumbnailUrl: "/placeholder.svg?height=200&width=300",
    attributeConfig: {
      startingPoints: 10,
      pointsPerLevelUp: 2,
    },
    attributes: [
      // Distributable attributes (player assigns points)
      {
        id: "strength",
        name: "Strength",
        summary: "Physical power and combat prowess",
        category: "distributable",
        display: {
          displayType: "number",
          icon: "sword",
          iconColor: "text-red-500",
          showOnCharacterSheet: true,
          position: 1,
          width: "half",
          showPercentage: true,
        },
        distributableConfig: {
          minValue: 1,
          maxValue: 10,
          benchmarks: [
            {
              value: 1,
              label: "Frail",
              description: "Struggles with basic physical tasks",
            },
            {
              value: 2,
              label: "Average",
              description: "Normal human strength",
            },
            {
              value: 3,
              label: "Strong",
              description: "Can overpower most opponents",
            },
            {
              value: 4,
              label: "Mighty",
              description: "Legendary physical power",
            },
            {
              value: 5,
              label: "Titan",
              description: "Strength beyond mortal limits",
            },
          ],
        },
      },
      {
        id: "willpower",
        name: "Willpower",
        summary: "Mental fortitude and resistance to corruption",
        category: "distributable",
        display: {
          displayType: "number",
          icon: "brain",
          iconColor: "text-purple-500",
          showOnCharacterSheet: true,
          position: 2,
          width: "half",
        },
        distributableConfig: {
          minValue: 1,
          maxValue: 10,
          benchmarks: [
            {
              value: 1,
              label: "Weak-minded",
              description: "Easily influenced and corrupted",
            },
            {
              value: 2,
              label: "Resolute",
              description: "Can resist minor temptations",
            },
            {
              value: 3,
              label: "Steadfast",
              description: "Strong mental defenses",
            },
            {
              value: 4,
              label: "Unbreakable",
              description: "Nearly immune to mental attacks",
            },
            {
              value: 5,
              label: "Transcendent",
              description: "Mind is an impenetrable fortress",
            },
          ],
        },
      },
      {
        id: "cunning",
        name: "Cunning",
        summary: "Intelligence, perception, and tactical thinking",
        category: "distributable",
        display: {
          displayType: "number",
          icon: "eye",
          iconColor: "text-blue-500",
          showOnCharacterSheet: true,
          position: 3,
          width: "half",
        },
        distributableConfig: {
          minValue: 1,
          maxValue: 10,
          benchmarks: [
            { value: 1, label: "Simple", description: "Misses obvious clues" },
            {
              value: 2,
              label: "Perceptive",
              description: "Notices important details",
            },
            { value: 3, label: "Sharp", description: "Quick tactical mind" },
            { value: 4, label: "Brilliant", description: "Master strategist" },
            {
              value: 5,
              label: "Genius",
              description: "Sees all possibilities",
            },
          ],
        },
      },
      {
        id: "arcana",
        name: "Arcana",
        summary: "Magical affinity and knowledge of the mystical arts",
        category: "distributable",
        display: {
          displayType: "number",
          icon: "sparkles",
          iconColor: "text-violet-500",
          showOnCharacterSheet: true,
          position: 4,
          width: "half",
        },
        distributableConfig: {
          minValue: 1,
          maxValue: 10,
          benchmarks: [
            { value: 1, label: "Mundane", description: "No magical ability" },
            {
              value: 2,
              label: "Touched",
              description: "Minor magical sensitivity",
            },
            { value: 3, label: "Adept", description: "Can cast basic spells" },
            {
              value: 4,
              label: "Sorcerer",
              description: "Powerful magical abilities",
            },
            {
              value: 5,
              label: "Archmage",
              description: "Master of the arcane",
            },
          ],
        },
      },
      // Derived attributes (calculated from formula)
      {
        id: "health",
        name: "Health Points",
        shortName: "HP",
        summary: "Your life force - when it reaches zero, you die",
        category: "derived",
        display: {
          displayType: "bar",
          icon: "heart",
          iconColor: "text-red-500",
          barColor: "bg-red-500",
          barBackgroundColor: "bg-red-900/20",
          showPercentage: true,
          showOnCharacterSheet: true,
          position: 5,
          width: "full",
        },
        derivedConfig: {
          formula: [
            { type: "attribute", value: "strength" },
            { type: "operator", value: "*" },
            { type: "number", value: "10" },
            { type: "operator", value: "+" },
            { type: "attribute", value: "willpower" },
            { type: "operator", value: "*" },
            { type: "number", value: "5" },
          ],
          minValue: 1,
        },
      },
      {
        id: "mana",
        name: "Mana Points",
        shortName: "MP",
        summary: "Magical energy used to cast spells",
        category: "derived",
        display: {
          displayType: "bar",
          icon: "zap",
          iconColor: "text-blue-500",
          barColor: "bg-blue-500",
          barBackgroundColor: "bg-blue-900/20",
          showPercentage: true,
          showOnCharacterSheet: true,
          position: 6,
          width: "full",
        },
        derivedConfig: {
          formula: [
            { type: "attribute", value: "arcana" },
            { type: "operator", value: "*" },
            { type: "number", value: "15" },
            { type: "operator", value: "+" },
            { type: "attribute", value: "willpower" },
            { type: "operator", value: "*" },
            { type: "number", value: "3" },
          ],
          minValue: 0,
        },
      },
      {
        id: "stamina",
        name: "Stamina",
        shortName: "STA",
        summary: "Physical energy for combat actions",
        category: "derived",
        display: {
          displayType: "bar",
          icon: "activity",
          iconColor: "text-green-500",
          barColor: "bg-green-500",
          barBackgroundColor: "bg-green-900/20",
          showPercentage: false,
          showOnCharacterSheet: true,
          position: 7,
          width: "half",
        },
        derivedConfig: {
          formula: [
            { type: "attribute", value: "strength" },
            { type: "operator", value: "*" },
            { type: "number", value: "5" },
            { type: "operator", value: "+" },
            { type: "attribute", value: "cunning" },
            { type: "operator", value: "*" },
            { type: "number", value: "2" },
          ],
          minValue: 1,
        },
      },
    ],
    equipmentSlots: ["Head", "Body", "Main Hand", "Off Hand", "Accessory"],
    items: [
      {
        id: "iron-sword",
        name: "Iron Sword",
        description: "A well-balanced blade forged from dark iron",
        type: "equipment",
        slot: "Main Hand",
        icon: "sword",
        rarity: "common",
        stackable: false,
        attributeModifiers: [{ attributeId: "strength", modifier: 2 }],
      },
      {
        id: "leather-armor",
        name: "Leather Armor",
        description: "Light armor that provides basic protection",
        type: "equipment",
        slot: "Body",
        icon: "shield",
        rarity: "common",
        stackable: false,
        attributeModifiers: [{ attributeId: "willpower", modifier: 1 }],
      },
      {
        id: "mystic-amulet",
        name: "Mystic Amulet",
        description: "An ancient talisman that enhances magical abilities",
        type: "equipment",
        slot: "Accessory",
        icon: "sparkles",
        rarity: "rare",
        stackable: false,
        attributeModifiers: [
          { attributeId: "arcana", modifier: 3 },
          { attributeId: "willpower", modifier: 1 },
        ],
      },
      {
        id: "health-potion",
        name: "Health Potion",
        description: "A crimson elixir that restores vitality",
        type: "consumable",
        icon: "heart",
        rarity: "common",
        stackable: true,
        maxStack: 10,
        attributeModifiers: [],
      },
      {
        id: "scroll-wisdom",
        name: "Scroll of Wisdom",
        description:
          "Reading this ancient scroll permanently increases your cunning",
        type: "consumable",
        icon: "book-open",
        rarity: "uncommon",
        stackable: true,
        maxStack: 5,
        attributeModifiers: [{ attributeId: "cunning", modifier: 1 }],
      },
    ],
    characters: [
      {
        id: "shadow-knight",
        type: "character",
        name: "The Shadow Knight",
        description:
          "A cursed warrior bound to serve the darkness, yet yearning for redemption.",
        role: "Antagonist/Potential Ally",
        attributes: { strength: 8, willpower: 6, cunning: 4, arcana: 3 },
        portraits: {},
      },
      {
        id: "witch-of-whispers",
        type: "character",
        name: "The Witch of Whispers",
        description:
          "An ancient crone who speaks with spirits and knows secrets best left forgotten.",
        role: "Mentor",
        attributes: { strength: 2, willpower: 8, cunning: 7, arcana: 10 },
        portraits: {},
      },
    ],
    locations: [
      {
        id: "crimson-citadel",
        type: "location",
        name: "The Crimson Citadel",
        description:
          "A fortress stained red by centuries of bloodshed, now home to the Shadow Knight.",
        attributes: {},
        musics: ["dark-ambient-1", "battle-theme"],
        ambientSounds: ["wind-howling", "distant-screams"],
        backgroundImageUrl: "/placeholder.svg?height=400&width=600",
      },
      {
        id: "whispering-woods",
        type: "location",
        name: "The Whispering Woods",
        description:
          "A cursed forest where the trees themselves seem to speak in forgotten tongues.",
        attributes: {},
        musics: ["mysterious-forest"],
        ambientSounds: ["rustling-leaves", "whispers"],
        backgroundImageUrl: "/placeholder.svg?height=400&width=600",
      },
    ],
    relationshipLabels: [],
    conflictEvents: [
      {
        id: "combat",
        name: "Combat",
        description: "A turn-based battle between combatants",
        icon: "swords",
        animationSpeed: "normal",
        roles: [
          {
            id: "player",
            name: "Player",
            entityType: "character",
            required: true,
          },
          {
            id: "enemy",
            name: "Enemy",
            entityType: "character",
            required: true,
          },
          {
            id: "location",
            name: "Battle Location",
            entityType: "location",
            required: false,
          },
        ],
        // Cycle: Checks -> Actions -> Logs -> Checks -> End
        cycleSteps: [
          // --- Player Turn ---
          {
            id: "player-attack-log",
            name: "Log Player Attack",
            action: {
              type: "log-message",
              template: "Player attacks with full force!",
            },
            executeFor: "once",
          },
          {
            id: "player-attack-action",
            name: "Player Deals Damage",
            action: {
              type: "modify-attribute",
              roleId: "enemy",
              attributeId: "health",
              operation: "subtract",
              formula: [
                { type: "parenthesis", value: "(" },
                { type: "role-attribute", value: "player.strength" },
                { type: "operator", value: "*" },
                { type: "number", value: "3" },
                { type: "parenthesis", value: ")" },
                { type: "operator", value: "+" },
                { type: "role-attribute", value: "player.cunning" },
              ],
            },
          },
          {
            id: "check-victory",
            name: "Check Enemy Death",
            action: {
              type: "check-condition",
              condition: [
                { type: "role-attribute", value: "enemy.health" },
                { type: "operator", value: "<=" },
                { type: "number", value: "0" },
              ],
              thenSteps: ["trigger-victory"],
            },
          },

          // --- Enemy Turn ---
          {
            id: "enemy-attack-log",
            name: "Log Enemy Attack",
            action: {
              type: "log-message",
              template: "Enemy strikes back!",
            },
          },
          {
            id: "enemy-attack-action",
            name: "Enemy Deals Damage",
            action: {
              type: "modify-attribute",
              roleId: "player",
              attributeId: "health",
              operation: "subtract",
              formula: [
                { type: "parenthesis", value: "(" },
                { type: "role-attribute", value: "enemy.strength" },
                { type: "operator", value: "*" },
                { type: "number", value: "2" },
                { type: "parenthesis", value: ")" },
                { type: "operator", value: "+" },
                { type: "role-attribute", value: "enemy.cunning" },
              ],
            },
          },
          {
            id: "check-defeat",
            name: "Check Player Death",
            action: {
              type: "check-condition",
              condition: [
                { type: "role-attribute", value: "player.health" },
                { type: "operator", value: "<=" },
                { type: "number", value: "0" },
              ],
              thenSteps: ["trigger-defeat"],
            },
          },

          // --- End Round Status ---
          {
            id: "log-round-end",
            name: "End of Round",
            action: {
              type: "log-message",
              template:
                "Status - Player HP: {player.health}, Enemy HP: {enemy.health}",
            },
          },

          // --- Trigger Steps (Called by Check Conditions) ---
          {
            id: "trigger-victory",
            name: "Trigger Victory",
            action: {
              type: "trigger-outcome",
              outcomeId: "victory",
            },
          },
          {
            id: "trigger-defeat",
            name: "Trigger Defeat",
            action: {
              type: "trigger-outcome",
              outcomeId: "player-defeated",
            },
          },
        ],
        outcomes: [
          {
            id: "victory",
            name: "Victory",
            description: "You have defeated your enemy!",
            type: "success",
            experienceFormula: [
              { type: "role-attribute", value: "enemy.strength" },
              { type: "operator", value: "*" },
              { type: "number", value: "10" },
              { type: "operator", value: "+" },
              { type: "role-attribute", value: "enemy.cunning" },
              { type: "operator", value: "*" },
              { type: "number", value: "5" },
            ],
            itemRewards: [],
            triggersGameOver: false,
            attributeChanges: [],
          },
          {
            id: "player-defeated",
            name: "Defeated",
            description: "You have fallen in battle...",
            type: "failure",
            triggersGameOver: true,
            attributeChanges: [],
          },
        ],
        maxCycles: 50,
        showTurnLog: true,
      },
      {
        id: "magic-duel",
        name: "Magic Duel",
        animationSpeed: "normal",
        showTurnLog: true,
        description: "A battle of arcane power between spellcasters",
        icon: "wand",
        roles: [
          {
            id: "player",
            name: "Player",
            entityType: "character",
            required: true,
          },
          {
            id: "opponent",
            name: "Opponent",
            entityType: "character",
            required: true,
          },
        ],
        cycleSteps: [
          // --- Pre-turn Mana Checks ---
          {
            id: "check-player-mana",
            name: "Check Player Mana",
            action: {
              type: "check-condition",
              condition: [
                { type: "role-attribute", value: "player.mana" },
                { type: "operator", value: "<=" },
                { type: "number", value: "0" },
              ],
              thenSteps: ["trigger-mana-depleted"],
            },
          },
          {
            id: "check-opponent-mana",
            name: "Check Opponent Mana",
            action: {
              type: "check-condition",
              condition: [
                { type: "role-attribute", value: "opponent.mana" },
                { type: "operator", value: "<=" },
                { type: "number", value: "0" },
              ],
              thenSteps: ["trigger-opponent-exhausted"],
            },
          },

          // --- Player Action ---
          {
            id: "player-spend-mana",
            name: "Player Cast Cost",
            action: {
              type: "modify-attribute",
              roleId: "player",
              attributeId: "mana",
              operation: "subtract",
              formula: [{ type: "number", value: "10" }],
            },
          },
          {
            id: "log-player-spell",
            name: "Log Player Spell",
            action: {
              type: "log-message",
              template: "Player channels arcane energy! (Mana: {player.mana})",
            },
          },
          {
            id: "player-spell-damage",
            name: "Player Spell Damage",
            action: {
              type: "modify-attribute",
              roleId: "opponent",
              attributeId: "health",
              operation: "subtract",
              formula: [
                { type: "role-attribute", value: "player.arcana" },
                { type: "operator", value: "*" },
                { type: "number", value: "4" },
              ],
            },
          },
          {
            id: "check-victory-magic",
            name: "Check Opponent Defeat",
            action: {
              type: "check-condition",
              condition: [
                { type: "role-attribute", value: "opponent.health" },
                { type: "operator", value: "<=" },
                { type: "number", value: "0" },
              ],
              thenSteps: ["trigger-victory-magic"],
            },
          },

          // --- Opponent Action ---
          {
            id: "opponent-spend-mana",
            name: "Opponent Cast Cost",
            action: {
              type: "modify-attribute",
              roleId: "opponent",
              attributeId: "mana",
              operation: "subtract",
              formula: [{ type: "number", value: "10" }],
            },
          },
          {
            id: "log-opponent-spell",
            name: "Log Opponent Spell",
            action: {
              type: "log-message",
              template: "Opponent weaves dark magic! (Mana: {opponent.mana})",
            },
          },
          {
            id: "opponent-spell-damage",
            name: "Opponent Spell Damage",
            action: {
              type: "modify-attribute",
              roleId: "player",
              attributeId: "health",
              operation: "subtract",
              formula: [
                { type: "role-attribute", value: "opponent.arcana" },
                { type: "operator", value: "*" },
                { type: "number", value: "4" },
              ],
            },
          },
          {
            id: "check-defeat-magic",
            name: "Check Player Defeat",
            action: {
              type: "check-condition",
              condition: [
                { type: "role-attribute", value: "player.health" },
                { type: "operator", value: "<=" },
                { type: "number", value: "0" },
              ],
              thenSteps: ["trigger-defeat-magic"],
            },
          },

          // --- Trigger Steps ---
          {
            id: "trigger-victory-magic",
            name: "Trigger Arcane Victory",
            action: { type: "trigger-outcome", outcomeId: "victory" },
          },
          {
            id: "trigger-opponent-exhausted",
            name: "Trigger Exhaustion",
            action: {
              type: "trigger-outcome",
              outcomeId: "opponent-exhausted",
            },
          },
          {
            id: "trigger-mana-depleted",
            name: "Trigger Mana Depletion",
            action: { type: "trigger-outcome", outcomeId: "mana-depleted" },
          },
          {
            id: "trigger-defeat-magic",
            name: "Trigger Defeat",
            action: { type: "trigger-outcome", outcomeId: "defeat" },
          },
        ],
        outcomes: [
          {
            id: "victory",
            name: "Arcane Victory",
            description: "Your magic has overwhelmed your opponent!",
            type: "success",
            experienceFormula: [{ type: "number", value: "50" }],
            itemRewards: [],
            attributeChanges: [],
          },
          {
            id: "opponent-exhausted",
            name: "Opponent Exhausted",
            description: "Your opponent's mana is depleted!",
            type: "success",
            experienceFormula: [{ type: "number", value: "30" }],
            itemRewards: [],
            attributeChanges: [],
          },
          {
            id: "mana-depleted",
            name: "Mana Depleted",
            description: "You have exhausted your magical reserves...",
            type: "failure",
            triggersGameOver: true,
            attributeChanges: [],
          },
          {
            id: "defeat",
            name: "Defeated",
            description: "You have been bested in the arcane duel...",
            type: "failure",
            triggersGameOver: true,
            attributeChanges: [],
          },
        ],
        maxCycles: 20,
      },
    ],
  },
];
