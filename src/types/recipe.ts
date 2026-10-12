import type { BasketItem } from "./game";

/** Each slot needs one distinct ingredient; alternatives use standard food IDs. */
export interface Recipe {
  id: string;
  name: string;
  ingredients: string[][];
  optional?: string[];
}
export interface RecipeMatch {
  recipeId: string;
  name: string;
  used: BasketItem[];
  extras: BasketItem[];
}
