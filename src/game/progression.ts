import type { NPC } from "@/types/npc";
import { NPCS } from "@/data/npcs";
import { createRng, pick } from "./seededRandom";

/** How many win-rate points of noise to blend into difficulty ordering. */
const SELECTION_FUZZ = 7;

export const ROUND_TIMER_SECONDS = 90;

/** Clear this round and the run is won. */
export const FINAL_ROUND = 20;

const BUDGET_MULTIPLIERS = [
  1,
  0.94,
  0.88,
  0.82,
  0.76,
  0.7,
  0.64,
  0.58,
  0.52,
  0.47,
  0.42,
  0.38,
  0.34,
  0.31,
  0.29,
  0.27,
  0.25,
  0.23,
  0.21,
  0.2,
];

export function budgetMultiplierForRound(roundNumber: number): number {
  // Power-ups compound over a run, so the budget has to keep falling
  // after the midgame instead of flattening at a fixed floor.
  return BUDGET_MULTIPLIERS[Math.min(roundNumber, FINAL_ROUND) - 1] ?? 0.2;
}

export function budgetPressureLabel(multiplier: number): string {
  if (multiplier >= 0.95) return "Manageable";
  if (multiplier >= 0.85) return "Tight";
  if (multiplier >= 0.75) return "Grim";
  if (multiplier >= 0.65) return "Hostile";
  return "Checkout Goblin Mode";
}

/**
 * Pick the next NPC roughly in descending bot win rate: easy customers
 * early in a run, hard cases later. Seeded noise keeps the order from
 * being identical every run.
 */
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
    const score = npc.botWinRate + (rng() * 2 - 1) * SELECTION_FUZZ;
    if (score > bestScore) {
      best = npc;
      bestScore = score;
    }
  }
  return best;
}
