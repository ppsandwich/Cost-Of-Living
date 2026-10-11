import { useState } from "react";
import type { NPC } from "@/types/npc";
import type { BasketItem, BasketEvent } from "@/types/game";
import { FOOD_BY_ID } from "@/data/foodItems";
import { allRequirementsMet } from "@/game/requirements";
import { formatCents } from "@/utils/money";
import { StatsPanel } from "./StatsPanel";
import { BudgetMeter } from "./BudgetMeter";
import { ShoppingReaction } from "./ShoppingReaction";

interface BasketDrawerProps {
  basket: BasketItem[];
  npc: NPC;
  remainingBudgetCents: number;
  roundBudgetCents: number;
  event: BasketEvent | null;
  challengeTarget?: number;
  onRemove: (foodItemId: string) => void;
  onAdd: (foodItemId: string) => void;
  onCheckout: () => void;
}

export function BasketDrawer({
  basket,
  npc,
  remainingBudgetCents,
  roundBudgetCents,
  event,
  challengeTarget,
  onRemove,
  onAdd,
  onCheckout,
}: BasketDrawerProps) {
  const [open, setOpen] = useState(false);
  const itemCount = basket.reduce((n, b) => n + b.quantity, 0);
  const overBudget = remainingBudgetCents < 0;
  const readyToWin = !overBudget && allRequirementsMet(basket, npc);

  return (
    <div className="border-t-[3px] border-ink bg-receipt shadow-[0_-4px_12px_rgba(51,36,28,0.2)] lg:rounded-2xl lg:border-[3px] lg:shadow-[4px_4px_0_rgba(51,36,28,0.25)]">
      <div className="px-3 pt-2">
        <BudgetMeter budget={roundBudgetCents} remaining={remainingBudgetCents} event={event} target={challengeTarget} />
        <ShoppingReaction event={event} npc={npc} />
        <StatsPanel npc={npc} basket={basket} />
      </div>

      {open && (
        <div className="max-h-[40vh] overflow-y-auto border-b-2 border-dashed border-ink/25 px-3 py-2 lg:max-h-none">
          <h2 className="text-center text-sm font-bold uppercase tracking-widest text-faded">
            ··· your receipt ···
          </h2>
          {basket.length === 0 ? (
            <p className="py-2 text-center text-sm font-semibold text-faded">
              Nothing yet. What will you pick?
            </p>
          ) : (
            <ul className="divide-y divide-dashed divide-ink/15">
              {basket.map((entry) => {
                const food = FOOD_BY_ID[entry.foodItemId];
                if (!food) return null;
                return (
                  <li
                    key={entry.foodItemId}
                    className="flex items-center gap-2 py-1.5"
                  >
                    <span aria-hidden className="text-lg">
                      {food.emoji}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-bold leading-none">
                      {food.name}
                    </span>
                    <span className="text-sm font-bold leading-none tabular-nums text-faded">
                      {formatCents(entry.pricePaidCents)}×{entry.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onRemove(entry.foodItemId)}
                      className="btn grid size-11 place-items-center bg-paper text-lg"
                      aria-label={`Put back one ${food.name}`}
                    >
                      −
                    </button>
                    <button
                      type="button"
                      onClick={() => onAdd(entry.foodItemId)}
                      className="btn grid size-11 place-items-center bg-paper text-lg"
                      aria-label={`Add one more ${food.name}`}
                    >
                      +
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      <div className="space-y-2 px-3 py-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={`Your basket: ${itemCount} items. ${open ? "Hide" : "Show"} receipt`}
          aria-expanded={open}
          className="btn flex min-h-12 w-full items-center justify-between gap-2 bg-paper px-2.5 text-left"
        >
          <span className="basket-still-life" aria-hidden>
            <span className="basket-outline">🧺</span>
            {basket.slice(-5).map((entry) => <span key={`${entry.foodItemId}-${entry.quantity}`} className="basket-food">{FOOD_BY_ID[entry.foodItemId].emoji}</span>)}
            {event?.kind === "remove" && <span key={event.id} className="basket-food-leaving">{FOOD_BY_ID[event.foodItemId].emoji}</span>}
          </span>
          <span className="shrink-0 font-display text-sm">{itemCount} item{itemCount === 1 ? "" : "s"}</span>
          <span aria-hidden className="font-display text-faded">
            {open ? "▼" : "▲"}
          </span>
        </button>

        <button
          type="button"
          onClick={onCheckout}
          disabled={!readyToWin}
          className={`btn font-knewave min-h-12 w-full text-base uppercase text-white ${
            overBudget
              ? "bg-danger"
              : readyToWin
                ? "wobble bg-good"
                : "bg-faded"
          }`}
          aria-label={
            readyToWin
              ? "Check out the basket"
              : "Check out — finish the checklist and stay within budget first"
          }
        >
          {overBudget ? "⚠ Check out" : "Check out"}
        </button>
      </div>
    </div>
  );
}
