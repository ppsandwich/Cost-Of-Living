import { RoundIntro } from "./RoundIntro";
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
    <section id="shopping-plan" aria-label="Plan your shop" className="panel planning-panel bg-receipt">
      <RoundIntro state={state} />
      <div className="plan-actions">
        <a href="#store-shelves" className="browse-link" onClick={() => document.getElementById("store-shelves")?.focus({ preventScroll: true })}>Browse food ↓</a>
        <form id="begin-shopping" onSubmit={(e) => {
          e.preventDefault();
          if (valid) onBegin(estimate === "" ? null : Math.round(Number(estimate) * 100));
        }}>
          <section className="estimate-field" aria-label="Guess your total">
            <h3 className="text-sm font-bold">Guess your total <span className="font-normal text-faded">(optional)</span></h3>
            <label className="mt-2 block text-sm font-bold">
              What will you spend? ($)
              <input inputMode="decimal" value={estimate} onChange={(e) => setEstimate(e.target.value)} placeholder="e.g. 12.50" aria-invalid={!valid} aria-describedby={!valid ? "estimate-error" : undefined} className="mt-1 min-h-11 w-full rounded-lg border-2 border-ink/40 bg-paper px-3" />
            </label>
            {!valid && <p id="estimate-error" className="mt-1 text-sm text-danger">Enter an amount like 12.50, up to $10,000.</p>}
          </section>
          <div className="planning-start">
            <span className="text-xs font-bold">Budget <strong className="block font-display text-xl">{formatCents(state.roundBudgetCents)}</strong></span>
            <button disabled={!valid} className="btn min-h-12 flex-1 bg-good text-white">{state.mode === "learning" ? "Start shopping →" : "Start the clock →"}</button>
          </div>
        </form>
      </div>
    </section>
  );
}
