import type { NPC } from "@/types/npc";
import { NPCS } from "@/data/npcs";
import { createRng, pick } from "./seededRandom";

/** How much seeded variety to blend into the access-based ordering. */
const SELECTION_FUZZ = 7;

export const ROUND_TIMER_SECONDS = 90;

/** Clear this round and the run is won. */
export const FINAL_ROUND = 20;

export function budgetMultiplierForRound(roundNumber: number): number {
  return Math.max(0.35, 1 - (roundNumber - 1) * 0.04);
}

export function budgetPressureLabel(multiplier: number): string {
  if (multiplier >= 0.95) return "Steady budget";
  if (multiplier >= 0.85) return "Tight budget";
  if (multiplier >= 0.75) return "Tighter budget";
  if (multiplier >= 0.65) return "Small budget";
  return "Tiny budget";
}

/** Introduce people with fewer kitchen constraints early; seeded noise varies the order. */
export function selectNPC(previousNPCIds: string[], seed: number): NPC {
  const rng = createRng(seed);
  let pool = NPCS.filter((n) => !previousNPCIds.includes(n.id));
  if (pool.length === 0) {
    // Pool exhausted: allow repeats, but avoid the NPC just played
    const lastId = previousNPCIds[previousNPCIds.length - 1];
    pool = NPCS.filter((n) => n.id !== lastId);
    return pick(rng, pool);
  }
  let best = pool[0];
  let bestScore = -Infinity;
  for (const npc of pool) {
    const score =
      100 - npc.restrictions.length * 20 + (rng() * 2 - 1) * SELECTION_FUZZ;
    if (score > bestScore) {
      best = npc;
      bestScore = score;
    }
  }
  return best;
}
