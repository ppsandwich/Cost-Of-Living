import type { BasketItem } from "@/types/game";
import type { NPC } from "@/types/npc";
import type { FoodItem } from "@/types/food";
import type { RecipeMatch } from "@/types/recipe";
import { FOOD_BY_ID } from "@/data/foodItems";
import { RECIPES, STAPLE_IDS } from "@/data/recipes";
import { usableFood } from "./meals";

export const RECIPE_BONUS = 50;
const standardId = (id: string) => id.replace(/^premium-/, "");
export const isStaple = (food: FoodItem) => STAPLE_IDS.has(standardId(food.id));

export function findRecipe(basket: BasketItem[], npc: NPC): RecipeMatch | null {
  const eligible = basket.filter((entry) => entry.quantity > 0 && FOOD_BY_ID[entry.foodItemId] && usableFood(FOOD_BY_ID[entry.foodItemId], npc));
  let best: RecipeMatch | null = null;
  let bestRequired = 0;
  for (const recipe of RECIPES) {
    // Backtrack: overlapping alternatives must never reuse the same ingredient.
    const fill = (slot: number, used: BasketItem[]): BasketItem[] | null => {
      if (slot === recipe.ingredients.length) return used;
      for (const entry of eligible) {
        const id = standardId(entry.foodItemId);
        if (!recipe.ingredients[slot].includes(id) || used.some((item) => standardId(item.foodItemId) === id)) continue;
        const match = fill(slot + 1, [...used, { ...entry, quantity: 1 }]);
        if (match) return match;
      }
      return null;
    };
    const used = fill(0, []);
    if (!used || used.length < 2) continue;
    for (const entry of eligible) {
      const id = standardId(entry.foodItemId);
      if (recipe.optional?.includes(id) && !used.some((item) => standardId(item.foodItemId) === id)) used.push({ ...entry, quantity: 1 });
    }
    if (best && (used.length < best.used.length || (used.length === best.used.length && recipe.ingredients.length <= bestRequired))) continue;
    const extras = basket.flatMap((entry) => {
      const quantity = entry.quantity - (used.some((item) => item.foodItemId === entry.foodItemId) ? 1 : 0);
      return quantity > 0 ? [{ ...entry, quantity }] : [];
    });
    best = { recipeId: recipe.id, name: recipe.name, used, extras };
    bestRequired = recipe.ingredients.length;
  }
  return best;
}
