import { useEffect, useRef, useState } from "react";
import type { BasketEvent } from "@/types/game";
import { formatCents } from "@/utils/money";

function useAnimatedCents(value: number) {
  const [display, setDisplay] = useState(value);
  const current = useRef(value);
  useEffect(() => {
    const from = current.current;
    const start = performance.now();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    const tick = (now: number) => {
      const fraction = reduced ? 1 : Math.min(1, (now - start) / 280);
      current.current = Math.round(from + (value - from) * fraction);
      setDisplay(current.current);
      if (fraction < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return display;
}
export function BudgetMeter({ budget, remaining, event, target }: { budget: number; remaining: number; event: BasketEvent | null; target?: number }) {
  const shown = useAnimatedCents(remaining);
  const spent = budget - remaining;
  return <section className="budget-meter" aria-label="Your budget">
    <div className="flex items-baseline justify-between gap-2 font-display text-sm">
      <span aria-hidden>Spent {formatCents(budget - shown)}</span>
      <strong aria-hidden className={remaining < 0 ? "text-danger" : "text-good"}>{formatCents(Math.abs(shown))} {remaining < 0 ? "over" : "left"}</strong>
      <span className="sr-only">Spent {formatCents(spent)}. {formatCents(Math.abs(remaining))} {remaining < 0 ? "over budget" : "left"}.</span>
    </div>
    <div className="budget-track" role="meter" aria-label="Budget spent" aria-valuemin={0} aria-valuemax={budget} aria-valuenow={Math.min(budget, Math.max(0, spent))} aria-valuetext={`${formatCents(spent)} spent out of ${formatCents(budget)}`}>
      <div className={remaining < 0 ? "budget-fill budget-over" : "budget-fill"} style={{ width: `${Math.min(100, spent / budget * 100)}%` }} />
    </div>
    {target !== undefined && <p className="mt-1 text-xs font-bold text-good">🎯 Try for {formatCents(target)} or less</p>}
    {event && <span aria-hidden key={event.id} className={`money-movement ${event.kind === "remove" ? "money-return" : ""}`}>{event.kind === "remove" ? "+" : "−"}{formatCents(event.cents)}</span>}
  </section>;
}
