import type { GameEvent } from "../../types";

// Batch 7: arriving in the paradises. Real help, gentle ribbing.
export const PARADISE_EVENTS: GameEvent[] = [
  // ------------------------------------------------ Seattle
  {
    id: "pa-seattle-fish", title: "Fish Market", where: "paradise", tags: ["arrival", "food"], conditions: { stops: ["seattle"] },
    text: "At the waterfront market, fishmongers are throwing salmon to each other over the heads of tourists. One of them sees your plates, yells \"REFUGEES!\" and throws a fish at you, affectionately.",
    choices: [
      { label: "Catch it", check: { skill: "survival", difficulty: "easy" },
        success: [{ text: "{skilled} catches it one-handed. The crowd cheers. The fish is yours, plus a bag of smoked salmon \"for the road.\"", effects: { food: 15, morale: 12 } }],
        failure: [{ text: "The fish hits {member} square in the chest. They give you the fish anyway, and a towel.", effects: { food: 10, morale: 8 } }] },
      { label: "Duck", outcomes: [{ text: "The fish hits a tourist. Everyone laughs, including the tourist. They give you a discount out of guilt.", effects: { food: 6, morale: 6 } }] }
    ]
  },
  {
    id: "pa-seattle-tech", title: "Startup Offer", where: "paradise", tags: ["arrival", "money"], conditions: { stops: ["seattle"] },
    text: "A tech founder in a vest overhears your story at a coffee shop and wants to build an app about it. \"Uber, but for escaping.\" He offers $200 for an hour of \"user research.\"",
    choices: [
      { label: "Take the money", outcomes: [{ text: "An hour of questions about your \"pain points.\" He pays, then asks if you'd consider equity instead. You would not.", effects: { money: 200, morale: -3 } }] },
      { label: "Ask him to donate to the Resistance instead", check: { skill: "persuasion", difficulty: "medium" },
        success: [{ text: "{skilled} reframes it as \"impact.\" He donates, gives you a burner laptop from his drawer of burner laptops, and posts about it.", effects: { items: { laptop: 1 }, rep: { resistance: 10 } } }],
        failure: [{ text: "He says he'll \"circle back.\" He will not circle back.", effects: {} }] }
    ]
  },
  {
    id: "pa-seattle-rain-gear", title: "Outfitter", where: "paradise", tags: ["arrival"], conditions: { stops: ["seattle"] },
    text: "An outdoor co-op the size of an airplane hangar, with a climbing wall, a rain-testing room and a staff of very calm people in fleece who want to know your trip details.",
    choices: [
      { label: "Get outfitted for the mountains", cost: { money: 40 }, outcomes: [{ text: "Rain shells, wool socks, and a quiet staff discount when they hear where you're headed.", effects: { health: 6, morale: 8, items: { "topo-maps": 1 } } }] },
      { label: "Just try the rain room", outcomes: [{ text: "Everyone stands in the fake rain for a while. It's identical to the real rain outside. You leave satisfied.", effects: { morale: 5 } }] }
    ]
  },
  // ------------------------------------------------ Twin Cities
  {
    id: "pa-mpls-nice", title: "Minnesota Nice", where: "paradise", tags: ["arrival", "people"], conditions: { stops: ["minneapolis"] },
    text: "A woman in a parka helps you park, gives you directions you didn't ask for, invites you to dinner, and apologizes four times for nothing. She will not take no for an answer, politely.",
    choices: [
      { label: "Go to dinner", outcomes: [{ text: "Hotdish, bars, and a husband who says \"oh, for sure\" every time anyone speaks. They send you off with leftovers in a container you're told to keep.", effects: { food: 12, health: 6, morale: 12 } }] },
      { label: "Say no thank you", outcomes: [{ text: "She says \"oh, okay then\" in a tone that will haunt you. She brings the hotdish to the van anyway.", effects: { food: 8, morale: 6 } }] }
    ]
  },
  {
    id: "pa-mpls-skyway", title: "Skyways", where: "paradise", tags: ["arrival"], conditions: { stops: ["minneapolis"] },
    text: "Downtown is connected by a maze of enclosed bridges so you never have to go outside. You go in to find a pharmacy and come out four hours later in a different decade.",
    choices: [
      { label: "Explore", outcomes: [{ text: "You find the pharmacy, a food court, a dentist, and a man who's lived in the skyways since 2003. Everything you needed was up here.", effects: { morale: 8, items: { antibiotics: 1 }, money: -20 } }] },
      { label: "Stay at street level", outcomes: [{ text: "It's cold. You understand the skyways now." }] }
    ]
  },
  {
    id: "pa-mpls-lakes", title: "City of Lakes", where: "paradise", tags: ["arrival", "health"], conditions: { stops: ["minneapolis"] },
    text: "A lake in the middle of the city with a walking path, a band shell and a sign: CANOES FREE FOR TRAVELERS. Nobody's ever seen a sign like that.",
    choices: [
      { label: "Take a canoe out", outcomes: [{ text: "An hour on the water. Loons. Nobody talks about the road at all.", effects: { morale: 14, health: 4 } }] },
      { label: "Rest on the shore", outcomes: [{ text: "A long nap in the grass. Someone covers {member} with a jacket and walks away.", effects: { health: 8, cure: "exhausted" } }] }
    ]
  },
  // ------------------------------------------------ Madison
  {
    id: "pa-madison-market", title: "Farmers' Market on the Square", where: "paradise", tags: ["arrival", "food"], conditions: { stops: ["madison"] },
    text: "A farmers' market circles the capitol. Everyone walks counterclockwise. You walk clockwise by mistake and are gently, firmly turned around by a woman holding a basket of beets.",
    choices: [
      { label: "Shop counterclockwise", cost: { money: 25 }, outcomes: [{ text: "Bread, cheese, spicy cheese bread, honey, and a lecture on beet varieties from a farmer who is clearly thrilled you asked.", effects: { food: 15, morale: 10 } }] },
      { label: "Ask a farmer for seeds to carry east", outcomes: [{ text: "She gives you heirloom seeds \"for whoever's planting in Vermont.\"", effects: { items: { seeds: 1 }, morale: 6 } }] }
    ]
  },
  {
    id: "pa-madison-students", title: "Student Union", where: "paradise", tags: ["arrival", "people"], conditions: { stops: ["madison"] },
    text: "The student union terrace on the lake, with brightly colored chairs and a hundred students arguing about everything except the thing you'd expect.",
    choices: [
      { label: "Join a debate", check: { skill: "persuasion", difficulty: "easy" },
        success: [{ text: "{skilled} wins a debate about whether cheese curds are a meal. The prize is a pitcher and a free night on a dorm floor.", effects: { morale: 12, health: 4 } }],
        failure: [{ text: "You lose a debate to a sophomore. She's very gracious about it.", effects: { morale: 6 } }] },
      { label: "Ask about the van", outcomes: [{ text: "An engineering club adopts the van for an afternoon. It comes back with a new alternator and a sticker.", effects: { van: 20 } }] }
    ]
  },
  {
    id: "pa-madison-capitol", title: "The Capitol Steps", where: "paradise", tags: ["arrival", "faction"], conditions: { stops: ["madison"] },
    text: "There's been a rally on the capitol steps every day for three years. They've gotten good at it: there's a coffee rotation, a sign library and a hospitality tent for refugees.",
    choices: [
      { label: "Visit the hospitality tent", outcomes: [{ text: "Coffee, cots, a free medkit, and a volunteer who writes your names in a ledger \"so someone knows you passed through.\"", effects: { items: { medkit: 1 }, health: 6, rep: { resistance: 8 } } }] },
      { label: "Borrow a sign and join the rally", outcomes: [{ text: "Your sign says RESPECTFULLY, NO. It's a crowd favorite.", effects: { morale: 14, rep: { resistance: 12 } } }] }
    ]
  },
  // ------------------------------------------------ Chicago
  {
    id: "pa-chicago-pizza", title: "The Pizza Question", where: "paradise", tags: ["arrival", "food", "people"], conditions: { stops: ["chicago"] },
    text: "You ask a local where to get pizza. Two other locals overhear. Within a minute there are six people on a sidewalk arguing deep dish against tavern-cut with the intensity of a constitutional convention.",
    choices: [
      { label: "Get deep dish", cost: { money: 30 }, outcomes: [{ text: "It takes forty-five minutes and it's basically a casserole. Everyone eats until they can't move.", effects: { food: 10, morale: 12 } }] },
      { label: "Get tavern-cut", cost: { money: 25 }, outcomes: [{ text: "Thin, crispy, cut in squares. The locals who recommended it nod at you with deep respect.", effects: { food: 8, morale: 12, rep: { resistance: 3 } } }] },
      { label: "Refuse to pick a side", outcomes: [{ text: "Both camps feed you out of pity. You get both. This is the way.", effects: { food: 12, morale: 10 } }] }
    ]
  },
  {
    id: "pa-chicago-dibs", title: "Dibs", where: "paradise", tags: ["arrival", "people"], conditions: { stops: ["chicago"], seasons: ["winter", "fall"] },
    text: "You find the only open parking spot on the block. There's a lawn chair in it. Nobody's sitting in the chair. The chair is the point.",
    choices: [
      { label: "Move the chair", outcomes: [{ text: "Within ninety seconds, a man in a parka appears from nowhere, as if summoned. You put the chair back. He nods. Order is restored.", effects: { morale: -4 } }] },
      { label: "Respect the chair", outcomes: [{ text: "You park six blocks away. A neighbor sees you respect the chair and, impressed, gives you directions to a free safe house.", effects: { morale: 6, heat: -10 } }] }
    ]
  },
  {
    id: "pa-chicago-el", title: "The L", where: "paradise", tags: ["arrival"], conditions: { stops: ["chicago"] },
    text: "You leave the van and ride the elevated train downtown. A man on the car is selling candy bars for a basketball team that may or may not exist. Everyone buys one anyway.",
    choices: [
      { label: "Buy a candy bar", cost: { money: 2 }, outcomes: [{ text: "It's a good candy bar. The team, he says, is \"rebuilding.\"", effects: { morale: 5 } }] },
      { label: "Ride the loop and look at the city", outcomes: [{ text: "Steel and brick and the lake flashing between buildings. Nobody checks your papers once. It's the safest you've felt in a thousand miles.", effects: { morale: 12, heat: -5 } }] }
    ]
  },
  {
    id: "pa-chicago-liqueur", title: "Local Spirit", where: "paradise", tags: ["arrival", "people"], conditions: { stops: ["chicago"] },
    text: "A bartender pours four shots of the city's signature liqueur, which tastes like a grapefruit that has given up on life. \"It's a rite of passage,\" he says. \"You're Chicagoans now.\"",
    choices: [
      { label: "Take the shot", outcomes: [{ text: "Everyone makes the face. The bartender takes a photo of the face for a wall of faces. You're in good company.", effects: { morale: 10 } }] },
      { label: "Ask for a beer instead", outcomes: [{ text: "He pours you a local beer and tells you about every bar on the way to Indiana that won't ask questions.", effects: { morale: 6, heat: -5 } }] }
    ]
  },
  // ------------------------------------------------ Baltimore
  {
    id: "pa-baltimore-hon", title: "Hon", where: "paradise", tags: ["arrival", "people"], conditions: { stops: ["baltimore"] },
    text: "A woman on a rowhouse stoop calls each of you \"hon\" individually, then collectively, then asks if you've eaten, and does not wait for the answer.",
    choices: [
      { label: "Let her feed you", outcomes: [{ text: "Crab cakes on the stoop, two lawn chairs and a cooler. Her grandson fixes your taillight while you eat.", effects: { food: 10, morale: 12, van: 5 } }] },
      { label: "Say you're fine", outcomes: [{ text: "\"You're not fine, hon.\" She feeds you anyway.", effects: { food: 8, morale: 8 } }] }
    ]
  },
  {
    id: "pa-baltimore-harbor", title: "Harbor", where: "paradise", tags: ["arrival"], conditions: { stops: ["baltimore"] },
    text: "The harbor at sunset: paddle boats shaped like dragons, a lighthouse, and a man fishing who claims he's caught the same fish eleven times. \"We have an understanding.\"",
    choices: [
      { label: "Rent a dragon paddle boat", cost: { money: 15 }, outcomes: [{ text: "Four adults in a dragon, pedaling in circles. It's the dumbest, best hour of the trip.", effects: { morale: 15 } }] },
      { label: "Talk to the fisherman", outcomes: [{ text: "He knows every dock where boats go north without paperwork. He's never needed to use one. He hopes you won't either.", effects: { heat: -10, morale: 4 } }] }
    ]
  },
  // ------------------------------------------------ Philadelphia
  {
    id: "pa-philly-cheesesteak", title: "Cheesesteak", where: "paradise", tags: ["arrival", "food"], conditions: { stops: ["philadelphia"] },
    text: "Two cheesesteak shops face each other across an intersection, lit like rival casinos. Each has a line. Each line glares at the other line.",
    choices: [
      { label: "Pick the left one", cost: { money: 24 }, outcomes: [{ text: "You order wrong, the man yells, you order right, he smiles. It's excellent. The right-side line boos you, warmly.", effects: { food: 8, morale: 10 } }] },
      { label: "Pick the right one", cost: { money: 24 }, outcomes: [{ text: "You order right on the first try. The man is suspicious of how right you ordered. It's excellent.", effects: { food: 8, morale: 10 } }] },
      { label: "Ask a local where they actually eat", outcomes: [{ text: "Neither. A corner place six blocks away. It's better, and cheaper, and the owner gives you a hoagie for the road.", effects: { food: 10, morale: 8, money: -10 } }] }
    ]
  },
  {
    id: "pa-philly-bell", title: "The Bell", where: "paradise", tags: ["arrival", "faction"], conditions: { stops: ["philadelphia"] },
    text: "You go to see the old cracked bell. A park ranger is giving the full, unedited history to a crowd of refugees, out loud, on purpose, and nobody stops her.",
    choices: [
      { label: "Listen to the whole thing", outcomes: [{ text: "She ends with the inscription and asks everyone to say it with her. You say it. Your voice does something on the last word.", effects: { morale: 15, rep: { resistance: 8 } } }] },
      { label: "Take a photo and go", outcomes: [{ text: "It's smaller than you'd think. Everything that matters is.", effects: { morale: 6 } }] }
    ]
  },
  {
    id: "pa-philly-jawn", title: "Jawn", where: "paradise", tags: ["arrival", "people"], conditions: { stops: ["philadelphia"] },
    text: "A teenager tells you to \"grab that jawn\" while pointing at, as far as you can tell, several unrelated things. He's helping you unload. He's very fast.",
    choices: [
      { label: "Grab the jawn", outcomes: [{ text: "You grab a jawn. It's the right jawn. He gives you a thumbs up and directions to a free clinic.", effects: { health: 8, morale: 6 } }] },
      { label: "Ask which jawn", outcomes: [{ text: "\"All of them, it's all jawn.\" A lesson in linguistics, and a hand with every bag.", effects: { morale: 8 } }] }
    ]
  },
  // ------------------------------------------------ any paradise
  {
    id: "pa-co-op", title: "Co-op Orientation", where: "paradise", tags: ["arrival", "food"],
    text: "The food co-op in {stop} will sell to non-members only after a 40-minute orientation on consensus decision-making, bulk bins and \"the jar policy.\"",
    choices: [
      { label: "Sit through orientation", outcomes: [{ text: "You learn the jar policy. You'll never forget the jar policy. Member prices on everything.", effects: { delay: 1, food: 15, morale: -3, money: -25 } }] },
      { label: "Buy at the corner store instead", cost: { money: 35 }, outcomes: [{ text: "Fine groceries, no orientation, slightly sad produce.", effects: { food: 12 } }] }
    ]
  },
  {
    id: "pa-pronouns", title: "Name Tags", where: "paradise", tags: ["arrival", "people"],
    text: "At a refugee welcome center in {stop}, the volunteer hands you name tags with space for your name, pronouns, dietary restrictions, and \"one thing you're grateful for.\"",
    choices: [
      { label: "Fill them out earnestly", outcomes: [{ text: "Everyone writes \"the van\" for grateful. The volunteer cries a little. You get priority at the clinic.", effects: { health: 10, morale: 8 } }] },
      { label: "Ask for the short version", outcomes: [{ text: "There's a short version. It's just your name. It's still lovely.", effects: { health: 6 } }] }
    ]
  },
  {
    id: "pa-sanctuary-church", title: "Sanctuary Church", where: "paradise", tags: ["arrival", "faction"],
    text: "A church in {stop} has a banner: ALL ARE WELCOME, AND WE MEAN ALL. The pastor runs a shelter in the basement and a legal clinic in the choir loft.",
    choices: [
      { label: "Stay the night", outcomes: [{ text: "Cots, soup and a choir rehearsing above you. The legal clinic clears a warrant you didn't know you had.", effects: { health: 8, heat: -20, rep: { faithful: 8, resistance: 5 } } }] },
      { label: "Donate", cost: { money: 30 }, outcomes: [{ text: "The pastor blesses the van, then gives you a box of donated medicine \"for anyone you meet on the road.\"", effects: { items: { painkillers: 1, electrolytes: 1 }, rep: { faithful: 10 } } }] }
    ]
  },
  {
    id: "pa-mural", title: "Mural", where: "paradise", tags: ["arrival", "people"],
    text: "A whole wall in {stop} painted with the faces of people who made it out of the hellhole. There's room for more. An artist with a ladder asks if you'd like to be on it.",
    choices: [
      { label: "Pose for the mural", outcomes: [{ text: "She sketches you leaning on the van. \"For when you get there,\" she says. Everyone feels, for a moment, like the trip is already a story.", effects: { morale: 15, delay: 1 } }] },
      { label: "Not yet", outcomes: [{ text: "\"Come back on your way to visit,\" she says. You promise.", effects: { morale: 6 } }] }
    ]
  },
  {
    id: "pa-zoning", title: "Zoning Hearing", where: "paradise", tags: ["arrival"],
    text: "You try to park the van overnight in {stop}. It turns out overnight parking is the subject of a three-year zoning debate. Tonight is a public hearing.",
    choices: [
      { label: "Testify", check: { skill: "persuasion", difficulty: "easy" },
        success: [{ text: "{skilled} gives three minutes of testimony so moving the board votes to allow refugee parking on the spot. You get a permit and applause.", effects: { morale: 12, rep: { resistance: 5 } } }],
        failure: [{ text: "You're the fourteenth speaker. The hearing is continued to next month.", effects: { morale: -4, money: -20 } }] },
      { label: "Park in the church lot", outcomes: [{ text: "The church has its own zoning debate, but the pastor ignores it.", effects: {} }] }
    ]
  },
  {
    id: "pa-bookstore", title: "The Bookstore", where: "paradise", tags: ["arrival"],
    text: "An independent bookstore in {stop} has a whole section labeled BANNED ELSEWHERE, with a staff pick from every banned author. The cat asleep on the register has a name tag.",
    choices: [
      { label: "Buy a stack", cost: { money: 30 }, outcomes: [{ text: "Three novels, one poetry collection, a field guide. The cat approves.", effects: { items: { books: 2 }, morale: 6 } }] },
      { label: "Sell your contraband", requires: { item: "textbooks" }, outcomes: [{ text: "The owner buys the textbooks for a school that needs them, at a price that's almost charity.", effects: { items: { textbooks: -1 }, money: 70 } }] },
      { label: "Pet the cat", outcomes: [{ text: "The cat permits it. That's enough.", effects: { morale: 5 } }] }
    ]
  },
  {
    id: "pa-therapy-dogs", title: "Therapy Dogs", where: "paradise", tags: ["arrival", "health"],
    text: "At the welcome center in {stop}, a volunteer arrives with three therapy dogs and the words \"you look like you need these.\" You do.",
    choices: [
      { label: "Sit with the dogs", outcomes: [{ text: "Twenty minutes on a carpet, a golden retriever in every lap. Nobody's exhausted anymore. Nobody's sad, for twenty minutes.", effects: { morale: 15, cure: "exhausted" } }] }
    ]
  }
];
