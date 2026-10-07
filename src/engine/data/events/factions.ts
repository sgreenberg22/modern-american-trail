import type { GameEvent } from "../../types";

// Batch 8: factions, heat, and the things you carry.
export const FACTION_EVENTS: GameEvent[] = [
  // ------------------------------------------------ reputation pays off (or doesn't)
  {
    id: "fx-safe-house", title: "Blue Porch, Second Time", where: "road", tags: ["faction", "people"], weight: 2, conditions: { minRep: { resistance: 25 } },
    text: "A pickup flashes its lights twice and pulls over ahead. The driver says the network heard you were coming. There's a safe house ten miles off the highway with your names on the guest list.",
    choices: [
      { label: "Spend the night", outcomes: [{ text: "Hot showers, a real dinner, and a former county clerk who loses your file in a drawer. Everyone sleeps like they're home.", effects: { delay: 1, health: 10, heat: -30, cure: "exhausted" } }] },
      { label: "Just take the supplies", outcomes: [{ text: "Two jerry cans, a cooler, and a thank-you note. \"From the network.\"", effects: { fuel: 8, food: 10, items: { "thank-you": 1 } } }] }
    ]
  },
  {
    id: "fx-militia-escort", title: "Escort", where: "road", regions: ["mountain", "plains", "south"], tags: ["faction"], weight: 2, conditions: { minRep: { militia: 25 } },
    text: "Two trucks from the county militia pull alongside. You tense up. Then the lead driver waves. \"You're the folks who complimented the vests. Roadblock ahead. Follow us.\"",
    choices: [
      { label: "Follow them", outcomes: [{ text: "They wave you through their own roadblock and three more after it. Nobody checks anything. One of them gives you jerky.", effects: { heat: -15, miles: 25, items: { jerky: 1 } } }] },
      { label: "Thank them and go your own way", outcomes: [{ text: "They shrug. \"Suit yourself.\" Friendly, still.", effects: {} }] }
    ]
  },
  {
    id: "fx-militia-grudge", title: "They Remember", where: "road", regions: ["mountain", "plains", "south"], tags: ["faction", "danger"], weight: 2, conditions: { maxRep: { militia: -15 } },
    text: "A truck you've seen before is parked across the road. The men from the roadblock. They remember your faces, and they've brought friends.",
    choices: [
      { label: "Pay them off", cost: { money: 120 }, outcomes: [{ text: "They take the money and the van's spare tire, \"for their trouble.\"", effects: { van: -5, rep: { militia: 10 } } }] },
      { label: "Talk them down", check: { skill: "negotiation", difficulty: "hard", faction: "militia" },
        success: [{ text: "{skilled} apologizes so precisely and so completely that their leader is embarrassed to keep going.", effects: { rep: { militia: 15 } } }],
        failure: [{ text: "It goes badly, briefly. Everyone's alive. The van has new dents.", effects: { health: -14, van: -20, money: -60 } }] },
      { label: "Back up and take the long way", outcomes: [{ text: "Seventy miles around. They follow you for the first ten.", effects: { miles: -70, fuel: -3, heat: 10 } }] }
    ]
  },
  {
    id: "fx-church-network", title: "The Church Network", where: "road", regions: ["south", "midwest", "plains"], tags: ["faction", "people"], weight: 2, conditions: { minRep: { faithful: 25 } },
    text: "A pastor you've never met is waiting at a gas station with a casserole. \"Pastor Dale called Pastor Jim, who called me,\" she says. \"You're the ones who stayed for the whole sermon.\"",
    choices: [
      { label: "Accept the casserole and the blessing", outcomes: [{ text: "Casserole, a blessing, and a phone number for every church between here and the coast that \"won't ask about your papers.\"", effects: { food: 12, health: 5, heat: -10 } }] },
      { label: "Ask her about the checkpoints", outcomes: [{ text: "She knows which deacons work which weigh stations, and which ones owe her favors.", effects: { heat: -20 } }] }
    ]
  },
  {
    id: "fx-church-cold", title: "Word Got Around", where: "road", regions: ["south", "midwest", "plains"], tags: ["faction"], weight: 2, conditions: { maxRep: { faithful: -15 } },
    text: "The diner goes quiet when you walk in. A woman at the counter says, not unkindly, \"You're the ones who heckled the revival.\" Nobody will serve you.",
    choices: [
      { label: "Apologize, sincerely", check: { skill: "persuasion", difficulty: "medium", faction: "faithful" },
        success: [{ text: "{skilled} apologizes without performing it. The woman nods. The waitress brings coffee.", effects: { rep: { faithful: 15 }, food: 4 } }],
        failure: [{ text: "It comes out wrong. You eat in the van.", effects: { morale: -8 } }] },
      { label: "Leave", outcomes: [{ text: "You eat gas station sandwiches in the parking lot. They watch you through the window.", effects: { morale: -6 } }] }
    ]
  },
  {
    id: "fx-standoff", title: "Standoff", where: "road", regions: ["midwest", "plains", "mountain"], tags: ["faction", "danger"],
    text: "Outside a feed store, a Resistance courier and a militia patrol are in a standoff over a pallet of seed. Both sides look at you like you're the tiebreaker.",
    choices: [
      { label: "Side with the courier", outcomes: [{ text: "The patrol backs off, outnumbered and annoyed. The courier owes you.", effects: { rep: { resistance: 12, militia: -12 }, heat: 10 } }] },
      { label: "Side with the patrol", outcomes: [{ text: "The courier leaves. The patrol is pleased. You feel strange about it all day.", effects: { rep: { militia: 12, resistance: -12 }, morale: -8 } }] },
      { label: "Split the seed down the middle", check: { skill: "negotiation", difficulty: "medium" },
        success: [{ text: "{skilled} proposes half and half, and both sides agree because nobody wants to explain this to their boss. Both owe you a little.", effects: { rep: { resistance: 5, militia: 5 } } }],
        failure: [{ text: "Both sides agree on one thing: they don't like you.", effects: { rep: { resistance: -5, militia: -5 } } }] }
    ]
  },

  // ------------------------------------------------ heat
  {
    id: "fx-bounty-hunter", title: "Bounty Hunter", where: "road", tags: ["heat", "danger"], weight: 2, conditions: { minHeat: 55 },
    text: "A man in a cowboy hat and a branded polo shirt (PATRIOT RECOVERY LLC) is reading your license plate off a tablet at a gas station. He looks up. He smiles.",
    choices: [
      { label: "Leave now", check: { skill: "stealth", difficulty: "medium" },
        success: [{ text: "You're three exits away before he finishes his coffee.", effects: { heat: -5 } }],
        failure: [{ text: "He follows you for sixty miles, then calls ahead.", effects: { heat: 20 } }] },
      { label: "Make him a counteroffer", cost: { money: 150 }, outcomes: [{ text: "Turns out he's paid per capture, and you're paying more. He \"loses\" your file.", effects: { heat: -30 } }] },
      { label: "Intimidate him", requires: { skill: "intimidation" }, check: { skill: "intimidation", difficulty: "hard" },
        success: [{ text: "{skilled} tells him exactly what his LLC's insurance doesn't cover. He leaves.", effects: { heat: -15 } }],
        failure: [{ text: "He's not intimidated. He takes a photo of everyone.", effects: { heat: 25 } }] }
    ]
  },
  {
    id: "fx-file-clerk", title: "The File Clerk", where: "road", tags: ["heat", "people"], conditions: { minHeat: 35 },
    text: "In a county records office restroom, a clerk washing her hands says to the mirror, \"For two hundred dollars, some files get misplaced. For three hundred, they get misplaced in a shredder.\"",
    choices: [
      { label: "Pay for the shredder", cost: { money: 300 }, outcomes: [{ text: "She doesn't look at you. That afternoon, a lot of paperwork has an accident.", effects: { heat: -45 } }] },
      { label: "Pay for misplacing", cost: { money: 200 }, outcomes: [{ text: "Your file is now in the wrong county, filed under a different decade.", effects: { heat: -30 } }] },
      { label: "Pretend you didn't hear", outcomes: [{ text: "She dries her hands and leaves. The offer leaves with her." }] }
    ]
  },
  {
    id: "fx-waitress", title: "Waitress", where: "road", tags: ["heat", "people"], weight: 2, conditions: { minHeat: 50 },
    text: "A diner. Your faces are on the TV over the counter. The waitress glances at the screen, glances at you, then turns the TV to a cooking show.",
    choices: [
      { label: "Leave a big tip", cost: { money: 40 }, outcomes: [{ text: "She pockets it, writes a back-road route on your receipt, and says, \"Never saw you.\"", effects: { heat: -20 } }] },
      { label: "Eat fast and go", outcomes: [{ text: "She refills your coffee without being asked. Nobody else in the diner looks up.", effects: { heat: -5, morale: 6 } }] }
    ]
  },
  {
    id: "fx-propaganda-shoot", title: "Extras Wanted", where: "road", tags: ["money", "faction"],
    text: "A film crew is shooting a regime ad called \"Real Americans, Real Values\" and needs extras who \"look like a normal family.\" They pay cash. Wardrobe is provided. The wardrobe is all khaki.",
    choices: [
      { label: "Be extras", outcomes: [{ text: "You spend a day pretending to love a grill. The ad airs in three states. Your heat drops, because nobody suspects people in khaki.", effects: { delay: 1, money: 120, heat: -15, morale: -10 } }] },
      { label: "Sabotage the shoot", check: { skill: "stealth", difficulty: "medium" },
        success: [{ text: "{skilled} swaps the soundtrack for a protest song. Nobody notices until it airs.", effects: { morale: 15, rep: { resistance: 10 }, heat: 15 } }],
        failure: [{ text: "The director catches you, and now you're in the ad as \"concerned citizens\" anyway.", effects: { heat: 10, morale: -8 } }] },
      { label: "Decline", outcomes: [{ text: "The casting director says you \"weren't the look anyway.\"" }] }
    ]
  },
  {
    id: "fx-wear-hats", title: "Camouflage", where: "road", tags: ["heat"], conditions: { item: "regime-hats", minHeat: 30 },
    text: "Checkpoints ahead. In the back of the van, a box of regime hats you were planning to sell in a paradise, ironically.",
    choices: [
      { label: "Wear the hats", outcomes: [{ text: "Everyone looks like a different, worse group of people. Every guard waves you through with a nod of brotherhood.", effects: { heat: -20, morale: -8 } }] },
      { label: "Keep them boxed", outcomes: [{ text: "You'll sell them later. Dignity first." }] }
    ]
  },

  // ------------------------------------------------ things you carry
  {
    id: "fx-insulin-kid", title: "Insulin", where: "road", tags: ["people", "faction"], weight: 3, conditions: { item: "insulin" },
    text: "A mother at a pharmacy counter is being told the price of insulin has gone up again, \"for freedom.\" Her son is eleven. She doesn't have it.",
    choices: [
      { label: "Give her the insulin", outcomes: [{ text: "She doesn't say anything for a long time. Then she hugs everyone, one at a time. The pharmacist pretends to see nothing, then slips you a box of medkits.", effects: { items: { insulin: -1, medkit: 1 }, morale: 20, rep: { resistance: 15 } } }] },
      { label: "Sell it to her at cost", outcomes: [{ text: "She pays what she can. It's not much. You don't ask for more.", effects: { items: { insulin: -1 }, money: 30, morale: 10 } }] },
      { label: "Keep it", outcomes: [{ text: "You have your reasons. They don't feel very good right now.", effects: { morale: -15 } }] }
    ]
  },
  {
    id: "fx-seed-swap", title: "Seed Swap", where: "road", regions: ["plains", "midwest", "south"], tags: ["food", "people"], conditions: { item: "seeds" },
    text: "A farmer at a co-op elevator notices your heirloom seeds in a jar on the dash. His eyes go wide. \"Are those pre-patent?\"",
    choices: [
      { label: "Trade them for food", outcomes: [{ text: "He trades you a month of food: potatoes, a ham, preserves, and eggs. He says his grandmother grew those tomatoes.", effects: { items: { seeds: -1 }, food: 30, morale: 8 } }] },
      { label: "Give him some and keep some", outcomes: [{ text: "You split them. He presses a sack of potatoes and a jar of honey on you anyway.", effects: { food: 12, morale: 10 } }] }
    ]
  },
  {
    id: "fx-solar-farm", title: "Off the Grid", where: "road", regions: ["plains", "mountain", "south"], tags: ["money", "people"], conditions: { item: "solar-panel" },
    text: "A ranch house miles from anywhere, with a sign: WE BUY SOLAR. NO QUESTIONS. The rancher votes for the regime every election and also wants off the grid. People contain multitudes.",
    choices: [
      { label: "Sell the panel", outcomes: [{ text: "He pays more than any paradise would. \"Don't tell the co-op,\" he says.", effects: { items: { "solar-panel": -1 }, money: 160 } }] },
      { label: "Keep it", outcomes: [{ text: "He shrugs. \"Your loss. Panel's illegal here, you know.\"", effects: { heat: 5 } }] }
    ]
  },
  {
    id: "fx-tote-recognition", title: "Fellow Listener", where: "road", tags: ["people"], conditions: { item: "tote" },
    text: "At a gas station deep in the hellhole, a man in a regime hat sees the signed public radio tote on your passenger seat. He looks around, leans in and whispers, \"I listen every morning. Don't tell my wife.\"",
    choices: [
      { label: "Give him the tote", outcomes: [{ text: "He hides it under his jacket like contraband, which it is. He fills your tank and won't take money.", effects: { items: { tote: -1 }, fuel: 15, morale: 10 } }] },
      { label: "Promise to keep his secret", outcomes: [{ text: "He nods, then hums the theme music under his breath all the way back to his truck.", effects: { morale: 8 } }] }
    ]
  },
  {
    id: "fx-listening-party", title: "Listening Party", where: "road", regions: ["south", "midwest", "mountain"], tags: ["people"], conditions: { item: "vinyl" },
    text: "A record store owner in a hostile town sees your banned vinyl and goes pale. He hasn't heard that album in four years. He locks the door and puts up a sign: INVENTORY.",
    choices: [
      { label: "Play it for him", outcomes: [{ text: "Fifteen people come through the back door, one by one, to listen. Nobody talks. At the end, everybody claps for a record.", effects: { morale: 15, rep: { resistance: 10 } } }] },
      { label: "Sell it to him", outcomes: [{ text: "He pays far too much and hides it behind a stack of approved country records.", effects: { items: { vinyl: -1 }, money: 80 } }] }
    ]
  },
  {
    id: "fx-copper-accused", title: "Copper Thieves", where: "road", tags: ["heat", "danger"], conditions: { item: "copper" },
    text: "A sheriff pulls you over because a substation two towns back is missing its copper wire. You have a spool of copper wire in the back. It's a different spool. Try explaining that.",
    choices: [
      { label: "Explain", check: { skill: "negotiation", difficulty: "hard" },
        success: [{ text: "{skilled} points out that your spool is a different gauge than substation wire. The sheriff is impressed that you know that and suspicious that you know that.", effects: { heat: 10 } }],
        failure: [{ text: "The sheriff confiscates the wire and writes you up.", effects: { items: { copper: -1 }, heat: 25 } }] },
      { label: "Give him the wire", outcomes: [{ text: "Problem solved, wire gone.", effects: { items: { copper: -1 }, heat: 5 } }] }
    ]
  },
  {
    id: "fx-ham-relay", title: "Relay", where: "road", tags: ["faction"], conditions: { item: "ham-radio" },
    text: "The ham radio crackles. A voice, using an old call sign, asks anyone on frequency to relay a message east: names of people who need pickups at a church in two days.",
    choices: [
      { label: "Relay it", outcomes: [{ text: "You pass the names along to an operator in the next state. Two days later you hear back: everyone made it.", effects: { rep: { resistance: 15 }, morale: 12, heat: 5 } }] },
      { label: "Stay off the air", outcomes: [{ text: "Someone else picks it up. You hear them relay it. You feel a little smaller." }] }
    ]
  },
  {
    id: "fx-cigarette-economy", title: "Currency", where: "road", tags: ["heat"], conditions: { item: "cigarettes" },
    text: "A jail transport bus is parked at a rest stop. A guard leaning on it eyes the carton of cigarettes on your dashboard like it's a briefcase of cash.",
    choices: [
      { label: "Trade the carton for information", outcomes: [{ text: "He tells you exactly which checkpoints are looking for which plates, including yours.", effects: { items: { cigarettes: -1 }, heat: -25 } }] },
      { label: "Keep it", outcomes: [{ text: "He sighs, deeply, and goes back to staring at nothing." }] }
    ]
  },
  {
    id: "fx-black-market", title: "Night Market", where: "road", tags: ["money", "people"],
    text: "Behind a shuttered big-box store, after dark: a night market in car trunks. Insulin, books, bourbon, seeds, solar panels, all priced in cash and trust.",
    choices: [
      { label: "Buy contraband to sell later", cost: { money: 60 }, outcomes: [{ text: "Two jars of heirloom seeds and a crate of banned textbooks. Paradises will pay well.", effects: { items: { seeds: 1, textbooks: 1 } } }] },
      { label: "Buy insulin", cost: { money: 70 }, outcomes: [{ text: "Canadian. Worth a lot in the hellhole. Worth more to the right person.", effects: { items: { insulin: 1 } } }] },
      { label: "Buy a lockpick set", cost: { money: 50 }, outcomes: [{ text: "The seller demonstrates on your van. Quickly. Too quickly.", effects: { items: { lockpicks: 1 } } }] },
      { label: "Just look", outcomes: [{ text: "Everyone here is very polite and very fast. When a car's headlights appear, the market vanishes in nine seconds." }] }
    ]
  },
  {
    id: "fx-bourbon-trade", title: "A Fair Trade", where: "road", regions: ["mountain", "plains", "south"], tags: ["money"], conditions: { item: "bourbon" },
    text: "A deputy pulls you over, sees the bottle of pre-ban bourbon on the floor, and gets a look on his face that's either law enforcement or nostalgia.",
    choices: [
      { label: "Offer it to him", outcomes: [{ text: "Nostalgia. He tucks it in his jacket. \"Taillight's fine,\" he says, though nobody said it wasn't.", effects: { items: { bourbon: -1 }, heat: -15 } }] },
      { label: "Play dumb", check: { skill: "persuasion", difficulty: "medium" },
        success: [{ text: "{skilled} claims it's a gift for a grandmother. He decides not to arrest anyone's grandmother.", effects: {} }],
        failure: [{ text: "He confiscates it as evidence, and you watch him drink the evidence.", effects: { items: { bourbon: -1 }, heat: 10 } }] }
    ]
  },
  {
    id: "fx-junior-deputy", title: "Junior Deputy", where: "road", tags: ["people"],
    text: "A kid at a gas station is handing out plastic junior deputy badges from a bucket. His dad runs the station. The kid takes his job extremely seriously.",
    choices: [
      { label: "Take a badge", outcomes: [{ text: "He swears you in. You promise to uphold the law. He makes you say it twice.", effects: { items: { "deputy-badge": 1 }, morale: 6 } }] },
      { label: "Ask him for directions", outcomes: [{ text: "His directions are better than any map. He knows every shortcut on his bike route.", effects: { miles: 10 } }] }
    ]
  },
  {
    id: "fx-wanted-poster-copy", title: "A Copy for Yourself", where: "road", tags: ["heat"], conditions: { minHeat: 45 },
    text: "Your faces, again, on a post office bulletin board. This one's in color. It's honestly a good photo of everyone except one person, who is furious about it.",
    choices: [
      { label: "Take it down and keep it", check: { skill: "stealth", difficulty: "easy" },
        success: [{ text: "It's yours now. You'll frame it someday.", effects: { items: { "wanted-poster": 1 }, heat: -5, morale: 6 } }],
        failure: [{ text: "The postmaster sees you take it, and has three more copies.", effects: { heat: 15 } }] },
      { label: "Leave it", outcomes: [{ text: "You leave. The photo watches you go." }] }
    ]
  },
  {
    id: "fx-resistance-cache", title: "Cache", where: "road", tags: ["faction", "scavenge"], conditions: { minRep: { resistance: 15 } },
    text: "A text from an unknown number, then a set of coordinates: an abandoned barn, a loose board, a waterproof bin with the network's logo on the lid.",
    choices: [
      { label: "Check the cache", outcomes: [{ text: "Antibiotics, a jerry can, a lockpick set, and a note: \"Take what you need. Leave what you can.\"", effects: { items: { antibiotics: 1, jerrycan: 1, lockpicks: 1 } } }] },
      { label: "Leave something for the next person", requires: { item: "medkit" }, outcomes: [{ text: "You leave a medkit and take the jerry can. The network will know.", effects: { items: { medkit: -1, jerrycan: 1 }, rep: { resistance: 10 } } }] }
    ]
  }
];
