// Authored news-ticker headlines. Always available; optional AI headlines add
// variety on top. The regime's state media, the paradises' community radio,
// and the occasional local paper. Keyed by region, plus general lines.
import type { Region } from "../types";

export const HEADLINES: Record<Region | "any", string[]> = {
  any: [
    "STATE MEDIA: Unemployment at record low after 'unemployed' reclassified as 'patriotically resting'",
    "Governor signs bill requiring all clouds to be 'traditional shapes'",
    "Loyalty points now accepted at three participating hospitals",
    "Ministry of Truth denies existence of Ministry of Truth in strongly worded press release",
    "New study funded by the Department of Normalcy finds everything is fine",
    "Gas prices up 40% due to 'liberal weather'",
    "Library card applications down 98%, State Library Board calls it 'a win'",
    "Checkpoint wait times now measured in 'patriotic minutes,' which are longer",
    "Federal agency rebrands as 'Freedom Agency' after brief, freedom-loving pause",
    "Pledge of Allegiance extended by two verses and a sponsor message",
    "Weather service suspended for 'editorializing' about a hurricane",
    "Senate passes resolution declaring itself correct"
  ],
  northwest: [
    "COMMUNITY RADIO: Seattle co-op reaches 40th step of membership process, celebrates with oat milk",
    "Portland food carts unionize, form mutual aid network, still refuse to put pineapple on anything",
    "State media warns of 'dangerous kombucha' crossing the Idaho border"
  ],
  mountain: [
    "Idaho book-burning season opens early due to 'dry conditions'",
    "Montana installs 10,000th camera; officials say they've 'never felt more watched over'",
    "Ranchers report cows now required to carry papers",
    "Mountain pass renamed 'Liberty Pass' after the old name was found to be 'too descriptive'"
  ],
  plains: [
    "Great Wall of North Dakota reaches 11.2 miles, still keeps out no one",
    "County militia announces it is 'actively recruiting,' displays pamphlet with two typos",
    "Tornado declared 'an act of God against Minneapolis,' misses Minneapolis by 400 miles",
    "Wheat harvest strong; Department of Agriculture credits 'prayer and tariffs'"
  ],
  midwest: [
    "COMMUNITY RADIO: Twin Cities hot dish exchange enters third consecutive month",
    "Madison farmers market defies 'nonessential vegetable' ban for 40th Saturday",
    "Chicago aldermen reach consensus, briefly, before arguing about deep dish",
    "Indiana church sponsorship tier list leaked; regional bank 'disappointed' in its placement",
    "Factory town receives sign promising factory; factory not included"
  ],
  south: [
    "Kentucky checkpoint buckle polished to 'blinding shine,' three drivers blinded",
    "Megachurch toll plaza adds express lane for 'tithers with Premium membership'",
    "Coal-rolling declared 'state sport'; asthma declared 'liberal hoax'",
    "Statue count on Memorial Highway reaches 300; gift shops report record hat sales",
    "Revival tent attendance strong; fried chicken attendance stronger"
  ],
  east: [
    "COMMUNITY RADIO: Baltimore harbor station broadcasts 24-hour reading of the Bill of Rights",
    "Philadelphia pretzel vendors distribute 'First Amendment' pamphlets with every purchase",
    "Vermont maple syrup taxed as 'luxury liquid'; Vermont responds with more syrup",
    "Convoy of used Subarus spotted ferrying travelers across the Vermont line; state media calls it \"a granola-based threat\""
  ]
};
