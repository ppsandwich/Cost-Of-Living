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
  | "likes_variety"
  | "dislikes_bland_food"
  | "dislikes_repetition";

export type FoodRestriction =
  | "vegetarian"
  | "no_pork"
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
  preferences: FoodPreference[];
  restrictions: FoodRestriction[];
  sensitivity: NPCSensitivity;
}
