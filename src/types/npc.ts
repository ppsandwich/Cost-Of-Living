export interface NutritionStats {
  calories: number;
  protein: number;
  fat: number;
  sugar: number;
  carbs: number;
  fibre: number;
  vitamins: number;
  minerals: number;
  sodium: number;
  nutrition: number;
  happiness: number;
}

export interface DangerThresholds {
  caloriesMax: number;
  fatMax: number;
  sugarMax: number;
  carbsMax: number;
  sodiumMax: number;
}

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

/** Soft modifiers: shape how food lands, but aren't win requirements. */
export type FoodRestriction =
  | "low_sugar"
  | "low_fat"
  | "low_sodium"
  | "high_protein_need"
  | "high_fibre_need"
  | "limited_cooking_equipment"
  | "no_fridge"
  | "no_microwave";

export interface NPCSensitivity {
  happinessFromTreatsMultiplier: number;
  nutritionFromVegetablesMultiplier: number;
  sugarPenaltyMultiplier: number;
  fatPenaltyMultiplier: number;
  carbPenaltyMultiplier: number;
  vitaminNeedMultiplier: number;
  mineralNeedMultiplier: number;
}

export interface NPC {
  id: string;
  name: string;
  emoji: string;
  ageLabel: string;
  description: string;
  mood: string;
  baseBudgetCents: number;
  nutritionTarget: number;
  happinessTarget: number;
  maxThresholds: DangerThresholds;
  /** Exactly two wants — both must be satisfied to clear the round. */
  wants: [FoodPreference, FoodPreference];
  /** One hard dietary rule — violating it blocks the round until fixed. */
  mustNot: DietaryMustNot;
  restrictions: FoodRestriction[];
  sensitivity: NPCSensitivity;
}
