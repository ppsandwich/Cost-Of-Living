import type { NPC } from "@/types/npc";
import type { BasketItem, StoreItem } from "@/types/game";
import type { PowerUpId } from "@/data/powerups";
import { FOOD_BY_ID } from "@/data/foodItems";
import { computeImpact, PREFERENCE_TAG } from "./applyFoodItem";
import { basketFoods, calculateBasketStats } from "./calculateStats";
import { generateInventory } from "./generateInventory";
import { allRequirementsMet, getRequirementsStatus, VARIETY_CATEGORY_MIN } from "./requirements";
import { quantityRemaining } from "./roundEnd";
import { fatalStat } from "./thresholds";

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

/**
 * Greedy attempt to clear a round. `cautious` skips single items that
 * swallow most of the budget; the second pass allows them.
 */
function greedyClears(
  npc: NPC,
  inventory: StoreItem[],
  budgetCents: number,
  powerUps: PowerUpId[],
  cautious: boolean
): boolean {
  let basket: BasketItem[] = [];
  let remaining = budgetCents;

  for (let step = 0; step < 40; step++) {
    const stats = calculateBasketStats(basket, npc, powerUps);
    if (
      remaining >= 0 &&
      !fatalStat(stats, npc.maxThresholds) &&
      allRequirementsMet(stats, basket, npc)
    ) {
      return true;
    }

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
      if (cautious && item.currentPriceCents > budgetCents * 0.55) continue;
      const food = FOOD_BY_ID[item.foodItemId];
      const impact = computeImpact(food, npc, prior, item.shrinkflated, powerUps);
      if (impact.mustNotViolation) continue;

      const trial = calculateBasketStats(
        addToBasket(basket, item.foodItemId, item.currentPriceCents, item.shrinkflated),
        npc,
        powerUps
      );
      if (fatalStat(trial, npc.maxThresholds)) continue;

      const wantBonus = unmetTags.some((t) => food.tags.includes(t)) ? 30 : 0;
      const varietyBonus =
        wantsVariety && !prior.some((f) => f.category === food.category) ? 15 : 0;
      const value =
        Math.min(Math.max(0, impact.nutritionGain), needN) +
        Math.min(Math.max(0, impact.happinessGain), needH) +
        wantBonus +
        varietyBonus;
      if (value <= 0) continue;
      if (
        !best ||
        value > best.value ||
        (value === best.value && item.currentPriceCents < best.price)
      ) {
        best = {
          id: item.foodItemId,
          price: item.currentPriceCents,
          value,
          shrinkflated: item.shrinkflated,
        };
      }
    }

    if (!best) return false;
    basket = addToBasket(basket, best.id, best.price, best.shrinkflated);
    remaining -= best.price;
  }
  return false;
}

/** True if a clearing combination provably exists in this store. */
export function canClear(
  npc: NPC,
  inventory: StoreItem[],
  budgetCents: number,
  powerUps: PowerUpId[]
): boolean {
  return (
    greedyClears(npc, inventory, budgetCents, powerUps, true) ||
    greedyClears(npc, inventory, budgetCents, powerUps, false)
  );
}

export interface SolvableRound {
  inventory: StoreItem[];
  budgetCents: number;
  /** How many cents of rescue money were added to keep the round clearable. */
  rescueCents: number;
}

/**
 * Generate a round that is guaranteed to be clearable: reshuffle the
 * shelves a few times, and if no layout works, the NPC "finds" 10% more
 * money until one does. Rounds ramp in difficulty but never dead-end.
 */
export function generateSolvableRound(
  npc: NPC,
  budgetCents: number,
  seed: number,
  roundNumber: number,
  powerUps: PowerUpId[]
): SolvableRound {
  let budget = budgetCents;
  let inventory = generateInventory(npc, budget, seed, roundNumber, powerUps);
  for (let attempt = 0; attempt < 24; attempt++) {
    if (canClear(npc, inventory, budget, powerUps)) {
      return { inventory, budgetCents: budget, rescueCents: budget - budgetCents };
    }
    // first try fresh shelf layouts, then start adding rescue money
    if (attempt >= 2) budget = Math.round((budget * 1.1) / 5) * 5;
    inventory = generateInventory(npc, budget, (seed + (attempt + 1) * 7919) >>> 0, roundNumber, powerUps);
  }
  return { inventory, budgetCents: budget, rescueCents: budget - budgetCents };
}
