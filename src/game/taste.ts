import type { BasketItem } from "@/types/game";
import type { NPC } from "@/types/npc";
import type { RecipeMatch } from "@/types/recipe";
import { FOOD_BY_ID } from "@/data/foodItems";
import { TASTE_CLASHES } from "@/data/tasteClashes";
import { findRecipe } from "./recipes";
import { usableFood } from "./meals";

export const TASTY_MEAL_BONUS = 35;
export const DUBIOUS_FOOD_PENALTY = 40;
export interface TasteAssessment {
  quality: "tasty" | "dubious" | "unrated";
  recipe: RecipeMatch | null;
  clash: [string, string] | null;
}

/** Assemble the best recognised 3–4 ingredient dish; other items stay on the side.
 * Unknown combinations are neutral. Only explicit clashes lose points.
 */
export function assessTaste(basket: BasketItem[], npc: NPC): TasteAssessment {
  const recipe = findRecipe(basket, npc, { minIngredients: 3, maxIngredients: 4 });
  if (recipe) return { quality: "tasty", recipe, clash: null };
  const foods = [...new Map(basket.filter((entry) => entry.quantity > 0)
    .map((entry) => FOOD_BY_ID[entry.foodItemId])
    .filter((food) => food && usableFood(food, npc))
    .map((food) => [food.id.replace(/^premium-/, ""), food])).values()];
  if (foods.length >= 3) for (const rule of TASTE_CLASHES) {
    const sweet = foods.find((food) => (rule.sweet as readonly string[]).includes(food.id.replace(/^premium-/, "")));
    const savoury = foods.find((food) => (rule.savoury as readonly string[]).includes(food.id.replace(/^premium-/, "")));
    if (sweet && savoury) return { quality: "dubious", recipe: null, clash: [sweet.id, savoury.id] };
  }
  return { quality: "unrated", recipe: null, clash: null };
}

export function tastePoints(taste?: TasteAssessment | null): number {
  return taste?.quality === "tasty" ? TASTY_MEAL_BONUS : taste?.quality === "dubious" ? -DUBIOUS_FOOD_PENALTY : 0;
}

export function tasteExplanation(taste: TasteAssessment): string {
  if (taste.recipe) return `${taste.recipe.name}: ${taste.recipe.used.map((entry) => FOOD_BY_ID[entry.foodItemId].name).join(" + ")}. Extra items stay on the side.`;
  if (taste.clash) return `${taste.clash.map((id) => FOOD_BY_ID[id].name).join(" + ")} clash in one dish. Swap one, or build a matching 3–4 ingredient dish and keep extras on the side.`;
  return "Try 3–4 foods that go together, like pasta, tomato and tuna. No taste points gained or lost yet.";
}
