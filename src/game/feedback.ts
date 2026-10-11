import type { GameState, BasketItem } from "@/types/game";
import { FOOD_BY_ID } from "@/data/foodItems";
import { allRequirementsMet, getRequirementsStatus } from "./requirements";
import { mealCoverage, MEAL_LABELS, MEAL_ROLES, usableFood } from "./meals";
import { quantityRemaining } from "./roundEnd";
import { formatCents } from "@/utils/money";
import { WANT_LABEL } from "@/data/labels";
import { findClearingBasket } from "./solver";

export function missingRequirements(state: GameState): string[] {
  const npc = state.npc!;
  const coverage = mealCoverage(state.basket, npc);
  return [
    ...MEAL_ROLES.filter((r) => !coverage[r]).map((r) => MEAL_LABELS[r]),
    ...getRequirementsStatus(state.basket, npc)
      .wants.filter((w) => !w.satisfied)
      .map((w) => WANT_LABEL[w.want]),
    ...(state.remainingBudgetCents < 0
      ? [`Reduce spending by ${formatCents(-state.remainingBudgetCents)}`]
      : []),
  ];
}
/** Only suggest a saving when the resulting basket still meets the entire brief. */
export function improvementTip(state: GameState): string {
  const npc = state.npc!;
  let best = { savings: 0, message: "" };
  for (const entry of state.basket) {
    const trimmed = state.basket.flatMap((b) =>
      b.foodItemId !== entry.foodItemId
        ? [b]
        : b.quantity > 1
          ? [{ ...b, quantity: b.quantity - 1 }]
          : [],
    );
    const consider = (
      trial: BasketItem[],
      savings: number,
      message: string,
    ) => {
      if (
        savings > best.savings &&
        state.remainingBudgetCents + savings >= 0 &&
        allRequirementsMet(trial, npc)
      )
        best = { savings, message };
    };
    consider(
      trimmed,
      entry.pricePaidCents,
      `Put back one pack of ${FOOD_BY_ID[entry.foodItemId].name} and save ${formatCents(entry.pricePaidCents)}. The lunch brief still works.`,
    );
    for (const item of state.inventory) {
      if (
        item.foodItemId === entry.foodItemId ||
        quantityRemaining(item, state.basket) <= 0 ||
        !usableFood(FOOD_BY_ID[item.foodItemId], npc)
      )
        continue;
      const savings = entry.pricePaidCents - item.currentPriceCents;
      const trial = [
        ...trimmed,
        {
          foodItemId: item.foodItemId,
          quantity: 1,
          pricePaidCents: item.currentPriceCents,
        },
      ];
      consider(
        trial,
        savings,
        `Swap one pack of ${FOOD_BY_ID[entry.foodItemId].name} for ${FOOD_BY_ID[item.foodItemId].name} to save ${formatCents(savings)} and still meet the whole brief.`,
      );
    }
  }
  if (best.message) return best.message;
  if (state.endReason === "goals_met")
    return "Every part of the brief is covered. Try a different combination and compare its cost; this basket is not necessarily the cheapest.";
  const witness = findClearingBasket(
    npc,
    state.inventory,
    state.roundBudgetCents,
  );
  const next = witness?.find(
    (b) => !state.basket.some((current) => current.foodItemId === b.foodItemId),
  );
  return next
    ? `On your retry, look at ${FOOD_BY_ID[next.foodItemId].name}. It is part of one basket that meets this brief within budget.`
    : "Start with the lunch components, then check the two wants. Leave time to check out.";
}
