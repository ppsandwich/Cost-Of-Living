export type FoodPreference =
  | "likes_sweet_food"
  | "likes_salty_food"
  | "likes_fresh_food"
  | "likes_comfort_food"
  | "likes_spicy_food"
  | "likes_crunchy_food"
  | "likes_familiar_food"
  | "likes_variety";

/** The hard dietary line each NPC has — one per NPC, never to be crossed. */
export type DietaryMustNot =
  | "vegetarian"
  | "vegan"
  | "no_pork"
  | "nut_allergy"
  | "dairy_allergy"
  | "egg_allergy";

export interface NPC {
  id: string;
  name: string;
  emoji: string;
  ageLabel: string;
  description: string;
  mood: string;
  baseBudgetCents: number;
  /** Exactly two wants — both must be satisfied to clear the round. */
  wants: [FoodPreference, FoodPreference];
  /** One hard dietary rule — violating it blocks the round until fixed. */
  mustNot: DietaryMustNot;
}
