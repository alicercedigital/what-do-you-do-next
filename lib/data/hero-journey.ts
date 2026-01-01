import type { HeroJourneyStep } from "@/lib/schemas/game-schema"

export interface HeroJourneyStepData {
  id: HeroJourneyStep
  name: string
  definition: string
  examples: string[]
  antiheroExamples: string[]
}

export const heroJourneySteps: HeroJourneyStepData[] = [
  {
    id: "ordinary-world",
    name: "The Ordinary World",
    definition:
      "The hero's status quo. Establishes the baseline, the hero's limited awareness, and what they stand to lose.",
    examples: [
      "Frodo Baggins living a comfortable, sheltered life in the Shire.",
      "An unfulfilled accountant meticulously filing paperwork in a gray cubicle.",
      "A workaholic editor spending another Friday night alone with takeout.",
      "A high school student trying to remain invisible to avoid bullies.",
      "A farmer plowing fields, unaware that war has been declared in the capital.",
    ],
    antiheroExamples: [
      "A high school chemistry teacher feels emasculated by his low income and terminal cancer diagnosis.",
      "A sociopathic thief drifts through life feeling superior to the 'sheep' around him, bored by adherence to the law.",
    ],
  },
  {
    id: "call-to-adventure",
    name: "The Call to Adventure",
    definition: "An inciting incident disrupts the status quo and presents a challenge or opportunity.",
    examples: [
      "R2-D2 playing the hologram message 'Help me, Obi-Wan Kenobi.'",
      "A retired detective receives a letter from a killer he never caught.",
      "A protagonist notices a strange symptom or receives a life-changing diagnosis.",
      "A family finds a locked door in their new house that wasn't on the blueprints.",
      "An underdog team is invited to a major tournament due to a disqualification.",
    ],
    antiheroExamples: [
      "A struggling videographer sees a film crew recording a car crash and realizes he can monetize human tragedy.",
      "A mob underboss is offered a chance to whack his mentor and take over the family.",
    ],
  },
  {
    id: "refusal-of-call",
    name: "Refusal of the Call",
    definition: "The hero hesitates due to fear, insecurity, or obligation.",
    examples: [
      "John Wick initially refusing to return to the criminal underworld ('I'm retired').",
      "The protagonist meets their soulmate but pushes them away citing 'bad timing.'",
      "A soldier tries to dodge the draft or requests a desk job to avoid the front lines.",
      "The hero denies the supernatural events are happening, blaming stress or hallucination.",
      "A slacker protagonist refuses to save the world because it interferes with a video game tournament.",
    ],
    antiheroExamples: [
      "The protagonist declines a lucrative illegal job, not out of morality, but because the risk-to-reward ratio is too high.",
      "A vigilante considers throwing away their costume because the city is 'too rotten to save.'",
    ],
  },
  {
    id: "meeting-mentor",
    name: "Meeting the Mentor",
    definition: "The hero gains supplies, knowledge, or confidence from a seasoned guide.",
    examples: [
      "Mr. Miyagi teaching Daniel patience through 'wax on, wax off.'",
      "A hacker receives an encryption key from an anonymous online source known as The Oracle.",
      "Dante meeting Virgil to guide him through Hell.",
      "A cynical senior executive takes a naive junior under their wing.",
      "The old gunslinger gives the young sheriff a rusted but reliable revolver.",
    ],
    antiheroExamples: [
      "A young drug dealer learns the ropes from an unpredictable, violent junkie (a 'dark mentor').",
      "A corrupt politician teaches an idealistic staffer how to bury a scandal using blackmail.",
    ],
  },
  {
    id: "crossing-threshold",
    name: "Crossing the Threshold",
    definition:
      "The hero commits to the journey, leaving the Ordinary World and entering the Special World. There is no turning back.",
    examples: [
      "Alice falling down the rabbit hole.",
      "Katniss Everdeen volunteering as Tribute and boarding the train to the Capitol.",
      "The lawyer officially files the lawsuit against the massive corporation.",
      "The plane crashes on the island; the survivors realize no help is coming immediately.",
      "Stepping off the boat or plane onto new soil, leaving the homeland behind.",
    ],
    antiheroExamples: [
      "The protagonist commits their first murder to solve a problem, realizing how easy it was.",
      "A con artist steals from their own family, severing their last tie to a legitimate life.",
    ],
  },
  {
    id: "tests-allies-enemies",
    name: "Tests, Allies, and Enemies",
    definition: "The hero explores the Special World, learns the rules, and determines who to trust.",
    examples: [
      "Harry Potter meeting Ron and Hermione, and encountering Draco Malfoy on the train.",
      "Ocean's Eleven recruiting the specialist crew and scouting the casino security.",
      "The couple goes on a series of dates, meeting each other's friends (allies) and jealous exes (enemies).",
      "The brutal boot camp sequence where the recruit is broken down and built up.",
      "The private eye interrogates snitches, gets beaten up by goons, and finds a femme fatale.",
    ],
    antiheroExamples: [
      "A gangster navigates internal politics, deciding which fellow criminals to ally with and which to betray before they betray him.",
      "The protagonist alienates their only true friend to impress a powerful enemy.",
    ],
  },
  {
    id: "approach-inmost-cave",
    name: "Approach to the Inmost Cave",
    definition:
      "Preparation for the main hurdle. The stakes rise, and the hero pauses to strategize or face internal doubts.",
    examples: [
      "The 'gearing up' montage where weapons are loaded and maps are finalized.",
      "The protagonist decides to go down into the basement where the noise is coming from.",
      "The team pulls an all-nighter to perfect the pitch deck before the investor meeting.",
      "Approaching the villain's heavily guarded fortress in disguise.",
      "The protagonist sits in their car outside their estranged father's house, gathering the courage to knock.",
    ],
    antiheroExamples: [
      "The criminal spirals into paranoia, fortifying their home against the very people they hired.",
      "An unscrupulous lawyer destroys evidence to ensure their guilty client wins, crossing the final ethical line before trial.",
    ],
  },
  {
    id: "ordeal",
    name: "The Ordeal",
    definition: "The central crisis. The hero faces death (literal or metaphorical) or their greatest fear.",
    examples: [
      "Luke Skywalker in the trash compactor / being pulled under by the Dianoga.",
      "The 'Black Moment' breakup based on a misunderstanding or revealed secret.",
      "The protagonist relapses or suffers a near-fatal overdose.",
      "Indiana Jones facing the snakes in the Well of Souls.",
      "The key witness lies on the stand, seemingly destroying the defense's case.",
    ],
    antiheroExamples: [
      "The protagonist is forced to choose between saving a loved one or securing ultimate power—and they choose power.",
      "A brutal interrogation where the antihero laughs in the face of pain, revealing their complete loss of humanity.",
    ],
  },
  {
    id: "reward",
    name: "Reward (Seizing the Sword)",
    definition: "The hero survives the Ordeal and claims the prize (object, knowledge, or reconciliation).",
    examples: [
      "Arthur pulling Excalibur from the stone.",
      "The couple reconciles and shares a first kiss or admission of love.",
      "The detective finds the 'smoking gun' evidence that proves the killer's identity.",
      "The data has been successfully stolen from the corporate server.",
      "The hero realizes they are worthy of love/success (internal validation).",
    ],
    antiheroExamples: [
      "The rival is dead and the throne is secured, but the victory feels hollow or terrifyingly isolating.",
      "They successfully steal the money, but it is covered in blood, symbolizing the permanent stain on their soul.",
    ],
  },
  {
    id: "road-back",
    name: "The Road Back",
    definition: "The hero must return to the Ordinary World, but the consequences of the Ordeal chase them.",
    examples: [
      "The high-speed car chase escaping the enemy base with the stolen plans.",
      "The killer isn't dead; they rise for one final jump scare/attack.",
      "The vacation is over; the couple must now figure out how to integrate their love into real life.",
      "Orpheus trying to lead Eurydice out of the Underworld without looking back.",
      "The extraction helicopter is inbound, but the enemy is swarming the landing zone.",
    ],
    antiheroExamples: [
      "Trying to attend a normal family dinner while hiding a gunshot wound, realizing they can never be 'normal' again.",
      "Framing an innocent person to cover their escape, ensuring the police chase the wrong target.",
    ],
  },
  {
    id: "resurrection",
    name: "The Resurrection",
    definition: "The final test. A climax where the hero is tested once more to prove they have truly changed.",
    examples: [
      "Iron Man sacrificing himself to snap Thanos out of existence.",
      "The liar is forced to tell the truth in a high-stakes situation, risking everything.",
      "The showdown at High Noon; the hero faces the villain alone.",
      "The closing argument where the lawyer speaks from the heart, not just the law books.",
      "Beauty weeping over the Beast; her love transforms him from beast to human.",
    ],
    antiheroExamples: [
      "Faced with a chance for redemption, the antihero doubles down on their villainy to survive, fully embracing their dark side ('The monster is born').",
      "The protagonist saves the day, but uses excessive, horrific violence to do so, terrifying the people they just saved.",
    ],
  },
  {
    id: "return-with-elixir",
    name: "Return with the Elixir",
    definition:
      "The hero returns home, transformed, bringing a boon (wisdom, freedom, or a physical cure) to their world.",
    examples: [
      "Samwise Gamgee returns to his family, content and capable ('Well, I'm back.').",
      "The corrupt government is toppled, and society begins to rebuild with freedom.",
      "Hamlet dies, but the 'poison' of the kingdom is purged, and the truth is told by Horatio.",
      "The team brings home the trophy, uniting the divided town.",
      "The protagonist is still single, but happy and self-assured, no longer needing a partner to feel complete.",
    ],
    antiheroExamples: [
      "The character sits alone in a mansion, wealthy and powerful but utterly bereft of love or trust (The Elixir is poison).",
      "They escape justice and drive off into the sunset, smirking, having learned nothing and ready to sin again.",
    ],
  },
]

export function getHeroJourneyStep(id: HeroJourneyStep): HeroJourneyStepData | undefined {
  return heroJourneySteps.find((step) => step.id === id)
}

export function getNextHeroJourneyStep(currentId: HeroJourneyStep): HeroJourneyStep | null {
  const currentIndex = heroJourneySteps.findIndex((step) => step.id === currentId)
  if (currentIndex === -1 || currentIndex === heroJourneySteps.length - 1) {
    return null
  }
  return heroJourneySteps[currentIndex + 1].id
}
