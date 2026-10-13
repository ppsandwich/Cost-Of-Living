import type { FoodItem } from "@/types/food";
import type { NPC } from "@/types/npc";
import type { StoreItem } from "@/types/game";
import type { PowerUpId } from "@/data/powerups";
import { FOOD_ITEMS } from "@/data/foodItems";
import { MEAL_RECIPES } from "@/data/recipes";
import { isStaple } from "./recipes";
import { PREFERENCE_TAG } from "./applyFoodItem";
import { MEAL_REQUIRED, MEAL_ROLES, mealRoles, usableFood } from "./meals";
import {
  powerUpExtraSpecials,
  powerUpInventoryMultiplier,
  powerUpPriceMultiplier,
} from "./powerups";
import { createRng, randomBetween, shuffle } from "./seededRandom";
export const INVENTORY_SIZE = 20;
export const MIN_STAPLE_SHARE = 0.4;
const TARGET_STAPLE_SHARE = 0.75;
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
  const size = Math.round(INVENTORY_SIZE * powerUpInventoryMultiplier(powerUps));
  const pool = FOOD_ITEMS;
  const usable = pool.filter((f) => usableFood(f, npc) && !f.variant);
  const pick = (predicate: (food: FoodItem) => boolean) => {
    if (chosen.size >= size) return;
    const candidates = shuffle(rng, usable).filter((f) => !chosen.has(f.id) && predicate(f));
    const food = candidates.find(isStaple) ?? candidates[0];
    if (food) chosen.set(food.id, food);
  };
  // Put the core of a familiar, dietary-safe meal on every shelf.
  const starter = shuffle(rng, MEAL_RECIPES).find((recipe) =>
    recipe.ingredients.every((slot) => usable.some((food) => slot.includes(food.id))));
  if (starter) for (const slot of starter.ingredients) pick((food) => slot.includes(food.id));
  for (const role of MEAL_ROLES) {
    while ([...chosen.values()].filter((food) => mealRoles(food).includes(role)).length < MEAL_REQUIRED[role]) {
      const before = chosen.size;
      pick((food) => mealRoles(food).includes(role));
      if (chosen.size === before) throw new Error(`Not enough suitable foods for ${role}`);
    }
  }
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
  const minimumStaples = Math.ceil(size * TARGET_STAPLE_SHARE);
  while ([...chosen.values()].filter(isStaple).length < minimumStaples) {
    const before = chosen.size;
    pick(isStaple);
    if (chosen.size === before) throw new Error("Not enough suitable staples for this shop");
  }
  for (let i = 0; i < 3; i++) pick((f) => f.basePriceCents <= 250);
  for (const food of shuffle(rng, pool)) {
    if (chosen.size >= size) break;
    chosen.set(food.id, food);
  }
  const items = shuffle(rng, [...chosen.values()]).map((food): StoreItem => {
    const referencePriceCents = roundPrice(food.basePriceCents * randomBetween(rng, 0.85, 1.25) * (1 + 0.02 * (roundNumber - 1)));
    return { foodItemId: food.id, referencePriceCents, currentPriceCents: roundPrice(referencePriceCents * powerUpPriceMultiplier(powerUps)), quantityAvailable: 1 };
  });
  const specials = shuffle(
    rng,
    items.filter((i) =>
      usableFood(FOOD_ITEMS.find((f) => f.id === i.foodItemId)!, npc),
    ),
  ).slice(0, 2 + powerUpExtraSpecials(powerUps));
  for (const [index, item] of specials.entries()) {
    if (index < 2) item.referencePriceCents = roundPrice(item.referencePriceCents! * 0.7);
    item.currentPriceCents = roundPrice(item.currentPriceCents * 0.7);
    item.specialLabel = "On sale";
    item.onSale = true;
  }
  for (const item of items)
    if (!item.specialLabel && item.currentPriceCents > roundBudgetCents)
      item.specialLabel = "Costs more than your budget";
  return items;
}
