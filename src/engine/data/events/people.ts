import type { GameEvent } from "../../types";

// Batch 5: strangers on the road, anywhere.
export const PEOPLE_EVENTS: GameEvent[] = [
  {
    id: "pp-grandma", title: "Grandma on the Shoulder", where: "road", tags: ["people"],
    text: "An old woman with a rolling suitcase and a cat carrier is walking along the shoulder. She tells you she's going to Vermont. \"My sister's there. I'm eighty-four. I'm not waiting for permission.\"",
    choices: [
      { label: "Drive her to the next bus station", outcomes: [{ text: "She talks the whole way about her sister, her late husband and the cat, in that order. At the station she presses a postcard from Vermont into your hand. \"Keep it until you need it.\"", effects: { miles: -20, items: { postcard: 1 }, morale: 10 } }] },
      { label: "Give her food and money", cost: { money: 20 }, outcomes: [{ text: "She takes the food, refuses the money, then takes the money when you insist. \"I'll see you up there,\" she says.", effects: { food: -4, morale: 8 } }] },
      { label: "Keep driving", outcomes: [{ text: "You see her in the rearview mirror for a long time, still walking.", effects: { morale: -8 } }] }
    ]
  },
  {
    id: "pp-governors-dog", title: "Lost Dog", where: "road", tags: ["people", "heat"],
    text: "A very well-groomed golden retriever is trotting along the road. Its collar tag says PROPERTY OF THE GOVERNOR'S OFFICE — REWARD.",
    choices: [
      { label: "Return it for the reward", outcomes: [
        { weight: 2, text: "A staffer gives you $150 and a signed photo of the governor. The dog seems sad to leave.", effects: { money: 150, morale: -5 } },
        { weight: 1, text: "The staffer takes the dog, then takes your names, \"for the thank-you letter.\"", effects: { money: 150, heat: 20 } }
      ] },
      { label: "Let it ride with you a while", outcomes: [{ text: "It rides shotgun for a day, head out the window. When you leave it at a shelter, nobody wants to say goodbye.", effects: { morale: 15 } }] },
      { label: "Leave it", outcomes: [{ text: "It follows you for a mile, then sits down in the road and watches you go." }] }
    ]
  },
  {
    id: "pp-yard-sale", title: "Yard Sale", where: "road", tags: ["people", "money"],
    text: "A yard sale: a family is selling everything because they're moving \"somewhere with better schools.\" They don't say where. The kid's T-shirt says VERMONT.",
    choices: [
      { label: "Browse the tools", cost: { money: 25 }, outcomes: [{ text: "A multimeter and an old first-aid manual with all its pages. The dad whispers, \"Good luck out there.\"", effects: { items: { multimeter: 1, "first-aid-manual": 1 } } }] },
      { label: "Browse the records", cost: { money: 20 }, outcomes: [{ text: "Protest folk, banned in this county. You'll sell it somewhere they're wanted.", effects: { items: { vinyl: 1 } } }] },
      { label: "Buy them lemonade", outcomes: [{ text: "You buy a lemonade from their kid's stand. She asks if you're moving too. You say yes. She says, \"Me too,\" like it's a secret.", effects: { money: -2, morale: 8 } }] }
    ]
  },
  {
    id: "pp-lemonade-license", title: "Licensed Lemonade", where: "road", tags: ["people"],
    text: "A kid's lemonade stand has a laminated permit, a tax certificate and a loyalty pledge taped to the front. She is nine and looks exhausted.",
    choices: [
      { label: "Buy a cup", cost: { money: 2 }, outcomes: [{ text: "Best lemonade you've had. She shows you the paperwork. There are four forms. She did them herself.", effects: { morale: 6 } }] },
      { label: "Help with the paperwork", requires: { skill: "negotiation" }, outcomes: [{ text: "{skilled} finds she's been overcharged on the permit. You file the appeal. She gives you free lemonade for life, which is about four minutes.", effects: { morale: 12 } }] },
      { label: "Tip her $20", cost: { money: 20 }, outcomes: [{ text: "She stares at the twenty like it's a treasure map. You leave her to it.", effects: { morale: 10 } }] },
      { label: "Tell her she's doing great", outcomes: [{ text: "She says, \"I know,\" with enormous dignity. You believe her.", effects: { morale: 4 } }] }
    ]
  },
  {
    id: "pp-psychic", title: "Truck Stop Psychic", where: "road", tags: ["people"],
    text: "A booth at a truck stop: MADAME VERITY — PALMS, TAROT, PATRIOTIC FORTUNES. Madame Verity is a man named Doug in a scarf.",
    choices: [
      { label: "Get a reading", cost: { money: 10 }, outcomes: [
        { weight: 1, text: "\"I see a long road. I see a van. I see Vermont.\" Doug is either psychic or observant. Either way, it helps.", effects: { morale: 10 } },
        { weight: 1, text: "\"I see a checkpoint in your future.\" There is a checkpoint in your future. There always is.", effects: { morale: -3 } }
      ] },
      { label: "Ask Doug about the road ahead", outcomes: [{ text: "Doug drops the accent. He's been sitting here for six years watching traffic and knows exactly which troopers work which shifts.", effects: { heat: -10 } }] }
    ]
  },
  {
    id: "pp-busker", title: "Busker", where: "road", tags: ["people"],
    text: "A busker at a gas station is playing a banned protest song on a banjo, very quietly, so only people who already know it can hear.",
    choices: [
      { label: "Tip him", cost: { money: 5 }, outcomes: [{ text: "He nods and plays the second verse, the one that's really banned. Then he gives you a tape.", effects: { morale: 8, items: { mixtape: 1 } } }] },
      { label: "Sing along", outcomes: [
        { weight: 2, text: "Everyone at the pumps who knows it joins in, softly. It's a strange, beautiful minute.", effects: { morale: 14 } },
        { weight: 1, text: "Someone at pump four doesn't know it, and recognizes that it's banned.", effects: { morale: 8, heat: 15 } }
      ] }
    ]
  },
  {
    id: "pp-family-fleeing", title: "Another Van", where: "road", tags: ["people"],
    text: "At a rest stop, a family in a van much like yours: a mom, two kids, a grandfather. Their bumper sticker has been scraped off. They're heading the same way and have less of everything.",
    choices: [
      { label: "Share food", cost: { food: 10 }, outcomes: [{ text: "The kids eat like they haven't in a while. The mom writes down a safe house address you didn't have.", effects: { morale: 12, rep: { resistance: 8 } } }] },
      { label: "Share gas", cost: { fuel: 4 }, outcomes: [{ text: "You siphon them four gallons. The grandfather salutes you with two fingers, like a pilot.", effects: { morale: 10, rep: { resistance: 5 } } }] },
      { label: "Swap information", outcomes: [{ text: "They tell you about a checkpoint ahead that's harder than it looks. You tell them about one behind you that's easier. Fair trade.", effects: { heat: -5 } }] }
    ]
  },
  {
    id: "pp-influencer", title: "Influencer", where: "road", tags: ["people", "heat"],
    text: "A man with a ring light on his dashboard is filming a video titled \"I Visited a Liberal Paradise and Here's What Happened.\" He wants to interview you.",
    choices: [
      { label: "Give him a boring interview", check: { skill: "persuasion", difficulty: "easy" },
        success: [{ text: "{skilled} is so boring he cuts you from the video. Perfect.", effects: {} }],
        failure: [{ text: "You accidentally say something interesting. It gets four million views.", effects: { heat: 25, morale: -4 } }] },
      { label: "Hack his upload", requires: { skill: "hacking" }, check: { skill: "hacking", difficulty: "medium" },
        success: [{ text: "{skilled} replaces his video with forty minutes of a fireplace. It does better than his usual content.", effects: { morale: 12 } }],
        failure: [{ text: "His followers trace the hack to a van with your plates. Comments are open.", effects: { heat: 20 } }] },
      { label: "Leave before he gets you on camera", outcomes: [{ text: "You're in the background of the video, for one frame, eating chips.", effects: { heat: 5 } }] }
    ]
  },
  {
    id: "pp-census", title: "The Census", where: "road", tags: ["heat"],
    text: "A census taker flags you down at a gas station. The regime's census has a few extra questions this year. Question 9: \"Rate your loyalty from 1 to 10.\"",
    choices: [
      { label: "Answer 10 for everyone", outcomes: [{ text: "Perfect scores. Nobody has ever answered anything else. The census is very confident.", effects: { morale: -5 } }] },
      { label: "Answer honestly", outcomes: [{ text: "You're the first 4 she's seen. She doesn't report it. She writes 10 and winks.", effects: { morale: 8 } }] },
      { label: "Say you're just passing through", check: { skill: "negotiation", difficulty: "easy" },
        success: [{ text: "{skilled} explains that transients aren't residents. She agrees and moves on, relieved to have one fewer form.", effects: {} }],
        failure: [{ text: "Transients get the long form.", effects: { delay: 1, heat: 5 } }] }
    ]
  },
  {
    id: "pp-free-library", title: "Little Free Library", where: "road", tags: ["people"],
    text: "A tiny free library on a post outside a farmhouse. A sign: TAKE A BOOK, LEAVE A BOOK. Inside, under a cookbook, someone has hidden a contraband novel and a note: \"For whoever needs it.\"",
    choices: [
      { label: "Take the novel", outcomes: [{ text: "You read it aloud in the van, a chapter a day.", effects: { items: { books: 1 }, morale: 6 } }] },
      { label: "Leave one of yours", requires: { item: "books" }, outcomes: [{ text: "You leave a forbidden book and a note of your own. Somebody, someday.", effects: { items: { books: -1 }, morale: 12, rep: { resistance: 5 } } }] },
      { label: "Leave it for the next person", outcomes: [{ text: "You close the little door gently.", effects: { morale: 4 } }] }
    ]
  },
  {
    id: "pp-barber", title: "Free Haircuts", where: "road", tags: ["heat", "people"], conditions: { minHeat: 20 },
    text: "A barbershop advertises FREE HAIRCUTS FOR PATRIOTS. The barber, cutting a man's hair into a perfect flat-top, looks your party up and down and says, \"You could use one.\"",
    choices: [
      { label: "Get regime haircuts", outcomes: [{ text: "Everyone looks like they work in insurance. Nobody recognizes you from the wanted poster.", effects: { heat: -20, morale: -8 } }] },
      { label: "Decline", outcomes: [{ text: "He shrugs. \"Your funeral,\" he says, and then, after a second, \"figure of speech.\"" }] }
    ]
  },
  {
    id: "pp-ice-cream", title: "Ice Cream Truck", where: "road", tags: ["food", "people"],
    text: "An ice cream truck playing the national anthem instead of a jingle. The driver hates it. He says he can't change it. He's tried.",
    choices: [
      { label: "Buy everyone ice cream", cost: { money: 12 }, outcomes: [{ text: "Bomb pops. The flag ones. Everybody laughs.", effects: { morale: 10 } }] },
      { label: "Fix his music box", requires: { skill: "mechanical" }, outcomes: [{ text: "{skilled} rewires it. It now plays a jingle about a cow. He's so happy he gives you a box of popsicles.", effects: { morale: 12, food: 4 } }] },
      { label: "Wave him on", outcomes: [{ text: "The anthem fades down the block, slightly out of tune." }] }
    ]
  },
  {
    id: "pp-lottery", title: "Scratch-Off", where: "road", tags: ["money"],
    text: "The gas station's lottery tickets are called FREEDOM SCRATCHERS. Scratch off three eagles to win. The odds are printed on the back in very small type.",
    choices: [
      { label: "Buy a few", cost: { money: 10 }, outcomes: [
        { weight: 6, text: "Two eagles and a snake. That's how they get you.", effects: {} },
        { weight: 2, text: "Three eagles! Twenty bucks!", effects: { money: 20, morale: 6 } },
        { weight: 1, text: "Three eagles and a bonus flag. $250. The cashier looks at you like you've robbed the place.", effects: { money: 250, morale: 12 } }
      ] },
      { label: "Don't", outcomes: [{ text: "The man behind you buys forty. He's wearing a shirt that says I'M DUE." }] }
    ]
  },
  {
    id: "pp-retired-spy", title: "The Man in the Corner Booth", where: "road", tags: ["people", "heat"],
    text: "In a diner, an old man in the corner booth catches your eye, nods at your plates through the window, and slides a matchbook across the counter. Inside: an address and \"ask for Earl.\"",
    choices: [
      { label: "Go see Earl", outcomes: [
        { weight: 3, text: "Earl runs a body shop. Earl has seen vans like yours before. Earl puts on new plates from a state that doesn't exist, no charge.", effects: { delay: 1, items: { "fake-plates": 1 } } },
        { weight: 1, text: "Earl died last spring. His widow makes you lunch and tells you about him.", effects: { delay: 1, food: 6, morale: 8 } }
      ] },
      { label: "Leave the matchbook", outcomes: [{ text: "When you look back, the booth is empty." }] }
    ]
  },
  {
    id: "pp-brave-protest", title: "Six People and a Sign", where: "road", tags: ["faction", "heat"],
    text: "In a town square in the middle of the hellhole, six people are holding protest signs. Six. Across the street, sixty people are watching them, and two deputies.",
    choices: [
      { label: "Join them", outcomes: [{ text: "Now there are nine. Nobody does anything, which is somehow the most dramatic outcome. They hug you when you leave.", effects: { morale: 15, heat: 20, rep: { resistance: 15 } } }] },
      { label: "Honk in support", outcomes: [{ text: "Six people cheer. Sixty people turn around to see who honked.", effects: { morale: 8, heat: 10, rep: { resistance: 5 } } }] },
      { label: "Drive past", outcomes: [{ text: "One of them sees your plates and waves anyway.", effects: { morale: -4 } }] }
    ]
  },
  {
    id: "pp-emu", title: "Emu", where: "road", tags: ["people"],
    text: "An emu is standing in the middle of the highway. It looks at the van. You look at the emu. Somewhere, a farmer is having a very bad day.",
    choices: [
      { label: "Herd it home", check: { skill: "survival", difficulty: "medium" },
        success: [{ text: "{skilled} herds the emu two miles to a farm. The farmer gives you a dozen enormous eggs and a look of profound gratitude.", effects: { food: 10, morale: 10, delay: 1 } }],
        failure: [{ text: "The emu herds you, for a while. Then it leaves.", effects: { morale: -3, miles: -15 } }] },
      { label: "Wait for it to leave", outcomes: [{ text: "Twenty minutes. The emu does not care about your schedule.", effects: { miles: -10 } }] }
    ]
  },
  {
    id: "pp-wedding-photos", title: "Bride Needs a Van", where: "road", tags: ["money", "people"],
    text: "A wedding photographer flags you down. The couple's vintage car broke down, and your van is \"exactly the aesthetic.\"",
    choices: [
      { label: "Let them use the van for photos", outcomes: [{ text: "The bride sits on the hood in her dress. It's a great photo. They pay $80 and send you off with cake.", effects: { money: 80, food: 6, morale: 8, miles: -15 } }] },
      { label: "Drive the couple to the reception", outcomes: [{ text: "You honk the whole way. The groom's uncle tips you $100 and offers you a job at his car dealership, which you decline.", effects: { money: 100, morale: 10, delay: 1 } }] }
    ]
  },
  {
    id: "pp-bake-sale", title: "Church Bake Sale", where: "road", tags: ["food", "faction", "people"],
    text: "A church bake sale on a folding table: pies, brownies, and a woman who is very proud of her lemon bars. Not a sponsored church. Just a church with a roof that needs fixing.",
    choices: [
      { label: "Buy a pie and a dozen lemon bars", cost: { money: 15 }, outcomes: [{ text: "The lemon bars are, in fact, outstanding. You tell her so. She tears up a little.", effects: { food: 6, morale: 10, rep: { faithful: 5 } } }] },
      { label: "Donate to the roof fund", cost: { money: 25 }, outcomes: [{ text: "She gives you a whole pie and a prayer card. \"We pray for everybody on the road,\" she says, and means it.", effects: { food: 8, morale: 8, rep: { faithful: 10 }, items: { "church-fan": 1 } } }] },
      { label: "Just say hi", outcomes: [{ text: "She gives you a brownie anyway.", effects: { morale: 4 } }] }
    ]
  },
  {
    id: "pp-teen-runaways", title: "Two Kids at the Bus Stop", where: "road", tags: ["people", "heat"],
    text: "Two teenagers at a bus stop, holding hands, with one backpack between them. The bus to the city doesn't come anymore; the route was cut. They ask, carefully, where you're going.",
    choices: [
      { label: "Drive them to the next paradise bus line", outcomes: [{ text: "They're quiet for a hundred miles, then talk for the next hundred. When you drop them off, one of them says, \"We'll pay it forward.\" You believe them.", effects: { miles: -20, heat: 15, morale: 15, rep: { resistance: 10 } } }] },
      { label: "Give them money for another route", cost: { money: 40 }, outcomes: [{ text: "They take it like it's a lifeline, because it is.", effects: { morale: 10, rep: { resistance: 5 } } }] },
      { label: "Tell them you can't", outcomes: [{ text: "They nod like they expected that. That's the worst part.", effects: { morale: -12 } }] }
    ]
  },
  {
    id: "pp-pawn-shop", title: "Pawn Shop", where: "road", tags: ["money"],
    text: "A pawn shop called PATRIOT PAWN & GOLD. The owner buys everything and sells it back at triple. He also, it turns out, buys a lot of things nobody should sell.",
    choices: [
      { label: "Pawn the regime hats", requires: { item: "regime-hats" }, outcomes: [{ text: "He takes the hats at a fair price. He'll sell them back to the town at triple. Circle of life.", effects: { items: { "regime-hats": -1 }, money: 25 } }] },
      { label: "Pawn the commemorative coins", requires: { item: "rally-coins" }, outcomes: [{ text: "He bites one, laughs, and offers you $8. They're brass. You knew that.", effects: { items: { "rally-coins": -1 }, money: 8 } }] },
      { label: "Buy the clipboard on the wall", cost: { money: 10 }, outcomes: [{ text: "It came from a county inspector who \"didn't need it anymore.\" It still has authority in it.", effects: { items: { clipboard: 1 } } }] },
      { label: "Just look", outcomes: [{ text: "A guitar, a wedding ring, a trophy for \"Most Loyal 2019.\" Everything here has a story." }] }
    ]
  },
  {
    id: "pp-roadside-preacher", title: "Street Corner Preacher", where: "road", tags: ["people", "faction"],
    text: "A street preacher with a sandwich board that says THE END IS NEAR, and on the back, in smaller letters, BUT ALSO, BE NICE. He's preaching about the back half.",
    choices: [
      { label: "Listen to the back half", outcomes: [{ text: "Fifteen minutes on being nice. It's the best sermon you've heard on this trip, and the only one without a sponsor.", effects: { morale: 8, rep: { faithful: 5 } } }] },
      { label: "Give him a sandwich", cost: { food: 3 }, outcomes: [{ text: "He blesses the sandwich, then you, then the van, then a passing cat.", effects: { morale: 6, rep: { faithful: 5 } } }] }
    ]
  },
  {
    id: "pp-hitchhiking-trucker", title: "The Trucker's Tip", where: "road", tags: ["people", "heat"],
    text: "A trucker at a fuel island sees your plates and says, without looking at you, \"Scale house on 80 is running ID checks today. Take the county road.\"",
    choices: [
      { label: "Take his advice", outcomes: [{ text: "The county road is slower and empty. Later you hear the scale house made eleven arrests.", effects: { miles: -20, heat: -10 } }] },
      { label: "Thank him with coffee", requires: { item: "coffee" }, outcomes: [{ text: "He grins. \"Real coffee.\" He gives you his CB handle and a list of every friendly truck stop to the coast.", effects: { items: { coffee: -1 }, heat: -15, morale: 6 } }] },
      { label: "Ignore him", outcomes: [{ text: "The scale house is running ID checks.", effects: { heat: 15, delay: 1 } }] }
    ]
  },
  {
    id: "pp-pen-pal", title: "Pen Pal", where: "road", tags: ["people"],
    text: "At a post office, a teenager is mailing a letter to a pen pal in a paradise city. The postmaster opens it, reads it and stamps it APPROVED (WITH CONCERNS). The kid looks mortified.",
    choices: [
      { label: "Offer to hand-deliver her next letter", outcomes: [{ text: "She runs home and writes one. It's to a girl in Philadelphia. You promise. She gives you a mixtape for the road.", effects: { items: { mixtape: 1 }, morale: 8 } }] },
      { label: "Tell the postmaster to mind his business", check: { skill: "intimidation", difficulty: "medium" },
        success: [{ text: "{skilled} cites the federal statute on mail tampering. The postmaster, unsure the statute still exists, apologizes to the kid.", effects: { morale: 10 } }],
        failure: [{ text: "The postmaster reads your mail too.", effects: { heat: 15 } }] }
    ]
  },
  {
    id: "pp-mechanic-scam", title: "Honest Bob's", where: "road", tags: ["vehicle", "money"],
    text: "HONEST BOB'S AUTO — FREE INSPECTION. Bob inspects the van with a flashlight and a face that suggests he's looking at a hospice patient. \"Gonna need a whole new transmission.\"",
    choices: [
      { label: "Get a second opinion", requires: { skill: "mechanical" }, outcomes: [{ text: "{skilled} looks. The transmission is fine. Bob, caught, does an honest oil change for free to save face.", effects: { van: 8 } }] },
      { label: "Pay Bob", cost: { money: 150 }, outcomes: [{ text: "Bob does... something. The van runs the same. Bob's boat, you notice, is very nice.", effects: { van: 5 } }] },
      { label: "Leave", outcomes: [{ text: "Bob yells that you won't make it fifty miles. You make it fifty miles. You make it a hundred." }] }
    ]
  },
  {
    id: "pp-reporter", title: "Real Reporter", where: "road", tags: ["people", "faction"],
    text: "A woman in a parking lot recognizes your plates and says she's a reporter from a paper that \"technically doesn't exist anymore.\" She wants your story, anonymously.",
    choices: [
      { label: "Tell her everything", outcomes: [{ text: "She records for an hour. Weeks later, someone in Vermont will read it and cry. She gives you a press badge she \"doesn't need anymore.\"", effects: { items: { "press-badge": 1 }, rep: { resistance: 10 }, heat: 5 } }] },
      { label: "Decline", outcomes: [{ text: "She understands. She gives you her number on a gum wrapper anyway." }] }
    ]
  }
];
