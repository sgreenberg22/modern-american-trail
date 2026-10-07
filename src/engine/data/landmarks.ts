import type { Faction } from "../types";

// Hostile major stops. You stop here for the day: a gas station with a small,
// overpriced market, and up to two of: talk to locals, scavenge, lay low, motel.
export interface Landmark {
  intro: string;
  /** Whose good opinion talking to locals affects. */
  faction: Faction;
  talk: { success: string; failure: string };
  scavenge: { success: string; failure: string };
  /** A day of cash work: what the job is. */
  work: string;
}

export const LANDMARKS: Record<string, Landmark> = {
  boise: {
    intro: "The Book Burning Fields are an actual field, with bleachers. Saturday's event is sold out. The gas station sells kindling by the library card.",
    faction: "militia",
    talk: {
      success: "A rancher at the pump says the county sheriff only checks vans with out-of-state plates on weekdays, then winks so hard his hat moves.",
      failure: "You ask the wrong man about the bleachers. He writes down your plate number in a notebook titled PLATES."
    },
    scavenge: {
      success: "Behind the stadium: a pallet of confiscated granola bars and a box of perfectly good car parts nobody wanted to burn.",
      failure: "A security guard chases you off the lot. {member} trips over a pile of thesauruses."
    },
    work: "You spend the day restocking bleacher seats before Saturday's burning. The foreman pays cash and doesn't ask what you read."
  },
  helena: {
    intro: "Every light pole in Helena has a camera, and every camera has a little sign thanking you for your cooperation. The motel advertises \"Free Wi-Fi (Monitored).\"",
    faction: "militia",
    talk: {
      success: "A retired schoolteacher shows you the one stretch of highway the cameras can't see. She's been mapping blind spots for years. \"Hobby,\" she says.",
      failure: "The friendly man at the diner counter is, in fact, the camera installer. He's very proud of his work, and now he knows your faces."
    },
    scavenge: {
      success: "The dumpster behind the surveillance contractor's office is full of catered lunches nobody ate.",
      failure: "A camera swivels to watch you. Then another. {member} cuts a hand climbing out of a dumpster in a hurry."
    },
    work: "A day cleaning camera lenses on a cherry picker. You wave at yourselves on every monitor. Cash, under the table, which is also monitored."
  },
  bismarck: {
    intro: "The Great Wall of North Dakota is eleven miles long, four feet tall, and keeps out no one. The gift shop does great business.",
    faction: "militia",
    talk: {
      success: "A wall volunteer admits nobody's ever crossed it on purpose. He gives you directions, a free souvenir brick, and a look of quiet despair.",
      failure: "You compliment the wall sarcastically. The volunteer, who built it by hand, does not take it well, and he has a radio."
    },
    scavenge: {
      success: "The gift shop's back room has expired beef jerky, a case of road flares, and a box of spare parts from a tour bus that never left.",
      failure: "You're spotted taking a brick. It turns into a whole thing. {member} gets a bruise in the scuffle."
    },
    work: "The gift shop needs help repainting the wall. You paint eleven miles of nothing. The pay is decent; the wall is unchanged."
  },
  indianapolis: {
    intro: "In the Corporate Theocracy of Indiana, each church has a sponsor and each sponsor has a pew. Today's sermon is brought to you by a regional bank.",
    faction: "faithful",
    talk: {
      success: "An usher, off the clock, tells you which checkpoints accept prayer as payment and which ones only take cards.",
      failure: "You ask about the sponsorship model. The deacon asks about your credit score. It's not a friendly question."
    },
    scavenge: {
      success: "A church food pantry left its side door unlocked. The note on the shelf says \"Take what you need, and God (and Chase) bless you.\"",
      failure: "The food pantry has a loyalty card scanner. {member} gets caught and roughed up a little by a very large greeter."
    },
    work: "A megachurch hires day labor to install a new jumbotron. You learn more about the sponsor than anyone should. Paid in cash and a branded hoodie."
  },
  louisville: {
    intro: "The Bible Belt Checkpoint is a literal belt buckle, forty feet wide, across the interstate. Traffic goes through the hole in the middle.",
    faction: "faithful",
    talk: {
      success: "A church lady at the gas station decides you're lost lambs and gets you a list of back roads, a tin of biscuits, and a blessing.",
      failure: "You use the word \"secular\" in conversation. Word travels fast here; it has a lot of practice."
    },
    scavenge: {
      success: "A closed-down bourbon distillery has a pantry nobody's checked since the regime banned \"spirits with a liberal bias.\"",
      failure: "The distillery has a dog. {member} learns that the dog is very fast."
    },
    work: "You polish the giant belt buckle. It takes all day. A trucker tips you for the shine."
  },
  charleston: {
    intro: "In the Coal Rolling Capital, the air tastes like a tailpipe and the welcome sign is a lifted truck. Somebody is coal-rolling the town square as a civic tradition.",
    faction: "militia",
    talk: {
      success: "An out-of-work miner tells you the truth about the mines, the pensions and the trucks, then tells you which road the militia never patrols. You buy him lunch.",
      failure: "You mention solar power. Someone in the parking lot starts revving immediately, as if summoned."
    },
    scavenge: {
      success: "An abandoned company store still has canned goods and a shelf of truck parts that will fit the van, mostly.",
      failure: "The company store's floor gives way. {member} goes partway through."
    },
    work: "A day washing soot off lifted trucks at a car wash called Rollin' Clean. The owner pays well and calls you all \"city folk\" with surprising warmth."
  },
  richmond: {
    intro: "The Confederate Memorial Highway has a statue every mile. Every statue has a gift shop. Every gift shop sells the same hat.",
    faction: "militia",
    talk: {
      success: "A history teacher in the hat (\"for camouflage\") gives you a twenty-minute lecture on what really happened and directions to a safe house in Baltimore.",
      failure: "You ask a docent a historical question. He has an answer. It's wrong, loud, and directed at the sheriff."
    },
    scavenge: {
      success: "Behind a gift shop: a pallet of unsold hats, and beneath them, a cooler of sandwiches somebody forgot.",
      failure: "You're caught behind the gift shop. The owner calls it \"heritage theft.\" {member} gets shoved into a statue base."
    },
    work: "You spend the day folding the same hat into gift shop pyramids. The owner pays cash and asks if you're \"from around here.\" Nobody answers."
  }
};
