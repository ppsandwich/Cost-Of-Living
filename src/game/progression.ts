import type { Difficulty } from "@/types/game";
import type { NPC, FoodPreference } from "@/types/npc";
import { NPCS } from "@/data/npcs";
import { createRng, pick, shuffle } from "./seededRandom";

export const ROUND_TIMER_SECONDS = 90;

/** Clear this round and the run is won. */
export const FINAL_ROUND = 20;

/** Meet everyone before repeating; keep the order stable for a given seed. */
export function selectNPC(previousNPCIds: string[], seed: number): NPC {
  const rng = createRng(seed);
  let pool = NPCS.filter((n) => !previousNPCIds.includes(n.id));
  if (pool.length === 0) {
    // Pool exhausted: allow repeats, but avoid the NPC just played
    const lastId = previousNPCIds[previousNPCIds.length - 1];
    pool = NPCS.filter((n) => n.id !== lastId);
    return pick(rng, pool);
  }
  return pick(rng, pool);
}


export function wishCountForRound(round: number): number {
  return Math.min(4, 1 + Math.floor((Math.max(1, round) - 1) / 5));
}

const WISHES: FoodPreference[] = ["likes_sweet_food", "likes_salty_food", "likes_fresh_food", "likes_comfort_food", "likes_spicy_food", "likes_crunchy_food", "likes_familiar_food", "likes_variety"];

/** Preserve each person's favourite wishes, adding stable, distinct wishes later. */
export function npcForRound(npc: NPC, round: number): NPC {
  const seed = [...npc.id].reduce((n, c) => n * 31 + c.charCodeAt(0), 0) >>> 0;
  const wishes = [...npc.wants, ...shuffle(createRng(seed), WISHES.filter((wish) => !npc.wants.includes(wish)))];
  return { ...npc, wants: wishes.slice(0, wishCountForRound(round)) };
}

/** Before power-ups, spendable room above the cheapest valid basket falls every round. */
export function budgetHeadroomForRound(round: number, difficulty: Difficulty = 2): number {
  return ({ 1: 2.5, 2: 2.15, 3: 1.8 }[difficulty]) - (Math.min(FINAL_ROUND, Math.max(1, round)) - 1) * 0.04;
}
