import { useState } from "react";
import type { GameState } from "@/types/game";
import { formatCents } from "@/utils/money";

export function PlanningPanel({ state, onBegin }: {
  state: GameState;
  onBegin: (estimateCents: number | null) => void;
}) {
  const [estimate, setEstimate] = useState("");
  const valid = estimate === "" || (/^\d+(?:\.\d{1,2})?$/.test(estimate) && Number(estimate) <= 10000);
  return (
    <section id="shopping-plan" aria-label="Plan your shop" className="panel planning-panel bg-receipt p-4">
      <h2 className="font-title text-2xl">Take a look first</h2>
      <p className="mt-1 text-sm">Check the prices. Pick out a lunch in your head.</p>
      <p className="mt-2 text-xs font-bold text-brand-dark">{state.mode === "learning" ? "Take your time — there’s no timer." : `The ${state.roundDurationSeconds}-second clock starts when you shop. Putting food back costs 3 seconds.`}</p>
      {state.retryChallenge && <p className="challenge-ticket mt-3">🎯 Same checklist. Spend {formatCents(state.retryChallenge.targetSpendCents)} or less.</p>}
      {state.previousAttempt && !state.retryChallenge && <p className="mt-2 text-xs">Same shop. Last spend: {formatCents(state.previousAttempt.spentCents)}.</p>}
      <a href="#store-shelves" className="browse-link">Browse prices ↓</a>
      <form id="begin-shopping" className="mt-3" onSubmit={(e) => {
        e.preventDefault();
        if (valid) onBegin(estimate === "" ? null : Math.round(Number(estimate) * 100));
      }}>
        <details className="estimate-disclosure">
          <summary className="cursor-pointer text-sm font-bold">Guess your total <span className="font-normal text-faded">(optional)</span></summary>
          <label className="mt-2 block text-sm font-bold">
            What will you spend? ($)
            <input inputMode="decimal" value={estimate} onChange={(e) => setEstimate(e.target.value)} placeholder="e.g. 12.50" aria-invalid={!valid} aria-describedby={!valid ? "estimate-error" : undefined} className="mt-1 min-h-11 w-full rounded-lg border-2 border-ink/40 bg-paper px-3" />
          </label>
          {!valid && <p id="estimate-error" className="mt-1 text-sm text-danger">Enter an amount like 12.50, up to $10,000.</p>}
        </details>
        <div className="planning-start">
          <span className="text-xs font-bold">Budget <strong className="block font-display text-xl">{formatCents(state.roundBudgetCents)}</strong></span>
          <button disabled={!valid} className="btn min-h-12 flex-1 bg-good text-white">{state.mode === "learning" ? "Start shopping →" : "Start the clock →"}</button>
        </div>
      </form>
    </section>
  );
}
