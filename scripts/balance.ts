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
import { allRequirementsMet, getRequirementsStatus, VARIETY_CATEGORY_MIN } from "../src/game/requirements";
import { fatalStat } from "../src/game/thresholds";
import { PREFERENCE_TAG } from "../src/game/applyFoodItem";
import type { BasketItem } from "../src/types/game";
import type { NPC } from "../src/types/npc";

const MULTIPLIERS = [1.0, 0.95, 0.9, 0.85, 0.8, 0.75, 0.7, 0.65, 0.6];
const SEEDS_PER_CELL = 40;

function simulate(npc: NPC, multiplier: number, seed: number): boolean {
  const budget = Math.round(npc.baseBudgetCents * multiplier);
  const inventory = generateInventory(npc, budget, seed);
  let basket: BasketItem[] = [];
  let remaining = budget;

  for (let step = 0; step < 30; step++) {
    let stats = calculateBasketStats(basket, npc);
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

    let best: { id: string; price: number; value: number } | null = null;
    for (const item of inventory) {
      if (quantityRemaining(item, basket) <= 0) continue;
      if (item.currentPriceCents > remaining) continue;
      const food = FOOD_BY_ID[item.foodItemId];
      const impact = computeImpact(food, npc, prior);
      if (impact.mustNotViolation) continue; // a sane shopper reads the list

      // Would this purchase get dangerously close to a threshold?
      const trialBasket = addToBasket(basket, item.foodItemId, item.currentPriceCents);
      const trialStats = calculateBasketStats(trialBasket, npc);
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
        best = { id: item.foodItemId, price: item.currentPriceCents, value };
      }
    }

    if (!best) return false;
    basket = addToBasket(basket, best.id, best.price);
    remaining -= best.price;
    stats = calculateBasketStats(basket, npc);
    if (fatalStat(stats, npc.maxThresholds)) return false;
  }
  return allRequirementsMet(calculateBasketStats(basket, npc), basket, npc);
}

function addToBasket(basket: BasketItem[], foodItemId: string, price: number): BasketItem[] {
  const existing = basket.find((b) => b.foodItemId === foodItemId);
  return existing
    ? basket.map((b) => (b.foodItemId === foodItemId ? { ...b, quantity: b.quantity + 1 } : b))
    : [...basket, { foodItemId, quantity: 1, pricePaidCents: price }];
}

let failures = 0;
console.log("Win rate by NPC and budget multiplier (greedy bot, 40 seeds each):\n");
console.log(
  "NPC".padEnd(10) + MULTIPLIERS.map((m) => m.toFixed(2).padStart(7)).join("")
);
for (const npc of NPCS) {
  let row = npc.id.padEnd(10);
  for (const multiplier of MULTIPLIERS) {
    let wins = 0;
    for (let s = 0; s < SEEDS_PER_CELL; s++) {
      if (simulate(npc, multiplier, 1000 + s * 7919)) wins++;
    }
    const rate = wins / SEEDS_PER_CELL;
    // PRD §29: round 1 must be winnable; high multipliers should be
    // comfortable; low multipliers may be very difficult but not impossible.
    if (multiplier >= 0.9 && rate < 0.9) failures++;
    else if (multiplier >= 0.75 && rate < 0.5) failures++;
    else if (rate <= 0.1) failures++;
    row += `${Math.round(rate * 100)}%`.padStart(7);
  }
  console.log(row);
}

console.log(
  failures === 0
    ? "\n✅ Balance check passed: every NPC is winnable at every multiplier."
    : `\n⚠️  Balance concerns: ${failures} cell(s) below acceptable win rate.`
);
process.exit(failures === 0 ? 0 : 1);
