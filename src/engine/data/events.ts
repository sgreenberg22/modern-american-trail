import type { GameEvent } from "../types";

// Starter content for Phase 1, written in the Phase 3 schema. Tokens:
//   {stop}    the stop you're at or heading to
//   {leader}  first living party member
//   {member}  a random living member (same person throughout one event)
//   {skilled} the living member whose skill the choice uses (falls back to {leader})
//
// Tags: "danger" events are what Encrypted Comms makes rarer; "checkpoint" events
// are preferred when you roll into a checkpoint.

export const EVENTS: GameEvent[] = [
  // ------------------------------------------------------------ checkpoints
  {
    id: "loyalty-pledge", title: "Sponsored Pledge", where: "road", tags: ["checkpoint", "danger"],
    text: "A trooper at {stop} asks everyone to recite the Pledge of Allegiance to a flag made of corporate logos. This month's sponsor is a mattress company, and the pledge has a promo code in it.",
    choices: [
      { label: "Recite it with feeling, promo code and all",
        outcomes: [
          { weight: 3, text: "You nail the sponsor read. The trooper wipes away a tear and waves you through.", effects: { morale: -5 } },
          { weight: 1, text: "You say \"liberty\" with insufficient conviction. Re-education pamphlets, $40 processing fee.", effects: { money: -40, morale: -6 } }
        ] },
      { label: "Slip him a \"donation\"", cost: { money: 60 },
        outcomes: [{ text: "He pockets it and stamps your papers PATRIOTIC (PROVISIONAL).", effects: { miles: 10 } }] },
      { label: "Mention the mattress company was just bought by a foreign conglomerate", check: { skill: "persuasion", difficulty: "medium" },
        success: [{ text: "{skilled} walks him through the acquisition. The trooper, deeply shaken, lets you go so he can reconsider his whole life.", effects: { morale: 10 } }],
        failure: [{ text: "He does not want to hear about mergers. Two-hour lecture on the shoulder.", effects: { delay: 1, morale: -5 } }] }
    ]
  },
  {
    id: "book-inspection", title: "Book Inspection", where: "road", tags: ["checkpoint", "danger"],
    text: "Inspectors at {stop} are checking vehicles for books containing more than one point of view. A beagle in a tiny vest is doing most of the work.",
    choices: [
      { label: "Hand over the books",
        outcomes: [{ text: "They take the books and give you a receipt. The receipt is also a book, with one point of view.", effects: { morale: -10 } }] },
      { label: "Hide them in the spare tire", check: { skill: "stealth", difficulty: "medium" },
        success: [{ text: "The beagle sniffs the tire, sneezes, and moves on. {skilled} gives it a respectful nod.", effects: { morale: 6 } }],
        failure: [{ text: "The beagle was trained on paperbacks specifically. Fine, plus a pamphlet about the dangers of nuance.", effects: { money: -80, morale: -8 } }] },
      { label: "Insist they're cookbooks", check: { skill: "persuasion", difficulty: "hard" },
        success: [{ text: "\"To Kill a Mockingbird,\" {skilled} explains, is about game birds. The inspector nods slowly.", effects: { morale: 8 } }],
        failure: [{ text: "Turns out he knows what a mockingbird is. Fine, and a mandatory reading of an approved novel.", effects: { money: -60, delay: 1 } }] }
    ]
  },
  {
    id: "speed-trap", title: "Coin-Operated Justice", where: "road", tags: ["checkpoint", "danger"],
    text: "A deputy clocks you at three over the limit near {stop}. His radar gun has a coin slot and a sticker that says IN GOD WE TRUST, ALL OTHERS PAY CASH.",
    choices: [
      { label: "Pay the \"fine\"", cost: { money: 90 },
        outcomes: [{ text: "He makes change. Nobody has ever been so polite about extortion." }] },
      { label: "Contest it, citing the statute", check: { skill: "negotiation", difficulty: "medium" },
        success: [{ text: "{skilled} cites a statute. The deputy, unsure it exists and equally unsure it doesn't, lets you go." }],
        failure: [{ text: "He did not care for the statute. Bigger fine, and you wait while he looks it up.", effects: { money: -140, delay: 1 } }] },
      { label: "Do the cop voice", requires: { skill: "intimidation" }, check: { skill: "intimidation", difficulty: "easy" },
        success: [{ text: "{skilled} does the cop voice. The deputy apologizes and calls everyone sir.", effects: { morale: 8 } }],
        failure: [{ text: "Wrong cop voice. That's a different, worse department.", effects: { money: -120 } }] }
    ]
  },
  {
    id: "heritage-inspection", title: "Heritage Inspection", where: "road", tags: ["checkpoint", "danger"],
    text: "A State Line Heritage Inspection wants proof your ancestors were here before a date they decline to specify.",
    choices: [
      { label: "Show them your library card",
        outcomes: [
          { weight: 1, text: "The guard doesn't read. He waves the card like a passport and lets you through.", effects: { morale: 5 } },
          { weight: 1, text: "Library cards are considered subversive here. Confiscated, plus a fine.", effects: { money: -50, morale: -4 } }
        ] },
      { label: "Forge a family tree", requires: { skill: "hacking" }, check: { skill: "hacking", difficulty: "hard" },
        success: [{ text: "{skilled} prints a family tree back to the Mayflower, including a passenger named Gerald. Very convincing.", effects: { morale: 10 } }],
        failure: [{ text: "The printer jams mid-ancestor. That's a $100 fine and an overnight hold.", effects: { money: -100, delay: 1 } }] },
      { label: "Wait for the shift change",
        outcomes: [{ text: "The night guard is asleep in a recliner with a flag blanket. You roll through at 3 a.m.", effects: { delay: 1 } }] }
    ]
  },

  // ------------------------------------------------------------ road hazards
  {
    id: "megachurch-toll", title: "Tithe Plaza", where: "road", regions: ["south", "midwest"], tags: ["danger"],
    text: "The only bridge for fifty miles is a toll plaza owned by a megachurch. The toll is a tithe or a public testimony, broadcast live on the church's streaming service.",
    choices: [
      { label: "Pay the tithe", cost: { money: 70 },
        outcomes: [{ text: "The gate lifts. A screen thanks you by name, which is upsetting since you didn't give it." }] },
      { label: "Give a testimony", check: { skill: "persuasion", difficulty: "easy" },
        success: [{ text: "{skilled}'s story about being saved from a gluten intolerance brings the house down. Somebody hands you a casserole.", effects: { food: 10, morale: 5 } }],
        failure: [{ text: "The testimony includes the phrase \"my therapist.\" Security escorts you to the slow lane.", effects: { delay: 1, morale: -4 } }] },
      { label: "Floor it through the gate",
        outcomes: [
          { weight: 2, text: "The gate is mostly decorative. You are now on a watch list for a church, which is new.", effects: { miles: 20 } },
          { weight: 1, text: "The gate is load-bearing.", effects: { health: -12, money: -50 } }
        ] }
    ]
  },
  {
    id: "coal-roller", title: "Rolling Coal", where: "road", regions: ["south", "plains", "mountain", "midwest"], tags: ["danger"],
    text: "A lifted pickup with three flags and one muffler pulls alongside and coal-rolls the van until the windshield is entirely black.",
    choices: [
      { label: "Pull over and wait it out",
        outcomes: [{ text: "You lose the afternoon breathing through T-shirts.", effects: { miles: -30, health: -4 } }] },
      { label: "Find the recirculate button", check: { skill: "mechanical", difficulty: "medium" },
        success: [{ text: "{skilled} finds recirc. It was there the whole time. Nobody talks about how long that took." }],
        failure: [{ text: "Nobody can find recirc. Everyone coughs for a day.", effects: { health: -10 } }] },
      { label: "Wave and smile",
        outcomes: [
          { weight: 1, text: "Friendliness confuses him. He peels off toward a Buffalo Wild Wings.", effects: { morale: 5 } },
          { weight: 1, text: "He takes the wave as a challenge and rolls coal for another twenty miles.", effects: { health: -8, morale: -8 } }
        ] }
    ]
  },
  {
    id: "drone", title: "Motivational Drone", where: "road", regions: ["mountain", "plains"], tags: ["danger"],
    text: "A surveillance drone follows the van for forty miles. It has a small speaker that plays a podcast about grit.",
    choices: [
      { label: "Jam it", requires: { skill: "hacking" }, check: { skill: "hacking", difficulty: "medium" },
        success: [{ text: "{skilled} reroutes its feed to a nine-part documentary about labor unions. The drone flies home to think.", effects: { morale: 10, miles: 10 } }],
        failure: [{ text: "{skilled} bricks their own phone instead. The drone files a report.", effects: { money: -50, morale: -5 } }] },
      { label: "Hide under an overpass until it leaves",
        outcomes: [{ text: "It gets bored around midnight. So does everyone.", effects: { delay: 1, morale: -4 } }] },
      { label: "Just listen",
        outcomes: [{ text: "Four episodes about cold showers. Spirits sag.", effects: { morale: -12 } }] }
    ]
  },
  {
    id: "wildfire", title: "Hoax With Smoke Effects", where: "road", regions: ["northwest", "mountain", "plains"], tags: ["danger"],
    text: "Smoke on the horizon. The state has officially declared the wildfire \"a hoax with smoke effects\" and closed nothing.",
    choices: [
      { label: "Detour around it",
        outcomes: [{ text: "Most of a day spent going around something that isn't happening.", effects: { miles: -60, food: -5 } }] },
      { label: "Push through", check: { skill: "survival", difficulty: "medium" },
        success: [{ text: "{skilled} reads the wind and finds a gap. You come out ash-gray and ahead of schedule.", effects: { miles: 30 } }],
        failure: [{ text: "Visibility goes to zero. You make it through, coughing.", effects: { health: -15, miles: -20 } }] }
    ]
  },
  {
    id: "militia", title: "County Defense Force", where: "road", regions: ["mountain", "plains", "south"], tags: ["danger"],
    text: "Three men in tactical vests have blocked the road to protect the county from outsiders. You are, technically, outsiders.",
    choices: [
      { label: "Pay the \"toll\"", cost: { money: 100 },
        outcomes: [{ text: "They give you a receipt with an eagle on it. The eagle is holding a smaller eagle." }] },
      { label: "Compliment the vests", check: { skill: "persuasion", difficulty: "medium" },
        success: [{ text: "{skilled} asks about the vests. Twenty minutes later you know everyone's pouch configuration, and you're through.", effects: { morale: 5 } }],
        failure: [{ text: "They decide you're feds. A bad hour, and a lighter wallet.", effects: { health: -10, money: -60 } }] },
      { label: "Take a dirt road around them", check: { skill: "survival", difficulty: "medium" },
        success: [{ text: "{skilled} finds a ranch road. Nobody notices but a cow." }],
        failure: [{ text: "The dirt road is a creek.", effects: { delay: 1, food: -5 } }] }
    ]
  },
  {
    id: "breakdown", title: "Van Trouble", where: "road", tags: ["vehicle"],
    text: "The van makes a noise like a disappointed parent and coasts to a stop.",
    choices: [
      { label: "Fix it yourselves", check: { skill: "mechanical", difficulty: "medium" },
        success: [{ text: "{skilled} fixes it with a coat hanger and a strongly worded affirmation." }],
        failure: [{ text: "Fixed eventually. It takes two days and most of your vocabulary.", effects: { delay: 2 } }] },
      { label: "Call a tow", cost: { money: 150 },
        outcomes: [{ text: "The tow driver adds a \"lifestyle surcharge\" but drops you well down the road.", effects: { miles: 20 } }] },
      { label: "Push it to the next exit",
        outcomes: [{ text: "Everyone pushes. Everyone learns something about themselves, mostly about their hamstrings.", effects: { delay: 1, health: -8 } }] }
    ]
  },
  {
    id: "rally", title: "Highway Rally", where: "road", regions: ["midwest", "south", "plains"], tags: ["danger"],
    text: "A rally has closed the interstate. A man on a flatbed stage is selling gold coins, survival buckets, and a supplement for \"masculine focus.\"",
    choices: [
      { label: "Wait it out",
        outcomes: [{ text: "It runs long. It always runs long.", effects: { delay: 1, morale: -6 } }] },
      { label: "Buy a survival bucket", cost: { money: 60 },
        outcomes: [{ text: "It's 90 percent powdered eggs. It is, legally, food.", effects: { food: 20 } }] },
      { label: "Sneak through the parking lot", check: { skill: "stealth", difficulty: "medium" },
        success: [{ text: "Hats on, heads down, you pass as attendees and come out the far side.", effects: { miles: 15 } }],
        failure: [{ text: "Someone asks {skilled}'s opinion on the gold coins. They give it.", effects: { health: -8, morale: -8 } }] }
    ]
  },
  {
    id: "flagged", title: "Flagged For Review", where: "road", tags: ["danger"],
    text: "Every phone in the van buzzes at once: you've been flagged for patriotic review based on your podcast history.",
    choices: [
      { label: "Scrub the phones", requires: { skill: "hacking" },
        outcomes: [{ text: "{skilled} wipes everything. The review finds only a weather app and a lot of bird photos.", effects: { morale: 5 } }] },
      { label: "Ditch them and buy burners", cost: { money: 100 },
        outcomes: [{ text: "You buy burners at a gas station. Two of them can only call that gas station.", effects: { morale: -3 } }] },
      { label: "Ignore it",
        outcomes: [
          { weight: 1, text: "The review is backlogged until 2031. You're fine." },
          { weight: 1, text: "A trooper is waiting at the next exit with a printout of your listening history.", effects: { money: -80, delay: 1 } }
        ] }
    ]
  },
  {
    id: "storm", title: "Divine Weather", where: "road", regions: ["plains", "midwest"], tags: ["danger", "weather"],
    text: "A supercell rolls across the plains. The radio says it's God's judgment on Minneapolis, which is four hundred miles away.",
    choices: [
      { label: "Shelter under an overpass",
        outcomes: [{ text: "Hail the size of golf balls. Everyone huddles and eats cold beans.", effects: { delay: 1, morale: -3 } }] },
      { label: "Outrun it", check: { skill: "survival", difficulty: "hard" },
        success: [{ text: "{skilled} reads the radar like a sailor. You beat the storm east.", effects: { miles: 40 } }],
        failure: [{ text: "You do not outrun it.", effects: { health: -15, miles: -20 } }] }
    ]
  },
  {
    id: "coyotes", title: "Night Visitors", where: "road", regions: ["plains", "mountain"], tags: ["camp"],
    text: "Camping off the highway, you hear coyotes circling the van all night.",
    choices: [
      { label: "Take turns keeping watch",
        outcomes: [{ text: "Nobody sleeps much. The coyotes leave at dawn, unbothered.", effects: { morale: -6, health: -3 } }] },
      { label: "Scare them off", check: { skill: "intimidation", difficulty: "easy" },
        success: [{ text: "{skilled} yells something deeply authoritative. The coyotes respect it.", effects: { morale: 6 } }],
        failure: [{ text: "The coyotes do not respect it. {skilled} gets nipped.", effects: { healthOne: -15 } }] }
    ]
  },
  {
    id: "food-poisoning", title: "Gas Station Sushi", where: "road", tags: ["health"], conditions: { minDay: 3 },
    text: "{member} ate the gas station sushi. Everyone said not to. It was always going to be a mistake.",
    choices: [
      { label: "Treat it properly", requires: { skill: "medical" }, check: { skill: "medical", difficulty: "easy" },
        success: [{ text: "{skilled} prescribes fluids, saltines, and a firm talking-to.", effects: { healthOne: -4 } }],
        failure: [{ text: "Even with care, it's a long night.", effects: { healthOne: -14 } }] },
      { label: "Tough it out",
        outcomes: [{ text: "A rough day for {member}. Nobody speaks of it again.", effects: { healthOne: -22 } }] }
    ]
  },

  // ------------------------------------------------------------ road opportunities
  {
    id: "diner", title: "Legendary Pie", where: "road", tags: ["food"],
    text: "A diner with a sign that says WE SERVE EVERYONE (WHO AGREES). The pie is supposed to be legendary.",
    choices: [
      { label: "Eat in and keep quiet", cost: { money: 40 },
        outcomes: [{ text: "The pie is legendary. Nobody brings up anything. It's a miracle.", effects: { morale: 12, health: 5 } }] },
      { label: "Order to go", cost: { money: 25 },
        outcomes: [{ text: "You eat in the van. The pie is still legendary.", effects: { food: 8, morale: 4 } }] },
      { label: "Drive past",
        outcomes: [{ text: "{member} stares at the pie case through the window like a lost love.", effects: { morale: -4 } }] }
    ]
  },
  {
    id: "dollar-store", title: "Closed Due to Faith", where: "road", tags: ["scavenge"],
    text: "An abandoned dollar store with its door hanging open. A sign reads CLOSED: INSUFFICIENT FAITH IN THE ECONOMY.",
    choices: [
      { label: "Scavenge", check: { skill: "survival", difficulty: "easy" },
        success: [{ text: "Canned soup, granola bars, and a rotisserie chicken you wisely leave alone.", effects: { food: 15 } }],
        failure: [{ text: "Mostly gender-reveal confetti. {skilled} cuts a hand on a shelf.", effects: { food: 3, healthOne: -8 } }] },
      { label: "Leave it",
        outcomes: [{ text: "Discretion. Also, raccoons." }] }
    ]
  },
  {
    id: "hitchhiker", title: "Fellow Traveler", where: "road", tags: ["people"],
    text: "A hitchhiker holds a cardboard sign: FLEEING TO VERMONT. HAVE GAS MONEY.",
    choices: [
      { label: "Pick them up",
        outcomes: [
          { weight: 3, text: "They chip in $60 and hop out at the next town with a hug.", effects: { money: 60, morale: 5 } },
          { weight: 1, text: "They chip in $60 and also eat ten days of food. Nobody saw it happen.", effects: { money: 60, food: -10 } }
        ] },
      { label: "Drive on",
        outcomes: [{ text: "{member} watches them in the side mirror for a long time.", effects: { morale: -5 } }] }
    ]
  },
  {
    id: "kindness", title: "Godspeed", where: "road", tags: ["people"], weight: 0.6,
    text: "At a gas station, a woman sees your Vermont road atlas on the dash. She says nothing, fills your tank, and leaves a bag of groceries on the hood. On her way out she whispers \"Godspeed.\"",
    choices: [
      { label: "Thank her quietly",
        outcomes: [{ text: "There are good people everywhere. Here, they have to whisper.", effects: { food: 12, morale: 10 } }] }
    ]
  },
  {
    id: "megamart", title: "Patriot Discount", where: "road", tags: ["food"],
    text: "A Freedom MegaMart offers a Patriot Discount if you sign a loyalty oath. It is the only store for ninety miles.",
    choices: [
      { label: "Sign the oath and shop", cost: { money: 40 },
        outcomes: [{ text: "The oath has a 47-page arbitration clause. The groceries are cheap, though.", effects: { food: 25, morale: -8 } }] },
      { label: "Pay full price", cost: { money: 75 },
        outcomes: [{ text: "The cashier looks at you like you've paid in pesos.", effects: { food: 25 } }] },
      { label: "Keep driving",
        outcomes: [{ text: "Ninety miles is not that far, you tell yourselves." }] }
    ]
  },
  {
    id: "pharmacy", title: "Conscientious Pharmacist", where: "road", tags: ["health"], conditions: { maxLowestHealth: 60 },
    text: "A strip-mall pharmacy. The pharmacist won't fill anything that conflicts with his values, which turn out to include ibuprofen.",
    choices: [
      { label: "Appeal to his better nature", check: { skill: "persuasion", difficulty: "medium" },
        success: [{ text: "{skilled} finds the one value he has left. He fills it, muttering.", effects: { health: 10 } }],
        failure: [{ text: "His better nature is closed on Sundays.", effects: { morale: -6 } }] },
      { label: "Try the vet next door", cost: { money: 50 },
        outcomes: [{ text: "The vet is wonderful. Dosing is by body weight; she rounds generously.", effects: { health: 8 } }] },
      { label: "Leave", outcomes: [{ text: "You'll manage." }] }
    ]
  },
  {
    id: "porch-light", title: "Blue Porch Light", where: "road", tags: ["people"],
    text: "A note under the wiper: \"Blue porch light, mile marker 212. Hot food. A friend.\"",
    choices: [
      { label: "Find the porch light",
        outcomes: [
          { weight: 3, text: "A retired teacher feeds you lasagna and asks you to write when you get there.", effects: { food: 15, health: 8, morale: 10 } },
          { weight: 1, text: "It's a man selling timeshares. You escape after ninety minutes with a free lunch.", effects: { food: 5, delay: 1 } }
        ] },
      { label: "Too risky",
        outcomes: [{ text: "You keep driving. The note goes in the glovebox, just in case." }] }
    ]
  },

  // ------------------------------------------------------------ crises (conditional, weighted up)
  {
    id: "starving", title: "Empty Bag", where: "road", tags: ["crisis"], weight: 4, conditions: { maxFood: 8 },
    text: "The food bag is folded flat. {member} has started treating ketchup packets as a meal.",
    choices: [
      { label: "Forage", check: { skill: "survival", difficulty: "medium" },
        success: [{ text: "{skilled} finds an orchard nobody's guarding and a creek with actual fish.", effects: { food: 20 } }],
        failure: [{ text: "Some crab apples. Some regret.", effects: { food: 5, health: -6 } }] },
      { label: "Ask a church for help",
        outcomes: [
          { weight: 1, text: "They feed you, then pray for you, loudly, by name.", effects: { food: 15, morale: -6 } },
          { weight: 1, text: "They pray first. They pray for a long time.", effects: { food: 8, morale: -12 } }
        ] },
      { label: "Trade the spare tire for groceries",
        outcomes: [{ text: "The guy at the garage is thrilled. You're now living without a spare.", effects: { food: 25 }, setFlags: ["no-spare"] }] }
    ]
  },
  {
    id: "fever", title: "Fever", where: "road", tags: ["crisis", "health"], weight: 3, conditions: { maxLowestHealth: 35 },
    text: "{member} is running a fever and can't keep anything down.",
    choices: [
      { label: "Find an underground clinic", cost: { money: 120 },
        outcomes: [{ text: "Cash only, no names, excellent bedside manner. {member} is on the mend.", effects: { healthOne: 30 } }] },
      { label: "Rest for a day",
        outcomes: [{ text: "A day in the van with the windows cracked and a cold washcloth.", effects: { delay: 1, health: 5 } }] },
      { label: "Push on",
        outcomes: [{ text: "{member} sleeps through three states.", effects: { healthOne: -12 } }] }
    ]
  },

  // ------------------------------------------------------------ chain: the envelope (3 beats)
  {
    id: "envelope-1", title: "The Envelope", where: "road", regions: ["mountain", "plains"], tags: ["quest"],
    conditions: { minDay: 3, notFlags: ["envelope", "envelope-done"] },
    text: "At a truck stop, a nervous woman asks you to carry a sealed envelope to the Twin Cities. \"Documents,\" she says. \"Real ones. The kind they want gone.\"",
    choices: [
      { label: "Take it",
        outcomes: [{ text: "You tape it under the dashboard. She mouths \"thank you\" and is gone.", effects: { morale: 5 }, setFlags: ["envelope"], next: "envelope-2" }] },
      { label: "Decline",
        outcomes: [{ text: "She nods like she expected that, and asks the next van.", setFlags: ["envelope-done"] }] }
    ]
  },
  {
    id: "envelope-2", title: "Gray Sedan", where: "chain", tags: ["quest", "danger"], conditions: { flags: ["envelope"] },
    text: "A gray sedan with tinted windows has been behind you for two hundred miles.",
    choices: [
      { label: "Lose them", check: { skill: "stealth", difficulty: "medium" },
        success: [{ text: "Through a car wash and out the other side. {skilled} is insufferable about it for days.", effects: { morale: 6 } }],
        failure: [{ text: "They're still there. They're very patient. You burn a day on back roads.", effects: { delay: 1, food: -4 } }] },
      { label: "Pull over and let them pass",
        outcomes: [
          { weight: 1, text: "They turn off at a Cracker Barrel. Maybe it was nothing.", effects: { morale: 3 } },
          { weight: 1, text: "They pull over too. Nobody gets out. Eventually you drive on, shaking.", effects: { morale: -8, health: -4 } }
        ] },
      { label: "Burn the envelope",
        outcomes: [{ text: "The sedan turns around within the minute. You'll never know what was in it.", effects: { morale: -10 }, clearFlags: ["envelope"], setFlags: ["envelope-done"] }] }
    ]
  },
  {
    id: "envelope-3", title: "Delivery", where: "paradise", regions: ["midwest"], tags: ["quest"], weight: 100,
    conditions: { flags: ["envelope"] },
    text: "At a co-op in the Twin Cities, a woman with reading glasses on a chain opens the envelope, goes pale, then laughs. \"You have no idea what you just did.\"",
    choices: [
      { label: "Ask what it was",
        outcomes: [{ text: "\"Receipts,\" she says. \"Theirs.\" She presses an envelope of her own into your hands: cash, and a list of safe houses east.", effects: { money: 250, morale: 20 }, clearFlags: ["envelope"], setFlags: ["envelope-done"] }] }
    ]
  },

  // ------------------------------------------------------------ paradise arrivals
  {
    id: "welcome-committee", title: "Welcome Committee", where: "paradise", tags: ["arrival"],
    text: "A welcome committee meets you at the city limits of {stop} with oat-milk lattes and a land acknowledgment that runs a while.",
    choices: [
      { label: "Accept everything gratefully",
        outcomes: [{ text: "The lattes are excellent. The acknowledgment is thorough. You feel safe for the first time in days.", effects: { morale: 12, health: 5 } }] },
      { label: "Ask about free clinics",
        outcomes: [{ text: "There's a free clinic with a waitlist, and a waitlist for the waitlist. You're refugees, so you skip both.", effects: { health: 12 } }] }
    ]
  },
  {
    id: "mutual-aid", title: "Community Fridge", where: "paradise", tags: ["arrival", "food"],
    text: "A mutual-aid fridge in {stop} has a hand-lettered sign: TAKE WHAT YOU NEED. COMPOST THE REST. PLEASE STOP LEAVING KOMBUCHA.",
    choices: [
      { label: "Load up",
        outcomes: [{ text: "Mostly kombucha. Some actual food.", effects: { food: 15, morale: 3 } }] },
      { label: "Take only what you need",
        outcomes: [{ text: "A smaller haul, and the warm feeling of being the kind of person who reads signs.", effects: { food: 10, morale: 8 } }] }
    ]
  },
  {
    id: "fundraiser", title: "Silent Auction", where: "paradise", tags: ["arrival", "money"],
    text: "Locals in {stop} throw you a fundraiser with a silent auction. The top lot is a tote bag signed by a public radio host.",
    choices: [
      { label: "Attend and mingle",
        outcomes: [{ text: "The tote goes for $300. You get a cut.", effects: { money: 120, morale: 6 } }] },
      { label: "Give a speech", check: { skill: "persuasion", difficulty: "easy" },
        success: [{ text: "{skilled} speaks from the heart. Three people cry, one Venmos you directly.", effects: { money: 220, morale: 10 } }],
        failure: [{ text: "{skilled} mentions the wrong podcast. The room cools, but the checks still clear.", effects: { money: 100, morale: -3 } }] }
    ]
  },
  {
    id: "potluck", title: "Lentil Potluck", where: "paradise", tags: ["arrival", "food"],
    text: "A housing co-op in {stop} invites you to a potluck. Every dish is a lentil dish. Two are excellent.",
    choices: [
      { label: "Go, and eat a lot of lentils",
        outcomes: [{ text: "You find the two excellent ones. Someone sends you off with leftovers.", effects: { health: 10, morale: 10, food: 5 } }] }
    ]
  },
  {
    id: "march", title: "Two Protests", where: "paradise", tags: ["arrival"],
    text: "A march blocks downtown {stop}. Half of it is protesting the regime. The other half is protesting the first half's choice of font.",
    choices: [
      { label: "Join the march",
        outcomes: [{ text: "You chant until your voice goes. It's the best you've felt in weeks.", effects: { morale: 15, health: -3 } }] },
      { label: "Duck into a bookstore", cost: { money: 20 },
        outcomes: [{ text: "Three books, one tote bag. Everyone feels better.", effects: { morale: 10 } }] }
    ]
  },
  {
    id: "nurses", title: "Knitting Nurses", where: "paradise", tags: ["arrival", "health"],
    text: "A clinic in {stop} run by retired nurses offers free checkups. One of them knits through your entire exam.",
    choices: [
      { label: "Get everyone checked",
        outcomes: [{ text: "Bandages, antibiotics, and a scarf for {member}.", effects: { health: 15 } }] }
    ]
  },
  {
    id: "bike-lane", title: "Parking", where: "paradise", tags: ["arrival"],
    text: "{stop} has replaced its main street with a protected bike lane. The van is not welcome. A volunteer offers to help you find parking.",
    choices: [
      { label: "Pay for a garage", cost: { money: 30 },
        outcomes: [{ text: "Validated, even.", effects: { morale: 5 } }] },
      { label: "Circle the block",
        outcomes: [{ text: "You pass the same mural eleven times. It's a good mural.", effects: { morale: -5 } }] }
    ]
  }
];
