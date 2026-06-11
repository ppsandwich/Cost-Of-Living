/**
 * Dev-only balance check (PRD §29.1).
 *
 * Simulates a greedy shopper for every NPC at budget multipliers from
 * 1.00 down to 0.60 across many seeds, and reports the win rate. If the
 * greedy bot can win, a human has at least one viable path.
 *
 * Run: npx tsx scripts/balance.ts
 */
import { FOOD_BY_ID } from "../src/data/foodItems";
import { NPCS } from "../src/data/npcs";
import { computeImpact } from "../src/game/applyFoodItem";
import { basketFoods, calculateBasketStats } from "../src/game/calculateStats";
import { generateInventory } from "../src/game/generateInventory";
import { quantityRemaining } from "../src/game/roundEnd";
import { budgetMultiplierForRound } from "../src/game/progression";
import type { PowerUpId } from "../src/data/powerups";
import {
  adjustThresholds,
  drawPowerUps,
  hasPowerUp,
  powerUpExtraBudgetCents,
} from "../src/game/powerups";
import { createRng } from "../src/game/seededRandom";
import { allRequirementsMet, getRequirementsStatus, VARIETY_CATEGORY_MIN } from "../src/game/requirements";
import { fatalStat } from "../src/game/thresholds";
import { PREFERENCE_TAG } from "../src/game/applyFoodItem";
import type { BasketItem } from "../src/types/game";
import type { NPC } from "../src/types/npc";

const ROUNDS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const SEEDS_PER_CELL = 40;

function simulate(baseNpc: NPC, roundNumber: number, seed: number): boolean {
  // By round N the player has chosen N-1 random power-ups, and the
  // budget multiplier, shrinkflation and inflation match that round
  const multiplier = budgetMultiplierForRound(roundNumber);
  const powerUps: PowerUpId[] = drawPowerUps(
    createRng((seed ^ 0x51ed) >>> 0),
    [],
    roundNumber - 1
  );
  // Mirror setupRound's power-up adjustments
  const npc: NPC = {
    ...baseNpc,
    maxThresholds: adjustThresholds(baseNpc.maxThresholds, powerUps),
    mustNot: hasPowerUp(powerUps, "exposure_therapy") ? "none" : baseNpc.mustNot,
  };
  const budget =
    Math.round(npc.baseBudgetCents * multiplier) + powerUpExtraBudgetCents(powerUps);
  const inventory = generateInventory(npc, budget, seed, roundNumber, powerUps);
  let basket: BasketItem[] = [];
  let remaining = budget;

  for (let step = 0; step < 30; step++) {
    let stats = calculateBasketStats(basket, npc, powerUps);
    if (allRequirementsMet(stats, basket, npc)) return true;

    const needN = Math.max(0, npc.nutritionTarget - stats.nutrition);
    const needH = Math.max(0, npc.happinessTarget - stats.happiness);
    const prior = basketFoods(basket);
    const reqs = getRequirementsStatus(basket, npc);
    const unmetTags = reqs.wants
      .filter((w) => !w.satisfied)
      .map((w) => PREFERENCE_TAG[w.want])
      .filter((t) => t !== undefined);
    const wantsVariety =
      reqs.wants.some((w) => w.want === "likes_variety" && !w.satisfied) &&
      new Set(prior.map((f) => f.category)).size < VARIETY_CATEGORY_MIN;

    let best: { id: string; price: number; value: number; shrinkflated?: boolean } | null = null;
    for (const item of inventory) {
      if (quantityRemaining(item, basket) <= 0) continue;
      if (item.currentPriceCents > remaining) continue;
      // no sane shopper drops over half the round's budget on one item
      if (item.currentPriceCents > budget * 0.55) continue;
      const food = FOOD_BY_ID[item.foodItemId];
      const impact = computeImpact(food, npc, prior, item.shrinkflated, powerUps);
      if (impact.mustNotViolation) continue; // a sane shopper reads the list

      // Would this purchase get dangerously close to a threshold?
      const trialBasket = addToBasket(basket, item.foodItemId, item.currentPriceCents, item.shrinkflated);
      const trialStats = calculateBasketStats(trialBasket, npc, powerUps);
      if (fatalStat(trialStats, npc.maxThresholds)) continue;

      const wantBonus = unmetTags.some((t) => food.tags.includes(t)) ? 30 : 0;
      const varietyBonus =
        wantsVariety && !prior.some((f) => f.category === food.category) ? 15 : 0;
      const value =
        Math.min(Math.max(0, impact.nutritionGain), needN) +
        Math.min(Math.max(0, impact.happinessGain), needH) +
        wantBonus +
        varietyBonus;
      if (value <= 0) continue;
      if (!best || value > best.value || (value === best.value && item.currentPriceCents < best.price)) {
        best = { id: item.foodItemId, price: item.currentPriceCents, value, shrinkflated: item.shrinkflated };
      }
    }

    if (!best) return false;
    basket = addToBasket(basket, best.id, best.price, best.shrinkflated);
    remaining -= best.price;
    stats = calculateBasketStats(basket, npc, powerUps);
    if (fatalStat(stats, npc.maxThresholds)) return false;
  }
  return allRequirementsMet(calculateBasketStats(basket, npc, powerUps), basket, npc);
}

function addToBasket(
  basket: BasketItem[],
  foodItemId: string,
  price: number,
  shrinkflated?: boolean
): BasketItem[] {
  const existing = basket.find((b) => b.foodItemId === foodItemId);
  return existing
    ? basket.map((b) => (b.foodItemId === foodItemId ? { ...b, quantity: b.quantity + 1 } : b))
    : [...basket, { foodItemId, quantity: 1, pricePaidCents: price, shrinkflated }];
}

let failures = 0;
console.log("Win rate by NPC and round, power-ups accumulating (greedy bot, 40 seeds each):\n");
console.log(
  "NPC".padEnd(10) +
    ROUNDS.map((r) => `r${r}@${budgetMultiplierForRound(r).toFixed(2)}`.padStart(8)).join("")
);
for (const npc of NPCS) {
  let row = npc.id.padEnd(10);
  let sum = 0;
  for (const roundNumber of ROUNDS) {
    const multiplier = budgetMultiplierForRound(roundNumber);
    let wins = 0;
    for (let s = 0; s < SEEDS_PER_CELL; s++) {
      if (simulate(npc, roundNumber, 1000 + s * 7919)) wins++;
    }
    const rate = wins / SEEDS_PER_CELL;
    sum += rate;
    // PRD §29: early rounds must be winnable; later rounds may be very
    // difficult but not impossible.
    if (roundNumber <= 3 && rate < 0.9) failures++;
    else if (multiplier >= 0.75 && rate < 0.5) failures++;
    else if (rate <= 0.1) failures++;
    row += `${Math.round(rate * 100)}%`.padStart(8);
  }
  const avg = Math.round((sum / ROUNDS.length) * 100);
  row += `  avg ${avg}% ${avg === npc.botWinRate ? "" : `(data says ${npc.botWinRate})`}`;
  console.log(row);
}

console.log(
  failures === 0
    ? "\n✅ Balance check passed: every NPC is winnable at every multiplier."
    : `\n⚠️  Balance concerns: ${failures} cell(s) below acceptable win rate.`
);
process.exit(failures === 0 ? 0 : 1);
