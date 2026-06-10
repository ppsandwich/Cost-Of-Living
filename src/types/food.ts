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
  | "requires_fridge"
  | "requires_microwave"
  | "requires_stove"
  | "family_friendly";

export type EquipmentRequirement =
  | "fridge"
  | "freezer"
  | "microwave"
  | "stove"
  | "oven"
  | "kettle";

export interface FoodItem {
  id: string;
  name: string;
  emoji: string;
  category: FoodCategory;
  basePriceCents: number;
  calories: number;
  protein: number;
  fat: number;
  sugar: number;
  carbs: number;
  fibre: number;
  vitamins: number;
  minerals: number;
  sodium?: number;
  baseNutrition: number;
  baseHappiness: number;
  tags: FoodTag[];
  requiresEquipment?: EquipmentRequirement[];
  maxQuantity?: number;
  flavour: string;
}
