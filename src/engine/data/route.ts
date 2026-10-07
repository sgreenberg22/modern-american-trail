import type { Leg, Region, Stop, StopKind } from "../types";
import type { Rng } from "../rng";

// Major stops with real coordinates. Names are provisional until the Phase 3
// content pass; "paradise" stops are the safe havens along the escape route.
interface MajorStop {
  id: string;
  name: string;
  kind: StopKind;
  region: Region;
  lat: number;
  lon: number;
}

export const MAJOR_STOPS: MajorStop[] = [
  { id: "portland", name: "Liberal Paradise of Portland", kind: "paradise", region: "northwest", lat: 45.515, lon: -122.679 },
  { id: "seattle", name: "Sanctuary City of Seattle", kind: "paradise", region: "northwest", lat: 47.606, lon: -122.332 },
  { id: "boise", name: "Book Burning Fields of Idaho", kind: "hostile", region: "mountain", lat: 43.615, lon: -116.202 },
  { id: "helena", name: "Surveillance State of Montana", kind: "hostile", region: "mountain", lat: 46.589, lon: -112.039 },
  { id: "bismarck", name: "The Great Wall of North Dakota", kind: "hostile", region: "plains", lat: 46.808, lon: -100.784 },
  { id: "minneapolis", name: "Twin Cities Commune", kind: "paradise", region: "midwest", lat: 44.978, lon: -93.265 },
  { id: "madison", name: "Cheese Curd Collective of Madison", kind: "paradise", region: "midwest", lat: 43.073, lon: -89.401 },
  { id: "chicago", name: "Sanctuary of Chicago", kind: "paradise", region: "midwest", lat: 41.878, lon: -87.63 },
  { id: "indianapolis", name: "Corporate Theocracy of Indiana", kind: "hostile", region: "midwest", lat: 39.768, lon: -86.158 },
  { id: "louisville", name: "Bible Belt Checkpoint (Kentucky)", kind: "hostile", region: "south", lat: 38.253, lon: -85.759 },
  { id: "charleston", name: "Coal Rolling Capital (West Virginia)", kind: "hostile", region: "south", lat: 38.35, lon: -81.633 },
  { id: "richmond", name: "Confederate Memorial Highway (Virginia)", kind: "hostile", region: "south", lat: 37.541, lon: -77.436 },
  { id: "baltimore", name: "Crab Cake Free State of Baltimore", kind: "paradise", region: "east", lat: 39.29, lon: -76.612 },
  { id: "philadelphia", name: "The Last Stand (Philadelphia)", kind: "paradise", region: "east", lat: 39.953, lon: -75.165 },
  { id: "vermont", name: "Safe Haven of Vermont", kind: "goal", region: "east", lat: 44.26, lon: -72.576 }
];

export const CHECKPOINT_NAMES = [
  "Checkpoint Alpha", "Loyalty Testing Facility", "Patriotism Academy", "Freedom™ Outpost",
  "Truth Verification Point", "Propaganda Station", "Compliance Center", "Ministry of Truth Field Office",
  "Re-education Rest Stop", "Thought Police Substation", "Freedom™ Processing Center",
  "Mandatory Prayer Weigh Station", "Corporate Sponsorship Toll Plaza", "Book Return & Incineration Drop",
  "Surveillance Nexus", "Pledge Compliance Kiosk", "Approved Opinions Visitor Center",
  "Department of Normalcy Annex", "Traditional Values Tollbooth", "Flag Size Inspection Station",
  "Loyalty Points Redemption Center", "Patriot Mall Food Court Checkpoint", "Regime Outpost",
  "Indoctrination Hub", "Order Facility", "Detention Center Annex", "Bootstrap Inspection Point",
  "Heritage Verification Depot"
];

/** Roads aren't straight; scale great-circle distance to approximate driving miles. */
export const ROAD_FACTOR = 1.2;
/** Roughly one hostile checkpoint per this many miles of road. */
const MILES_PER_CHECKPOINT = 190;

export function haversineMiles(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const R = 3958.8;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Builds the run's stops and legs. Geometry is fixed (real coordinates, checkpoint
 * count by leg length); only checkpoint names are seeded.
 */
export function buildRoute(rng: Rng): { stops: Stop[]; legs: Leg[] } {
  const names = rng.shuffle(CHECKPOINT_NAMES);
  let nameIdx = 0;
  const stops: Stop[] = [];

  MAJOR_STOPS.forEach((major, i) => {
    stops.push({ ...major });
    const nextMajor = MAJOR_STOPS[i + 1];
    if (!nextMajor) return;
    const road = haversineMiles(major, nextMajor) * ROAD_FACTOR;
    const count = Math.min(2, Math.round(road / MILES_PER_CHECKPOINT));
    for (let k = 1; k <= count; k++) {
      const f = k / (count + 1);
      stops.push({
        id: `cp-${major.id}-${k}`,
        name: names[nameIdx++ % names.length],
        kind: "waypoint",
        region: f < 0.5 ? major.region : nextMajor.region,
        lat: major.lat + (nextMajor.lat - major.lat) * f,
        lon: major.lon + (nextMajor.lon - major.lon) * f
      });
    }
  });

  const legs: Leg[] = [];
  for (let i = 0; i < stops.length - 1; i++) {
    legs.push({ from: i, to: i + 1, miles: Math.round(haversineMiles(stops[i], stops[i + 1]) * ROAD_FACTOR) });
  }
  return { stops, legs };
}
