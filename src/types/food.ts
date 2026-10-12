export type FoodCategory =
  | "fruit"
  | "vegetable"
  | "grain"
  | "protein"
  | "dairy"
  | "snack"
  | "frozen"
  | "ready_meal"
  | "drink"
  | "pantry"
  | "treat";

export type FoodTag =
  | "cheap"
  | "filling"
  | "fresh"
  | "processed"
  | "comfort"
  | "sweet"
  | "salty"
  | "spicy"
  | "crunchy"
  | "bland"
  | "meat"
  | "pork"
  | "dairy"
  | "egg"
  | "nuts"
  | "high_protein"
  | "high_fibre"
  | "high_sugar"
  | "high_fat"
  | "high_carb"
  | "vitamin_rich"
  | "mineral_rich"
  | "low_prep"
  | "seasoning"
  | "family_friendly";

export interface FoodItem {
  id: string;
  name: string;
  emoji: string;
  /** A price/branding variant, without a nutrition or meal-coverage advantage. */
  variant?: "premium";
  category: FoodCategory;
  basePriceCents: number;
  tags: FoodTag[];
  maxQuantity?: number;
  flavour: string;
}
