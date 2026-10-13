import { assessTaste, tastePoints } from "./taste";
import type { GameState, BasketItem } from "@/types/game";
import { FOOD_BY_ID } from "@/data/foodItems";
import { allRequirementsMet, getRequirementsStatus } from "./requirements";
import { mealCounts, MEAL_REQUIRED, mealCoverage, MEAL_LABELS, MEAL_ROLES, usableFood } from "./meals";
import { quantityRemaining } from "./roundEnd";
import { formatCents } from "@/utils/money";
import { WANT_LABEL } from "@/data/labels";
import { findClearingBasket } from "./solver";

export function missingRequirements(state: GameState): string[] {
  const npc = state.npc!;
  const coverage = mealCoverage(state.basket, npc);
  const produceNeeded = Math.max(0, MEAL_REQUIRED.produce - mealCounts(state.basket, npc).produce);
  return [
    ...MEAL_ROLES.filter((r) => !coverage[r]).map((r) => r === "produce" ? `${produceNeeded} more fruit or veg item${produceNeeded === 1 ? "" : "s"}` : MEAL_LABELS[r]),
    ...getRequirementsStatus(state.basket, npc)
      .wants.filter((w) => !w.satisfied)
      .map((w) => WANT_LABEL[w.want]),
    ...(state.remainingBudgetCents < 0
      ? [`Spend less by ${formatCents(-state.remainingBudgetCents)}`]
      : []),
  ];
}
/** Only suggest a saving when the resulting basket still meets the entire brief. */
export function findSaving(state: GameState) {
  const npc = state.npc!;
  const currentTastePoints = tastePoints(assessTaste(state.basket, npc));
  let best = { savings: 0, message: "", basket: [] as BasketItem[] };
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
        allRequirementsMet(trial, npc) &&
        tastePoints(assessTaste(trial, npc)) >= currentTastePoints
      )
        best = { savings, message, basket: trial };
    };
    consider(
      trimmed,
      entry.pricePaidCents,
      `Put back one pack of ${FOOD_BY_ID[entry.foodItemId].name} and save ${formatCents(entry.pricePaidCents)}. Needs still met.`,
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
        `Swap one pack of ${FOOD_BY_ID[entry.foodItemId].name} for ${FOOD_BY_ID[item.foodItemId].name}. Save ${formatCents(savings)}; needs still met.`,
      );
    }
  }
  return best.savings > 0 ? best : null;
}

export function improvementTip(state: GameState): string {
  const npc = state.npc!;
  const taste = assessTaste(state.basket, npc);
  if (taste.quality === "dubious" && state.endReason === "goals_met") return "Next shop, plan one dish first, then pick a second fruit or veg item to go with it.";
  const saving = findSaving(state);
  if (saving) return saving.message;
  if (state.endReason === "goals_met")
    return "Next shop, compare prices before you add food. Can one item cover two parts of lunch?";
  const witness = findClearingBasket(
    npc,
    state.inventory,
    state.roundBudgetCents,
  );
  const next = witness?.find(
    (b) => !state.basket.some((current) => current.foodItemId === b.foodItemId),
  );
  return next
    ? `Try ${FOOD_BY_ID[next.foodItemId].name}. It can help you finish the checklist within budget.`
    : "Pick a base, protein food and two fruit or veg items. Check all food wishes and leave time to check out.";
}

export function challengeAchieved(state: GameState): boolean {
  return Boolean(state.retryChallenge && state.endReason === "goals_met" && state.npc &&
    state.remainingBudgetCents >= 0 && allRequirementsMet(state.basket, state.npc) &&
    state.roundBudgetCents - state.remainingBudgetCents <= state.retryChallenge.targetSpendCents);
}
