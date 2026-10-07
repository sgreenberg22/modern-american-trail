import type { GameEvent } from "../../types";

// Quest chains. Each starts as a normal event, continues through "chain" beats
// that fire days later (next/nextIn), and often pays off in a specific paradise
// via a flag. Every chain can end early, and every beat has a choice anyone can take.
export const CHAIN_EVENTS: GameEvent[] = [
  // ================================================ Seed Library (Seattle → Philadelphia)
  {
    id: "ch-seeds-1", title: "The Seed Library", where: "paradise", tags: ["quest", "arrival"], weight: 3,
    conditions: { stops: ["seattle"], notFlags: ["seeds-quest", "seeds-done"] },
    text: "A seed librarian in Seattle (it's a library, but for seeds) asks you to carry a jar of heirloom seeds to a farm co-op outside Philadelphia. \"These tomatoes survived three wars and one regime. They can survive your van.\"",
    choices: [
      { label: "Take the jar", outcomes: [{ text: "She wraps it in a wool sock and gives you a handwritten care sheet. \"Keep them cool. Keep them dry. Keep them away from inspectors.\"", effects: { morale: 6 }, setFlags: ["seeds-quest"], next: "ch-seeds-2", nextIn: 4 }] },
      { label: "Too much responsibility", outcomes: [{ text: "She understands. \"Someone else will carry them,\" she says, sounding like someone who has said it before.", setFlags: ["seeds-done"] }] }
    ]
  },
  {
    id: "ch-seeds-2", title: "Agricultural Inspection", where: "chain", tags: ["quest", "checkpoint"], conditions: { flags: ["seeds-quest"] },
    text: "An agricultural inspector at a state line opens your cooler, sniffs, and asks if you are \"transporting any unpatented biological material.\" The seed jar is in a sock in the glovebox.",
    choices: [
      { label: "Hide the jar", check: { skill: "stealth", difficulty: "medium" },
        success: [{ text: "{skilled} slides the sock into a hiking boot. The inspector finds four apples and confiscates them with satisfaction.", effects: { food: -3 }, next: "ch-seeds-3", nextIn: 6 }],
        failure: [{ text: "He finds the jar. He holds it up to the light like evidence, because it is. The seeds are gone.", effects: { heat: 15, morale: -10 }, clearFlags: ["seeds-quest"], setFlags: ["seeds-done"] }] },
      { label: "Say they're decorative", check: { skill: "persuasion", difficulty: "medium" },
        success: [{ text: "\"Decorative seeds,\" {skilled} says, with such confidence that he writes it down as a category.", effects: {}, next: "ch-seeds-3", nextIn: 6 }],
        failure: [{ text: "He has never heard of decorative seeds, and he's not about to start.", effects: { heat: 10, money: -40 }, clearFlags: ["seeds-quest"], setFlags: ["seeds-done"] }] },
      { label: "Hand them over", outcomes: [{ text: "You give up the jar. The librarian's care sheet stays in the glovebox, a small reproach.", effects: { morale: -12 }, clearFlags: ["seeds-quest"], setFlags: ["seeds-done"] }] }
    ]
  },
  {
    id: "ch-seeds-3", title: "Sprouting", where: "chain", tags: ["quest"], conditions: { flags: ["seeds-quest"] },
    text: "The van has been hot for days. When you check the jar, three of the seeds have sprouted, tiny and green and doomed in a jar.",
    choices: [
      { label: "Plant the sprouts in a gas station planter", outcomes: [{ text: "Three tomato plants in a planter outside a regime gas station. They'll bloom next to a FREEDOM FUEL sign. That feels right.", effects: { morale: 10 } }] },
      { label: "Keep them cool and keep going", check: { skill: "survival", difficulty: "easy" },
        success: [{ text: "{skilled} rigs a wet-towel cooler for the jar. The rest stay dormant.", effects: { morale: 4 } }],
        failure: [{ text: "A few more sprout. Most are still fine.", effects: { morale: -3 } }] }
    ]
  },
  {
    id: "ch-seeds-4", title: "The Co-op Farm", where: "paradise", tags: ["quest", "arrival"], weight: 100, conditions: { stops: ["philadelphia", "baltimore"], flags: ["seeds-quest"] },
    text: "The co-op farm is a former parking lot, now forty raised beds and a goat. The farmer opens the jar, counts the seeds, and laughs out loud. \"She sent the Brandywines. She actually sent them.\"",
    choices: [
      { label: "Stay for dinner", outcomes: [{ text: "Dinner from the farm, and a jar of next year's seeds \"for Vermont.\" The goat eats {member}'s hat.", effects: { food: 15, health: 6, morale: 15, money: 80, items: { seeds: 1 }, rep: { resistance: 15 } }, clearFlags: ["seeds-quest"], setFlags: ["seeds-done"] }] }
    ]
  },

  // ================================================ The Stray
  {
    id: "ch-dog-1", title: "Follower", where: "road", tags: ["quest", "people"], conditions: { minDay: 2, notFlags: ["dog", "dog-done"] },
    text: "At a gas station, a scruffy mutt with one ear up and one ear down sits next to the van and stares at you. When you move, it moves. When you stop, it stops. It has decided.",
    choices: [
      { label: "Open the door", outcomes: [{ text: "It hops in, takes the best seat, and goes to sleep. {member} names it Biscuit. Nobody objects.", effects: { morale: 12 }, setFlags: ["dog"], next: "ch-dog-2", nextIn: 3 }] },
      { label: "Give it some food and go", outcomes: [{ text: "It eats, then watches you leave with total understanding. That's worse.", effects: { food: -2, morale: -4 }, setFlags: ["dog-done"] }] }
    ]
  },
  {
    id: "ch-dog-2", title: "Biscuit Finds Something", where: "chain", tags: ["quest"], conditions: { flags: ["dog"] },
    text: "At a rest stop, Biscuit runs into the woods and starts barking at a culvert with the urgency of a dog who has found the meaning of life.",
    choices: [
      { label: "Follow Biscuit", outcomes: [
        { weight: 2, text: "A stash of canned food in a waterproof bin: somebody's emergency cache, long forgotten. Biscuit is insufferable about it.", effects: { food: 12, morale: 6 }, next: "ch-dog-3", nextIn: 4 },
        { weight: 1, text: "A raccoon. Biscuit and the raccoon reach an understanding. You all leave.", effects: { morale: 4 }, next: "ch-dog-3", nextIn: 4 }
      ] },
      { label: "Call Biscuit back", outcomes: [{ text: "Biscuit comes back, eventually, with a sock that isn't yours.", effects: {}, next: "ch-dog-3", nextIn: 4 }] }
    ]
  },
  {
    id: "ch-dog-3", title: "Biscuit Hears Something", where: "chain", tags: ["quest", "heat"], conditions: { flags: ["dog"] },
    text: "Parked for the night, Biscuit wakes everyone with a low growl, staring down the road. Headlights, far off, moving slow. Searching.",
    choices: [
      { label: "Trust the dog and move now", outcomes: [{ text: "You pull out with the lights off. Behind you, a patrol car sweeps the spot where you were parked. Biscuit gets the whole bag of jerky.", effects: { heat: -20, morale: 8 }, next: "ch-dog-4", nextIn: 5 }] },
      { label: "Hold Biscuit and stay quiet", check: { skill: "stealth", difficulty: "medium" },
        success: [{ text: "The headlights pass. Biscuit doesn't make a sound. Good dog. Best dog.", effects: { heat: -10 }, next: "ch-dog-4", nextIn: 5 }],
        failure: [{ text: "Biscuit barks once. The headlights stop. Then a long night. In the morning, Biscuit is gone, chased off by a trooper's flashlight.", effects: { heat: 20, morale: -15 }, clearFlags: ["dog"], setFlags: ["dog-done"] }] }
    ]
  },
  {
    id: "ch-dog-4", title: "LOST DOG", where: "chain", tags: ["quest", "people"], conditions: { flags: ["dog"] },
    text: "A poster on a telephone pole: LOST DOG — ONE EAR UP — ANSWERS TO \"PANCAKE.\" Under it, a phone number and a drawing by a child. Biscuit wags at the drawing.",
    choices: [
      { label: "Call the number", outcomes: [{ text: "A family twenty miles back. The kid cries. The dad cries. Biscuit, or Pancake, licks everyone. They pay you the reward even though you try to refuse.", effects: { money: 100, morale: 10, miles: -20 }, clearFlags: ["dog"], setFlags: ["dog-done"] }] },
      { label: "Keep going", outcomes: [{ text: "You look at the poster for a long time, then at Biscuit, who is asleep on {member}'s lap. You keep going. Biscuit is going to Vermont.", effects: { morale: 6 }, setFlags: ["dog-forever", "dog-done"], clearFlags: ["dog"] }] }
    ]
  },

  // ================================================ The Ashes (→ Chicago)
  {
    id: "ch-ashes-1", title: "The Urn", where: "road", regions: ["mountain", "plains"], tags: ["quest", "people"], conditions: { notFlags: ["ashes", "ashes-done"] },
    text: "A widow at a motel breakfast asks where you're headed. When you say east, she goes to her room and comes back with an urn. \"Harold loved Lake Michigan. I can't drive anymore. Would you?\"",
    choices: [
      { label: "Take Harold", outcomes: [{ text: "She tells you about Harold for an hour: a machinist, a union man, a terrible dancer. You buckle the urn into a seat.", effects: { morale: 8 }, setFlags: ["ashes"], next: "ch-ashes-2", nextIn: 3 }] },
      { label: "Gently decline", outcomes: [{ text: "She nods. \"Someone will.\" She pays for your breakfast anyway.", effects: { money: 15 }, setFlags: ["ashes-done"] }] }
    ]
  },
  {
    id: "ch-ashes-2", title: "Cremains Permit", where: "chain", tags: ["quest", "checkpoint"], conditions: { flags: ["ashes"] },
    text: "A guard at a checkpoint taps the urn. \"Transporting human remains across a county line requires a Form 88-C, Certificate of Patriotic Interment.\"",
    choices: [
      { label: "Explain who Harold was", check: { skill: "persuasion", difficulty: "easy" },
        success: [{ text: "{skilled} tells Harold's story. The guard's father was a machinist too. He salutes the urn.", effects: { morale: 8 } }],
        failure: [{ text: "The guard is unmoved. Fee for the form, plus a fee for not having the form.", effects: { money: -50 } }] },
      { label: "Pay for the permit", cost: { money: 30 }, outcomes: [{ text: "Harold is now officially patriotic. He'd have hated that.", effects: {} }] },
      { label: "Hide Harold", check: { skill: "stealth", difficulty: "easy" },
        success: [{ text: "Harold rides under a sleeping bag. Nobody checks.", effects: {} }],
        failure: [{ text: "The guard finds the urn and adds a citation for \"concealed grandfather.\"", effects: { money: -60, heat: 10 } }] }
    ]
  },
  {
    id: "ch-ashes-3", title: "Lake Michigan", where: "paradise", tags: ["quest", "arrival"], weight: 100, conditions: { stops: ["chicago"], flags: ["ashes"] },
    text: "You drive to the lakefront at dawn. The water is grey and enormous and calm. You walk Harold out to the end of a concrete pier.",
    choices: [
      { label: "Say a few words", outcomes: [{ text: "Nobody knew him, so you tell the lake what his widow told you. The wind takes him exactly the right way. Back at the van there's a postcard on the windshield from the widow, who called ahead to a cousin: \"Thank you. Keep going.\"", effects: { morale: 20, items: { postcard: 1 }, rep: { resistance: 5 } }, clearFlags: ["ashes"], setFlags: ["ashes-done"] }] }
    ]
  },

  // ================================================ The Defector
  {
    id: "ch-defector-1", title: "The Guard Who Wants Out", where: "road", regions: ["mountain", "plains", "midwest"], tags: ["quest", "danger"], conditions: { minDay: 5, notFlags: ["defector", "defector-done"] },
    text: "At a checkpoint, the young guard checking your papers says, very quietly, without looking up: \"I'm done. My shift ends at six. Please.\"",
    choices: [
      { label: "Wait for six", outcomes: [{ text: "At 6:04 he climbs into the back in civilian clothes with a duffel bag and says, \"I'm Dev. I'm sorry. Thank you.\" He doesn't stop shaking for an hour.", effects: { heat: 15 }, setFlags: ["defector"], next: "ch-defector-2", nextIn: 2 }] },
      { label: "Pretend you didn't hear", outcomes: [{ text: "He stamps your papers and doesn't look at you again.", effects: { morale: -10 }, setFlags: ["defector-done"] }] }
    ]
  },
  {
    id: "ch-defector-2", title: "His Face on the List", where: "chain", tags: ["quest", "checkpoint", "heat"], conditions: { flags: ["defector"] },
    text: "At the next checkpoint, there's a tablet on the guard's clipboard. On it, a photo of Dev in his uniform: AWOL — DETAIN.",
    choices: [
      { label: "Hide Dev", check: { skill: "stealth", difficulty: "medium" },
        success: [{ text: "Dev folds himself into a space behind the back seat you didn't know existed. The guard waves you on.", effects: {}, next: "ch-defector-3", nextIn: 3 }],
        failure: [{ text: "They find him. He goes with them quietly so you won't be charged. He mouths \"thank you\" through the window.", effects: { heat: 25, morale: -15 }, clearFlags: ["defector"], setFlags: ["defector-done"] }] },
      { label: "Let Dev talk to them", outcomes: [
        { weight: 1, text: "He knows the guard. They went to training together. The guard looks at Dev, looks at the tablet, and says, \"Never saw you.\"", effects: {}, next: "ch-defector-3", nextIn: 3 },
        { weight: 1, text: "He knows the guard, and the guard knows him. The guard looks at the tablet a long time, then waves you through, angry about it.", effects: { heat: 20 }, next: "ch-defector-3", nextIn: 3 }
      ] }
    ]
  },
  {
    id: "ch-defector-3", title: "What Dev Knows", where: "chain", tags: ["quest", "heat"], conditions: { flags: ["defector"] },
    text: "Dev has been quiet for two days. Tonight he starts talking: patrol schedules, which checkpoints are understaffed, which roads the drones don't fly.",
    choices: [
      { label: "Take notes", outcomes: [{ text: "Pages of notes. The next week of driving gets a lot easier.", effects: { heat: -30 } }] },
      { label: "Ask why he joined", outcomes: [{ text: "\"It was the only job in town with health insurance.\" He laughs, then doesn't. Everyone stays up late.", effects: { morale: 8, heat: -15 } }] }
    ]
  },
  {
    id: "ch-defector-4", title: "Dev Gets Out", where: "paradise", tags: ["quest", "arrival"], weight: 100, conditions: { flags: ["defector"] },
    text: "In {stop}, Dev stands on the sidewalk with his duffel bag and looks around like he's never seen a city where nobody checks your papers.",
    choices: [
      { label: "Say goodbye", outcomes: [{ text: "He empties his wallet into your hands, all his savings, over your protests. \"I owe you more than this.\" The Resistance hears about it by nightfall.", effects: { money: 150, morale: 15, rep: { resistance: 20 } }, clearFlags: ["defector"], setFlags: ["defector-done"] }] }
    ]
  },

  // ================================================ The Band (→ Upper Midwest)
  {
    id: "ch-band-1", title: "Broken-Down Band", where: "road", regions: ["mountain", "plains"], tags: ["quest", "people"], conditions: { notFlags: ["band", "band-done"] },
    text: "A folk band's tour van is dead on the shoulder: four musicians, a stand-up bass and a banjo. They have a gig in the Midwest in a week. Their van is going nowhere. Their instruments could ride with you.",
    choices: [
      { label: "Take the instruments", outcomes: [{ text: "The bass rides across two seats. The banjo player gives you a set list and a hug. \"We'll meet you there.\"", effects: { morale: 8 }, setFlags: ["band"], next: "ch-band-2", nextIn: 3 }] },
      { label: "Give them a lift to the nearest town instead", outcomes: [{ text: "You drive them to a bus station. They sing the whole way. They give you a mixtape.", effects: { miles: -20, items: { mixtape: 1 }, morale: 10 }, setFlags: ["band-done"] }] }
    ]
  },
  {
    id: "ch-band-2", title: "Is That a Banjo?", where: "chain", tags: ["quest", "checkpoint"], conditions: { flags: ["band"] },
    text: "A guard at a checkpoint sees the banjo case and narrows his eyes. \"Protest music,\" he says, \"is a regulated instrument.\"",
    choices: [
      { label: "Play him something wholesome", check: { skill: "persuasion", difficulty: "medium" },
        success: [{ text: "{skilled} plays a song about a dog and a truck. The guard tears up. He asks for an encore.", effects: { morale: 10 }, next: "ch-band-3", nextIn: 1 }],
        failure: [{ text: "{skilled} plays a song about a dog and a truck. Wrong dog, wrong truck. Fine.", effects: { money: -50 }, next: "ch-band-3", nextIn: 1 }] },
      { label: "Say it's a tennis racket", outcomes: [{ text: "He doesn't believe you. He also doesn't want to open it. Stalemate. You drive away.", effects: { heat: 10 }, next: "ch-band-3", nextIn: 1 }] }
    ]
  },
  {
    id: "ch-band-3", title: "Load-In", where: "chain", tags: ["quest"], conditions: { flags: ["band"] },
    text: "The band texts: the gig is confirmed, the venue has a back door, and they'll put you on the guest list. The bass smells like cigarettes and woodsmoke and makes the whole van feel like a tour.",
    choices: [
      { label: "Practice the chorus", outcomes: [{ text: "Everyone learns the chorus. Everyone is bad at it. Morale is excellent.", effects: { morale: 10 } }] }
    ]
  },
  {
    id: "ch-band-4", title: "The Gig", where: "paradise", regions: ["midwest"], tags: ["quest", "arrival"], weight: 100, conditions: { flags: ["band"] },
    text: "The band is at the back door of a bar in {stop}, waiting. They hug the bass first, then you. Then they put you on stage for the encore.",
    choices: [
      { label: "Sing the chorus", outcomes: [{ text: "You sing it badly, loudly, with two hundred people. The band splits the door with you. It's the best night of the trip.", effects: { money: 120, morale: 20, rep: { resistance: 8 } }, clearFlags: ["band"], setFlags: ["band-done"] }] }
    ]
  },

  // ================================================ The Hard Drive (→ Baltimore)
  {
    id: "ch-drive-1", title: "The Engineer", where: "road", regions: ["northwest", "mountain"], tags: ["quest", "faction"], conditions: { minDay: 2, notFlags: ["drive", "drive-done"] },
    text: "A nervous engineer at a rest stop presses a hard drive into your hands. \"Inspection reports. The dam upstream of three towns. They signed off on cracks. There are reporters in Baltimore who'll run it.\"",
    choices: [
      { label: "Take it", outcomes: [{ text: "She writes an address on your arm in pen. \"Don't plug it into anything,\" she says, and drives off fast.", effects: { heat: 10 }, setFlags: ["drive"], next: "ch-drive-2", nextIn: 4 }] },
      { label: "Hand it back", outcomes: [{ text: "She looks at you like you've disappointed her personally, then tries the next car.", effects: { morale: -6 }, setFlags: ["drive-done"] }] }
    ]
  },
  {
    id: "ch-drive-2", title: "They're Tracking It", where: "chain", tags: ["quest", "heat"], conditions: { flags: ["drive"] },
    text: "Every phone in the van gets the same text: \"We know what you have.\" No number. Then a drone, high up, keeping pace.",
    choices: [
      { label: "Wrap the drive in foil and ditch the phones", outcomes: [{ text: "Foil, burner phones, back roads. The drone loses interest by dusk.", effects: { money: -40, heat: -10 }, next: "ch-drive-3", nextIn: 5 }] },
      { label: "Spoof the tracker", requires: { skill: "hacking" }, check: { skill: "hacking", difficulty: "medium" },
        success: [{ text: "{skilled} clones the tracking signal onto a delivery truck headed west. The drone follows the truck.", effects: { heat: -20 }, next: "ch-drive-3", nextIn: 5 }],
        failure: [{ text: "The spoof fails loudly. Now they know you know.", effects: { heat: 25 }, next: "ch-drive-3", nextIn: 5 }] },
      { label: "Destroy the drive", outcomes: [{ text: "You smash it with a tire iron in a cornfield. The texts stop. You don't feel good.", effects: { morale: -15, heat: -15 }, clearFlags: ["drive"], setFlags: ["drive-done"] }] }
    ]
  },
  {
    id: "ch-drive-3", title: "Backups", where: "chain", tags: ["quest"], conditions: { flags: ["drive"] },
    text: "At a library with public computers, you think about the engineer's warning. If they take the drive, everything's gone. A backup would mean plugging it in.",
    choices: [
      { label: "Make an air-gapped backup", requires: { skill: "hacking" }, outcomes: [{ text: "{skilled} copies it to three thumb drives without ever touching the network. You hide them in three different places.", effects: { morale: 8 }, setFlags: ["drive-backup"] }] },
      { label: "Don't risk it", outcomes: [{ text: "You leave the drive in the foil. It sits in the glovebox like it's ticking.", effects: {} }] }
    ]
  },
  {
    id: "ch-drive-4", title: "The Newsroom", where: "paradise", tags: ["quest", "arrival"], weight: 100, conditions: { stops: ["baltimore", "philadelphia"], flags: ["drive"] },
    text: "The address on your arm is a newsroom over a crab house. An editor with reading glasses on her head plugs the drive into a machine with no network cable, reads for a long time, and picks up the phone.",
    choices: [
      { label: "Wait for the story", outcomes: [{ text: "It runs the next morning. Three towns evacuate; the dam is fixed within the year. The editor buys you dinner and won't say your names to anyone, ever.", effects: { money: 100, morale: 20, rep: { resistance: 25 } }, clearFlags: ["drive", "drive-backup"], setFlags: ["drive-done"] }] }
    ]
  },

  // ================================================ The Lost Hiker
  {
    id: "ch-hiker-1", title: "Search Party", where: "road", regions: ["mountain", "northwest"], tags: ["quest", "people"], conditions: { notFlags: ["hiker", "hiker-done"] },
    text: "Flyers at a trailhead: MISSING HIKER — 3 DAYS. A volunteer search party is forming. The sheriff isn't coming; he says the hiker \"chose the wilderness.\"",
    choices: [
      { label: "Join the search", outcomes: [{ text: "They hand you a map grid and a whistle. Your grid is the steepest one.", effects: { morale: 4 }, setFlags: ["hiker"], next: "ch-hiker-2" }] },
      { label: "Leave food for the searchers", cost: { food: 6 }, outcomes: [{ text: "They thank you. You drive on, thinking about the flyer.", effects: { morale: 4 }, setFlags: ["hiker-done"] }] },
      { label: "Keep going", outcomes: [{ text: "You can't save everyone. You think about that for a while.", effects: { morale: -4 }, setFlags: ["hiker-done"] }] }
    ]
  },
  {
    id: "ch-hiker-2", title: "Tracks", where: "chain", tags: ["quest"], conditions: { flags: ["hiker"] },
    text: "Your grid is a ridgeline. Halfway up, {member} finds a granola bar wrapper, then a boot print, then a broken branch, all leading off trail.",
    choices: [
      { label: "Follow the trail", check: { skill: "survival", difficulty: "medium" },
        success: [{ text: "{skilled} reads the signs like a page. By evening, you hear a whistle that isn't yours.", effects: {}, next: "ch-hiker-3" }],
        failure: [{ text: "The trail goes cold at a creek. The search is called off at dark. You never find out.", effects: { delay: 1, morale: -12 }, clearFlags: ["hiker"], setFlags: ["hiker-done"] }] },
      { label: "Report it and let the experts follow", outcomes: [{ text: "You radio it in. Two days later, a text: they found him, alive, because of your boot print.", effects: { delay: 1, morale: 12 }, clearFlags: ["hiker"], setFlags: ["hiker-done"] }] }
    ]
  },
  {
    id: "ch-hiker-3", title: "Found", where: "chain", tags: ["quest", "health"], conditions: { flags: ["hiker"] },
    text: "He's at the bottom of a ravine with a broken leg and a sense of humor. \"Took you long enough,\" he says, then cries.",
    choices: [
      { label: "Carry him out", outcomes: [{ text: "A day of carrying a man up a ravine. Everybody's wrecked. At the trailhead, his family gives you his ham radio and more money than they should.", effects: { delay: 1, health: -10, money: 100, morale: 20, items: { "ham-radio": 1 } }, clearFlags: ["hiker"], setFlags: ["hiker-done"] }] },
      { label: "Splint his leg first", requires: { skill: "medical" }, outcomes: [{ text: "{skilled} splints it properly. The carry is half as bad. His family insists on giving you everything in their car.", effects: { delay: 1, health: -4, money: 100, morale: 20, items: { "ham-radio": 1, medkit: 1 } }, clearFlags: ["hiker"], setFlags: ["hiker-done"] }] }
    ]
  },

  // ================================================ Election Day
  {
    id: "ch-vote-1", title: "Poll Watchers Needed", where: "road", regions: ["midwest", "plains"], tags: ["quest", "faction"], conditions: { notFlags: ["vote", "vote-done"] },
    text: "A small town is holding a mayoral election tomorrow. The reform candidate's campaign, which is two retirees and a teenager, needs poll watchers. \"Just stand there and look like you're paying attention.\"",
    choices: [
      { label: "Volunteer", outcomes: [{ text: "They give you lanyards and a church basement to sleep in.", effects: { delay: 1, morale: 6 }, setFlags: ["vote"], next: "ch-vote-2" }] },
      { label: "Wish them luck", outcomes: [{ text: "The teenager says, \"We'll need it,\" without irony.", setFlags: ["vote-done"] }] }
    ]
  },
  {
    id: "ch-vote-2", title: "The Ballot Box", where: "chain", tags: ["quest", "danger"], conditions: { flags: ["vote"] },
    text: "Mid-afternoon, a man in a windbreaker walks into the polling place, picks up a ballot box, and starts walking out with it, very confidently.",
    choices: [
      { label: "Stand in the doorway", check: { skill: "intimidation", difficulty: "medium" },
        success: [{ text: "{skilled} doesn't say anything, just stands there. He puts the box down and leaves.", effects: { morale: 10 }, next: "ch-vote-3" }],
        failure: [{ text: "He walks around you. The clerk tackles him. It's on the local news.", effects: { heat: 15 }, next: "ch-vote-3" }] },
      { label: "Get the county clerk", outcomes: [{ text: "The clerk is seventy and furious. She takes the box back herself, with words you won't repeat.", effects: { morale: 6 }, next: "ch-vote-3" }] }
    ]
  },
  {
    id: "ch-vote-3", title: "The Count", where: "chain", tags: ["quest", "faction"], conditions: { flags: ["vote"] },
    text: "It's a tie: 411 to 411. State law says a tie is broken by drawing a card. The clerk shuffles a deck and holds it out to you, the only neutral people in the building.",
    choices: [
      { label: "Draw", outcomes: [
        { weight: 1, text: "The reform candidate wins on a jack of hearts. The church basement erupts. The teenager cries. You leave town at dawn, and someone has filled your gas tank.", effects: { morale: 20, fuel: 10, rep: { resistance: 15 } }, clearFlags: ["vote"], setFlags: ["vote-done"] },
        { weight: 1, text: "The regime candidate wins on a four of clubs. The basement goes quiet. The retirees thank you anyway. \"Next time,\" one says. They mean it.", effects: { morale: -6, rep: { resistance: 8 } }, clearFlags: ["vote"], setFlags: ["vote-done"] }
      ] }
    ]
  },

  // ================================================ The Cookbook (→ the East)
  {
    id: "ch-recipe-1", title: "Grandma's Cookbook", where: "road", regions: ["midwest", "south", "plains"], tags: ["quest", "people", "food"], conditions: { notFlags: ["recipe", "recipe-done"] },
    text: "A grandmother at a diner overhears where you're going. She hands you a binder of handwritten recipes, banned for \"excessive foreign spices.\" \"My granddaughter is in the East. She should have these.\"",
    choices: [
      { label: "Take the cookbook", outcomes: [{ text: "She writes the address inside the cover and tells you which recipe to try first. It's the one with the most cumin.", effects: { morale: 6 }, setFlags: ["recipe"], next: "ch-recipe-2", nextIn: 4 }] },
      { label: "Promise to tell her granddaughter she said hello", outcomes: [{ text: "She laughs. \"That I can do myself, dear.\" She pays for your pie.", effects: { money: 10 }, setFlags: ["recipe-done"] }] }
    ]
  },
  {
    id: "ch-recipe-2", title: "Spice Inspection", where: "chain", tags: ["quest", "checkpoint"], conditions: { flags: ["recipe"] },
    text: "A checkpoint guard sniffs the air in the van and frowns. \"Is that... cumin?\" The cookbook has absorbed sixty years of spices. It smells like a crime.",
    choices: [
      { label: "Say it's a church cookbook", check: { skill: "persuasion", difficulty: "medium", faction: "faithful" },
        success: [{ text: "{skilled} points out the potluck section. There's a casserole. The guard is satisfied.", effects: {}, next: "ch-recipe-3", nextIn: 5 }],
        failure: [{ text: "He flips to a page titled \"Lamb, Properly.\" Fine, citation, a lecture on paprika.", effects: { money: -40, heat: 10 }, next: "ch-recipe-3", nextIn: 5 }] },
      { label: "Air out the van", outcomes: [{ text: "You open every window. The guard waves you through, coughing. The van will smell like cumin forever. Good.", effects: {}, next: "ch-recipe-3", nextIn: 5 }] }
    ]
  },
  {
    id: "ch-recipe-3", title: "Page 41", where: "chain", tags: ["quest", "food"], conditions: { flags: ["recipe"] },
    text: "A rough week. Everyone's tired and sick of gas station food. The cookbook is open on the dashboard to page 41, a lentil stew that \"fixes anything.\"",
    choices: [
      { label: "Make the stew", cost: { food: 6 }, outcomes: [{ text: "On a camp stove at a rest area. It fixes everything, as advertised.", effects: { health: 8, morale: 15, cure: "exhausted" } }] },
      { label: "Save the cookbook for the granddaughter", outcomes: [{ text: "You close the binder. Some things are worth waiting for.", effects: { morale: 4 } }] }
    ]
  },
  {
    id: "ch-recipe-4", title: "The Granddaughter", where: "paradise", regions: ["east"], tags: ["quest", "arrival"], weight: 100, conditions: { flags: ["recipe"] },
    text: "The granddaughter in {stop} opens the door, sees the binder, and sits down on her front step. She hasn't seen her grandmother's handwriting in four years.",
    choices: [
      { label: "Stay for dinner", outcomes: [{ text: "She cooks for six hours from the binder. Neighbors come. Everyone eats too much. She sends you off with leftovers, spices, and a hug for her grandmother you promise to send by postcard.", effects: { food: 20, health: 8, morale: 20 }, clearFlags: ["recipe"], setFlags: ["recipe-done"] }] }
    ]
  },

  // ================================================ The Governor's Nephew
  {
    id: "ch-nephew-1", title: "Chet", where: "road", tags: ["quest", "people"], conditions: { minDay: 6, notFlags: ["nephew", "nephew-done"] },
    text: "A hitchhiker in a pastel quarter-zip with a portfolio case and a sign: ART SCHOOL OR BUST. His name is Chet. He has never hitchhiked before. It shows.",
    choices: [
      { label: "Pick Chet up", outcomes: [{ text: "Chet talks about color theory for two hundred miles. He's actually very good. He won't say where he's from.", effects: { morale: 6 }, setFlags: ["nephew"], next: "ch-nephew-2", nextIn: 2 }] },
      { label: "Pass", outcomes: [{ text: "Chet waves like he's not sure he's doing it right.", setFlags: ["nephew-done"] }] }
    ]
  },
  {
    id: "ch-nephew-2", title: "Who Chet Is", where: "chain", tags: ["quest", "heat"], conditions: { flags: ["nephew"] },
    text: "The radio: the governor's nephew has \"gone missing, presumed kidnapped by radicals.\" There's a photo. It's Chet. Chet is in the back seat, eating your granola.",
    choices: [
      { label: "Keep driving", outcomes: [{ text: "\"I'm not kidnapped,\" Chet says. \"I'm going to art school. My uncle thinks painting is communism.\" The heat on you just went way up.", effects: { heat: 25 }, next: "ch-nephew-3", nextIn: 3 }] },
      { label: "Drop Chet at a bus station", outcomes: [{ text: "Chet understands. He leaves you a sketch of the van, signed. \"Worth something someday,\" he says. He's right.", effects: { items: { plate: 1 }, morale: 4 }, clearFlags: ["nephew"], setFlags: ["nephew-done"] }] }
    ]
  },
  {
    id: "ch-nephew-3", title: "The Name", where: "chain", tags: ["quest", "checkpoint", "heat"], conditions: { flags: ["nephew"] },
    text: "Troopers box you in at a checkpoint. Guns out. Then Chet leans forward from the back seat, rolls down the window, and says, \"Do you know who my uncle is?\"",
    choices: [
      { label: "Let Chet handle it", outcomes: [{ text: "The troopers know exactly who his uncle is. Chet tells them he's on a \"family-approved retreat\" with \"his staff,\" meaning you. They apologize. They escort you to the county line.", effects: { heat: -40 } }] }
    ]
  },
  {
    id: "ch-nephew-4", title: "Art School", where: "paradise", regions: ["midwest", "east"], tags: ["quest", "arrival"], weight: 100, conditions: { flags: ["nephew"] },
    text: "Chet's art school in {stop} has a mural on every wall and a dean who hugs him in the parking lot. Chet looks at the building like he's seeing color for the first time.",
    choices: [
      { label: "Say goodbye to Chet", outcomes: [{ text: "He gives you his savings, which are larger than you'd think, and a painting of the four of you in the van, done from memory. \"I'll be famous,\" he says. \"You'll be in a museum.\"", effects: { money: 200, morale: 15 }, clearFlags: ["nephew"], setFlags: ["nephew-done"] }] }
    ]
  },

  // ================================================ The Transmission
  {
    id: "ch-trans-1", title: "Grinding", where: "road", tags: ["quest", "vehicle"], conditions: { maxVan: 55, notFlags: ["trans", "trans-done"] },
    text: "Second gear has started making a sound like a coffee grinder full of regret. A mechanic at a gas station listens for two seconds and says, \"Transmission. She's dying.\"",
    choices: [
      { label: "Nurse it along", outcomes: [{ text: "You drive gently and never use second gear. It's like driving with a sore tooth.", effects: { morale: -4 }, setFlags: ["trans"], next: "ch-trans-2", nextIn: 3 }] },
      { label: "Replace it now", cost: { money: 250 }, outcomes: [{ text: "Two days and most of your money, but the van shifts like it's new.", effects: { delay: 1, van: 35 }, setFlags: ["trans-done"] }] }
    ]
  },
  {
    id: "ch-trans-2", title: "The Hill", where: "chain", tags: ["quest", "vehicle"], conditions: { flags: ["trans"] },
    text: "A long hill. The transmission slips, catches, slips again. The van starts rolling backward, slowly, with the dignity of a ship going down.",
    choices: [
      { label: "Everybody out and push", outcomes: [{ text: "Four people push a van up a hill. A farmer watching from a tractor eventually tows you to the top, laughing.", effects: { health: -6, morale: 4 }, next: "ch-trans-3", nextIn: 3 }] },
      { label: "Find a gear that works", check: { skill: "mechanical", difficulty: "medium" },
        success: [{ text: "{skilled} finds that first gear and a prayer will do it. You crawl to the top.", effects: {}, next: "ch-trans-3", nextIn: 3 }],
        failure: [{ text: "You find a gear that makes it worse.", effects: { van: -15 }, next: "ch-trans-3", nextIn: 3 }] }
    ]
  },
  {
    id: "ch-trans-3", title: "The Junkyard", where: "chain", tags: ["quest", "vehicle"], conditions: { flags: ["trans"] },
    text: "A junkyard with a van exactly like yours: same year, same color, same dent on the same door. The owner says you can have its transmission if you can get it out yourself.",
    choices: [
      { label: "Pull the transmission", check: { skill: "mechanical", difficulty: "medium" },
        success: [{ text: "{skilled} spends a day under two vans and comes out a legend. The van shifts like it's new.", effects: { delay: 1, van: 40, morale: 12 }, clearFlags: ["trans"], setFlags: ["trans-done"] }],
        failure: [{ text: "You get the wrong transmission out of the wrong van, which takes a full day. The owner sells you his for $120 out of pity.", effects: { delay: 1, money: -120, van: 30 }, clearFlags: ["trans"], setFlags: ["trans-done"] }] },
      { label: "Pay the owner to do it", cost: { money: 150 }, outcomes: [{ text: "He does it in four hours, whistling. It's perfect.", effects: { van: 40 }, clearFlags: ["trans"], setFlags: ["trans-done"] }] }
    ]
  }
];
