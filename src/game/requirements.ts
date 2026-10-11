import type { FoodPreference, NPC } from "@/types/npc";
import type { BasketItem } from "@/types/game";
import {
  PREFERENCE_TAG,
  violatesMustNot,
  hasEquipmentMismatch,
} from "./applyFoodItem";
import { basketFoods } from "./calculateStats";
import { mealCoverage, usableFood } from "./meals";

export const VARIETY_CATEGORY_MIN = 3;
export interface RequirementsStatus {
  wants: { want: FoodPreference; satisfied: boolean }[];
  mustNotViolated: boolean;
  equipmentMet: boolean;
  allMet: boolean;
}
export function getRequirementsStatus(
  basket: BasketItem[],
  npc: NPC,
): RequirementsStatus {
  const foods = basketFoods(basket);
  const usable = foods.filter((f) => usableFood(f, npc));
  const wants = npc.wants.map((want) => {
    const tag = PREFERENCE_TAG[want];
    return {
      want,
      satisfied:
        want === "likes_variety"
          ? new Set(usable.map((f) => f.category)).size >= VARIETY_CATEGORY_MIN
          : tag !== undefined && usable.some((f) => f.tags.includes(tag)),
    };
  });
  const mustNotViolated = foods.some((f) => violatesMustNot(f, npc));
  const equipmentMet = foods.every((f) => !hasEquipmentMismatch(f, npc));
  return {
    wants,
    mustNotViolated,
    equipmentMet,
    allMet: wants.every((w) => w.satisfied) && !mustNotViolated && equipmentMet,
  };
}
export function allRequirementsMet(basket: BasketItem[], npc: NPC): boolean {
  return (
    Object.values(mealCoverage(basket, npc)).every(Boolean) &&
    getRequirementsStatus(basket, npc).allMet
  );
}
