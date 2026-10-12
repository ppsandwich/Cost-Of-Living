import type { FoodItem } from "@/types/food";
import type { NPC } from "@/types/npc";
import type { BasketItem } from "@/types/game";
import { FOOD_BY_ID } from "@/data/foodItems";
import { violatesMustNot } from "./applyFoodItem";

export const MEAL_ROLES = ["base", "protein", "produce"] as const;
export type MealRole = (typeof MEAL_ROLES)[number];
export const MEAL_LABELS: Record<MealRole, string> = {
  base: "A lunch base",
  protein: "A protein food",
  produce: "Fruit or vegetables",
};

/** Shopping roles, not nutrition scores or prescribed portion sizes. */
export function mealRoles(food: FoodItem): MealRole[] {
  // Small flavour additions do not replace a main lunch component.
  if (food.tags.includes("seasoning")) return [];
  const id = food.id.replace(/^premium-/, "");
  if (
    [
      "frozen-lasagne",
      "microwave-curry",
      "frozen-pizza",
      "meal-deal-sandwich",
    ].includes(id)
  )
    return ["base", "protein"];
  if (
    food.category === "grain" ||
    [
      "potatoes-2kg",
      "instant-noodles",
      "tinned-spaghetti",
      "pot-noodle",
      "crackers",
      "rice-cakes",
    ].includes(id)
  )
    return ["base"];
  if (
    food.category === "protein" ||
    [
      "dried-lentils",
      "peanut-butter",
      "salted-peanuts",
      "cheese-block",
      "yoghurt-tub",
    ].includes(id)
  )
    return ["protein"];
  if (food.category === "fruit" || food.category === "vegetable")
    return ["produce"];
  return [];
}

export function usableFood(food: FoodItem, npc: NPC): boolean {
  return !violatesMustNot(food, npc);
}

export function mealCoverage(
  basket: BasketItem[],
  npc: NPC,
): Record<MealRole, boolean> {
  const covered = new Set(
    basket.flatMap((entry) => {
      const food = FOOD_BY_ID[entry.foodItemId];
      return entry.quantity > 0 && food && usableFood(food, npc)
        ? mealRoles(food)
        : [];
    }),
  );
  return {
    base: covered.has("base"),
    protein: covered.has("protein"),
    produce: covered.has("produce"),
  };
}
