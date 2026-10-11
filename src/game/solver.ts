import type { NPC } from "@/types/npc";
import type { BasketItem, StoreItem } from "@/types/game";
import type { PowerUpId } from "@/data/powerups";
import { FOOD_BY_ID } from "@/data/foodItems";
import { generateInventory } from "./generateInventory";
import { allRequirementsMet, getRequirementsStatus } from "./requirements";
import { mealCoverage, usableFood } from "./meals";

export const basketCost = (basket: BasketItem[]) =>
  basket.reduce((n, b) => n + b.quantity * b.pricePaidCents, 0);
function progress(basket: BasketItem[], npc: NPC): number {
  const roles = Object.values(mealCoverage(basket, npc)).filter(Boolean).length;
  const wants = getRequirementsStatus(basket, npc).wants.filter(
    (w) => w.satisfied,
  ).length;
  const variety = npc.wants.includes("likes_variety")
    ? Math.min(
        3,
        new Set(basket.map((b) => FOOD_BY_ID[b.foodItemId].category)).size,
      )
    : 0;
  return roles * 4 + wants * 4 + variety;
}
/** Returns an actual legal basket as a witness; makes no claim to global optimality. */
export function findClearingBasket(
  npc: NPC,
  inventory: StoreItem[],
  budgetCents: number,
): BasketItem[] | null {
  const solutions: BasketItem[][] = [];
  for (const priceWeight of [1, 0, 0.5, 2]) {
    let basket: BasketItem[] = [];
    for (let step = 0; step < inventory.length; step++) {
      if (allRequirementsMet(basket, npc)) {
        solutions.push(basket);
        break;
      }
      const before = progress(basket, npc);
      let best: { basket: BasketItem[]; value: number } | null = null;
      for (const item of inventory) {
        if (
          item.quantityAvailable < 1 ||
          basket.some((b) => b.foodItemId === item.foodItemId)
        )
          continue;
        if (!usableFood(FOOD_BY_ID[item.foodItemId], npc)) continue;
        const trial = [
          ...basket,
          {
            foodItemId: item.foodItemId,
            quantity: 1,
            pricePaidCents: item.currentPriceCents,
          },
        ];
        const gain = progress(trial, npc) - before;
        if (gain <= 0 || basketCost(trial) > budgetCents) continue;
        const value = gain / Math.pow(item.currentPriceCents, priceWeight);
        if (!best || value > best.value) best = { basket: trial, value };
      }
      if (!best) break;
      basket = best.basket;
    }
    if (allRequirementsMet(basket, npc)) solutions.push(basket);
  }
  return solutions.sort((a, b) => basketCost(a) - basketCost(b))[0] ?? null;
}
export function canClear(
  npc: NPC,
  inventory: StoreItem[],
  budgetCents: number,
): boolean {
  return findClearingBasket(npc, inventory, budgetCents) !== null;
}
export interface SolvableRound {
  inventory: StoreItem[];
  budgetCents: number;
  rescueCents: number;
}
export function generateSolvableRound(
  npc: NPC,
  budgetCents: number,
  seed: number,
  roundNumber: number,
  powerUps: PowerUpId[],
): SolvableRound {
  for (let attempt = 0; attempt < 24; attempt++) {
    const inventory = generateInventory(
      npc,
      budgetCents,
      (seed + attempt * 7919) >>> 0,
      roundNumber,
      powerUps,
    );
    const witness = findClearingBasket(npc, inventory, Number.MAX_SAFE_INTEGER);
    if (!witness) continue;
    const required = basketCost(witness);
    if (required > budgetCents && attempt < 3) continue;
    const budget = Math.max(budgetCents, required);
    return {
      inventory,
      budgetCents: budget,
      rescueCents: budget - budgetCents,
    };
  }
  throw new Error(`Could not generate a usable lunch brief for ${npc.id}`);
}
