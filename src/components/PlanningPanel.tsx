import { useState } from "react";
import type { GameState } from "@/types/game";
import { formatCents } from "@/utils/money";

export function PlanningPanel({
  state,
  onBegin,
}: {
  state: GameState;
  onBegin: (estimateCents: number | null) => void;
}) {
  const [estimate, setEstimate] = useState("");
  const valid =
    estimate === "" ||
    (/^\d+(?:\.\d{1,2})?$/.test(estimate) && Number(estimate) <= 10000);
  return (
    <section
      id="shopping-plan"
      aria-label="Plan your shop"
      className="panel planning-panel scroll-mt-28 space-y-3 bg-receipt p-4"
    >
      <p className="flex items-center gap-2 font-display text-xs text-brand-dark">
        <span className="sticker rounded-md bg-tag px-2 py-1 text-ink">1. Plan</span>
        <span>→ 2. Shop → 3. Review</span>
      </p>
      <h2 className="font-title text-2xl">Before you shop</h2>
      <p className="text-sm">{state.mode === "learning" ? "Look around first. No timer." : `${state.roundDurationSeconds} seconds to shop. Putting an item back costs three seconds.`}</p>
      {state.retryChallenge && <p className="challenge-ticket">🎯 Same checklist. Spend {formatCents(state.retryChallenge.targetSpendCents)} or less.</p>}
      {state.previousAttempt && !state.retryChallenge && <p className="text-xs">Same shop. Last spend: {formatCents(state.previousAttempt.spentCents)}.</p>}
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (valid)
            onBegin(
              estimate === "" ? null : Math.round(Number(estimate) * 100),
            );
        }}
      >
        <label className="block text-sm font-bold">
          What will you spend? (optional, $)
          <input
            inputMode="decimal"
            value={estimate}
            onChange={(e) => setEstimate(e.target.value)}
            placeholder="e.g. 12.50"
            aria-invalid={!valid}
            aria-describedby={!valid ? "estimate-error" : undefined}
            className="mt-1 min-h-11 w-full rounded-lg border-2 border-ink/40 bg-paper px-3"
          />
        </label>
        {!valid && (
          <p id="estimate-error" className="text-sm text-danger">
            Enter an amount like 12.50, up to $10,000.
          </p>
        )}
        <button
          disabled={!valid}
          className="btn min-h-12 w-full bg-good text-white"
        >
          {state.mode === "learning" ? "Ready to shop" : "Start the clock"}
        </button>
      </form>

    </section>
  );
}
