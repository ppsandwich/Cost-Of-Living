import { TasteFeedback } from "./TasteFeedback";
import { useRef } from "react";
import type { NPC } from "@/types/npc";
import type { BasketItem, BasketEvent } from "@/types/game";
import { FOOD_BY_ID } from "@/data/foodItems";
import { allRequirementsMet, getRequirementsStatus } from "@/game/requirements";
import { WANT_BADGE, MUST_NOT_LABEL } from "@/data/labels";
import { formatCents } from "@/utils/money";
import { StatsPanel } from "./StatsPanel";
import { BudgetMeter } from "./BudgetMeter";
import { ShoppingReaction } from "./ShoppingReaction";
import { Dialog } from "./Dialog";

interface BasketDrawerProps {
  basket: BasketItem[];
  npc: NPC;
  remainingBudgetCents: number;
  roundBudgetCents: number;
  event: BasketEvent | null;
  challengeTarget?: number;
  active: boolean;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  timed: boolean;
  timeRemainingSeconds: number;
  onRemove: (foodItemId: string) => void;
  onCheckout: () => void;
}

export function BasketDrawer({ basket, npc, remainingBudgetCents, roundBudgetCents, event, challengeTarget, active, open, onOpen, onClose, timed, timeRemainingSeconds, onRemove, onCheckout }: BasketDrawerProps) {
  const reviewButton = useRef<HTMLButtonElement>(null);
  const itemCount = basket.reduce((n, b) => n + b.quantity, 0);
  const overBudget = remainingBudgetCents < 0;
  const readyToWin = !overBudget && allRequirementsMet(basket, npc);
  const status = getRequirementsStatus(basket, npc);
  const close = () => { onClose(); requestAnimationFrame(() => reviewButton.current?.focus({ preventScroll: true })); };

  return <>
    <section className="basket-dock" aria-label="Your basket">
      <BudgetMeter budget={roundBudgetCents} remaining={remainingBudgetCents} event={event} target={challengeTarget} />
      <TasteFeedback basket={basket} npc={npc} compact />
      <ShoppingReaction event={event} npc={npc} empty={basket.length === 0} unsuitable={status.mustNotViolated} />
      <button ref={reviewButton} type="button" onClick={() => { if (active && readyToWin) onOpen(); }} disabled={!active || !readyToWin} aria-haspopup={readyToWin ? "dialog" : undefined} className={`btn basket-review-button ${status.mustNotViolated ? "basket-unsuitable" : readyToWin ? "bg-good text-white" : "bg-paper"}`} aria-label={readyToWin ? `Review basket: ${itemCount} item${itemCount === 1 ? "" : "s"}, ready to check out` : `Basket: ${itemCount} item${itemCount === 1 ? "" : "s"}. ${status.mustNotViolated ? "Remove unsuitable foods" : overBudget ? "Over budget" : "Checklist incomplete"}`}>
        <span className="basket-still-life" aria-hidden>
          <span className="basket-outline">🧺</span>
          {basket.slice(-4).map((entry) => <span key={`${entry.foodItemId}-${entry.quantity}`} className="basket-food">{FOOD_BY_ID[entry.foodItemId].emoji}</span>)}
          {event?.kind === "remove" && <span key={event.id} className="basket-food-leaving">{FOOD_BY_ID[event.foodItemId].emoji}</span>}
        </span>
        <span className="text-right text-sm leading-tight">{readyToWin && <strong className="block">Review basket →</strong>}<span className="text-xs">{itemCount} item{itemCount === 1 ? "" : "s"}</span></span>
      </button>
    </section>
    {open && active && <Dialog title="Check your basket" compact onClose={close}>
      <div className="basket-checklist mt-3">
        <StatsPanel npc={npc} basket={basket} />
        <div className="mt-2 flex flex-wrap gap-1.5 text-xs font-bold">
          {status.wants.map(({ want, satisfied }) => <span className={`meal-chip ${satisfied ? "meal-chip-covered" : ""}`} key={want}>{satisfied ? "✓" : "○"} {want === "likes_variety" ? "3+ aisles" : WANT_BADGE[want]}</span>)}
        </div>
        <p className="mt-2 text-xs font-bold">{status.mustNotViolated ? "⚠" : "✓"} {MUST_NOT_LABEL[npc.mustNot]}</p>
      </div>
      <TasteFeedback basket={basket} npc={npc} />
      <div className="basket-receipt">
        {basket.length === 0 ? <p className="py-4 text-center text-sm">Your basket is empty. Head to the shelves to pick your lunch.</p> : <ul>
          {basket.map((entry) => {
            const food = FOOD_BY_ID[entry.foodItemId];
            return <li key={entry.foodItemId} className="receipt-item">
              <span aria-hidden className="text-2xl">{food.emoji}</span>
              <div className="min-w-0 flex-1"><strong className="block text-sm leading-tight">{food.name}</strong></div>
              <strong className="text-sm tabular-nums">{formatCents(entry.pricePaidCents * entry.quantity)}</strong>
              <div className="flex gap-1">
                <button type="button" onClick={() => onRemove(entry.foodItemId)} className="btn grid size-11 place-items-center bg-paper text-lg" aria-label={`Put back one ${food.name}`}>−</button>
              </div>
            </li>;
          })}
        </ul>}
      </div>
      <BudgetMeter budget={roundBudgetCents} remaining={remainingBudgetCents} event={null} target={challengeTarget} />
      <p className={`my-2 text-xs font-bold ${overBudget ? "text-danger" : "text-good"}`} role="status">{overBudget ? `Put something back to save ${formatCents(-remainingBudgetCents)}.` : readyToWin ? "Checklist complete. Lunch is ready!" : "Finish the unticked parts of your checklist."}</p>
      {timed && <p className="mb-2 text-xs text-faded"><strong className={timeRemainingSeconds <= 15 ? "text-danger" : "text-ink"}>⏸ Timer paused · {timeRemainingSeconds}s left.</strong> Putting food back costs 3 seconds.</p>}
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={close} className="btn min-h-12 bg-paper text-sm">← Keep shopping</button>
        <button type="button" onClick={() => { onClose(); onCheckout(); }} disabled={!readyToWin} className="btn min-h-12 bg-good text-sm text-white">Check out ✓</button>
      </div>
    </Dialog>}
  </>;
}
