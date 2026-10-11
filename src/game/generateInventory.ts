import type { FoodItem } from "@/types/food";
import type { NPC } from "@/types/npc";
import type { StoreItem } from "@/types/game";
import type { PowerUpId } from "@/data/powerups";
import { FOOD_ITEMS } from "@/data/foodItems";
import { PREFERENCE_TAG } from "./applyFoodItem";
import { MEAL_ROLES, mealRoles, usableFood } from "./meals";
import {
  powerUpExtraSpecials,
  powerUpInventoryMultiplier,
  powerUpPriceMultiplier,
  powerUpQuantityBonus,
} from "./powerups";
import { createRng, randomBetween, shuffle } from "./seededRandom";
export const INVENTORY_SIZE = 16;
const roundPrice = (cents: number) => Math.max(50, Math.round(cents / 5) * 5);

export function generateInventory(
  npc: NPC,
  roundBudgetCents: number,
  seed: number,
  roundNumber = 1,
  powerUps: PowerUpId[] = [],
): StoreItem[] {
  const rng = createRng(seed);
  const chosen = new Map<string, FoodItem>();
  const pool = FOOD_ITEMS;
  const usable = pool.filter((f) => usableFood(f, npc) && !f.variant);
  const pick = (predicate: (food: FoodItem) => boolean) => {
    const food = shuffle(rng, usable).find(
      (f) => !chosen.has(f.id) && predicate(f),
    );
    if (food) chosen.set(food.id, food);
  };
  for (const role of MEAL_ROLES) pick((f) => mealRoles(f).includes(role));
  for (const want of npc.wants) {
    const tag = PREFERENCE_TAG[want];
    if (tag && ![...chosen.values()].some((f) => f.tags.includes(tag)))
      pick((f) => f.tags.includes(tag));
  }
  // Guarantee three distinct categories, including for characters who want variety.
  for (let i = 0; i < 3; i++) {
    const categories = new Set([...chosen.values()].map((f) => f.category));
    if (categories.size < 3) pick((f) => !categories.has(f.category));
  }
  for (let i = 0; i < 3; i++) pick((f) => f.basePriceCents <= 250);
  const size = Math.round(
    INVENTORY_SIZE * powerUpInventoryMultiplier(powerUps),
  );
  for (const food of shuffle(rng, pool)) {
    if (chosen.size >= size) break;
    chosen.set(food.id, food);
  }
  const multiplier =
    powerUpPriceMultiplier(powerUps) * (1 + 0.02 * (roundNumber - 1));
  const items = shuffle(rng, [...chosen.values()]).map(
    (food) =>
      ({
        foodItemId: food.id,
        currentPriceCents: roundPrice(
          food.basePriceCents * randomBetween(rng, 0.85, 1.25) * multiplier,
        ),
        quantityAvailable:
          (food.maxQuantity ?? 1) + powerUpQuantityBonus(powerUps),
      }) as StoreItem,
  );
  const specials = shuffle(
    rng,
    items.filter((i) =>
      usableFood(FOOD_ITEMS.find((f) => f.id === i.foodItemId)!, npc),
    ),
  ).slice(0, 2 + powerUpExtraSpecials(powerUps));
  for (const item of specials) {
    item.currentPriceCents = roundPrice(item.currentPriceCents * 0.7);
    item.specialLabel = "Manager’s special";
  }
  for (const item of items)
    if (!item.specialLabel && item.currentPriceCents > roundBudgetCents)
      item.specialLabel = "Over the whole budget";
  return items;
}
