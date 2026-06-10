import type { FoodPreference, NPC, NutritionStats } from "@/types/npc";
import type { BasketItem } from "@/types/game";
import { PREFERENCE_TAG, violatesMustNot } from "./applyFoodItem";
import { basketFoods } from "./calculateStats";
import { goalsMet } from "./roundEnd";

/** Distinct store categories needed to satisfy "likes_variety". */
export const VARIETY_CATEGORY_MIN = 3;

export interface RequirementsStatus {
  wants: { want: FoodPreference; satisfied: boolean }[];
  mustNotViolated: boolean;
  /** Both wants satisfied and the dietary line unbroken. */
  allMet: boolean;
}

export function getRequirementsStatus(basket: BasketItem[], npc: NPC): RequirementsStatus {
  const foods = basketFoods(basket);

  const wants = npc.wants.map((want) => {
    if (want === "likes_variety") {
      const categories = new Set(foods.map((f) => f.category));
      return { want, satisfied: categories.size >= VARIETY_CATEGORY_MIN };
    }
    const tag = PREFERENCE_TAG[want];
    return { want, satisfied: tag !== undefined && foods.some((f) => f.tags.includes(tag)) };
  });

  const mustNotViolated = foods.some((f) => violatesMustNot(f, npc));

  return {
    wants,
    mustNotViolated,
    allMet: wants.every((w) => w.satisfied) && !mustNotViolated,
  };
}

/** Full round-clear condition: meters at target, wants ticked, diet respected. */
export function allRequirementsMet(
  stats: NutritionStats,
  basket: BasketItem[],
  npc: NPC
): boolean {
  return goalsMet(stats, npc) && getRequirementsStatus(basket, npc).allMet;
}
