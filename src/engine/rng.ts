// Seeded PRNG. The generator state is a single uint32 stored in GameState.rng,
// so a saved game resumes with exactly the same future rolls.

/** FNV-1a: hash any string (a seed, or seed + ids) to a uint32. */
export function hashString(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Mulberry32 step: returns [float in [0,1), next state]. */
export function next(state: number): [number, number] {
  const s = (state + 0x6d2b79f5) >>> 0;
  let t = s;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return [((t ^ (t >>> 14)) >>> 0) / 4294967296, s];
}

/** Mutable cursor over the stored state, used inside a single reducer step. */
export class Rng {
  constructor(public state: number) {}

  float(): number {
    const [v, s] = next(this.state);
    this.state = s;
    return v;
  }

  /** Integer in [min, max], inclusive. */
  int(min: number, max: number): number {
    return min + Math.floor(this.float() * (max - min + 1));
  }

  chance(p: number): boolean {
    return this.float() < p;
  }

  pick<T>(items: readonly T[]): T {
    return items[Math.floor(this.float() * items.length)];
  }

  weighted<T>(items: readonly T[], weight: (t: T) => number): T {
    const total = items.reduce((a, t) => a + Math.max(0, weight(t)), 0);
    if (total <= 0) return this.pick(items);
    let r = this.float() * total;
    for (const t of items) {
      r -= Math.max(0, weight(t));
      if (r < 0) return t;
    }
    return items[items.length - 1];
  }

  shuffle<T>(items: readonly T[]): T[] {
    const a = [...items];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(this.float() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
}

/** Stable value in [0,1) for a key, independent of the run's RNG stream (e.g. shop prices). */
export function stableFloat(...parts: (string | number)[]): number {
  return next(hashString(parts.join("|")))[0];
}
