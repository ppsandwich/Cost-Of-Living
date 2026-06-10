import { useState } from "react";
import type { NPC, NutritionStats } from "@/types/npc";
import type { BasketItem } from "@/types/game";
import { FOOD_BY_ID } from "@/data/foodItems";
import { goalsMet } from "@/game/roundEnd";
import { formatCents } from "@/utils/money";

interface BasketDrawerProps {
  basket: BasketItem[];
  stats: NutritionStats;
  npc: NPC;
  roundBudgetCents: number;
  remainingBudgetCents: number;
  onRemove: (foodItemId: string) => void;
  onAdd: (foodItemId: string) => void;
  onSubmit: () => void;
}

export function BasketDrawer({
  basket,
  stats,
  npc,
  roundBudgetCents,
  remainingBudgetCents,
  onRemove,
  onAdd,
  onSubmit,
}: BasketDrawerProps) {
  const [open, setOpen] = useState(false);
  const itemCount = basket.reduce((n, b) => n + b.quantity, 0);
  const spent = roundBudgetCents - remainingBudgetCents;
  const met = goalsMet(stats, npc);

  return (
    <div className="border-t-2 border-ink/10 bg-receipt shadow-[0_-4px_12px_rgba(0,0,0,0.08)] lg:rounded-xl lg:border-2 lg:shadow-none">
      {open && (
        <div className="max-h-[45vh] overflow-y-auto border-b border-dashed border-ink/15 px-3 py-2 lg:max-h-none">
          <h2 className="text-xs font-bold uppercase tracking-wide text-faded">Basket</h2>
          {basket.length === 0 ? (
            <p className="py-2 text-sm text-faded">Nothing yet. The shelves await.</p>
          ) : (
            <ul className="divide-y divide-dashed divide-ink/10">
              {basket.map((entry) => {
                const food = FOOD_BY_ID[entry.foodItemId];
                if (!food) return null;
                return (
                  <li key={entry.foodItemId} className="flex items-center gap-2 py-1.5">
                    <span aria-hidden>{food.emoji}</span>
                    <span className="min-w-0 flex-1 truncate text-sm">{food.name}</span>
                    <span className="font-mono text-xs tabular-nums text-faded">
                      {formatCents(entry.pricePaidCents)} × {entry.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onRemove(entry.foodItemId)}
                      className="grid size-11 place-items-center rounded-lg border-2 border-ink/15 text-lg font-bold hover:bg-ink/5"
                      aria-label={`Remove one ${food.name}`}
                    >
                      −
                    </button>
                    <button
                      type="button"
                      onClick={() => onAdd(entry.foodItemId)}
                      className="grid size-11 place-items-center rounded-lg border-2 border-ink/15 text-lg font-bold hover:bg-ink/5"
                      aria-label={`Add one more ${food.name}`}
                    >
                      +
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 font-mono text-[11px] text-faded">
            <span>nutrition {Math.round(stats.nutrition)}/{npc.nutritionTarget}</span>
            <span>happiness {Math.round(stats.happiness)}/{npc.happinessTarget}</span>
            <span>cals {stats.calories}</span>
            <span>sugar {stats.sugar}</span>
            <span>fat {stats.fat}</span>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 px-3 py-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="min-h-11 min-w-0 flex-1 rounded-lg border-2 border-ink/15 px-2 text-left hover:bg-ink/5"
        >
          <span className="block truncate text-sm font-bold">
            🧺 {itemCount} item{itemCount === 1 ? "" : "s"} · {formatCents(spent)} spent
          </span>
          <span className="block truncate text-xs text-faded">
            {formatCents(remainingBudgetCents)} left ·{" "}
            {met ? (
              <span className="font-bold text-good">goals met ✓</span>
            ) : (
              "goals not met"
            )}{" "}
            · {open ? "close" : "review"}
          </span>
        </button>
        <button
          type="button"
          onClick={onSubmit}
          className={`min-h-12 rounded-lg px-4 text-sm font-bold text-white transition-colors ${
            met ? "bg-good hover:brightness-110" : "bg-ink/40 hover:bg-ink/50"
          }`}
        >
          Submit
        </button>
      </div>
    </div>
  );
}
