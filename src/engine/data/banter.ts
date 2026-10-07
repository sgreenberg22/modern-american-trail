// Party chatter on quiet road days. Each line belongs to a character and can
// depend on the situation. {other} is another living party member (or the one
// named in `with`). Lines don't repeat within a run until a character runs out.
import type { Region, Weather } from "../types";

export interface BanterWhen {
  /** Party has under 3 days of food. */
  lowFood?: boolean;
  /** Under 5 gallons. */
  lowGas?: boolean;
  /** The speaker's morale is under 35. */
  lowMorale?: boolean;
  /** Party morale averages over 70. */
  goodMood?: boolean;
  /** The speaker is hurt (health under 40 or any condition). */
  hurt?: boolean;
  /** Heat is at "wanted" or above. */
  wanted?: boolean;
  /** Someone in the party has died. */
  grief?: boolean;
  /** More than 85% of the way to Vermont. */
  nearGoal?: boolean;
  /** Van under 40%. */
  badVan?: boolean;
  weather?: Weather[];
  regions?: Region[];
  /** Another character who must be alive in the party; becomes {other}. */
  with?: string;
}

export interface BanterLine { id: string; text: string; when?: BanterWhen }

const lines = (char: string, items: (string | [string, BanterWhen])[]): BanterLine[] =>
  items.map((it, i) => (typeof it === "string" ? { id: `${char}-${i}`, text: it } : { id: `${char}-${i}`, text: it[0], when: it[1] }));

