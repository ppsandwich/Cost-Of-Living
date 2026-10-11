import type { NPC } from "@/types/npc";
import type { BasketItem } from "@/types/game";
import { mealCoverage, MEAL_LABELS, MEAL_ROLES } from "@/game/meals";
export const MEAL_ICONS = { base: "🍞", protein: "🫘", produce: "🥦" };
const SHORT_LABELS = { base: "Base", protein: "Protein", produce: "Fruit / veg" };
export function StatsPanel({ npc, basket, visual = false }: { npc: NPC; basket: BasketItem[]; visual?: boolean }) {
  const coverage = mealCoverage(basket, npc);
  return (
    <section aria-label="Parts of lunch">
      {!visual && <h2 className="sr-only">Lunch checklist</h2>}
      <ul className={visual ? "lunch-slots" : "flex flex-wrap gap-1.5 text-xs font-bold"}>
        {MEAL_ROLES.map((role) => <li key={role} className={`${visual ? "lunch-slot" : "meal-chip"} ${coverage[role] ? "meal-chip-covered" : ""}`}>
          <span key={String(coverage[role])} className={coverage[role] ? "check-stamp inline-block" : ""} aria-hidden>{coverage[role] ? "✓" : MEAL_ICONS[role]}</span>{" "}
          {visual ? SHORT_LABELS[role] : MEAL_LABELS[role]}
          <span className="sr-only">{coverage[role] ? ": covered" : ": still needed"}</span>
        </li>)}
      </ul>
    </section>
  );
}
