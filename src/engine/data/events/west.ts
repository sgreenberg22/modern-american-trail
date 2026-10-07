import type { GameEvent } from "../../types";

// Batch 2: the Northwest and the mountains.
export const WEST_EVENTS: GameEvent[] = [
  {
    id: "nw-logging-convoy", title: "Logging Convoy", where: "road", regions: ["northwest", "mountain"], tags: ["vehicle"],
    text: "Six log trucks in a row, doing 45 on a two-lane mountain road. The lead truck has a bumper sticker that says IF YOU CAN READ THIS, YOU'RE A NERD.",
    choices: [
      { label: "Settle in behind them", outcomes: [{ text: "You learn a great deal about patience and the back of a log truck.", effects: { miles: -30 } }] },
      { label: "Pass on the straightaway", check: { skill: "mechanical", difficulty: "medium" },
        success: [{ text: "{skilled} times it perfectly. The van, briefly, is fast.", effects: { miles: 20 } }],
        failure: [{ text: "A log shifts. So does your rear bumper.", effects: { van: -18, morale: -6 } }] }
    ]
  },
  {
    id: "nw-rain-week", title: "The Rain", where: "road", regions: ["northwest"], tags: ["weather"],
    text: "It's been raining for so long that {member} has started referring to the sun as \"a rumor.\" The windshield wipers have developed a limp.",
    choices: [
      { label: "Buy wiper blades at a gas station", cost: { money: 20 }, outcomes: [{ text: "New blades. You can see the rain clearly now.", effects: { morale: 5 } }] },
      { label: "Embrace it", outcomes: [{ text: "Someone puts on a sad playlist. It's the right call. Everyone feels bad in a cozy way.", effects: { morale: 4 } }] }
    ]
  },
  {
    id: "nw-espresso", title: "Drive-Through Espresso", where: "road", regions: ["northwest"], tags: ["food", "people"],
    text: "A drive-through espresso hut on a logging road, run by a woman with a nose ring and an assault on the senses called a \"lavender honey oat breve.\"",
    choices: [
      { label: "Order for everyone", cost: { money: 24 }, outcomes: [{ text: "She asks where you're headed. You tell her. She adds an extra shot to each, no charge, and a wink that means \"good luck.\"", effects: { morale: 12 } }] },
      { label: "Ask if she needs help", outcomes: [{ text: "She does: a delivery of oat milk to her cousin's place forty miles east. She pays in coffee and cash.", effects: { money: 40, items: { coffee: 1 }, delay: 1 } }] },
      { label: "Drive on", outcomes: [{ text: "You can smell the lavender for nine miles." }] }
    ]
  },
  {
    id: "nw-ferry", title: "Ferry Line", where: "road", regions: ["northwest"], tags: ["people"],
    text: "A ferry cuts an hour off the route. The line is two hours. A man in front of you has a kayak, a goat, and a strong theory about fluoride.",
    choices: [
      { label: "Take the ferry", cost: { money: 30 }, outcomes: [{ text: "The goat is the best passenger on the boat. You make good time.", effects: { miles: 40, morale: 6 } }] },
      { label: "Drive around", outcomes: [{ text: "The long way. The fluoride man waves goodbye. The goat does not.", effects: { fuel: -2 } }] }
    ]
  },
  {
    id: "nw-sasquatch", title: "Sighting", where: "road", regions: ["northwest", "mountain"], tags: ["camp"],
    text: "At a campsite, {member} swears they saw something large and hairy moving between the trees. A sign at the trailhead: SASQUATCH IS A PROTECTED CITIZEN (UNLIKE SOME).",
    choices: [
      { label: "Investigate", check: { skill: "survival", difficulty: "easy" },
        success: [{ text: "{skilled} follows the tracks to a very large man in a fur coat, who shares his campfire and his trail mix.", effects: { food: 8, morale: 10 } }],
        failure: [{ text: "Nothing. But {member} trips on a root and won't stop talking about it.", effects: { healthOne: -10, condition: "injured" } }] },
      { label: "Lock the van doors", outcomes: [{ text: "Everyone sleeps badly, together.", effects: { morale: -4 } }] }
    ]
  },
  {
    id: "mt-big-sky", title: "Big Sky", where: "road", regions: ["mountain", "plains"], tags: ["people"], weight: 0.7,
    text: "You stop on a ridge. The sky here is so big it's unsettling, and nobody says anything for a while. Even the regime can't put a checkpoint on this.",
    choices: [
      { label: "Stay a while", outcomes: [{ text: "You eat lunch on the hood. For a minute, it's just a road trip.", effects: { morale: 14, miles: -20 } }] },
      { label: "Take a photo and go", outcomes: [{ text: "It doesn't come out. It never does.", effects: { morale: 5 } }] }
    ]
  },
  {
    id: "mt-hot-springs", title: "Hot Springs", where: "road", regions: ["mountain"], tags: ["health"],
    text: "A hand-painted sign points down a dirt road: HOT SPRINGS — HONOR SYSTEM — $5. A second sign underneath says NO POLITICS IN THE WATER.",
    choices: [
      { label: "Soak", cost: { money: 15 }, outcomes: [{ text: "Everyone soaks. Nobody talks about politics. It is the best two hours of the trip.", effects: { health: 8, morale: 12, cure: "exhausted" } }] },
      { label: "Skip it", outcomes: [{ text: "You drive past. {member} looks back at the steam like a lost love." }] }
    ]
  },
  {
    id: "mt-bison", title: "Bison Jam", where: "road", regions: ["mountain", "plains"], tags: ["danger"],
    text: "A herd of bison has stopped on the highway. They are not in a hurry. One of them is looking directly at the van in a way that feels personal.",
    choices: [
      { label: "Wait", outcomes: [{ text: "Two hours. The bison leave when they're ready, not before.", effects: { miles: -40 } }] },
      { label: "Inch through", check: { skill: "survival", difficulty: "medium" },
        success: [{ text: "{skilled} reads the herd and threads the van through a gap. The big one snorts approval, or contempt.", effects: {} }],
        failure: [{ text: "The big one makes a decision about the van's door.", effects: { van: -25, morale: -8 } }] },
      { label: "Honk", outcomes: [{ text: "The bison do not respect horns. They respect nothing. You learn this the hard way.", effects: { van: -20 } }] }
    ]
  },
  {
    id: "mt-ghost-town", title: "Ghost Town", where: "road", regions: ["mountain"], tags: ["scavenge"],
    text: "A mining town that died twice: once when the silver ran out and again when the regime shut down the one museum about it.",
    choices: [
      { label: "Look around", check: { skill: "survival", difficulty: "easy" },
        success: [{ text: "The old general store still has canned peaches and a spool of copper wire someone forgot to steal.", effects: { food: 8, items: { copper: 1 } } }],
        failure: [{ text: "A floorboard gives. {member}'s ankle gives with it.", effects: { healthOne: -12, condition: "injured" } }] },
      { label: "Read the historical marker", outcomes: [{ text: "Someone has taped over the part about the miners' strike. Someone else has untaped it.", effects: { morale: 6 } }] }
    ]
  },
  {
    id: "mt-missoula", title: "College Town", where: "road", regions: ["mountain"], tags: ["people", "faction"],
    text: "A college town in the middle of the mountains, a little blue dot in a red sea. The coffee shop has a back room. The back room has a sign-up sheet.",
    choices: [
      { label: "Sign the sheet", outcomes: [{ text: "You're added to a phone tree. Somebody's grandmother brings sandwiches to the van.", effects: { food: 10, rep: { resistance: 10 }, heat: 5 } }] },
      { label: "Ask the students for help with the van", check: { skill: "persuasion", difficulty: "easy" },
        success: [{ text: "Two engineering students fix the van as a class project. They give it a B-plus.", effects: { van: 20 } }],
        failure: [{ text: "The students want to interview you for a podcast. It's four hours.", effects: { delay: 1, morale: 4 } }] },
      { label: "Keep moving", outcomes: [{ text: "Blue dots are watched closely. Best not to linger." }] }
    ]
  },
  {
    id: "mt-elk", title: "Elk Crossing", where: "road", regions: ["mountain", "northwest"], tags: ["vehicle", "danger"],
    text: "Dusk. Something huge steps out of the trees and stands in the middle of the road, considering its options.",
    choices: [
      { label: "Brake hard", check: { skill: "mechanical", difficulty: "easy" },
        success: [{ text: "You stop with a foot to spare. The elk walks off, unbothered, like it owned the road. It did.", effects: { morale: 5 } }],
        failure: [{ text: "You stop. The cooler doesn't. Food everywhere.", effects: { food: -12 } }] },
      { label: "Swerve", outcomes: [
        { weight: 1, text: "You miss the elk. You don't miss the ditch.", effects: { van: -20, delay: 1 } },
        { weight: 1, text: "You miss everything. Everyone screams anyway.", effects: { morale: -5 } }
      ] }
    ]
  },
  {
    id: "mt-ranch-hand", title: "Ranch Job", where: "road", regions: ["mountain", "plains"], tags: ["money", "people"],
    text: "A rancher at a gas station is short-handed for the day and doesn't care who you voted for. \"Can you lift a hay bale?\" is his only question.",
    choices: [
      { label: "Work the day", outcomes: [{ text: "Hard work, decent pay, and lunch with his whole family. Nobody mentions politics once. You leave sore and weirdly hopeful.", effects: { delay: 1, money: 80, food: 8, morale: 6 } }] },
      { label: "Fix his truck instead", requires: { skill: "mechanical" }, check: { skill: "mechanical", difficulty: "easy" },
        success: [{ text: "{skilled} has the truck running in an hour. He pays you, then sends you off with a socket set he \"doesn't need anymore.\"", effects: { money: 50, items: { "socket-set": 1 } } }],
        failure: [{ text: "The truck is beyond help. He pays you for trying, which is decent of him.", effects: { money: 20 } }] },
      { label: "Pass", outcomes: [{ text: "He tips his hat. Nobody's hurt by it." }] }
    ]
  },
  {
    id: "mt-wildfire-evac", title: "Evacuation Route", where: "road", regions: ["mountain", "northwest"], tags: ["danger", "weather"], conditions: { seasons: ["summer", "fall"] },
    text: "Every car on the highway is heading the other way, loaded with dogs and photo albums. A sheriff waves you down. \"It's a hoax,\" he says, \"but turn around anyway.\"",
    choices: [
      { label: "Turn around and wait it out", outcomes: [{ text: "You spend a day at a church gym with evacuees. It's crowded and sad and full of people sharing food.", effects: { delay: 1, morale: -4, food: 6 } }] },
      { label: "Take the fire road", check: { skill: "survival", difficulty: "hard" },
        success: [{ text: "{skilled} reads the smoke and finds the gap. You come out ahead, smelling like a campfire.", effects: { miles: 30, health: -4 } }],
        failure: [{ text: "Visibility zero. You make it, coughing, with the paint on one side blistered.", effects: { health: -18, van: -20 } }] },
      { label: "Help load an evacuee's van", outcomes: [{ text: "An old man and his three dogs. He presses a jar of huckleberry jam and a ham radio into your hands. \"Listen for the weather,\" he says.", effects: { delay: 1, items: { "ham-radio": 1 }, morale: 10 } }] }
    ]
  },
  {
    id: "mt-surveillance-balloon", title: "Weather Balloon", where: "road", regions: ["mountain", "plains"], tags: ["heat"],
    text: "A white balloon drifts overhead, matching your speed exactly. The radio says it's a weather balloon. The radio says that a lot.",
    choices: [
      { label: "Drive under trees", check: { skill: "survival", difficulty: "medium" },
        success: [{ text: "{skilled} picks a forest road. The balloon loses interest.", effects: { heat: -10 } }],
        failure: [{ text: "The forest road ends at a clearing. The balloon was waiting.", effects: { heat: 15 } }] },
      { label: "Wave", outcomes: [{ text: "The balloon doesn't wave back. You feel it, somehow.", effects: { heat: 10 } }] }
    ]
  },
  {
    id: "mt-gun-show", title: "Gun Show Parking", where: "road", regions: ["mountain", "plains", "south"], tags: ["food"],
    text: "The only open diner for forty miles is attached to a convention center hosting a gun show. Every booth is selling the same three items: jerky, hats, and \"gold.\"",
    choices: [
      { label: "Eat at the diner", cost: { money: 30 }, outcomes: [{ text: "Enormous portions. The waitress calls everyone \"sweetie\" regardless of politics.", effects: { health: 5, morale: 8 } }] },
      { label: "Buy jerky in bulk", cost: { money: 25 }, outcomes: [{ text: "Two pounds of jerky shaped like the state. It's food.", effects: { food: 10, items: { jerky: 1 } } }] },
      { label: "Leave before anyone notices your bumper", outcomes: [{ text: "Wise. You eat crackers in the parking lot of a closed Arby's." }] }
    ]
  },
  {
    id: "mt-chains", title: "Chain Law", where: "road", regions: ["mountain"], tags: ["weather", "vehicle"], conditions: { weather: ["snow", "storm"] },
    text: "CHAINS REQUIRED says the sign at the pass. You don't have chains. A man at the bottom of the pass is renting them for a price that suggests he's the one who put up the sign.",
    choices: [
      { label: "Rent chains", cost: { money: 60 }, outcomes: [{ text: "You crawl over the pass with chains on, slowly and safely. The man waves from his Cadillac.", effects: {} }] },
      { label: "Wait for the plow", outcomes: [{ text: "A day in a truck stop. The plow comes. The man with the chains looks betrayed.", effects: { delay: 1 } }] },
      { label: "Risk it", check: { skill: "mechanical", difficulty: "hard" },
        success: [{ text: "{skilled} drives the pass in second gear the whole way. It's terrifying and it works.", effects: { miles: 15 } }],
        failure: [{ text: "Halfway up, you slide into a snowbank. A trucker pulls you out, for a fee and a lecture.", effects: { van: -18, money: -50, health: -6 } }] }
    ]
  },
  {
    id: "id-potato", title: "Potato Festival", where: "road", regions: ["mountain"], tags: ["food", "people"],
    text: "A town in Idaho is holding a potato festival. Everything is a potato: the food, the hats, the man in the costume, the mayor.",
    choices: [
      { label: "Enjoy the festival", cost: { money: 20 }, outcomes: [{ text: "Potato everything. Potato ice cream, even, which is a mistake you'll make once. Nobody checks your ID.", effects: { food: 12, morale: 10 } }] },
      { label: "Enter the potato sack race", check: { skill: "survival", difficulty: "medium" },
        success: [{ text: "{skilled} wins. The prize is a sack of potatoes and the respect of a small town.", effects: { food: 15, morale: 8, rep: { militia: 5 } } }],
        failure: [{ text: "{member} trips over a child, who also trips. Nobody's hurt, but people remember your faces.", effects: { heat: 10, morale: -4 } }] }
    ]
  },
  {
    id: "id-book-bonfire", title: "Community Bonfire", where: "road", regions: ["mountain"], tags: ["danger", "faction"],
    text: "A town is having a bonfire. They're burning books. A volunteer with a clipboard is going car to car, asking for \"donations.\"",
    choices: [
      { label: "Donate a cookbook", outcomes: [{ text: "You give them a cookbook with no politics in it. They seem disappointed it's so wholesome.", effects: { morale: -6, heat: -5 } }] },
      { label: "Rescue books from the pile", check: { skill: "stealth", difficulty: "medium" },
        success: [{ text: "{skilled} walks off with an armful of biology textbooks while everyone's watching the flames.", effects: { items: { textbooks: 1 }, morale: 10, heat: 5 } }],
        failure: [{ text: "You're caught holding a copy of a classic novel. They burn it in front of you, then ask for your plate number.", effects: { heat: 25, morale: -10 } }] },
      { label: "Drive away", outcomes: [{ text: "Nobody talks for twenty miles.", effects: { morale: -8 } }] }
    ]
  },
  {
    id: "id-snow-globe", title: "Souvenir Stand", where: "road", regions: ["mountain"], tags: ["people"],
    text: "A roadside souvenir stand sells snow globes of the Book Burning Fields. Shake one and paper flakes swirl around a little bonfire.",
    choices: [
      { label: "Buy one, ironically", cost: { money: 12 }, outcomes: [{ text: "It's horrible. Someone in a paradise will love it.", effects: { items: { "snow-globe": 1 } } }] },
      { label: "Ask the seller if she likes her job", outcomes: [{ text: "She doesn't. She hates it. She gives you directions to a back road and a free snow globe to sell later.", effects: { items: { "snow-globe": 1 }, heat: -5 } }] }
    ]
  },
  {
    id: "mt-mine-tour", title: "Mine Tour", where: "road", regions: ["mountain"], tags: ["people", "faction"],
    text: "A historic mine offers tours. The tour guide, a retired miner, has been told to skip the part about the cave-in and the union. He tells you anyway, quietly, in the dark.",
    choices: [
      { label: "Take the tour", cost: { money: 15 }, outcomes: [{ text: "He walks you through the history they tried to erase. At the end he shakes everyone's hand and says, \"Tell people.\"", effects: { morale: 12, rep: { resistance: 5 } } }] },
      { label: "Skip it", outcomes: [{ text: "You drive on. The mine stays where it is, full of what it knows." }] }
    ]
  },
  {
    id: "mt-runaway", title: "Runaway Truck Ramp", where: "road", regions: ["mountain"], tags: ["vehicle", "danger"], conditions: { maxVan: 60 },
    text: "On a long descent the brake pedal starts going soft. A sign ahead: RUNAWAY TRUCK RAMP 1 MILE.",
    choices: [
      { label: "Take the ramp", outcomes: [{ text: "Gravel, then stillness. Everyone's alive. A tow truck takes a day and most of your cash.", effects: { delay: 1, money: -80, van: 10 } }] },
      { label: "Downshift and ride it out", check: { skill: "mechanical", difficulty: "medium" },
        success: [{ text: "{skilled} downshifts like a trucker. You reach the bottom smelling of hot brakes.", effects: { van: -10 } }],
        failure: [{ text: "You make it, mostly by luck, with brakes that are now decorative.", effects: { van: -30, health: -8 } }] }
    ]
  },
  {
    id: "nw-mushroom", title: "Mushroom Forager", where: "road", regions: ["northwest"], tags: ["food", "people"],
    text: "A forager in waders offers to sell you a basket of chanterelles. \"Probably chanterelles,\" she adds.",
    choices: [
      { label: "Buy them", cost: { money: 15 }, outcomes: [
        { weight: 3, text: "They are chanterelles. Dinner is the best meal of the trip.", effects: { food: 10, morale: 10 } },
        { weight: 1, text: "They are mostly chanterelles. {member} has a long night.", effects: { food: 6, healthOne: -15, condition: "sick" } }
      ] },
      { label: "Have your survivalist check them", requires: { skill: "survival" }, outcomes: [{ text: "{skilled} sorts them in two minutes. The good ones are excellent. The forager asks for lessons.", effects: { food: 12, morale: 8 } }] },
      { label: "Decline", outcomes: [{ text: "She shrugs and eats one. She seems fine. You'll never know." }] }
    ]
  },
  {
    id: "nw-tent-city", title: "Tent City", where: "road", regions: ["northwest"], tags: ["people"],
    text: "A tent encampment under an overpass. A hand-lettered sign: WE HAVE SOUP. WE NEED SOCKS.",
    choices: [
      { label: "Give food", cost: { food: 10 }, outcomes: [{ text: "They give you soup back, which seems like it defeats the purpose, but it's very good soup.", effects: { morale: 12, rep: { resistance: 5 } } }] },
      { label: "Give socks", outcomes: [{ text: "Everyone donates a pair. Your feet are cold. Your hearts are not.", effects: { morale: 10, health: -2 } }] },
      { label: "Drive on", outcomes: [{ text: "You keep driving. You think about the sign for a long time.", effects: { morale: -5 } }] }
    ]
  },
  {
    id: "mt-pass-motel", title: "Last Motel Before the Pass", where: "road", regions: ["mountain"], tags: ["health"],
    text: "LAST MOTEL FOR 120 MILES. The vacancy sign flickers. The desk clerk is reading a forbidden book openly, which tells you a lot.",
    choices: [
      { label: "Get a room", cost: { money: 35 }, outcomes: [{ text: "Clean sheets, hot water, and the clerk slips you a map of the pass with the patrol schedule penciled in.", effects: { health: 8, cure: "exhausted", heat: -10, items: { "topo-maps": 1 } } }] },
      { label: "Push on", outcomes: [{ text: "You drive into the night. It's 120 miles of nothing, and the nothing is very dark.", effects: { morale: -4 } }] }
    ]
  },
  {
    id: "mt-radio-preacher", title: "Only One Station", where: "road", regions: ["mountain", "plains"], tags: ["faction"],
    text: "For 200 miles the radio gets exactly one station: a preacher who's been talking for six hours about the moral dangers of oat milk.",
    choices: [
      { label: "Listen", outcomes: [{ text: "By hour two you're hooked. By hour three, {member} has started taking notes. Nobody's sure why.", effects: { morale: -3, rep: { faithful: 3 } } }] },
      { label: "Sing instead", outcomes: [{ text: "Your party sings every song you collectively know. You run out at hour one.", effects: { morale: 8 } }] },
      { label: "Play the mixtape", requires: { item: "mixtape" }, outcomes: [{ text: "Side A, Side B, Side B again. It's perfect.", effects: { morale: 12 } }] }
    ]
  }
];
