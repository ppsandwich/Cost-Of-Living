import type { GameState } from "@/types/game";
import { FOOD_BY_ID } from "@/data/foodItems";
import { WANT_BADGE, MUST_NOT_LABEL } from "@/data/labels";
import { basketCost } from "@/game/solver";
import { formatCents } from "@/utils/money";

export function RoundSolution({ state }: { state: GameState }) {
  const spent = basketCost(state.solution);
  return <section className="round-solution" aria-label="One possible solution">
    <h3 className="font-display">One possible solution</h3>
    <ul>{state.solution.map((entry) => <li key={entry.foodItemId}>
      <span aria-hidden>{FOOD_BY_ID[entry.foodItemId].emoji}</span><span>{FOOD_BY_ID[entry.foodItemId].name}</span><strong>{formatCents(entry.pricePaidCents)}</strong>
    </li>)}</ul>
    <p className="font-bold">Total {formatCents(spent)} · {formatCents(state.roundBudgetCents - spent)} left</p>
    <p>✓ Base, protein and fruit / veg</p>
    <p>✓ {state.npc!.wants.map((wish) => wish === "likes_variety" ? "3+ aisles" : WANT_BADGE[wish]).join(" · ")}</p>
    <p>✓ {MUST_NOT_LABEL[state.npc!.mustNot]}</p>
  </section>;
}
