// Location vignettes: a short scene the first time you pass or reach a place.
// Checkpoints are keyed by name (names are shuffled onto the route each run);
// cities by stop id. Landmarks have their own scenes in landmarks.ts.

export const CHECKPOINT_VIGNETTES: Record<string, string> = {
  "Checkpoint Alpha": "There is no Checkpoint Beta. Someone asked once. Checkpoint Alpha is very proud of being first, and the guard salutes every car as if it were the last.",
  "Loyalty Testing Facility": "A drive-through with a menu board of oaths, small through extra-large. The extra-large comes with a commemorative cup.",
  "Patriotism Academy": "A former community college. The marquee lists this semester's courses: Advanced Saluting, Flags II, and a seminar called Questions (Why Not).",
  "Freedom™ Outpost": "The trademark symbol is enforced. A small sign explains that unlicensed freedom will be confiscated at the owner's expense.",
  "Truth Verification Point": "A booth with a polygraph and a guard who has clearly failed it many times himself. He waves you through without looking up from his phone.",
  "Propaganda Station": "A radio tower and a gift shop. The station's slogan is painted on the water tower: NEWS YOU CAN TRUST (WE CHECKED).",
  "Compliance Center": "A beige building with a beige sign and a line of beige sedans. Everyone inside is filling out the form that lets them fill out the other form.",
  "Ministry of Truth Field Office": "The field office is a double-wide trailer with a satellite dish and a fax machine that never stops. Nobody has ever seen what's on the faxes.",
  "Re-education Rest Stop": "Clean bathrooms, decent vending machines, and a mandatory eleven-minute video before you can use either. The video is narrated by a bald eagle puppet.",
  "Thought Police Substation": "The substation is closed. A note on the door says the officers are at a training on thinking. The note does not say when they'll be back.",
  "Freedom™ Processing Center": "Cars go in one end of a long shed and come out the other with a sticker. Nobody knows what happens in the middle. The sticker says PROCESSED.",
  "Mandatory Prayer Weigh Station": "Trucks pull onto a scale and a chaplain prays over them. Vans are waved past, which feels like being judged and found too small to bother.",
  "Corporate Sponsorship Toll Plaza": "Each lane is sponsored. Lane 3 is brought to you by an insurance company and plays its jingle while you wait. You will hum it for two states.",
  "Book Return & Incineration Drop": "A library-style book return slot, except the chute leads to a furnace. A sign reminds patrons that late fees still apply.",
  "Surveillance Nexus": "Eleven cameras on one pole, all pointed at the same spot in the road. The spot is unremarkable. You drive over it anyway, feeling seen.",
  "Pledge Compliance Kiosk": "A touchscreen kiosk asks you to recite the pledge into a microphone. It doesn't work. A handwritten sign says JUST SAY IT LOUD.",
  "Approved Opinions Visitor Center": "The visitor center has a rack of free brochures, each with one opinion in it. You take the one about lakes. It's for them.",
  "Department of Normalcy Annex": "Everything at the annex is aggressively normal: beige paint, soft rock, a bowl of mints. It's the most unsettling place you've been all week.",
  "Traditional Values Tollbooth": "The toll is the same as it was in 1957, adjusted for inflation, plus a fee for having been adjusted for inflation.",
  "Flag Size Inspection Station": "A row of flags, each larger than the last, ending in one so big it has its own weather. Inspectors measure every vehicle's flag against the chart.",
  "Loyalty Points Redemption Center": "Turn in your loyalty points for prizes. The prizes are more loyalty points. The redemption desk is staffed by a teenager who has stopped hoping.",
  "Patriot Mall Food Court Checkpoint": "The checkpoint is inside a mall, between a pretzel stand and a store that only sells hats. The guards take their breaks at the pretzel stand.",
  "Regime Outpost": "A guard shack, a flagpole and a dog asleep in the shade. The dog is the only one here doing the job right.",
  "Indoctrination Hub": "A billboard every hundred yards for a mile, each with one word. Read together, they say a sentence that doesn't mean anything, very confidently.",
  "Order Facility": "A building for maintaining order. Through the window you can see the filing cabinets, which are in no order whatsoever.",
  "Detention Center Annex": "A chain-link fence around nothing yet. The sign says COMING SOON. Everyone drives past this one a little faster.",
  "Bootstrap Inspection Point": "Guards check that travelers have bootstraps and are pulling on them. Sandals are cited. {member} keeps their feet very still.",
  "Heritage Verification Depot": "A man in a tricorn hat checks paperwork against a family tree painted on the wall. The tree has been edited many times. You can see the old branches under the paint."
};

/** First look at a paradise or the endpoints. */
export const CITY_VIGNETTES: Record<string, string> = {
  portland: "Portland: bike racks, food carts, a co-op on every corner, and a mural of a heron that someone has spray-painted a tiny scarf on. It's home. You still have to leave it.",
  seattle: "Seattle smells like coffee and rain. A man at the city limits holds a sign that says YOU'RE SAFE HERE in four languages, then offers you a pamphlet about composting, also in four languages.",
  minneapolis: "The Twin Cities are cold, kind, and fully organized. Within an hour you've been offered a hot dish, a spare room, and a seat on three committees.",
  madison: "Madison is a lake, a capitol dome, and a farmer's market that has been running continuously since before the regime and has no intention of stopping.",
  chicago: "Chicago rises out of the prairie like it's been waiting for you. The El rattles overhead, someone yells about deep dish in a tone that ends the discussion, and for one night nobody checks your papers.",
  baltimore: "Baltimore: row houses, crab shacks, and a harbor with a resistance radio station broadcasting from a boat. Everyone calls you 'hon,' even the people who are very busy.",
  philadelphia: "Philadelphia, where the Constitution was written, is still very much in the business of reading it out loud. A street vendor sells you a pretzel and a copy of the First Amendment.",
  vermont: "Green hills, white steeples, maple trees, and a hand-painted sign at the border: WELCOME. NOBODY HERE WILL ASK YOU ANYTHING."
};
