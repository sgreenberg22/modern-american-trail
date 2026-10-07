import type { GameEvent } from "../../types";

// Batch 1: checkpoints. The regime's front door: paperwork, loyalty, sponsorship.
export const CHECKPOINT_EVENTS: GameEvent[] = [
  {
    id: "cp-anthem", title: "Anthem Requirement", where: "road", tags: ["checkpoint", "danger"],
    text: "The guard at {stop} wants the national anthem sung in full, by everyone, in harmony. There's a judge. The judge has a scorecard.",
    choices: [
      { label: "Sing it straight",
        outcomes: [
          { weight: 2, text: "You hit the high note. The judge gives you a 6.2 and waves you through.", effects: { morale: -5 } },
          { weight: 1, text: "{member} goes for the high note and misses it by a state line. Re-sing fee.", effects: { money: -60, morale: -10 } }
        ] },
      { label: "Let your best singer carry it", check: { skill: "persuasion", difficulty: "medium" },
        success: [{ text: "{skilled} sings with such conviction the judge stands up. You get a 9.8 and a coupon.", effects: { morale: 10, money: 20 } }],
        failure: [{ text: "{skilled} adds a key change. Key changes are considered \"showboating.\"", effects: { money: -80, heat: 10 } }] },
      { label: "Hum, convincingly", check: { skill: "stealth", difficulty: "easy" },
        success: [{ text: "Nobody notices you're humming. Patriotism is mostly volume.", effects: {} }],
        failure: [{ text: "The judge has a microphone pointed at your mouth specifically.", effects: { money: -50, heat: 10 } }] }
    ]
  },
  {
    id: "cp-vibe", title: "Vibe Check", where: "road", tags: ["checkpoint", "danger"],
    text: "{stop} has replaced its document check with a vibe check. A man in a reflective vest looks at each of you for a long time and makes notes.",
    choices: [
      { label: "Project normal energy",
        outcomes: [
          { weight: 2, text: "Your vibe is \"acceptable.\" He seems disappointed.", effects: {} },
          { weight: 1, text: "Your vibe is \"coastal.\" He adds a surcharge.", effects: { money: -45, heat: 10 } }
        ] },
      { label: "Talk sports", check: { skill: "persuasion", difficulty: "easy", faction: "militia" },
        success: [{ text: "{skilled} has an opinion about a quarterback. It's the correct opinion. Vibe: immaculate.", effects: { morale: 6, rep: { militia: 5 } } }],
        failure: [{ text: "{skilled} confuses two sports. The man writes for a long time.", effects: { heat: 15 } }] },
      { label: "Flash the clipboard back at him", requires: { item: "clipboard" },
        outcomes: [{ text: "Two clipboards meet. He nods, professionally, and waves you through. Clipboard people understand each other.", effects: { heat: -10 } }] }
    ]
  },
  {
    id: "cp-flag-size", title: "Flag Size Inspection", where: "road", tags: ["checkpoint"],
    text: "At {stop}, every vehicle must display a flag \"proportional to its patriotism.\" They measure the van. They measure the flag you don't have.",
    choices: [
      { label: "Buy a regulation flag", cost: { money: 35 },
        outcomes: [{ text: "The flag is eight feet wide. It covers the rear window. You now drive by faith.", effects: { heat: -5 } }] },
      { label: "Argue that the van itself is patriotic", check: { skill: "negotiation", difficulty: "medium" },
        success: [{ text: "{skilled} points out the van is American-made, mostly, and the dents are from freedom. It's accepted.", effects: { morale: 6 } }],
        failure: [{ text: "The inspector notes the van was assembled in Ontario. That's a whole other form.", effects: { money: -60, delay: 1 } }] },
      { label: "Take the fine", outcomes: [{ text: "Forty dollars and a citation for \"insufficient waving.\"", effects: { money: -40 } }] }
    ]
  },
  {
    id: "cp-points", title: "Loyalty Points", where: "road", tags: ["checkpoint"],
    text: "The kiosk at {stop} offers loyalty points for every checkpoint you pass without incident. Ten punches gets you a free pass, a commemorative card, and your name in a database.",
    choices: [
      { label: "Sign up for the card",
        outcomes: [
          { weight: 2, text: "You give a fake name. The card arrives already half-punched, which is suspicious and also convenient.", effects: { heat: 5, items: { "loyalty-card": 1 } } },
          { weight: 1, text: "You give a fake name. The system recognizes the fake name. It's been used before, by you, last week.", effects: { heat: 15 } }
        ] },
      { label: "Decline politely", outcomes: [{ text: "The attendant says \"your loss\" in a tone that means it." }] }
    ]
  },
  {
    id: "cp-loyalty-card", title: "Card Accepted", where: "road", tags: ["checkpoint"], weight: 2, conditions: { item: "loyalty-card" },
    text: "The guard at {stop} scans your fully punched loyalty card. A tiny jingle plays. He looks like he'd like to arrest you anyway.",
    choices: [
      { label: "Redeem it", outcomes: [{ text: "Free pass. The guard has to salute. He does it like it costs him money.", effects: { heat: -20, items: { "loyalty-card": -1 } } }] },
      { label: "Save it for later", outcomes: [{ text: "You pay the toll and keep the card. A pass this good is for a worse day.", effects: { money: -30 } }] }
    ]
  },
  {
    id: "cp-prayer-weigh", title: "Mandatory Prayer Weigh Station", where: "road", regions: ["south", "midwest", "plains"], tags: ["checkpoint", "danger"],
    text: "Trucks get weighed. Passenger vans get prayed over, and the prayer gets weighed. A deacon with a scale explains that light prayers pay a surcharge.",
    choices: [
      { label: "Pray heavily", check: { skill: "persuasion", difficulty: "medium", faction: "faithful" },
        success: [{ text: "{skilled} delivers a prayer so dense the scale tips. The deacon is moved and slightly alarmed.", effects: { rep: { faithful: 8 }, morale: 4 } }],
        failure: [{ text: "Your prayer weighs about as much as a receipt. Surcharge.", effects: { money: -70 } }] },
      { label: "Pay the light-prayer surcharge", cost: { money: 40 },
        outcomes: [{ text: "The deacon blesses your receipt. It's laminated.", effects: {} }] },
      { label: "Ask what the scale is calibrated to",
        outcomes: [{ text: "He doesn't know. Nobody's ever asked. He calls a supervisor, who also doesn't know, and you wait two hours while they find out.", effects: { delay: 1, heat: 5 } }] }
    ]
  },
  {
    id: "cp-forms", title: "Form 27-B (Travel Intent)", where: "road", tags: ["checkpoint"],
    text: "Before {stop} lets you pass, you must fill out Form 27-B: Statement of Travel Intent. Question 14 asks you to \"describe your feelings about the destination.\"",
    choices: [
      { label: "Write \"neutral\"", outcomes: [{ text: "Approved. Neutral is the safest feeling. It's printed on the back of the form as an example.", effects: { morale: -4 } }] },
      { label: "Get it notarized", requires: { item: "notary-stamp" },
        outcomes: [{ text: "You stamp your own form. The clerk has never seen a notarized 27-B. He's so impressed he skips questions 15 through 40.", effects: { heat: -10, morale: 6 } }] },
      { label: "Fill it out creatively", check: { skill: "negotiation", difficulty: "hard" },
        success: [{ text: "{skilled} answers every question with a citation. The clerk files it under \"too much\" and lets you through.", effects: { morale: 8 } }],
        failure: [{ text: "Your creativity is noted. In three places. In red.", effects: { heat: 20, delay: 1 } }] }
    ]
  },
  {
    id: "cp-sponsored", title: "This Checkpoint Brought to You By", where: "road", tags: ["checkpoint"],
    text: "{stop} is sponsored by a regional mattress chain. Before you can pass, you must watch a 90-second ad and answer a question about it.",
    choices: [
      { label: "Watch carefully",
        outcomes: [
          { weight: 3, text: "Q: \"What is the mattress made of?\" A: \"Freedom foam.\" Correct. You're through, and slightly sleepy.", effects: { morale: -3 } },
          { weight: 1, text: "Q: \"How many springs?\" Nobody knows. Watch it again.", effects: { delay: 1, morale: -6 } }
        ] },
      { label: "Hack the ad screen", requires: { skill: "hacking" }, check: { skill: "hacking", difficulty: "medium" },
        success: [{ text: "{skilled} swaps the ad for a public-health video about sleep hygiene. The guard watches it all. He seems rested.", effects: { morale: 10, heat: 5 } }],
        failure: [{ text: "The screen now plays the mattress ad at full volume on a loop. Everyone at the checkpoint turns to look at you.", effects: { heat: 20 } }] }
    ]
  },
  {
    id: "cp-bootstrap", title: "Bootstrap Inspection", where: "road", tags: ["checkpoint", "danger"],
    text: "An inspector at {stop} asks to see your bootstraps. He means it literally. He has a gauge.",
    choices: [
      { label: "Show your shoes",
        outcomes: [
          { weight: 1, text: "Two of you are wearing slip-ons. \"Explains a lot,\" he says, writing.", effects: { money: -40, morale: -6 } },
          { weight: 1, text: "{member}'s hiking boots pass. The rest of you are \"under review.\"", effects: { heat: 5 } }
        ] },
      { label: "Tell him your bootstraps are in the shop", check: { skill: "intimidation", difficulty: "medium" },
        success: [{ text: "{skilled} says it with such authority he apologizes for asking.", effects: {} }],
        failure: [{ text: "He offers to sell you bootstraps. They're $90. They're shoelaces.", effects: { money: -90 } }] }
    ]
  },
  {
    id: "cp-snitch-line", title: "See Something, Say Something", where: "road", tags: ["checkpoint", "heat"],
    text: "A billboard at {stop}: REPORT SUSPICIOUS TRAVELERS — $200 REWARD. Underneath, a family in a minivan is clearly composing a report about you.",
    choices: [
      { label: "Report them first", check: { skill: "persuasion", difficulty: "medium" },
        success: [{ text: "{skilled} files a detailed report about their suspicious minivan. They're pulled over. You aren't. Nobody feels good about it.", effects: { heat: -10, morale: -8, money: 60 } }],
        failure: [{ text: "Your report is so detailed it becomes evidence against you.", effects: { heat: 25 } }] },
      { label: "Wave at them warmly",
        outcomes: [
          { weight: 1, text: "The kids wave back. The parents put the phone down. Small victories.", effects: { morale: 6 } },
          { weight: 1, text: "The wave is interpreted as gang activity.", effects: { heat: 20 } }
        ] },
      { label: "Leave fast", outcomes: [{ text: "You pull out before they finish typing.", effects: { heat: 5 } }] }
    ]
  },
  {
    id: "cp-detention-annex", title: "Overflow Parking", where: "road", tags: ["checkpoint", "danger"],
    text: "The Detention Center Annex at {stop} has run out of room, so it's detaining people in the parking lot. A guard points you toward a space marked \"COMPACT DETAINEES.\"",
    choices: [
      { label: "Park and wait to be processed",
        outcomes: [{ text: "Processing takes a day. You're released for \"insufficient criminality.\"", effects: { delay: 1, morale: -10 } }] },
      { label: "Slip out the exit lane", check: { skill: "stealth", difficulty: "medium" },
        success: [{ text: "The exit lane is unguarded because nobody's ever tried it. Now someone has.", effects: { heat: 10, morale: 5 } }],
        failure: [{ text: "The exit lane has a spike strip. The spike strip has opinions.", effects: { van: -20, heat: 20 } }] },
      { label: "Hand the guard a carton of cigarettes", requires: { item: "cigarettes" },
        outcomes: [{ text: "He pockets them and waves you into the exit lane, which apparently has a cover charge.", effects: { items: { cigarettes: -1 }, heat: -5 } }] }
    ]
  },
  {
    id: "cp-press", title: "Media Check", where: "road", tags: ["checkpoint"],
    text: "\"Any journalists?\" asks the guard at {stop}. He has a list of approved outlets. It has two entries, and one is a podcast.",
    choices: [
      { label: "Show the press badge", requires: { item: "press-badge" },
        outcomes: [{ text: "The guard has never heard of the paper on your badge, so he assumes it's important. Saluted through.", effects: { morale: 8 } }] },
      { label: "Say nobody here reads", outcomes: [{ text: "He believes you immediately, which hurts.", effects: { morale: -6 } }] },
      { label: "Say you're with the podcast", check: { skill: "persuasion", difficulty: "hard" },
        success: [{ text: "{skilled} does the voice. He asks for an autograph and a shout-out.", effects: { morale: 12 } }],
        failure: [{ text: "He calls the podcast to check. The podcast picks up.", effects: { heat: 25, money: -50 } }] }
    ]
  },
  {
    id: "cp-plates", title: "Plate Reader", where: "road", tags: ["checkpoint", "heat"], conditions: { minHeat: 25 },
    text: "Cameras at {stop} read every plate. A screen above the lane shows each one with a green check or a red X. Yours is loading.",
    choices: [
      { label: "Sit tight", outcomes: [
        { weight: 1, text: "Green check. The camera had a cache problem.", effects: {} },
        { weight: 1, text: "Red X. Then a second red X, for emphasis.", effects: { heat: 20 } }
      ] },
      { label: "You have fake plates on", requires: { item: "fake-plates" },
        outcomes: [{ text: "The screen shows a plate from a state that doesn't exist, then a green check. The system can't argue with what it can't find.", effects: { heat: -15 } }] },
      { label: "Jam the reader", requires: { skill: "hacking" }, check: { skill: "hacking", difficulty: "medium" },
        success: [{ text: "{skilled} feeds it a loop of the governor's plate. It salutes, electronically.", effects: { heat: -20 } }],
        failure: [{ text: "The reader crashes and reboots into a screen that says FLAGGED.", effects: { heat: 25 } }] }
    ]
  },
  {
    id: "cp-heritage-quiz", title: "Heritage Quiz", where: "road", regions: ["south", "east"], tags: ["checkpoint", "danger"],
    text: "{stop} requires a heritage quiz. Question one: \"Who won?\" The guard won't say which war.",
    choices: [
      { label: "Answer the question they want", outcomes: [{ text: "You say what he wants to hear. It costs you something that doesn't show up in any stat.", effects: { morale: -12 } }] },
      { label: "Answer the question correctly", check: { skill: "negotiation", difficulty: "hard", faction: "militia" },
        success: [{ text: "{skilled} gives a careful, historically accurate answer with such procedural calm that the guard decides it's above his pay grade.", effects: { morale: 10 } }],
        failure: [{ text: "Correct, and therefore wrong. Secondary inspection.", effects: { heat: 25, delay: 1 } }] },
      { label: "Ask to take it home and study", outcomes: [{ text: "He gives you a study guide and a 24-hour pass. The study guide is a placemat.", effects: { delay: 1 } }] }
    ]
  },
  {
    id: "cp-glovebox", title: "Glovebox Search", where: "road", tags: ["checkpoint", "danger"],
    text: "\"Mind if I look in the glovebox?\" asks the officer at {stop}, already looking in the glovebox.",
    choices: [
      { label: "Let him", outcomes: [
        { weight: 2, text: "Registration, napkins, a single sock. He's disappointed.", effects: {} },
        { weight: 1, text: "He finds a receipt from a feminist bookstore. That's a citation.", effects: { money: -60, heat: 10 } }
      ] },
      { label: "Cite the Fourth Amendment", check: { skill: "negotiation", difficulty: "medium" },
        success: [{ text: "{skilled} recites it from memory. He doesn't know what it is, but it sounds expensive to argue with.", effects: { morale: 8 } }],
        failure: [{ text: "He says the Fourth Amendment is \"under review\" in this county.", effects: { heat: 15, delay: 1 } }] },
      { label: "Point out the cameras recording him", requires: { skill: "intimidation" }, check: { skill: "intimidation", difficulty: "easy" },
        success: [{ text: "{skilled} nods at the dashcam. He closes the glovebox like it's hot.", effects: { heat: -5 } }],
        failure: [{ text: "He points out that the cameras are his.", effects: { heat: 15 } }] }
    ]
  },
  {
    id: "cp-toll-tithe", title: "Freedom Toll", where: "road", tags: ["checkpoint"],
    text: "The Freedom Toll at {stop} costs $25. Paying in cash costs $40, \"to discourage untraceable freedom.\"",
    choices: [
      { label: "Pay by card", outcomes: [{ text: "$25. You're now in a database of people who paid the Freedom Toll. That one's large and mostly harmless.", effects: { money: -25, heat: 5 } }] },
      { label: "Pay cash", cost: { money: 40 }, outcomes: [{ text: "The attendant counts it twice, sighing at the untraceability.", effects: {} }] },
      { label: "Run the toll", check: { skill: "stealth", difficulty: "medium" },
        success: [{ text: "The gate arm was never actually connected to anything.", effects: { heat: 10 } }],
        failure: [{ text: "The gate arm was connected to a siren.", effects: { heat: 30, money: -50 } }] }
    ]
  },
  {
    id: "cp-dog", title: "The K-9 Unit", where: "road", tags: ["checkpoint", "danger"],
    text: "A German shepherd at {stop} circles the van, sits down by the back door, and looks at its handler with enormous significance.",
    choices: [
      { label: "Open up", outcomes: [
        { weight: 1, text: "The dog was alerting on a granola bar. It's given the granola bar. Everyone's happy except the granola bar.", effects: { food: -3 } },
        { weight: 1, text: "The dog was alerting on the Forbidden Books. Everyone's unhappy except the dog.", effects: { money: -80, heat: 15 } }
      ] },
      { label: "Make friends with the dog", check: { skill: "survival", difficulty: "medium" },
        success: [{ text: "{skilled} speaks fluent dog. The shepherd rolls over. The handler, betrayed, waves you on.", effects: { morale: 12 } }],
        failure: [{ text: "The dog likes you. The handler does not like that the dog likes you.", effects: { heat: 15 } }] },
      { label: "Toss it some gift shop jerky", requires: { item: "jerky" },
        outcomes: [{ text: "The jerky is shaped like Montana. The dog eats Montana and forgets what it was doing.", effects: { items: { jerky: -1 } } }] }
    ]
  },
  {
    id: "cp-curfew", title: "Curfew", where: "road", tags: ["checkpoint", "heat"],
    text: "You reach {stop} at 9:04 p.m. Curfew started at 9:00. The guard taps his watch with the satisfaction of a man who has been waiting all day.",
    choices: [
      { label: "Sleep in the impound lot", outcomes: [{ text: "The impound lot has better security than most motels. Everyone sleeps fine. Impound fee in the morning.", effects: { delay: 1, money: -40 } }] },
      { label: "Argue that your watches say 8:58", check: { skill: "negotiation", difficulty: "medium" },
        success: [{ text: "{skilled} produces three devices showing 8:58. The guard's watch is wrong. He's devastated, then lets you through.", effects: { morale: 8 } }],
        failure: [{ text: "He confiscates all three devices as evidence of \"time fraud.\"", effects: { heat: 20, money: -40 } }] }
    ]
  },
  {
    id: "cp-swear", title: "Oath of Normalcy", where: "road", tags: ["checkpoint"],
    text: "The Department of Normalcy annex at {stop} needs each of you to swear you are \"a normal amount of everything.\"",
    choices: [
      { label: "Swear it", outcomes: [{ text: "You all swear. Nobody can define normal, so nobody can be charged. It's the safest oath in the country.", effects: { morale: -3 } }] },
      { label: "Ask for a definition", check: { skill: "negotiation", difficulty: "easy" },
        success: [{ text: "{skilled} asks so politely that the clerk goes to find the definition. You leave while he's looking.", effects: { morale: 6 } }],
        failure: [{ text: "Asking for a definition is abnormal.", effects: { heat: 15 } }] }
    ]
  },
  {
    id: "cp-volunteer", title: "Volunteer Checkpoint", where: "road", regions: ["plains", "mountain", "midwest"], tags: ["checkpoint"],
    text: "{stop} is staffed by volunteers, retirees in vests. One is knitting. One is asleep. One is really, really into it.",
    choices: [
      { label: "Go to the knitter's lane", outcomes: [{ text: "She doesn't look up. \"Drive safe, hon.\" You do.", effects: { morale: 5 } }] },
      { label: "Go to the enthusiast's lane", outcomes: [
        { weight: 1, text: "Forty-five minutes of questions, two of which are about your star sign.", effects: { delay: 1, heat: 5 } },
        { weight: 1, text: "He's so excited to have someone to check that he forgets to check anything.", effects: { morale: 4 } }
      ] },
      { label: "Wake the sleeper and ask for directions", outcomes: [{ text: "He gives excellent directions to a back road \"the young fella on the end doesn't know about.\"", effects: { heat: -10, miles: 15 } }] }
    ]
  },
  {
    id: "cp-merch", title: "Gift Shop Exit", where: "road", tags: ["checkpoint"],
    text: "The only way out of {stop} is through the gift shop. You must buy something.",
    choices: [
      { label: "Buy the cheapest thing", cost: { money: 12 }, outcomes: [{ text: "Gift shop jerky, shaped like the state. Everyone eyes it, hungry and ashamed.", effects: { items: { jerky: 1 } } }] },
      { label: "Buy the box of hats", cost: { money: 15 }, outcomes: [{ text: "Twelve hats. You'll never wear them. Someone in a paradise will pay double, ironically.", effects: { items: { "regime-hats": 1 } } }] },
      { label: "Walk through very fast", check: { skill: "stealth", difficulty: "easy" },
        success: [{ text: "You're out before the cashier finishes saying \"welcome.\"", effects: {} }],
        failure: [{ text: "A greeter blocks the door. You buy a commemorative plate.", effects: { money: -25, items: { plate: 1 } } }] }
    ]
  },
  {
    id: "cp-tire-tax", title: "Out-of-State Tire Tax", where: "road", tags: ["checkpoint"],
    text: "{stop} charges a tax on \"imported rubber,\" meaning any tires bought outside the state. The inspector kicks each tire to determine its citizenship.",
    choices: [
      { label: "Pay the tax", outcomes: [{ text: "Four tires, four tax stamps. The stamps fall off in the first rain.", effects: { money: -60 } }] },
      { label: "Claim the tires are local", check: { skill: "mechanical", difficulty: "medium" },
        success: [{ text: "{skilled} reads the DOT code aloud and invents a plausible local factory. The inspector nods; he's heard of it, he thinks.", effects: {} }],
        failure: [{ text: "He knows every factory. There are two.", effects: { money: -90, heat: 10 } }] }
    ]
  },
  {
    id: "cp-quarantine", title: "Ideological Quarantine", where: "road", tags: ["checkpoint", "danger"], conditions: { minDay: 6 },
    text: "Travelers from paradise cities must quarantine at {stop} for \"ideological incubation.\" The quarantine room has a TV with one channel.",
    choices: [
      { label: "Do the quarantine", outcomes: [{ text: "Two days of the one channel. You come out knowing the governor's favorite sandwich.", effects: { delay: 2, morale: -12, heat: -15 } }] },
      { label: "Test negative", check: { skill: "medical", difficulty: "medium" },
        success: [{ text: "{skilled} administers a rigorous-looking test with a tongue depressor and a stern face. All negative for ideology.", effects: { heat: -5 } }],
        failure: [{ text: "The test detects \"trace empathy.\" One day minimum.", effects: { delay: 1, morale: -8 } }] },
      { label: "Leave through the back", check: { skill: "stealth", difficulty: "hard" },
        success: [{ text: "Out the loading dock while the guard watches the one channel.", effects: { heat: 15 } }],
        failure: [{ text: "The loading dock is the quarantine for people who leave through the loading dock.", effects: { delay: 2, heat: 25 } }] }
    ]
  },
  {
    id: "cp-radio", title: "Approved Frequencies", where: "road", tags: ["checkpoint"],
    text: "The guard at {stop} checks your radio presets. Approved stations only. Your presets include public radio, a jazz station, and something that's just weather.",
    choices: [
      { label: "Let him reset them", outcomes: [{ text: "All six presets are now the same talk show, recorded in 2011.", effects: { morale: -8 } }] },
      { label: "Show him the weather station is approved", check: { skill: "persuasion", difficulty: "easy" },
        success: [{ text: "{skilled} argues weather is nonpartisan. He grudgingly agrees, then checks the forecast himself.", effects: {} }],
        failure: [{ text: "He finds the jazz station. Jazz is \"under review.\"", effects: { money: -35 } }] },
      { label: "Hand over the ham radio", requires: { item: "ham-radio" }, outcomes: [{ text: "He's fascinated. He spends twenty minutes talking to the poetry guy in Nebraska and forgets about your presets entirely.", effects: { morale: 8 } }] }
    ]
  },
  {
    id: "cp-bridge", title: "Bridge Allegiance", where: "road", tags: ["checkpoint", "danger"],
    text: "The bridge at {stop} is closed to anyone who hasn't pledged allegiance to the bridge. It's a nice bridge. It has a plaque.",
    choices: [
      { label: "Pledge to the bridge", outcomes: [{ text: "\"I pledge allegiance to the bridge, and to the river which it spans.\" The guard is moved. You're across.", effects: { morale: -4 } }] },
      { label: "Ford the river instead", check: { skill: "survival", difficulty: "medium" },
        success: [{ text: "{skilled} finds a shallow crossing. The bridge watches you go, betrayed.", effects: { van: -5 } }],
        failure: [{ text: "The river is not shallow.", effects: { van: -20, food: -10, delay: 1 } }] }
    ]
  }
];
