import { useState } from "react";
import type { GameState } from "@/types/game";
import { mealCoverage } from "@/game/meals";
import { getRequirementsStatus } from "@/game/requirements";
import { MUST_NOT_LABEL, WANT_BADGE } from "@/data/labels";
import { NPCPanel } from "./NPCPanel";

export function ShoppingOrder({ state }: { state: GameState }) {
  const [open, setOpen] = useState(false);
  const npc = state.npc!;
  const wishes = getRequirementsStatus(state.basket, npc).wants;
  const ticks = Object.values(mealCoverage(state.basket, npc)).filter(Boolean).length + wishes.filter((w) => w.satisfied).length;
  return <section className={`shopping-order ${open ? "order-open" : "order-closed"}`}>
    <button className="order-toggle" aria-expanded={open} aria-controls="shopping-checklist" onClick={() => setOpen(!open)}>
      <span><strong>{npc.emoji} Lunch checklist · {ticks}/5</strong><span className="order-quick-wishes">{wishes.map(({ want, satisfied }) => <span key={want} className={satisfied ? "text-good" : ""}>{satisfied ? "✓" : "★"} {want === "likes_variety" ? "3+ aisles" : WANT_BADGE[want]}</span>)}</span><span className="block text-xs">🚫 {MUST_NOT_LABEL[npc.mustNot]}</span></span>
      <span aria-hidden>{open ? "−" : "+"}</span>
    </button>
    <div id="shopping-checklist" className="order-content"><NPCPanel npc={npc} basket={state.basket} budgetCents={state.roundBudgetCents} event={state.basketEvent} /></div>
  </section>;
}
