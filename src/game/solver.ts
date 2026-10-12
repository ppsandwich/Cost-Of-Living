import type { NPC } from "@/types/npc";
import type { BasketItem, StoreItem } from "@/types/game";
import type { PowerUpId } from "@/data/powerups";
import { FOOD_BY_ID } from "@/data/foodItems";
import { generateInventory } from "./generateInventory";
import { PREFERENCE_TAG } from "./applyFoodItem";
import { MEAL_ROLES, mealRoles, usableFood } from "./meals";

export const basketCost = (basket: BasketItem[]) =>
  basket.reduce((n, b) => n + b.quantity * b.pricePaidCents, 0);

interface Path { cost: number; basket: BasketItem[] }
const cache = new WeakMap<StoreItem[], Map<string, Path | null>>();

/** Exact 0/1 dynamic programming: meal parts, wishes and distinct aisles are the state. */
export function findClearingBasket(npc: NPC, inventory: StoreItem[], budgetCents: number): BasketItem[] | null {
  const key = `${npc.mustNot}:${npc.wants.join(",")}`;
  let results = cache.get(inventory);
  if (!results) { results = new Map(); cache.set(inventory, results); }
  if (!results.has(key)) results.set(key, cheapestBasket(npc, inventory));
  const result = results.get(key);
  return result && result.cost <= budgetCents ? result.basket.map((entry) => ({ ...entry })) : null;
}

function cheapestBasket(npc: NPC, inventory: StoreItem[]): Path | null {
  const wishes = npc.wants.filter((wish) => wish !== "likes_variety");
  const needVariety = npc.wants.includes("likes_variety");
  const goal = (1 << (3 + wishes.length)) - 1;
  const categories = [...new Set(inventory.map((item) => FOOD_BY_ID[item.foodItemId].category))];
  const varietyDone = 1 << categories.length;
  const categoryStride = varietyDone * 2;
  const paths = new Map<number, Path>([[0, { cost: 0, basket: [] }]]);
  const distinct = (n: number) => { let count = 0; while (n) { n &= n - 1; count++; } return count; };
  for (const item of inventory) {
    const food = FOOD_BY_ID[item.foodItemId];
    if (item.quantityAvailable < 1 || !usableFood(food, npc)) continue;
    let bits = 0;
    for (const role of mealRoles(food)) bits |= 1 << MEAL_ROLES.indexOf(role);
    wishes.forEach((wish, i) => { const tag = PREFERENCE_TAG[wish]; if (tag && food.tags.includes(tag)) bits |= 1 << (3 + i); });
    const category = needVariety ? 1 << categories.indexOf(food.category) : 0;
    // Snapshot ensures an item cannot be selected twice in the same pass.
    for (const [mask, path] of [...paths]) {
      let cats = (mask % categoryStride) | category;
      if (needVariety && ((cats & varietyDone) || distinct(cats) >= 3)) cats = varietyDone;
      const next = ((Math.floor(mask / categoryStride) | bits) * categoryStride) + cats;
      const cost = path.cost + item.currentPriceCents;
      if (next === mask || (paths.get(next)?.cost ?? Infinity) <= cost) continue;
      paths.set(next, { cost, basket: [...path.basket, { foodItemId: item.foodItemId, quantity: 1, pricePaidCents: item.currentPriceCents }] });
    }
  }
  return paths.get(goal * categoryStride + (needVariety ? varietyDone : 0)) ?? null;
}

export function canClear(npc: NPC, inventory: StoreItem[], budgetCents: number): boolean {
  return findClearingBasket(npc, inventory, budgetCents) !== null;
}
export interface SolvableRound {
  inventory: StoreItem[];
  budgetCents: number;
  rescueCents: number;
  solution: BasketItem[];
  referenceCostCents: number;
}
export function generateSolvableRound(npc: NPC, budgetCents: number, seed: number, roundNumber: number, powerUps: PowerUpId[]): SolvableRound {
  for (let attempt = 0; attempt < 24; attempt++) {
    const inventory = generateInventory(npc, budgetCents, (seed + attempt * 7919) >>> 0, roundNumber, powerUps);
    const solution = findClearingBasket(npc, inventory, Number.MAX_SAFE_INTEGER);
    if (!solution) continue;
    const required = basketCost(solution);
    if (required > budgetCents && attempt < 3) continue;
    const reference = inventory.map((item) => ({ ...item, currentPriceCents: item.referencePriceCents ?? item.currentPriceCents }));
    const referenceCostCents = basketCost(findClearingBasket(npc, reference, Number.MAX_SAFE_INTEGER)!);
    return { inventory, budgetCents: Math.max(budgetCents, required), rescueCents: Math.max(0, required - budgetCents), solution, referenceCostCents };
  }
  throw new Error(`Could not generate a usable lunch brief for ${npc.id}`);
}
