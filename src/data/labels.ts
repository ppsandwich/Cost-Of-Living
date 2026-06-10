import type { DietaryMustNot, FoodPreference } from "@/types/npc";
import { VARIETY_CATEGORY_MIN } from "@/game/requirements";

/** Checklist wording for each want. */
export const WANT_LABEL: Record<FoodPreference, string> = {
  likes_sweet_food: "Something sweet",
  likes_salty_food: "Something salty",
  likes_fresh_food: "Something fresh",
  likes_comfort_food: "Some comfort food",
  likes_spicy_food: "Something spicy",
  likes_crunchy_food: "Something crunchy",
  likes_familiar_food: "Something familiar",
  likes_variety: `Variety: ${VARIETY_CATEGORY_MIN}+ aisles`,
};

/** Short badge text shown on matching food cards (variety is basket-wide). */
export const WANT_BADGE: Partial<Record<FoodPreference, string>> = {
  likes_sweet_food: "Sweet",
  likes_salty_food: "Salty",
  likes_fresh_food: "Fresh",
  likes_comfort_food: "Comfort",
  likes_spicy_food: "Spicy",
  likes_crunchy_food: "Crunchy",
  likes_familiar_food: "Familiar",
};

export const WANT_EMOJI: Record<FoodPreference, string> = {
  likes_sweet_food: "🍬",
  likes_salty_food: "🧂",
  likes_fresh_food: "🌿",
  likes_comfort_food: "🛋️",
  likes_spicy_food: "🌶️",
  likes_crunchy_food: "🥨",
  likes_familiar_food: "🏠",
  likes_variety: "🌈",
};

/** Checklist wording for the hard dietary line. */
export const MUST_NOT_LABEL: Record<DietaryMustNot, string> = {
  vegetarian: "Vegetarian — no meat",
  vegan: "Vegan — nothing animal",
  no_pork: "No pork",
  nut_allergy: "Nut allergy — no nuts",
  dairy_allergy: "Dairy allergy — no dairy",
  egg_allergy: "Egg allergy — no egg",
};

/** What a violating food card screams. */
export const MUST_NOT_BADGE: Record<DietaryMustNot, string> = {
  vegetarian: "Meat — they're vegetarian",
  vegan: "Animal product — they're vegan",
  no_pork: "Pork — off the list",
  nut_allergy: "Nuts — allergic!",
  dairy_allergy: "Dairy — allergic!",
  egg_allergy: "Egg — allergic!",
};
