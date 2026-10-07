import type { GameEvent } from "../../types";

// Batch 4: the South and the East.
export const EAST_EVENTS: GameEvent[] = [
  {
    id: "so-bourbon-trail", title: "Distillery Tour", where: "road", regions: ["south"], tags: ["food", "money"],
    text: "A family distillery still makes bourbon the regime has banned for \"liberal bias.\" The tour guide says the bias is in the barrel char. She winks so hard it's audible.",
    choices: [
      { label: "Take the tour", cost: { money: 20 }, outcomes: [{ text: "At the end she sells you a bottle from the back room, \"for medicinal and resale purposes.\"", effects: { items: { bourbon: 1 }, morale: 8 } }] },
      { label: "Help them move barrels before the inspector comes", outcomes: [{ text: "You hide forty barrels in a hay barn. They pay you in bourbon and gratitude.", effects: { delay: 1, items: { bourbon: 2 }, rep: { resistance: 5 } } }] },
      { label: "Keep driving", outcomes: [{ text: "The whole county smells like vanilla and defiance." }] }
    ]
  },
  {
    id: "so-holler", title: "Up the Holler", where: "road", regions: ["south"], tags: ["people"],
    text: "A wrong turn takes you up a hollow on a one-lane road. At the end, a woman on a porch with a shotgun across her knees and a pot of beans on the stove. She looks at your plates for a long time.",
    choices: [
      { label: "Apologize and ask for directions", outcomes: [{ text: "She sets the shotgun down. \"Y'all are a long way from home.\" Beans, cornbread, directions, and a jar of something clear you don't ask about.", effects: { food: 10, morale: 10, heat: -5 } }] },
      { label: "Back down the road slowly", outcomes: [{ text: "She waves. It's a nicer wave than you expected.", effects: { miles: -15 } }] }
    ]
  },
  {
    id: "so-mutual-aid-mountain", title: "Mountain Mutual Aid", where: "road", regions: ["south"], tags: ["people", "faction"],
    text: "A church parking lot in the mountains has turned into a mutual aid depot: insulin from Canada, diapers, chainsaws, seed potatoes. The man running it is a preacher and a former union rep. He says he sees no contradiction.",
    choices: [
      { label: "Ask what they need", outcomes: [{ text: "They need a driver to haul supplies to a town up the road. You do, and come back with your van full of thank-yous and a box of insulin for someone further east.", effects: { delay: 1, items: { insulin: 1 }, rep: { resistance: 10, faithful: 10 } } }] },
      { label: "Take some supplies", outcomes: [{ text: "He hands you food and won't take money. \"Pass it on down the road.\"", effects: { food: 12, rep: { faithful: 4 } } }] }
    ]
  },
  {
    id: "so-coal-company-store", title: "Company Scrip", where: "road", regions: ["south"], tags: ["checkpoint", "danger"],
    text: "The only gas in this county is at a company store that only takes company scrip. The exchange rate is posted on a chalkboard and has clearly been changed recently, upward.",
    choices: [
      { label: "Buy scrip at their rate", cost: { money: 60 }, outcomes: [{ text: "Sixty dollars buys you thirty dollars of scrip and ten gallons of gas. That's the system.", effects: { fuel: 10 } }] },
      { label: "Ask the miners in line where they buy gas", outcomes: [{ text: "Everybody knows: a guy two hollers over, cash only, fair price. They draw you a map on a napkin.", effects: { fuel: 6, money: -20, heat: -5 } }] }
    ]
  },
  {
    id: "so-appalachian-hiker", title: "Thru-Hiker", where: "road", regions: ["south", "east"], tags: ["people"],
    text: "A thru-hiker with a beard to his sternum holds up a sign: TRAIL MAGIC? He's been walking from Georgia since March and has opinions about every road crossing.",
    choices: [
      { label: "Give him a ride to town", outcomes: [{ text: "He talks for forty miles. He knows every back road between here and Maine, and he gives you a pre-regime trail map.", effects: { items: { "topo-maps": 1 }, morale: 8 } }] },
      { label: "Give him food", cost: { food: 6 }, outcomes: [{ text: "Trail magic. He tells you hikers have a word for people like you: \"angels.\" Nobody's called you that in a while.", effects: { morale: 12 } }] },
      { label: "Wave", outcomes: [{ text: "He waves back with a trekking pole." }] }
    ]
  },
  {
    id: "so-moonshine", title: "Moonshine Run", where: "road", regions: ["south"], tags: ["money", "danger"],
    text: "A man at a gas station offers $200 to drive a cooler of \"apple juice\" to a man two counties east. He doesn't make eye contact with the cooler.",
    choices: [
      { label: "Take the job", outcomes: [
        { weight: 2, text: "Uneventful. The man two counties east pays you, then offers you some \"apple juice.\"", effects: { money: 200, heat: 10 } },
        { weight: 1, text: "A deputy pulls you over for a taillight. He opens the cooler. He closes the cooler. He takes the cooler.", effects: { heat: 35, money: -80 } }
      ] },
      { label: "Take the job and hide the cooler well", requires: { skill: "stealth" }, outcomes: [{ text: "{skilled} stashes it in the spare tire well. You deliver it, get paid, and get a jar for yourselves.", effects: { money: 200, heat: 5, morale: 5 } }] },
      { label: "Pass", outcomes: [{ text: "He shrugs and asks the next car." }] }
    ]
  },
  {
    id: "so-battlefield", title: "Battlefield Gift Shop", where: "road", regions: ["south", "east"], tags: ["people"],
    text: "A historic battlefield has a new visitor center. The exhibits have been \"updated.\" A park ranger is standing next to a placard with her arms crossed, like a museum guard guarding against the museum.",
    choices: [
      { label: "Ask the ranger about the update", outcomes: [{ text: "She gives you the original tour, from memory, in a low voice, in the parking lot. It takes an hour. It's the best history lesson of your life.", effects: { morale: 12, delay: 1 } }] },
      { label: "Buy a postcard", cost: { money: 5 }, outcomes: [{ text: "The postcard has the old caption, by mistake. You keep it.", effects: { morale: 5 } }] }
    ]
  },
  {
    id: "so-monument-avenue", title: "Monument Detour", where: "road", regions: ["south"], tags: ["checkpoint", "danger"],
    text: "The Confederate Memorial Highway adds a statue every year, so there's always a new dedication ceremony blocking the road. Today's is a horse, alone. Nobody knows who rode it.",
    choices: [
      { label: "Wait for the ceremony to end", outcomes: [{ text: "Three hours of speeches about the horse. The horse, carved from granite, takes it well.", effects: { delay: 1, morale: -8 } }] },
      { label: "Detour through a neighborhood", check: { skill: "survival", difficulty: "easy" },
        success: [{ text: "{skilled} finds a route through a neighborhood where a man on his porch waves you through with a beer. He's been detouring traffic for years.", effects: { miles: 10, morale: 5 } }],
        failure: [{ text: "The neighborhood has its own small checkpoint. It's run by an HOA.", effects: { money: -40, heat: 10 } }] }
    ]
  },
  {
    id: "so-sweet-tea", title: "Sweet Tea", where: "road", regions: ["south"], tags: ["food", "people"],
    text: "A roadside stand: a gallon of sweet tea for $3, sold by a kid doing his math homework. The tea is sweet enough to count as food.",
    choices: [
      { label: "Buy a gallon", cost: { money: 3 }, outcomes: [{ text: "Everyone's teeth hurt. Everyone's happier.", effects: { morale: 8 } }] },
      { label: "Help with his homework", outcomes: [{ text: "He's doing quadratic equations from a textbook with the evolution chapter cut out of the science section next to it. You help with the math. He gives you a free gallon.", effects: { morale: 10 } }] }
    ]
  },
  {
    id: "so-revival-baptism", title: "River Baptism", where: "road", regions: ["south"], tags: ["faction", "people"],
    text: "A congregation is holding a baptism in the river, in their Sunday clothes, singing. Nobody here is part of the regime's sponsored churches; they're just people who like rivers and singing.",
    choices: [
      { label: "Stop and listen", outcomes: [{ text: "They invite you to the potluck afterward. Nobody asks you to get in the river. It's the friendliest you've been treated in three states.", effects: { food: 8, morale: 12, rep: { faithful: 8 } } }] },
      { label: "Drive on quietly", outcomes: [{ text: "The singing follows you around the bend.", effects: { morale: 4 } }] }
    ]
  },
  {
    id: "so-coal-train", title: "Coal Train", where: "road", regions: ["south"], tags: ["vehicle"],
    text: "A coal train crosses the road. It's 140 cars long and moving at a stroll. The crossing arm has a sign: COAL IS FREEDOM. A second sign below: TRAIN TIME APPROX 40 MIN.",
    choices: [
      { label: "Wait", outcomes: [{ text: "Forty minutes. {member} counts the cars. It's 140. {member} is sure.", effects: { miles: -20 } }] },
      { label: "Find another crossing", check: { skill: "survival", difficulty: "medium" },
        success: [{ text: "{skilled} finds an underpass three miles back. Clear.", effects: { fuel: -1 } }],
        failure: [{ text: "Every crossing is blocked by the same train. It's very long.", effects: { miles: -40, fuel: -2 } }] }
    ]
  },
  {
    id: "va-beltway", title: "Beltway Traffic", where: "road", regions: ["south", "east"], tags: ["vehicle"],
    text: "The road funnels into a ring of traffic around the capital. Lanes for lobbyists, lanes for officials, lanes for contractors, and one lane for everyone else, at a standstill.",
    choices: [
      { label: "Sit in the everyone-else lane", outcomes: [{ text: "Five hours. You learn the license plates of everyone around you by heart.", effects: { miles: -60, morale: -8 } }] },
      { label: "Drive in the contractor lane", check: { skill: "intimidation", difficulty: "medium" },
        success: [{ text: "{skilled} puts on a lanyard and a look of mild impatience. You're waved through as \"consultants.\"", effects: { miles: 20, heat: 5 } }],
        failure: [{ text: "The contractor lane has its own checkpoint, and a $200 fine for impersonating a consultant.", effects: { money: -200, heat: 15 } }] },
      { label: "Flash the clipboard", requires: { item: "clipboard" }, outcomes: [{ text: "Nobody in the capital questions a clipboard. You're in the official lane in minutes.", effects: { miles: 30 } }] }
    ]
  },
  {
    id: "md-crab-shack", title: "Crab Shack", where: "road", regions: ["east"], tags: ["food", "people"],
    text: "A crab shack on the Chesapeake with newspaper on the tables, mallets, and a hand-painted sign: ALL WELCOME (WE MEAN IT).",
    choices: [
      { label: "Order a bushel", cost: { money: 50 }, outcomes: [{ text: "Hours of cracking, Old Bay on everything, and a table of locals who adopt you for the evening.", effects: { health: 6, morale: 15 } }] },
      { label: "Ask if they need help", outcomes: [{ text: "They do: a busy night. You bus tables until midnight and leave with cash and leftovers.", effects: { money: 60, food: 8, delay: 1 } }] },
      { label: "Just smell it and keep driving", outcomes: [{ text: "Old Bay haunts the van for a hundred miles. Nobody minds." }] }
    ]
  },
  {
    id: "pa-turnpike", title: "The Turnpike", where: "road", regions: ["east"], tags: ["checkpoint"],
    text: "The turnpike takes cash, tokens, or \"approved digital patriotism credits.\" Your options are cash, which costs triple, or the long way through the hills.",
    choices: [
      { label: "Pay the cash toll", cost: { money: 45 }, outcomes: [{ text: "Fast, smooth, expensive. The tunnels through the mountains are honestly spectacular.", effects: { miles: 40 } }] },
      { label: "Take the back roads", outcomes: [{ text: "Covered bridges, Amish buggies, and a town that has had the same diner since 1952. Slower, prettier.", effects: { morale: 8, miles: -20 } }] }
    ]
  },
  {
    id: "pa-steel-town", title: "Steel Town", where: "road", regions: ["east"], tags: ["people", "faction"],
    text: "An old steel town. The mill is a museum now, and the museum is an event venue, and the event tonight is a wedding. The groom's family and the bride's family are sitting on opposite sides of more than the aisle.",
    choices: [
      { label: "Crash the reception", check: { skill: "persuasion", difficulty: "medium" },
        success: [{ text: "{skilled} gives a toast so universal that both sides cry. You leave with cake, cash in an envelope, and the bride's thanks.", effects: { food: 8, money: 50, morale: 12 } }],
        failure: [{ text: "Both families agree on one thing: you shouldn't be here.", effects: { heat: 10, morale: -4 } }] },
      { label: "Walk the old mill", outcomes: [{ text: "The furnaces are cold and enormous. A placard lists every man who died here, by name.", effects: { morale: 4 } }] }
    ]
  },
  {
    id: "east-foliage", title: "Leaf Peepers", where: "road", regions: ["east"], tags: ["people"], conditions: { seasons: ["fall"] },
    text: "The trees are on fire with color. So is traffic: every road is jammed with people photographing leaves. Even the checkpoint guards have stopped to take pictures.",
    choices: [
      { label: "Join them", outcomes: [{ text: "You take the best photo of the trip. The guards in it are smiling.", effects: { morale: 12, miles: -20 } }] },
      { label: "Use the distraction", check: { skill: "stealth", difficulty: "easy" },
        success: [{ text: "Every guard is looking at a maple tree. You roll through.", effects: { heat: -15 } }],
        failure: [{ text: "One guard hates leaves. He's very focused on you.", effects: { heat: 10 } }] }
    ]
  },
  {
    id: "east-covered-bridge", title: "Covered Bridge", where: "road", regions: ["east"], tags: ["vehicle"],
    text: "A covered bridge, red, two hundred years old, with a clearance of eight feet. The van is eight feet one inch. You measured once, for exactly this reason.",
    choices: [
      { label: "Let some air out of the tires", check: { skill: "mechanical", difficulty: "easy" },
        success: [{ text: "{skilled} drops the van an inch and a half. You clear the bridge with a quarter inch to spare.", effects: { morale: 8 } }],
        failure: [{ text: "You clear the bridge. You do not clear the roof rack's top bolt.", effects: { van: -12 } }] },
      { label: "Go around", outcomes: [{ text: "Twenty miles around. The bridge is a nice bridge. You saw it.", effects: { miles: -25 } }] }
    ]
  },
  {
    id: "east-almost", title: "Almost There", where: "road", regions: ["east"], tags: ["people"], conditions: { minDay: 25 },
    text: "A highway sign: VERMONT 200. {member} reads it out loud, then again, then a third time. Nobody says anything. Nobody needs to.",
    choices: [
      { label: "Pull over and take a moment", outcomes: [{ text: "Everyone gets out. Somebody cries. Somebody laughs. It's both at once, mostly.", effects: { morale: 18 } }] },
      { label: "Keep driving, faster", outcomes: [{ text: "Nobody argues.", effects: { miles: 15, morale: 8 } }] }
    ]
  },
  {
    id: "east-border-patrol", title: "State Border Patrol", where: "road", regions: ["east"], tags: ["checkpoint", "danger", "heat"],
    text: "Near the last state line, the regime has set up a border patrol to stop \"ideological flight.\" The agents are bored, cold, and paid by the catch.",
    choices: [
      { label: "Go through with your papers", outcomes: [
        { weight: 2, text: "They check everything twice and wave you on with visible regret.", effects: { delay: 1 } },
        { weight: 1, text: "They find a forbidden book wrapper in the trash. Secondary inspection.", effects: { delay: 1, heat: 20, money: -60 } }
      ] },
      { label: "Take the logging road around it", check: { skill: "survival", difficulty: "hard" },
        success: [{ text: "{skilled} navigates by an old trail map. You come out on the other side of the patrol at dawn.", effects: { heat: -10, van: -10 } }],
        failure: [{ text: "The logging road ends at a gate with a camera.", effects: { heat: 30, van: -15 } }] }
    ]
  },
  {
    id: "east-maple", title: "Sugar Shack", where: "road", regions: ["east"], tags: ["food", "people"], conditions: { seasons: ["spring", "winter"] },
    text: "A sugar shack, steaming, the air thick and sweet. The farmer boiling sap has a Vermont accent and a Pennsylvania problem: the regime taxes syrup as a \"luxury liquid.\"",
    choices: [
      { label: "Buy syrup", cost: { money: 15 }, outcomes: [{ text: "He gives you a jar and a taste. \"That's what's waiting for you,\" he says, nodding north.", effects: { food: 4, morale: 12 } }] },
      { label: "Help him haul sap", outcomes: [{ text: "Back-breaking, sticky, wonderful. He pays you in syrup and a place to sleep.", effects: { delay: 1, food: 8, health: 5, morale: 10 } }] }
    ]
  },
  {
    id: "east-amtrak", title: "The Train", where: "road", regions: ["east"], tags: ["people"],
    text: "A train station with a northbound train in an hour. Tickets require \"travel purpose documentation.\" The ticket agent is visibly tired of asking for it.",
    choices: [
      { label: "Ask about tickets for everyone", outcomes: [{ text: "Three tickets need three purpose letters, and the van can't ride a train. You stay together. The agent wishes you luck in a way that sounds like a prayer.", effects: { morale: 6 } }] },
      { label: "Ask about smuggling routes north", check: { skill: "negotiation", difficulty: "medium" },
        success: [{ text: "{skilled} gets the agent talking. She knows the patrol rotations on every road north of here, and writes them down.", effects: { heat: -15 } }],
        failure: [{ text: "She doesn't know anything, and now she's nervous.", effects: { heat: 10 } }] }
    ]
  },
  {
    id: "so-snake-handler", title: "Roadside Reptile Zoo", where: "road", regions: ["south"], tags: ["people"],
    text: "A roadside reptile zoo: CROCS! SNAKES! A TORTOISE OLDER THAN THE REGIME! The tortoise is the main draw. He's 140 and has outlived four governments.",
    choices: [
      { label: "Visit the tortoise", cost: { money: 8 }, outcomes: [{ text: "He looks at you with ancient patience. Everyone feels better about the timeline.", effects: { morale: 10 } }] },
      { label: "Skip it", outcomes: [{ text: "The billboards for it continue for thirty miles, increasingly desperate." }] }
    ]
  },
  {
    id: "so-hurricane", title: "Storm Coming", where: "road", regions: ["south", "east"], tags: ["weather", "danger"], conditions: { weather: ["storm", "rain"], seasons: ["summer", "fall"] },
    text: "The radio says a hurricane's remnants are coming inland and the governor has declared it \"a test of faith.\" The evacuation route is also the route you need.",
    choices: [
      { label: "Drive with the evacuees", outcomes: [{ text: "Bumper to bumper for a day. People share water at red lights. It's the best and worst of everyone.", effects: { miles: -40, morale: 4 } }] },
      { label: "Shelter in a school gym", outcomes: [{ text: "Cots, kids, a volunteer making grilled cheese for 300. You help. You leave with a tote of donated supplies.", effects: { delay: 1, food: 10, items: { electrolytes: 1 }, morale: 8 } }] },
      { label: "Outrun it", check: { skill: "survival", difficulty: "hard" },
        success: [{ text: "{skilled} watches the radar and finds the gap in the bands. You beat the rain by an hour.", effects: { miles: 30 } }],
        failure: [{ text: "The storm catches you. The van takes on water through a door seal you didn't know was bad.", effects: { van: -25, food: -10, health: -6 } }] }
    ]
  },
  {
    id: "so-fireworks", title: "Fireworks Superstore", where: "road", regions: ["south", "midwest"], tags: ["people"],
    text: "A fireworks superstore the size of an airplane hangar. Everything is 80% off, always. A man in the parking lot is testing a product called PATRIOT'S REVENGE on a melon.",
    choices: [
      { label: "Buy a sparkler for everyone", cost: { money: 5 }, outcomes: [{ text: "That night, in a field, four sparklers. It's dumb and it's perfect.", effects: { morale: 10 } }] },
      { label: "Watch the melon demonstration", outcomes: [{ text: "The melon loses. The man is delighted. So, despite yourselves, are you.", effects: { morale: 5 } }] }
    ]
  },
  {
    id: "east-home-stretch-cop", title: "Small-Town Cop", where: "road", regions: ["east"], tags: ["checkpoint"],
    text: "A small-town cop pulls you over in the last state before Vermont. He runs your plates, looks at the results for a long time, then hands your license back.",
    choices: [
      { label: "Wait for what he says", outcomes: [{ text: "\"Taillight's out,\" he says. \"Get it fixed in Vermont.\" He doesn't write a ticket. He doesn't need to explain.", effects: { morale: 12, heat: -10 } }] }
    ]
  }
];
