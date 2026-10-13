import { TasteFeedback } from "./TasteFeedback";
import type { GameState, BasketItem } from "@/types/game";
import { FOOD_BY_ID } from "@/data/foodItems";
import { RECIPE_BONUS } from "@/game/recipes";

function FoodPicture({ entry }: { entry: BasketItem }) {
  const food = FOOD_BY_ID[entry.foodItemId];
  return <span className="plate-food" role="img" aria-label={`${food.name}${entry.quantity > 1 ? `, ${entry.quantity} packs` : ""}`} title={`${food.name}${entry.quantity > 1 ? ` × ${entry.quantity}` : ""}`}>
    {food.emoji}{entry.quantity > 1 && <small aria-hidden>×{entry.quantity}</small>}
  </span>;
}

export function DishPlate({ state }: { state: GameState }) {
  const recipe = state.recipe;
  const used = recipe?.used ?? state.basket;
  const extras = recipe?.extras ?? [];
  return <section className="dish-result" aria-label={recipe ? `${state.npc!.name} made ${recipe.name}` : state.taste?.quality === "dubious" ? "Dubious food" : "Your lunch picks"}>
    <div className="dish-heading"><h3 className="font-title">{recipe ? recipe.name : state.taste?.quality === "dubious" ? "Dubious food" : "Mix-and-match lunch"}</h3>{recipe && <span className="recipe-bonus">Recipe Bonus! <strong>+{RECIPE_BONUS}</strong></span>}</div>
    <div className="dish-serving">
      <div className={`dish-plate ${used.length > 6 ? "dish-plate-full" : ""}`} aria-label="Foods used in the dish">
        {used.map((entry) => <FoodPicture key={entry.foodItemId} entry={entry} />)}
      </div>
      {extras.length > 0 && <div className="dish-extras" aria-label="Extra items not used in the dish"><strong>Extras</strong><div>{extras.map((entry) => <span className="dish-extra" key={entry.foodItemId}><span aria-hidden className="extra-plus">+</span><FoodPicture entry={entry} /></span>)}</div></div>}
    </div>
    <TasteFeedback basket={state.basket} npc={state.npc!} />
    <p className="sr-only">{recipe ? `${state.npc!.name} made this with ${used.map((entry) => FOOD_BY_ID[entry.foodItemId].name).join(", ")}. Recipe bonus: ${RECIPE_BONUS} points.` : "No recipe match this time. No recipe bonus."}</p>
  </section>;
}