export const BANTER: Record<string, BanterLine[]> = {
  alex: lines("alex", [
    "\"I turned off location services on all our phones. Then I turned off the phones. Then I put them in a chip bag. You can't be too careful.\"",
    "\"Fun fact: that billboard has a camera in it. Not-fun fact: so does the next one.\"",
    "\"I've been mining crypto on the van's USB port. We've made eleven cents.\"",
    "\"If anyone asks, my job is 'IT.' It's technically true. I did fix a printer once.\"",
    "\"The regime's website still uses a password from 2009. I'm not going to do anything with that information. Probably.\"",
    "\"I miss Wi-Fi that didn't ask for my loyalty number.\"",
    ["\"We're on a list. Good news: it's an incompetently maintained list.\"", { wanted: true }],
    ["\"The drones out here run old firmware. I could fix that. I won't, but I could.\"", { regions: ["mountain", "plains"] }],
    ["\"I can hack a toll plaza. I cannot hack a granola bar into existence.\"", { lowFood: true }],
    ["\"{other}, if they ask about the laptop, it's for spreadsheets.\" {other}: \"Is it?\" \"It's for some spreadsheets.\"", { with: "morgan" }],
    ["\"Jessie and I have a deal: I disable the cameras, they disable the guilt.\"", { with: "jessie" }],
    ["\"Rain is good. Cameras hate rain.\"", { weather: ["rain", "storm", "fog"] }],
    ["\"I'm fine. I'm just running at reduced capacity. Like Windows Vista.\"", { hurt: true }],
    ["\"I keep refreshing a feed that isn't there anymore.\"", { grief: true }],
    ["\"I can see Vermont's servers from here. Metaphorically. They're running Linux and they're happy.\"", { nearGoal: true }],
    ["\"Honestly? Best road trip I've ever been on. Low bar, but still.\"", { goodMood: true }],
    "\"The phone says there's a Starbucks in four miles. The phone also says I'm in Belgium. I've stopped trusting the phone.\"",
    "\"I wrote a script that sends the regime's tip line a thousand photos of bread. It's not resistance, exactly. It's vibes.\"",
    ["\"Everyone shut up, I'm calculating whether the van can run on spite.\"", { lowGas: true }],
    "\"Someday I'm going to write a postmortem on this whole country. Root cause: everything.\"",
    "\"Twenty-two different apps want my location. I have given each of them a different wrong answer.\""
  ]),

  sam: lines("sam", [
    "\"I'm writing all of this down. Someday it's going to be a book, or evidence.\"",
    "\"Headline: 'Local Van Survives Another Day.' Subhead: 'Morale Cautiously Optimistic.'\"",
    "\"Every gas station clerk out here has a story. Most of them are about their ex. Some are about the country.\"",
    "\"I used to cover city council meetings. This is like that, but the stakes are higher and the coffee is worse.\"",
    "\"Do you think the regime reads my notes? Hi, regime. You misspelled 'patriotism' on that last sign.\"",
    "\"The thing about a good story is that it doesn't need adjectives. The thing about this trip is that it needs all of them.\"",
    ["\"Off the record: I'm terrified. On the record: we're doing great.\"", { wanted: true }],
    ["\"I'm going to write a whole chapter on how good that pie was. Whenever we find pie again.\"", { lowFood: true }],
    ["\"Nobody's journalism school covered 'what to do when your sources are all at a militia barbecue.'\"", { regions: ["mountain", "plains", "south"] }],
    ["\"I keep starting the sentence about them and not finishing it.\"", { grief: true }],
    ["\"I've got the last line. I just need us to get there so I can write it.\"", { nearGoal: true }],
    ["\"Look at us. Look at this. Somebody take a picture, I'm busy narrating.\"", { goodMood: true }],
    ["\"{other}, give me a quote for the book.\" {other}: \"No.\" \"Perfect. Very you.\"", { with: "riley" }],
    ["\"{other} told me the plural of 'interrogation' is 'Tuesday.' I'm using it.\"", { with: "morgan" }],
    ["\"I've filed this under 'weather, biblical.'\"", { weather: ["storm", "snow"] }],
    ["\"My hands hurt. Writer's cramp, but from holding on to the dashboard.\"", { hurt: true }],
    "\"The radio said we're 'dangerous outsiders.' I've never been called dangerous before. I'm a little flattered.\"",
    "\"Ask me how many words I've written today. Go on. Four thousand. Ask me how many are usable. Nine.\"",
    "\"Every town has a bulletin board, and every bulletin board is the real local newspaper.\"",
    "\"I interviewed a cow at the last stop. Better source than the governor.\"",
    ["\"I keep writing 'we're nearly out of gas' and then rewriting it to be less true.\"", { lowGas: true }]
  ]),

  jordan: lines("jordan", [
    "\"I've got a contingency plan for the contingency plan. It involves more lasagna.\"",
    "\"Those are elderberries. Edible. Those are not. Do not eat those.\"",
    "\"Ninety percent of survival is having a good knife and knowing where you put it.\"",
    "\"I rotate my canned goods by expiration date. I also rotate the van's tires by vibes.\"",
    "\"In a pinch you can make a stove out of a soda can. In a bigger pinch you can make a soda out of a stove. Don't ask.\"",
    "\"I always pack three of everything. Except patience. I packed one of those and I'm using it now.\"",
    ["\"Okay. Rationing protocol. Everyone gets one cracker and one inspirational quote.\"", { lowFood: true }],
    ["\"We could siphon. We could walk. I've trained for both.\"", { lowGas: true }],
    ["\"I've been waiting my whole life for weather like this. It's terrible. I love it.\"", { weather: ["storm", "snow"] }],
    ["\"Good country for foraging. Bad country for being seen foraging.\"", { regions: ["mountain", "northwest"] }],
    ["\"{other} keeps asking what's in the freeze-dried pouches. The answer is 'dinner,' {other}.\"", { with: "taylor" }],
    ["\"Me and {other} have the same bug-out bag. We should start a podcast.\"", { with: "quinn" }],
    ["\"I'm fine. I've splinted worse with a magazine and duct tape.\"", { hurt: true }],
    ["\"I had a plan for everything except this.\"", { grief: true }],
    ["\"Supplies are good, spirits are good, ankles are mostly good. Best day of the trip.\"", { goodMood: true }],
    ["\"Vermont. Fresh water, arable land, and good neighbors. That's a prepper's paradise.\"", { nearGoal: true }],
    "\"If the van breaks down, we have water for six days, food for nine, and puns for infinity.\"",
    "\"I don't believe in luck. I believe in having a backup flashlight for the backup flashlight.\"",
    "\"Every gas station sells beef jerky, a sunglasses rack, and one emotional support plush. Civilization endures.\"",
    "\"Somebody's going to want this tarp. Everybody always ends up wanting the tarp.\"",
    ["\"The van is making the noise. You know the noise.\"", { badVan: true }]
  ]),

  casey: lines("casey", [
    "\"Hear that? That's the van saying thank you. Or it's the alternator. Probably both.\"",
    "\"Every vehicle has a personality. This one's is 'anxious but loyal.'\"",
    "\"I could rebuild this engine with a spoon. I'd rather not have to.\"",
    "\"I give this van a solid C-plus. Which is better than the country.\"",
    "\"You learn a lot about people by what's in their glovebox. Ours has three maps, two parking tickets, and a Constitution.\"",
    "\"Rule one of road trips: never trust a gas station that sells its own brand of motor oil.\"",
    ["\"Don't worry about the smell. Okay, worry a little.\"", { badVan: true }],
    ["\"The gauge says empty. The gauge is a liar, but not by much.\"", { lowGas: true }],
    ["\"Lift kits, lift kits, lift kits. These people would lift a canoe if they could.\"", { regions: ["south", "mountain"] }],
    ["\"Rain's good for the tires. Bad for the wipers. Worse for me.\"", { weather: ["rain", "storm"] }],
    ["\"{other}, don't touch that.\" {other}: \"I wasn't going to.\" \"You were going to.\"", { with: "alex" }],
    ["\"{other} and I agree the van's a good van. It's the only thing we agree on.\"", { with: "quinn" }],
    ["\"I'll be okay. I'm a fixer. I just need someone to fix the fixer.\"", { hurt: true }],
    ["\"I keep tightening the same bolt. It's tight. I just need something to do with my hands.\"", { grief: true }],
    ["\"She's running smooth today. Don't say it out loud.\"", { goodMood: true }],
    ["\"If this van makes it to Vermont, I'm framing the spark plugs.\"", { nearGoal: true }],
    "\"The check engine light's been on since Idaho. At this point it's a nightlight.\"",
    "\"I named the van. I'm not telling you the name. It's between us.\"",
    "\"You can fix almost anything with duct tape, zip ties, and an unreasonable amount of confidence.\"",
    "\"A guy at the last stop told me the regime's trucks don't have mechanics. They have consultants.\"",
    ["\"Can't fix a stomach with a wrench. I've tried.\"", { lowFood: true }]
  ]),

  taylor: lines("taylor", [
    "\"Everyone drink water. I'll be checking. I'll know.\"",
    "\"I took an oath to do no harm. Nobody said anything about passive-aggressive reminders to stretch.\"",
    "\"That gas station burrito has a half-life.\"",
    "\"Sitting for eight hours a day is bad for you. So is everything else out here, so, priorities.\"",
    "\"I counted. We've eaten eleven bags of chips this week. Medically, that's a cry for help.\"",
    "\"If anyone needs a prescription, I can write one. If anyone needs a pharmacy that will fill it, I can't help you.\"",
    ["\"Nutritionally, we are now running on optimism and ketchup packets.\"", { lowFood: true }],
    ["\"Doctor's orders: everybody rest. Doctor's other orders: I also need to rest.\"", { hurt: true }],
    ["\"Heat stroke is real. Hydrate. That's not a suggestion.\"", { weather: ["heat"] }],
    ["\"Hypothermia is also real. Layers, people.\"", { weather: ["snow"] }],
    ["\"I keep thinking about what I could have done.\" {other}: \"Nothing. You did everything.\"", { grief: true }],
    ["\"{other}, that cough. Let me hear it again.\" {other}: \"It's nothing.\" \"That's what everyone says.\"", { with: "robin" }],
    ["\"{other} asked me if stress counts as a pre-existing condition. Out here it does.\"", { with: "sam" }],
    ["\"I've never seen blood pressure numbers this good on a road trip. Keep it up.\"", { goodMood: true }],
    ["\"The clinics here won't see 'out-of-state patients.' Good thing I brought one.\"", { regions: ["south", "midwest"] }],
    ["\"In Vermont I'm going to open a clinic and charge nothing and be smug about it.\"", { nearGoal: true }],
    "\"Fun fact: laughter really is good medicine. Unfortunately so is medicine.\"",
    "\"My bedside manner works great in a van. It's all bedside.\"",
    "\"I keep a list of every scratch, bruise and cough on this trip. It's not long. Yet.\"",
    "\"The regime banned three of the textbooks I studied from. I still have them memorized. Petty, but effective.\"",
    ["\"Stress, low sleep, and bad food. We're three for three.\"", { lowMorale: true }]
  ]),

  morgan: lines("morgan", [
    "\"Technically, nothing we're doing is illegal. Technically, a lot of things aren't technically anything anymore.\"",
    "\"I bill in six-minute increments. This trip is going to be expensive.\"",
    "\"Every checkpoint has a different interpretation of the law. Most of them are 'vibes.'\"",
    "\"I've cited the Fourth Amendment so many times the guards have started citing it back. Incorrectly.\"",
    "\"In law school they taught us to argue both sides. Out here there's only one side, and it has a lot of trucks.\"",
    "\"I keep a list of every unconstitutional thing we've seen. It's a scroll now.\"",
    ["\"We're 'persons of interest.' I prefer 'persons of note.'\"", { wanted: true }],
    ["\"I'd sue the weather if I could find its registered agent.\"", { weather: ["storm", "snow", "rain"] }],
    ["\"Objection: hunger. Sustained.\"", { lowFood: true }],
    ["\"Legally speaking, I'm fine. Medically speaking, ask {other}.\"", { hurt: true }],
    ["\"{other}, I've drafted your will. You get the tarp.\" {other}: \"I don't want the tarp.\" \"Too late.\"", { with: "jordan" }],
    ["\"{other} and I disagree about everything except due process. It's been nice.\"", { with: "riley" }],
    ["\"They'd want us to keep going. I don't need a precedent for that.\"", { grief: true }],
    ["\"The judges out here wear the robe over a hunting vest.\"", { regions: ["south", "plains", "mountain"] }],
    ["\"Vermont has a state constitution that predates the federal one. I'm going to read it in a bathtub.\"", { nearGoal: true }],
    ["\"For the record, today was good. Let the record reflect.\"", { goodMood: true }],
    "\"I've started reading the fine print on gas station receipts. One of them waives my right to complain about the coffee.\"",
    "\"Pro tip: always ask, 'Am I being detained?' It confuses them, and it's very satisfying.\"",
    "\"Somewhere out there, a law clerk is drafting something terrible. I can feel it.\"",
    "\"The pocket Constitution is mostly redacted now. The redactions have redactions.\"",
    ["\"We could argue we're entitled to gas. We'd lose, but we could argue it.\"", { lowGas: true }]
  ]),

  riley: lines("riley", [
    "\"Approach every checkpoint at exactly the speed limit. They hate that. Can't do anything about it.\"",
    "\"I used to work traffic. Most of these guards have never written a ticket that held up.\"",
    "\"Keep your hands where they can see them, and your opinions where they can't.\"",
    "\"I know the script. 'Where are you headed?' 'Visiting family.' Everybody's always visiting family.\"",
    "\"I quit the force because I didn't like who it was turning into. Turns out it was turning into this.\"",
    "\"I count exits. Old habit. Fourteen since the last town.\"",
    ["\"Wanted posters. Good photo of me, though. Finally.\"", { wanted: true }],
    ["\"Militia country. Don't make eye contact with anyone in a vest.\"", { regions: ["mountain", "plains"] }],
    ["\"I've been hungrier. Academy, week three. It's fine.\"", { lowFood: true }],
    ["\"Visibility's bad. Good for us, bad for them.\"", { weather: ["fog", "storm"] }],
    ["\"I've been hit harder. I don't want to talk about by whom.\"", { hurt: true }],
    ["\"{other}, if a cop asks, let me talk.\" {other}: \"You're not a cop anymore.\" \"They don't know that.\"", { with: "jessie" }],
    ["\"{other} keeps reading me rights I already know. It's soothing, honestly.\"", { with: "morgan" }],
    ["\"I've done notifications. I never got used to them. I'm not used to this either.\"", { grief: true }],
    ["\"Vermont state troopers drive Subarus. Did you know that? Subarus.\"", { nearGoal: true }],
    ["\"Nice day. Don't trust it.\"", { goodMood: true }],
    "\"Every one of these checkpoints is a jobs program for guys who wanted to be sheriff.\"",
    "\"You can tell a bored guard from an angry one by how they hold the clipboard.\"",
    "\"The worst cop I ever worked with is a state senator now. Explains a lot.\"",
    "\"I don't miss the uniform. I miss the pockets.\"",
    ["\"Lower morale than a precinct on a Monday.\"", { lowMorale: true }]
  ]),

  jessie: lines("jessie", [
    "\"I've driven this road before. Lights off, middle of the night, a trunk full of insulin. Good times.\"",
    "\"Smuggling's just logistics with a sense of humor.\"",
    "\"Never take the same route twice. Unless it's the only route. Then take it confidently.\"",
    "\"Everyone has a hidden compartment. Mine's in the spare tire. Yours is probably your heart.\"",
    "\"The secret to getting past a checkpoint is to look boring. I've been practicing boring my whole life.\"",
    "\"I've moved books, medicine, seeds, and once a goat. The goat was the hardest.\"",
    ["\"Relax. Being wanted is just being popular with the wrong crowd.\"", { wanted: true }],
    ["\"Fog. Finally. My kind of weather.\"", { weather: ["fog", "rain"] }],
    ["\"I know a guy with a cooler of sandwiches about forty miles from here. Probably. If he's still around.\"", { lowFood: true }],
    ["\"I know a guy with gas. I know a lot of guys. Some of them are even reliable.\"", { lowGas: true }],
    ["\"{other} disables the cameras, I disable the conversation. Teamwork.\"", { with: "alex" }],
    ["\"{other} won't stop telling me what they'd arrest me for.\" {other}: \"Everything. The answer's everything.\"", { with: "riley" }],
    ["\"I've had worse. I've had worse in a ditch in Arkansas.\"", { hurt: true }],
    ["\"I've lost people on runs before. It doesn't get easier. You just get quieter.\"", { grief: true }],
    ["\"Bourbon country. Back when that meant something.\"", { regions: ["south"] }],
    ["\"Vermont. Last stop. I've never delivered a cargo this important.\"", { nearGoal: true }],
    ["\"Clean run so far. I'm almost bored.\"", { goodMood: true }],
    "\"Pro tip: if you smile at a guard, smile with your eyes. Mouths are suspicious.\"",
    "\"The best hiding place is in plain sight. The second-best is under the sandwiches.\"",
    "\"I don't do this for the money. I mostly don't do this for the money.\"",
    ["\"The van's held together by luck and a zip tie I put on in 2019.\"", { badVan: true }]
  ]),

  pat: lines("pat", [
    "\"They defrocked me for preaching that Jesus would have fed people without asking for ID first. I stand by it.\"",
    "\"Most of the folks out here are good people living under bad people. It's an old story.\"",
    "\"I still pray. Mostly for the van.\"",
    "\"Every church we pass has a sign. I grade the signs. That one's a B-minus.\"",
    "\"The megachurches charge a tithe at the bridge. The little churches leave the door unlocked. You can tell which one the Lord's in.\"",
    "\"Grace is free. Gas is four dollars. Theology is complicated.\"",
    ["\"Loaves and fishes, everybody. Mostly loaves. Mostly not even loaves.\"", { lowFood: true }],
    ["\"Lord, if you're listening, a gas station would be wonderful.\"", { lowGas: true }],
    ["\"Bible Belt. My old stomping grounds. Literally, they stomped me out of it.\"", { regions: ["south"] }],
    ["\"Rain on the just and the unjust alike. And the van.\"", { weather: ["rain", "storm"] }],
    ["\"I sat with a lot of grieving families. I never thought I'd be the one needing the casserole.\"", { grief: true }],
    ["\"{other}, do you believe in miracles?\" {other}: \"I believe in medkits.\" \"Same thing, sometimes.\"", { with: "taylor" }],
    ["\"{other} has been asking me about forgiveness. I told them it's like a spare tire: you need it when you least expect it.\"", { with: "riley" }],
    ["\"It's just a bruise. I've had worse from a church potluck.\"", { hurt: true }],
    ["\"Vermont has more churches per capita than you'd think. Most of them are also bakeries.\"", { nearGoal: true }],
    ["\"This is a blessing. I don't say that lightly anymore.\"", { goodMood: true }],
    "\"I baptized half the kids in my old town. Most of them grew up kind. That's the part I'm proud of.\"",
    "\"The regime's favorite verse is the one about obeying authority. They skip the parts about the poor. There are a lot of parts about the poor.\"",
    "\"Somebody at the last stop recognized me. They didn't turn me in. They gave me a pie.\"",
    "\"Love thy neighbor, even the one with the lifted truck. Especially that one. He's the one who needs it.\""
  ]),

  quinn: lines("quinn", [
    "\"Breaker one-nine, this is Quinn, anybody out there? ...No. They never answer anymore.\"",
    "\"I've eaten at every truck stop between here and Bangor. Rank 'em? I could rank 'em.\"",
    "\"Truckers know everything. Every checkpoint, every speed trap, every diner with the good pie.\"",
    "\"Twenty years on the road. Never once got lost. Got 'redirected' a few times.\"",
    "\"The secret to long hauls is a good thermos, a bad podcast, and never trusting a GPS.\"",
    "\"Trucks out here have flags the size of bedsheets. Mine had a bobblehead of a cat.\"",
    ["\"CB says there's a speed trap ahead. CB also says Jesus loves me. Both reliable.\"", { wanted: true }],
    ["\"I know a truck stop forty miles up. Coffee's bad. Gas is good. That's the trade.\"", { lowGas: true }],
    ["\"Trucker trick: eat at the place with the most rigs in the lot. Except we can't afford it.\"", { lowFood: true }],
    ["\"Black ice weather. Gentle on the brakes, everybody.\"", { weather: ["snow"] }],
    ["\"I-90. Long, flat, and boring. My favorite.\"", { regions: ["plains", "mountain"] }],
    ["\"{other}, you hear that rattle?\" {other}: \"I hear it.\" \"Good. I thought I was crazy.\"", { with: "casey" }],
    ["\"{other}'s been trying to learn trucker slang. Says 'ten-four' like a question.\"", { with: "sam" }],
    ["\"Bad hip. Old trucker injury. Also a new one.\"", { hurt: true }],
    ["\"I've lost friends on the road before. Never got easier. Just got longer between stops.\"", { grief: true }],
    ["\"Last leg. Every trucker knows the last leg feels longest.\"", { nearGoal: true }],
    ["\"Good miles today. Smooth road, no smokeys. You don't get many of these.\"", { goodMood: true }],
    "\"Truck stop showers. Underrated. Like a spa, if the spa had a jukebox.\"",
    "\"You can tell a lot about a state from its rest stops. This one's honest, at least.\"",
    "\"I've got a guy in every state. Some of 'em even still talk to me.\"",
    ["\"The van's limping. I know a limp when I see one.\"", { badVan: true }]
  ]),

  robin: lines("robin", [
    "\"Twelve-hour shifts made me ready for anything. Except this. But almost this.\"",
    "\"Triage is just deciding who to worry about first. I worry about everyone first.\"",
    "\"I brought the good bandages. The ones that actually stick.\"",
    "\"Nurses run on coffee and spite. I'm out of coffee.\"",
    "\"I can start an IV in the dark on a moving bus. A van is nothing.\"",
    "\"The hospital I worked at got 'restructured.' Now it's a gun range with a pharmacy.\"",
    ["\"Everybody eat something. Even if it's just a sad cracker. Especially if it's just a sad cracker.\"", { lowFood: true }],
    ["\"I'm okay. Nurses are bad patients. Leave me alone.\"", { hurt: true }],
    ["\"Frostbite check, everyone. Fingers and toes.\"", { weather: ["snow"] }],
    ["\"Heat exhaustion is sneaky. If you stop sweating, tell me.\"", { weather: ["heat"] }],
    ["\"I've held a lot of hands at the end. I didn't think I'd lose one of us.\"", { grief: true }],
    ["\"{other} and I have a running bet on who sees the next bruise first.\"", { with: "taylor" }],
    ["\"{other}, sit still. I'm checking your blood pressure.\" {other}: \"Again?\" \"Again.\"", { with: "morgan" }],
    ["\"Rural clinics out here closed one by one. I worked at three of them.\"", { regions: ["plains", "south", "mountain"] }],
    ["\"In Vermont I'm sleeping for a week. Then I'm going back to work. That's how it goes.\"", { nearGoal: true }],
    ["\"Everyone's vitals are good. Don't jinx it.\"", { goodMood: true }],
    "\"Wash your hands. I'm not kidding. Gas station door handles are a biohazard.\"",
    "\"Patients used to apologize for bothering me. Never apologize to your nurse. Just tell us what hurts.\"",
    "\"The regime cut our supplies, so we started a black market for gauze. Wildest year of my career.\"",
    "\"You learn to sleep anywhere. I could sleep standing up. I have.\"",
    ["\"Stressed? Low morale? Tell me. That's a vital sign too.\"", { lowMorale: true }]
  ])
};
