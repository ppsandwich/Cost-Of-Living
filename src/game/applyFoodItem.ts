import type { FoodItem, FoodTag } from "@/types/food";
import type { FoodPreference, NPC } from "@/types/npc";

/** Tag a food must carry to count toward each want ("likes_variety" is structural). */
export const PREFERENCE_TAG: Partial<Record<FoodPreference, FoodTag>> = {
  likes_sweet_food: "sweet",
  likes_salty_food: "salty",
  likes_fresh_food: "fresh",
  likes_comfort_food: "comfort",
  likes_spicy_food: "spicy",
  likes_crunchy_food: "crunchy",
  likes_familiar_food: "family_friendly",
};

const MUST_NOT_TAGS: Record<NPC["mustNot"], FoodTag[]> = {
  vegetarian: ["meat", "pork"],
  vegan: ["meat", "pork", "dairy", "egg"],
  no_pork: ["pork"],
  nut_allergy: ["nuts"],
  dairy_allergy: ["dairy"],
  egg_allergy: ["egg"],
};

/** True if this food crosses the NPC's hard dietary line. */
export function violatesMustNot(food: FoodItem, npc: NPC): boolean {
  return MUST_NOT_TAGS[npc.mustNot].some((tag) => food.tags.includes(tag));
}
