import type { GameEvent } from "../../types";

// Batch 3: the Plains and the Midwest.
export const HEARTLAND_EVENTS: GameEvent[] = [
  {
    id: "pl-wind-farm", title: "Wind Farm", where: "road", regions: ["plains"], tags: ["faction"],
    text: "A wind farm stretches to the horizon. Every turbine has a banner: THIS TURBINE IS A HOAX. The turbines keep turning.",
    choices: [
      { label: "Stop and stare", outcomes: [{ text: "Hundreds of hoaxes, generating electricity. It's beautiful and stupid at once, like a lot of things.", effects: { morale: 8 } }] },
      { label: "Ask a maintenance crew for a lift up one", check: { skill: "persuasion", difficulty: "medium" },
        success: [{ text: "{skilled} talks your way to the top. From up there you can see three states and no checkpoints.", effects: { morale: 15, heat: -5 } }],
        failure: [{ text: "The crew foreman calls it in as \"tower tourism.\" Apparently that's a thing.", effects: { heat: 15 } }] }
    ]
  },
  {
    id: "pl-grain-elevator", title: "Grain Elevator", where: "road", regions: ["plains", "midwest"], tags: ["people"],
    text: "A co-op grain elevator, the tallest thing for fifty miles. The manager is a woman in a seed cap who has run it for thirty years and is not interested in your politics, only your arms.",
    choices: [
      { label: "Help unload a truck", outcomes: [{ text: "Hot, dusty, honest work. She pays in cash and a bag of flour, and tells you the sheriff's lunch schedule.", effects: { delay: 1, money: 60, food: 10, heat: -10 } }] },
      { label: "Ask for directions", outcomes: [{ text: "She draws a map on a feed receipt. It's better than your GPS.", effects: { miles: 15 } }] }
    ]
  },
  {
    id: "pl-oil-boom", title: "Boomtown", where: "road", regions: ["plains"], tags: ["money", "danger"],
    text: "An oil boomtown: man camps, $14 hamburgers, and a strip club called The Patriot. Help wanted signs are everywhere. So are cops.",
    choices: [
      { label: "Pick up a day's work", outcomes: [
        { weight: 3, text: "Twelve hours hauling pipe. Brutal, and it pays like nothing you've seen.", effects: { delay: 1, money: 140, health: -10 } },
        { weight: 1, text: "Twelve hours hauling pipe, then the foreman \"forgets\" to pay out-of-staters.", effects: { delay: 1, health: -10, morale: -12 } }
      ] },
      { label: "Get the $14 hamburger", cost: { money: 42 }, outcomes: [{ text: "It's a fine hamburger. It is not a $14 hamburger.", effects: { health: 4, morale: 4 } }] },
      { label: "Keep driving", outcomes: [{ text: "You get out before anybody remembers your faces." }] }
    ]
  },
  {
    id: "pl-tornado", title: "Tornado Warning", where: "road", regions: ["plains", "midwest"], tags: ["weather", "danger"], conditions: { weather: ["storm"] },
    text: "Every phone in the van screams at once. The sky has turned the green of an old bruise. Ahead, a farmhouse; behind, an overpass.",
    choices: [
      { label: "Knock on the farmhouse door", outcomes: [
        { weight: 3, text: "A family lets you into their storm cellar without asking a single question. You come up an hour later to a world rearranged, and alive.", effects: { morale: 8, van: -10 } },
        { weight: 1, text: "Nobody's home. You shelter in the barn with three goats. The goats are calmer than you.", effects: { van: -15, morale: -4 } }
      ] },
      { label: "Get in a ditch", check: { skill: "survival", difficulty: "medium" },
        success: [{ text: "{skilled} picks the right ditch. The tornado passes a mile north. The van is fine, somehow.", effects: {} }],
        failure: [{ text: "The ditch floods. You're alive and very wet. The van has hail dents now.", effects: { health: -10, van: -20 } }] }
    ]
  },
  {
    id: "pl-county-fair", title: "County Fair", where: "road", regions: ["plains", "midwest"], tags: ["food", "people"],
    text: "A county fair: a demolition derby, a butter sculpture of the governor, and a 4-H kid with a prize-winning pig named Senator.",
    choices: [
      { label: "Eat fair food", cost: { money: 25 }, outcomes: [{ text: "Deep-fried everything. Nobody feels great, everybody feels happy.", effects: { morale: 12, health: -2 } }] },
      { label: "Enter the van in the demolition derby", check: { skill: "mechanical", difficulty: "hard" },
        success: [{ text: "{skilled} drives like a legend. You win $200 and a trophy shaped like a fender. The van will never be the same.", effects: { money: 200, van: -30, morale: 15 } }],
        failure: [{ text: "You're out in the first round, and so is your radiator.", effects: { van: -40, morale: -6 } }] },
      { label: "Congratulate the kid with the pig", outcomes: [{ text: "She explains the pig's name was a joke. Her dad doesn't get it. She asks where you're going and says, very quietly, \"Lucky.\"", effects: { morale: 6 } }] }
    ]
  },
  {
    id: "pl-reservation", title: "Tribal Land", where: "road", regions: ["plains"], tags: ["people", "faction"],
    text: "The highway crosses a reservation. The regime's jurisdiction is, legally, complicated here. A tribal police officer pulls alongside, looks at your plates, and gives you a long, unreadable look.",
    choices: [
      { label: "Pull over and be respectful", outcomes: [{ text: "He tells you state troopers can't follow you onto tribal roads without a lot of paperwork, and that he hates paperwork. He points out a road.", effects: { heat: -20 } }] },
      { label: "Keep driving the speed limit exactly", outcomes: [{ text: "He follows for a mile, then peels off. Nobody here owes you anything, and you know it.", effects: {} }] }
    ]
  },
  {
    id: "pl-corn-maze", title: "Corn Maze", where: "road", regions: ["plains", "midwest"], tags: ["heat"], conditions: { minHeat: 40 },
    text: "Sirens behind you. A sign ahead: WORLD'S LARGEST CORN MAZE — THIS YEAR'S SHAPE: THE GOVERNOR'S FACE.",
    choices: [
      { label: "Hide in the maze", check: { skill: "survival", difficulty: "medium" },
        success: [{ text: "{skilled} navigates by the sun. You come out through the governor's left ear an hour later, unfollowed.", effects: { heat: -20 } }],
        failure: [{ text: "You're lost in the governor's mustache until dark. At least the police are too.", effects: { delay: 1, heat: -5 } }] },
      { label: "Keep driving", outcomes: [{ text: "The sirens were for someone else. This time.", effects: { heat: 5 } }] }
    ]
  },
  {
    id: "mw-supper-club", title: "Supper Club", where: "road", regions: ["midwest"], tags: ["food", "people"],
    text: "A Wisconsin supper club, wood-paneled and dim, with a relish tray, a brandy old fashioned, and a bartender who has seen everything since 1974.",
    choices: [
      { label: "Have the fish fry", cost: { money: 45 }, outcomes: [{ text: "Perfect walleye. The bartender asks no questions and comps your dessert. \"You look like you've been driving.\"", effects: { health: 6, morale: 14 } }] },
      { label: "Ask the bartender about the road", outcomes: [{ text: "She knows every speed trap from here to Chicago. She writes them on a cocktail napkin.", effects: { heat: -10, miles: 10 } }] }
    ]
  },
  {
    id: "mw-cheese-curds", title: "Squeaky", where: "road", regions: ["midwest"], tags: ["food"],
    text: "A dairy co-op sells cheese curds out of a shed. Fresh enough to squeak. A sign says RAW MILK SOLD HERE (SHHH).",
    choices: [
      { label: "Buy a bag of curds", cost: { money: 10 }, outcomes: [{ text: "They squeak. Everyone is delighted out of all proportion.", effects: { food: 6, morale: 10 } }] },
      { label: "Buy the contraband cheese wheel", cost: { money: 25 }, outcomes: [{ text: "Aged, raw-milk, banned for being \"too European.\" Worth more in a paradise, if you can resist it.", effects: { items: { cheese: 1 } } }] },
      { label: "Just smell the shed", outcomes: [{ text: "The co-op owner laughs and hands you a free sample. It squeaks. It's enough.", effects: { morale: 4 } }] }
    ]
  },
  {
    id: "mw-deer", title: "Deer", where: "road", regions: ["midwest", "plains", "east"], tags: ["vehicle", "danger"],
    text: "A deer appears on the shoulder, does the math, and decides the van is the best place to be.",
    choices: [
      { label: "Brake", outcomes: [
        { weight: 2, text: "You stop. The deer stares, offended, then leaves.", effects: {} },
        { weight: 1, text: "You almost stop.", effects: { van: -22, morale: -8 } }
      ] },
      { label: "Flash the brights", check: { skill: "survival", difficulty: "easy" },
        success: [{ text: "{skilled} knows the trick: brights off, honk once. The deer bounds away.", effects: {} }],
        failure: [{ text: "The deer is now frozen in the road, staring into your soul.", effects: { van: -15 } }] }
    ]
  },
  {
    id: "mw-mega-mall", title: "Mega Mall", where: "road", regions: ["midwest"], tags: ["people"],
    text: "A mall the size of a small town, with a roller coaster inside. Security is everywhere, but they're mall security, which is a different, gentler regime.",
    choices: [
      { label: "Restock at the food court", cost: { money: 35 }, outcomes: [{ text: "You leave with enough pretzels to feed a small army, which you are.", effects: { food: 15 } }] },
      { label: "Ride the roller coaster", cost: { money: 20 }, outcomes: [{ text: "You scream for ninety seconds. It's the most honest anyone has felt in weeks.", effects: { morale: 15 } }] },
      { label: "Walk around", outcomes: [{ text: "Everyone is shopping like nothing is happening. Maybe nothing is, here.", effects: { morale: -3 } }] }
    ]
  },
  {
    id: "in-sponsored-sermon", title: "Sponsored Sermon", where: "road", regions: ["midwest"], tags: ["faction"],
    text: "A highway church in Indiana broadcasts its sermon on a billboard. Today's sermon is \"Blessed Are the Shareholders,\" brought to you by a regional pharmacy chain.",
    choices: [
      { label: "Pull in for the free coffee", outcomes: [{ text: "The coffee is free. The pharmacy coupon book is mandatory. Some of the coupons are good, actually.", effects: { morale: 4, items: { painkillers: 1 }, rep: { faithful: 3 } } }] },
      { label: "Ask the pastor about the sponsorship", check: { skill: "negotiation", difficulty: "medium", faction: "faithful" },
        success: [{ text: "{skilled} asks so respectfully that the pastor admits he hates it. He gives you a box of the pharmacy's surplus medkits, \"for the road.\"", effects: { items: { medkit: 1 }, rep: { faithful: 8 } } }],
        failure: [{ text: "The pastor answers with a forty-minute sermon on the sponsorship's benefits. There is a quiz.", effects: { delay: 1 } }] },
      { label: "Keep driving", outcomes: [{ text: "The billboard follows you for six miles, then another one picks up the sermon." }] }
    ]
  },
  {
    id: "in-corporate-chaplain", title: "Corporate Chaplain", where: "road", regions: ["midwest"], tags: ["checkpoint", "faction"],
    text: "At {stop}, a corporate chaplain in a branded polo offers to bless your van for $30, or for free if you sign up for a credit card.",
    choices: [
      { label: "Pay for the blessing", cost: { money: 30 }, outcomes: [{ text: "He blesses the van, then the tires, then, unprompted, the cupholders. The van does feel blessed.", effects: { van: 5, rep: { faithful: 5 } } }] },
      { label: "Sign up for the card", outcomes: [{ text: "Free blessing. The card arrives at an address that doesn't exist, which is fine.", effects: { heat: 5, morale: -3 } }] },
      { label: "Decline", outcomes: [{ text: "He says he'll pray for you anyway, \"at the standard rate.\"" }] }
    ]
  },
  {
    id: "mw-lake", title: "The Lake", where: "road", regions: ["midwest"], tags: ["people"], weight: 0.7,
    text: "You catch a glimpse of Lake Michigan through the trees: grey, endless, looking like an ocean that decided to stay inland.",
    choices: [
      { label: "Stop at the beach", outcomes: [{ text: "Freezing water, a lighthouse, and a dog that adopts you for an hour. Everyone feels lighter.", effects: { morale: 14, miles: -15 } }] },
      { label: "Keep going", outcomes: [{ text: "It follows you for miles on the left, enormous and calm.", effects: { morale: 4 } }] }
    ]
  },
  {
    id: "mw-cheesehead", title: "Game Day", where: "road", regions: ["midwest"], tags: ["people", "faction"],
    text: "It's game day. Every bar for fifty miles is full, every hat is a hat, and for three hours politics is suspended. A man in a foam hat buys you all a round.",
    choices: [
      { label: "Watch the game with them", outcomes: [{ text: "You cheer for a team you've never heard of. For three hours you belong to something that isn't a side. Your team wins.", effects: { morale: 15, money: -15, rep: { militia: 4 } } }] },
      { label: "Use the cover to slip past a checkpoint", check: { skill: "stealth", difficulty: "easy" },
        success: [{ text: "The checkpoint guards are watching the game on a phone. You roll through in the fourth quarter.", effects: { heat: -15 } }],
        failure: [{ text: "One guard isn't a sports fan. He's very interested in you instead.", effects: { heat: 15 } }] }
    ]
  },
  {
    id: "mw-amish", title: "Buggy on the Shoulder", where: "road", regions: ["midwest", "east"], tags: ["people"],
    text: "A horse-drawn buggy on the shoulder. The family is selling pies from the back. Their regime problems seem to be the same as yours, plus they don't have a van.",
    choices: [
      { label: "Buy pies", cost: { money: 20 }, outcomes: [{ text: "Shoofly pie and apple. The father asks where you're headed, nods, and says nothing else. His wife adds a loaf of bread.", effects: { food: 12, morale: 8 } }] },
      { label: "Help with a loose wheel", requires: { skill: "mechanical" }, outcomes: [{ text: "{skilled} fixes the wheel in ten minutes. You leave with three pies and a jar of apple butter, and the family's quiet blessing.", effects: { food: 15, morale: 10 } }] },
      { label: "Wave and pass carefully", outcomes: [{ text: "The kids wave back. The horse ignores you." }] }
    ]
  },
  {
    id: "mw-truck-stop-church", title: "Truck Stop Chapel", where: "road", regions: ["midwest", "plains", "south"], tags: ["faction", "people"],
    text: "A truck stop with a chapel in a converted trailer. The chaplain, a former trucker, offers coffee, a cot, and \"no sermon unless you ask.\"",
    choices: [
      { label: "Take the coffee and cot", outcomes: [{ text: "Everyone sleeps for four hours. The chaplain prays for you while you sleep, which you only find out because he tells you. It's oddly nice.", effects: { health: 6, cure: "exhausted", rep: { faithful: 6 } } }] },
      { label: "Ask him about the road east", outcomes: [{ text: "Forty years of trucking. He knows every scale house and every cop who takes cigarettes instead of tickets.", effects: { heat: -10, items: { cigarettes: 1 } } }] }
    ]
  },
  {
    id: "mw-blue-county", title: "The County Line", where: "road", regions: ["midwest", "plains"], tags: ["people", "faction"],
    text: "You cross into a county that voted the other way. Nothing visibly changes, except the billboards stop yelling and the gas station has a bulletin board with a vegan potluck flyer.",
    choices: [
      { label: "Stop at the gas station", outcomes: [{ text: "The cashier sees your plates, smiles, and slides a Resistance flyer into your bag with your receipt.", effects: { rep: { resistance: 8 }, morale: 6 } }] },
      { label: "Keep going", outcomes: [{ text: "Another line, twenty miles on. Then the billboards start again." }] }
    ]
  },
  {
    id: "pl-dakota-snow", title: "Plains Blizzard", where: "road", regions: ["plains"], tags: ["weather", "danger"], conditions: { weather: ["snow"] },
    text: "The plains have no trees to stop the wind. The snow goes sideways, then up. You can't see the road, the ditches or the sky.",
    choices: [
      { label: "Stop at a farmhouse light", outcomes: [{ text: "An old couple feeds you hotdish and lets you sleep on the couch. In the morning, the husband digs out your van without being asked.", effects: { delay: 1, health: 6, food: 6, morale: 10 } }] },
      { label: "Follow the rumble strips", check: { skill: "survival", difficulty: "hard" },
        success: [{ text: "{skilled} drives by sound. Hours later, you're through it.", effects: { miles: 20 } }],
        failure: [{ text: "You end up in a ditch. A plow driver finds you at dawn. Everyone's cold and furious.", effects: { health: -14, van: -18, delay: 1 } }] }
    ]
  },
  {
    id: "pl-sunflowers", title: "Sunflowers", where: "road", regions: ["plains"], tags: ["people"], weight: 0.6, conditions: { seasons: ["summer"] },
    text: "A field of sunflowers that goes on for miles, every head turned the same way, toward the sun, as if waiting for instructions.",
    choices: [
      { label: "Pull over and walk in", outcomes: [{ text: "You take the best photo of the trip. {member} cries a little and doesn't explain why.", effects: { morale: 12 } }] },
      { label: "Drive by slowly", outcomes: [{ text: "Yellow on both sides, for ten minutes.", effects: { morale: 6 } }] }
    ]
  },
  {
    id: "pl-rest-area-sting", title: "Rest Area", where: "road", regions: ["plains", "midwest", "mountain"], tags: ["heat", "danger"], conditions: { minHeat: 30 },
    text: "The rest area has a family in a minivan, a trucker asleep, and a man in a windbreaker who has been reading the same newspaper upside down for twenty minutes.",
    choices: [
      { label: "Leave immediately", outcomes: [{ text: "He folds the newspaper and makes a call as you pull out.", effects: { heat: 10 } }] },
      { label: "Act completely normal", check: { skill: "stealth", difficulty: "medium" },
        success: [{ text: "You use the bathroom, buy a soda, and leave. He reports seeing \"a boring family.\"", effects: { heat: -10 } }],
        failure: [{ text: "You act so normal that it's suspicious. He follows you to the on-ramp.", effects: { heat: 20 } }] },
      { label: "Ask him if he needs help with his newspaper", requires: { skill: "intimidation" }, outcomes: [{ text: "{skilled} turns the newspaper right side up for him. He leaves without a word.", effects: { heat: -5 } }] }
    ]
  },
  {
    id: "mw-factory-town", title: "Factory Town", where: "road", regions: ["midwest"], tags: ["people", "faction"],
    text: "A factory town where the factory closed. The regime put up a sign saying it's coming back. It's been saying that for twelve years. The union hall is still open.",
    choices: [
      { label: "Stop at the union hall", outcomes: [{ text: "Coffee, a bulletin board of jobs that don't exist, and an old machinist who fixes your van's alternator for the price of the parts.", effects: { van: 15, money: -20, rep: { resistance: 5 }, morale: 6 } }] },
      { label: "Buy lunch at the diner", cost: { money: 20 }, outcomes: [{ text: "Everyone in the diner used to work at the factory. They talk about it like it's a person who died.", effects: { health: 4, morale: 2 } }] }
    ]
  },
  {
    id: "mw-water-tower", title: "Water Tower", where: "road", regions: ["midwest", "plains"], tags: ["people"],
    text: "A town water tower painted with the town's name and, below it, in smaller letters someone added at night: WE'RE NOT ALL LIKE THIS.",
    choices: [
      { label: "Honk twice", outcomes: [{ text: "Somewhere in town, someone honks back.", effects: { morale: 10 } }] },
      { label: "Drive on", outcomes: [{ text: "You notice it. That's something.", effects: { morale: 4 } }] }
    ]
  },
  {
    id: "pl-crop-duster", title: "Crop Duster", where: "road", regions: ["plains", "midwest"], tags: ["danger"],
    text: "A crop duster makes a pass over the highway, low enough that you can see the pilot's mustache. Then it turns around for another.",
    choices: [
      { label: "Get off the road", outcomes: [{ text: "The pilot was just dusting. You lose an hour and some dignity.", effects: { miles: -20 } }] },
      { label: "Keep driving with the windows up", outcomes: [
        { weight: 2, text: "The van is now a slightly different color. Everyone's fine.", effects: { morale: -4 } },
        { weight: 1, text: "The vents were open. {member} spends the afternoon coughing.", effects: { healthOne: -12, condition: "sick" } }
      ] }
    ]
  },
  {
    id: "mw-library", title: "Small-Town Library", where: "road", regions: ["midwest", "plains", "south", "mountain"], tags: ["people", "faction"],
    text: "A small-town library with half its shelves empty and a sign: BOOKS UNDER REVIEW. The librarian, eighty if she's a day, is keeping a second catalog in her head.",
    choices: [
      { label: "Ask what she recommends", outcomes: [{ text: "She takes you to the basement. The books are all there, in boxes labeled CHRISTMAS DECORATIONS. She lends you three, \"due back whenever this is over.\"", effects: { items: { books: 1 }, morale: 10, rep: { resistance: 5 } } }] },
      { label: "Donate a book", requires: { item: "books" }, outcomes: [{ text: "She files your contraband in the Christmas decorations box and gives you a hug you didn't expect.", effects: { items: { books: -1 }, morale: 14, rep: { resistance: 10 } } }] },
      { label: "Use the bathroom and go", outcomes: [{ text: "The bathroom has a poem taped to the mirror. It's a good poem." }] }
    ]
  }
];
