import type { GameEvent } from "../../types";

// Batch 6: the van, gas, camping, weather and health.
export const ROAD_EVENTS: GameEvent[] = [
  {
    id: "rd-flat", title: "Flat Tire", where: "road", tags: ["vehicle"],
    text: "A sound like a sad trombone, then a lean to the right. The rear tire has given up. It's not angry, just disappointed.",
    choices: [
      { label: "Patch it", cost: { items: { "tire-patch": 1 } }, outcomes: [{ text: "Twenty minutes and a bit of swearing. Good as new, nearly.", effects: { van: 5 } }] },
      { label: "Change it", check: { skill: "mechanical", difficulty: "easy" },
        success: [{ text: "{skilled} changes it in eleven minutes, a personal best.", effects: {} }],
        failure: [{ text: "The lug nuts were put on by a giant. It takes most of the afternoon.", effects: { miles: -40, morale: -5 } }] },
      { label: "Drive on the rim to the next town", outcomes: [{ text: "Sparks, noise, a tow-truck driver laughing at you. New tire, new rim.", effects: { money: -90, van: -10 } }] }
    ]
  },
  {
    id: "rd-dead-battery", title: "Dead Battery", where: "road", tags: ["vehicle"],
    text: "Somebody left the dome light on. The van turns over with the enthusiasm of a teenager on a Monday, which is to say, not at all.",
    choices: [
      { label: "Flag down a jump", outcomes: [
        { weight: 2, text: "A man in a pickup jumps you without a word, waves off your thanks, and drives away. Good people exist.", effects: { morale: 6 } },
        { weight: 1, text: "A man in a pickup jumps you, then asks where you're from, then asks again, more slowly.", effects: { heat: 10 } }
      ] },
      { label: "Rig something from the batteries", cost: { items: { batteries: 1 } }, check: { skill: "mechanical", difficulty: "medium" },
        success: [{ text: "{skilled} wires twenty D-cells into something deeply illegal. It works.", effects: { morale: 8 } }],
        failure: [{ text: "Sparks. Smoke. Then a jump from a stranger anyway.", effects: { van: -5 } }] },
      { label: "Push-start it downhill", outcomes: [{ text: "Everyone pushes. The van starts. Nobody had a plan for getting back in.", effects: { health: -4, morale: 4 } }] }
    ]
  },
  {
    id: "rd-overheat", title: "Overheating", where: "road", tags: ["vehicle"], conditions: { maxVan: 70 },
    text: "Steam from the hood, a smell like burnt maple, and a needle in the red. The van would like to stop now.",
    choices: [
      { label: "Top up the coolant", cost: { items: { coolant: 1 } }, outcomes: [{ text: "The needle drops. The van sighs. You all sigh with it.", effects: { van: 8 } }] },
      { label: "Let it cool and hope", outcomes: [{ text: "An hour on the shoulder. It runs. It's not happy about it.", effects: { miles: -30, van: -8 } }] },
      { label: "Find the leak", check: { skill: "mechanical", difficulty: "medium" },
        success: [{ text: "{skilled} finds a split hose and fixes it with duct tape and stubbornness.", effects: { van: 10 } }],
        failure: [{ text: "You find three leaks. You fix one.", effects: { van: -12 } }] }
    ]
  },
  {
    id: "rd-locked-out", title: "Keys in the Van", where: "road", tags: ["vehicle"],
    text: "Gas station. Doors locked. Keys on the dashboard, glinting with something like contempt.",
    choices: [
      { label: "Pick the lock", requires: { item: "lockpicks" }, outcomes: [{ text: "Thirty seconds with the lockpicks. The cashier watches you break into your own van and says nothing.", effects: {} }] },
      { label: "Slim-jim it", check: { skill: "stealth", difficulty: "medium" },
        success: [{ text: "{skilled} does it with a coat hanger in under a minute. Nobody asks how they know.", effects: {} }],
        failure: [{ text: "A deputy watches you try. He opens it for you. Then he runs your plates.", effects: { heat: 20 } }] },
      { label: "Call a locksmith", cost: { money: 70 }, outcomes: [{ text: "The locksmith takes two hours and two minutes, respectively.", effects: { miles: -20 } }] }
    ]
  },
  {
    id: "rd-check-light", title: "Check Patriotism Light", where: "road", tags: ["vehicle", "heat"],
    text: "A new light comes on on the dashboard: CHECK PATRIOTISM. Nobody knew the van had that. It's been retrofitted by a state law nobody read.",
    choices: [
      { label: "Ignore it", outcomes: [
        { weight: 2, text: "It blinks for a hundred miles, then gives up.", effects: {} },
        { weight: 1, text: "It's networked. A trooper is waiting at the next exit.", effects: { heat: 20 } }
      ] },
      { label: "Disconnect it", check: { skill: "hacking", difficulty: "easy" },
        success: [{ text: "{skilled} pulls the fuse. The light goes dark. So does the check-engine light, which is fine.", effects: { heat: -5 } }],
        failure: [{ text: "You disconnect the headlights instead.", effects: { van: -5, miles: -20 } }] },
      { label: "Put a flag sticker over it", outcomes: [{ text: "Technically, now the patriotism is covered.", effects: { morale: 4 } }] }
    ]
  },
  {
    id: "rd-pothole", title: "Pothole", where: "road", tags: ["vehicle"],
    text: "A pothole so big it has a sign: STATE HISTORIC POTHOLE — EST. 2016. It's in your lane. It's in every lane.",
    choices: [
      { label: "Slow down and take it", outcomes: [{ text: "Bang. Everything in the back rearranges itself.", effects: { van: -8 } }] },
      { label: "Swerve onto the shoulder", check: { skill: "mechanical", difficulty: "easy" },
        success: [{ text: "Clean miss. The pothole is denied another victim.", effects: {} }],
        failure: [{ text: "The shoulder has its own pothole. It's a sequel.", effects: { van: -15 } }] }
    ]
  },
  {
    id: "rd-campground", title: "Patriot Campground", where: "road", tags: ["camp"],
    text: "The only campground for fifty miles requires guests to sign the Camper's Pledge, which includes a promise to \"maintain traditional campfire values.\"",
    choices: [
      { label: "Sign and camp", cost: { money: 15 }, outcomes: [{ text: "Nobody knows what traditional campfire values are. You make s'mores. Seems right.", effects: { health: 4, morale: 8 } }] },
      { label: "Camp in the woods instead", check: { skill: "survival", difficulty: "easy" },
        success: [{ text: "{skilled} finds a flat clearing by a creek. Free and perfect.", effects: { health: 4, morale: 10 } }],
        failure: [{ text: "The clearing is someone's yard. Someone with a dog.", effects: { morale: -6, heat: 10 } }] },
      { label: "Sleep in the van", outcomes: [{ text: "Everybody's knees end up somewhere they shouldn't. It's fine.", effects: { morale: -3 } }] }
    ]
  },
  {
    id: "rd-raccoons", title: "Raccoons", where: "road", tags: ["camp", "food"],
    text: "In the night, a gang of raccoons gets into the food bag. They're very organized. One of them seems to be in charge.",
    choices: [
      { label: "Chase them off", check: { skill: "intimidation", difficulty: "easy" },
        success: [{ text: "{skilled} yells something terrifying. The lead raccoon calls a retreat.", effects: { food: -4 } }],
        failure: [{ text: "The raccoons do not respect you. They take what they want.", effects: { food: -15 } }] },
      { label: "Negotiate", outcomes: [{ text: "You throw them the stale crackers. They accept. Diplomacy works sometimes.", effects: { food: -6, morale: 6 } }] }
    ]
  },
  {
    id: "rd-stars", title: "Dark Sky", where: "road", tags: ["camp"], weight: 0.6,
    text: "Out here, there's no light pollution. The Milky Way spills across the whole sky. {member} lies on the van roof and doesn't say anything for an hour.",
    choices: [
      { label: "Everybody up on the roof", outcomes: [{ text: "Four people on a van roof, under everything. The regime feels very small from here.", effects: { morale: 15, van: -3 } }] },
      { label: "Get some sleep", outcomes: [{ text: "Practical. You all sleep well.", effects: { health: 4 } }] }
    ]
  },
  {
    id: "rd-tent-flood", title: "Flash Flood", where: "road", tags: ["camp", "weather", "danger"], conditions: { weather: ["rain", "storm"] },
    text: "You camp by a creek. At 3 a.m. the creek camps by you.",
    choices: [
      { label: "Grab everything and run", outcomes: [{ text: "You save most of the food and all of the people. The tent is now in a different county.", effects: { food: -10, morale: -8 } }] },
      { label: "Move to high ground fast", check: { skill: "survival", difficulty: "medium" },
        success: [{ text: "{skilled} was already awake and already moving. Everything's fine except your socks.", effects: { morale: -2 } }],
        failure: [{ text: "Everyone's soaked. {member} catches a chill that sticks.", effects: { food: -8, healthOne: -12, condition: "sick" } }] }
    ]
  },
  {
    id: "rd-sunstroke", title: "Too Much Sun", where: "road", tags: ["health", "weather"], conditions: { weather: ["heat"] },
    text: "The van's AC broke two states ago. {member} has gone very quiet and very red and is drinking the windshield fluid, metaphorically.",
    choices: [
      { label: "Stop and cool down", outcomes: [{ text: "A gas station freezer aisle, an hour, and a lot of popsicles. {member} recovers.", effects: { miles: -30, money: -10, healthOne: 5 } }] },
      { label: "Treat for heatstroke", check: { skill: "medical", difficulty: "easy" },
        success: [{ text: "{skilled} handles it: shade, water, salt, cold towels on the neck.", effects: { healthOne: 5 } }],
        failure: [{ text: "Cool towels help, but it'll be a rough day.", effects: { healthOne: -15, condition: "exhausted" } }] },
      { label: "Push on", outcomes: [{ text: "{member} survives the afternoon. Barely.", effects: { healthOne: -22, condition: "exhausted" } }] }
    ]
  },
  {
    id: "rd-ticks", title: "Ticks", where: "road", tags: ["health"], conditions: { seasons: ["spring", "summer"] },
    text: "After a hike, {member} finds a tick. Then another. Then they stop counting, which is the scariest part.",
    choices: [
      { label: "Do a full tick check", check: { skill: "medical", difficulty: "easy" },
        success: [{ text: "{skilled} gets every one, with tweezers and grim professionalism.", effects: {} }],
        failure: [{ text: "You miss one. A week later, {member} has a fever and a rash.", effects: { healthOne: -15, condition: "sick" } }] },
      { label: "Hope for the best", outcomes: [
        { weight: 1, text: "Nothing happens. You check again anyway, at night, with a flashlight.", effects: { morale: -3 } },
        { weight: 1, text: "{member} gets a fever.", effects: { healthOne: -15, condition: "sick" } }
      ] }
    ]
  },
  {
    id: "rd-back", title: "Van Back", where: "road", tags: ["health"], conditions: { minDay: 8 },
    text: "{member} has developed what they're calling \"van back.\" They walk like a question mark and describe the pain in terms of the regime.",
    choices: [
      { label: "Rest for a day", outcomes: [{ text: "A day of lying flat on a motel floor. {member} straightens out, mostly.", effects: { delay: 1, healthOne: 10, cure: "exhausted" } }] },
      { label: "Take painkillers", cost: { items: { painkillers: 1 } }, outcomes: [{ text: "Two pills. {member} is a person again.", effects: { healthOne: 12 } }] },
      { label: "Tough it out", outcomes: [{ text: "{member} rides in the back, on the cooler, sideways.", effects: { healthOne: -8, condition: "exhausted" } }] }
    ]
  },
  {
    id: "rd-tooth", title: "Toothache", where: "road", tags: ["health", "money"],
    text: "{member} cracked a molar on gas station beef jerky shaped like a state. The pain is architectural.",
    choices: [
      { label: "Find a dentist", cost: { money: 120 }, outcomes: [{ text: "The dentist is a cheerful man who asks no questions and plays smooth jazz, which may or may not be legal here.", effects: { healthOne: 10 } }] },
      { label: "Pull it yourselves", check: { skill: "medical", difficulty: "hard" },
        success: [{ text: "{skilled} does it with pliers, bourbon and real competence. {member} will never forgive anyone.", effects: { healthOne: -5, morale: -6 } }],
        failure: [{ text: "It's a bad afternoon. It's a bad week.", effects: { healthOne: -20, condition: "sick" } }] },
      { label: "Clove oil and denial", outcomes: [{ text: "It's still there. It'll be there until Vermont.", effects: { healthOne: -10, morale: -6 } }] }
    ]
  },
  {
    id: "rd-burrito", title: "Gas Station Burrito", where: "road", tags: ["health", "food"], conditions: { minDay: 4 },
    text: "{member} ate a burrito from a gas station heat lamp. The burrito had been there since the last administration.",
    choices: [
      { label: "Treat it", requires: { skill: "medical" }, outcomes: [{ text: "{skilled} prescribes fluids, crackers and a long silence. It works.", effects: { healthOne: -6 } }] },
      { label: "Ride it out", outcomes: [{ text: "Every rest area for two hundred miles knows {member} by name.", effects: { healthOne: -18, condition: "sick", miles: -20 } }] }
    ]
  },
  {
    id: "rd-hail", title: "Hail", where: "road", tags: ["weather", "danger", "vehicle"], conditions: { weather: ["storm"] },
    text: "Hail the size of golf balls, then hail the size of the golf balls' parents. It sounds like the van is being applauded by an angry crowd.",
    choices: [
      { label: "Get under an overpass", outcomes: [
        { weight: 2, text: "You wait it out with eleven other cars. Someone shares a thermos.", effects: { miles: -20, morale: 4 } },
        { weight: 1, text: "The overpass is full. You get the edge. The windshield gets a spiderweb.", effects: { van: -15 } }
      ] },
      { label: "Keep driving", outcomes: [{ text: "The van looks like a golf ball now.", effects: { van: -25, morale: -6 } }] }
    ]
  },
  {
    id: "rd-dust-storm", title: "Dust Storm", where: "road", regions: ["plains", "mountain"], tags: ["weather", "danger"],
    text: "A brown wall rolls across the plains toward the highway. The radio calls it \"a tremendous display of soil.\"",
    choices: [
      { label: "Pull off, lights off, wait", outcomes: [{ text: "The standard advice. An hour in a brown nothing, then the sky comes back.", effects: { miles: -30 } }] },
      { label: "Drive through it", outcomes: [
        { weight: 1, text: "You make it through by following the taillights ahead, which turn out to belong to a tractor.", effects: { miles: -10, van: -8 } },
        { weight: 1, text: "Zero visibility. You hit a mailbox, a fence, and a sign that said SLOW.", effects: { van: -22, money: -40 } }
      ] }
    ]
  },
  {
    id: "rd-black-ice", title: "Black Ice", where: "road", tags: ["weather", "danger", "vehicle"], conditions: { seasons: ["winter", "fall"], weather: ["snow", "clear", "fog"] },
    text: "A bridge at dawn. The road looks dry. It isn't. The van starts drifting with the slow grace of a parade float.",
    choices: [
      { label: "Steer into it", check: { skill: "mechanical", difficulty: "medium" },
        success: [{ text: "{skilled} steers into the skid like a stunt driver. You straighten out. Everybody exhales.", effects: { morale: 4 } }],
        failure: [{ text: "You end up facing backward on the shoulder, alive and in a ditch.", effects: { van: -20, health: -6, delay: 1 } }] },
      { label: "Brake", outcomes: [{ text: "Brakes don't work on ice. Everyone learns this together.", effects: { van: -25, health: -8 } }] }
    ]
  },
  {
    id: "rd-rainbow", title: "Double Rainbow", where: "road", tags: ["weather"], weight: 0.6, conditions: { weather: ["rain"] },
    text: "The rain stops all at once and a double rainbow arcs over the highway. A billboard underneath it reads RAINBOWS ARE A CHOICE.",
    choices: [
      { label: "Pull over and look", outcomes: [{ text: "Everyone gets out. It's the most beautiful thing you've seen this trip, and the billboard makes it funnier.", effects: { morale: 14 } }] },
      { label: "Keep driving", outcomes: [{ text: "It's in the mirror for ten minutes.", effects: { morale: 5 } }] }
    ]
  },
  {
    id: "rd-siphoned", title: "Siphoned", where: "road", tags: ["fuel"], conditions: { minDay: 3 },
    text: "In the morning, the gas cap is off and there's a rubber hose on the ground. Somebody had a worse week than you.",
    choices: [
      { label: "Check how bad", outcomes: [{ text: "About six gallons gone. The hose is good quality, at least.", effects: { fuel: -6 } }] },
      { label: "Follow the drips", check: { skill: "survival", difficulty: "medium" },
        success: [{ text: "{skilled} follows the trail to a teenager with two jerry cans. He gives it back, and apologizes, and asks if you need help with anything.", effects: { morale: 6 } }],
        failure: [{ text: "The trail ends at a highway. Whoever it was, they're long gone.", effects: { fuel: -6 } }] }
    ]
  },
  {
    id: "rd-free-gas", title: "Patriot Pump Day", where: "road", tags: ["fuel"],
    text: "A gas station is giving away free gas for \"Patriot Pump Day.\" To qualify you must honk the national anthem on your horn.",
    choices: [
      { label: "Honk the anthem", check: { skill: "persuasion", difficulty: "medium" },
        success: [{ text: "{skilled} honks it note-perfect. A crowd applauds. Free fill-up.", effects: { fuel: 12, morale: 4 } }],
        failure: [{ text: "Your horn only has one note. The attendant gives you two gallons out of pity.", effects: { fuel: 2, morale: -4 } }] },
      { label: "Pay for gas like a normal person", cost: { money: 30 }, outcomes: [{ text: "The attendant says \"your choice\" like it's a diagnosis.", effects: { fuel: 9 } }] },
      { label: "Skip it", outcomes: [{ text: "You drive away to the sound of someone honking the anthem badly." }] }
    ]
  },
  {
    id: "rd-gps", title: "Recalculating", where: "road", tags: ["vehicle"],
    text: "The GPS, updated last night with a mandatory patch, now routes everything through the \"Scenic Loyalty Corridor,\" a highway lined with motivational billboards.",
    choices: [
      { label: "Follow it", outcomes: [{ text: "Two hundred miles of billboards about grit, freedom and a mattress sale. Everybody's morale takes damage.", effects: { morale: -10, miles: -10 } }] },
      { label: "Use paper maps", requires: { item: "topo-maps" }, outcomes: [{ text: "Old maps, old roads, no billboards. Faster, even.", effects: { miles: 20, morale: 6 } }] },
      { label: "Roll back the patch", check: { skill: "hacking", difficulty: "easy" },
        success: [{ text: "{skilled} rolls it back. The GPS returns to its usual low-key incompetence.", effects: {} }],
        failure: [{ text: "Now it only speaks in the governor's voice.", effects: { morale: -12 } }] }
    ]
  },
  {
    id: "rd-scanner", title: "Police Scanner", where: "road", tags: ["heat", "vehicle"],
    text: "The van's ancient radio, bumped on a pothole, starts picking up the county police scanner. They're talking about a van. They're not sure which one.",
    choices: [
      { label: "Listen and plan", check: { skill: "survival", difficulty: "easy" },
        success: [{ text: "{skilled} maps every unit they mention. You route around all of them.", effects: { heat: -15 } }],
        failure: [{ text: "You learn a lot about the sheriff's lunch plans and nothing useful.", effects: {} }] },
      { label: "Turn it off", outcomes: [{ text: "Ignorance is bliss, briefly.", effects: {} }] }
    ]
  },
  {
    id: "rd-windshield", title: "Rock Chip", where: "road", tags: ["vehicle"],
    text: "A gravel truck flings a rock. A star appears on the windshield, then a crack, then the crack starts growing like it has somewhere to be.",
    choices: [
      { label: "Fix it at a glass shop", cost: { money: 60 }, outcomes: [{ text: "A tech in a FREEDOM GLASS polo fills it with resin. It holds.", effects: { van: 5 } }] },
      { label: "Ignore it", outcomes: [{ text: "By the next state it's crossed the whole windshield. You can see two of everything.", effects: { van: -10, morale: -4 } }] }
    ]
  },
  {
    id: "rd-laundromat", title: "Laundromat", where: "road", tags: ["health", "people"],
    text: "A laundromat with a hand-lettered sign: QUARTERS ONLY, NO POLITICS. Everyone's clothes have achieved a smell that has its own weather.",
    choices: [
      { label: "Do the laundry", cost: { money: 12 }, outcomes: [{ text: "Clean socks. Clean everything. The woman folding next to you has a paradise bumper sticker on her laundry basket.", effects: { morale: 12, health: 3 } }] },
      { label: "Skip it", outcomes: [{ text: "You drive with the windows down for the next three states.", effects: { morale: -4 } }] }
    ]
  },
  {
    id: "rd-bedbugs", title: "The Motel", where: "road", tags: ["health"],
    text: "A motel with a $29 room and a sign promising FREE HBO (1997). In the morning, everyone has bites in a perfect line.",
    choices: [
      { label: "Complain to the desk", check: { skill: "negotiation", difficulty: "easy" },
        success: [{ text: "{skilled} gets a full refund and a coupon for a waffle. The waffle is excellent.", effects: { money: 29, morale: 4 } }],
        failure: [{ text: "The desk clerk says the bugs are \"part of the historic charm.\"", effects: { morale: -6 } }] },
      { label: "Just leave", outcomes: [{ text: "You scratch for two hundred miles.", effects: { morale: -8, health: -3 } }] }
    ]
  }
];
