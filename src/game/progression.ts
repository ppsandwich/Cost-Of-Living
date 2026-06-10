import type { NPC } from "@/types/npc";
import { NPCS } from "@/data/npcs";
import { createRng, pick } from "./seededRandom";

export const ROUND_TIMER_SECONDS = 90;

export function budgetMultiplierForRound(roundNumber: number): number {
  return Math.max(0.6, 1 - (roundNumber - 1) * 0.05);
}

export function budgetPressureLabel(multiplier: number): string {
  if (multiplier >= 0.95) return "Manageable";
  if (multiplier >= 0.85) return "Tight";
  if (multiplier >= 0.75) return "Grim";
  if (multiplier >= 0.65) return "Hostile";
  return "Checkout Goblin Mode";
}

export function selectNPC(previousNPCIds: string[], seed: number): NPC {
  const rng = createRng(seed);
  let pool = NPCS.filter((n) => !previousNPCIds.includes(n.id));
  if (pool.length === 0) {
    // Pool exhausted: allow repeats, but avoid the NPC just played
    const lastId = previousNPCIds[previousNPCIds.length - 1];
    pool = NPCS.filter((n) => n.id !== lastId);
  }
  return pick(rng, pool);
}
