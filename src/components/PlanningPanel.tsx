import { useState } from "react";
import type { GameState } from "@/types/game";
import { formatCents } from "@/utils/money";

export function PlanningPanel({
  state,
  onBegin,
}: {
  state: GameState;
  onBegin: (estimateCents: number | null, prediction: string) => void;
}) {
  const [estimate, setEstimate] = useState("");
  const [prediction, setPrediction] = useState(
    "Start with the lunch components",
  );
  const valid =
    estimate === "" ||
    (/^\d+(?:\.\d{1,2})?$/.test(estimate) && Number(estimate) <= 10000);
  return (
    <section
      id="shopping-plan"
      aria-label="Plan your shop"
      className="panel scroll-mt-28 space-y-3 bg-receipt p-4"
    >
      <p className="text-xs font-bold text-brand-dark">Plan → shop → reflect</p>
      <h2 className="font-title text-2xl">A little trolley strategy</h2>
      <p className="text-sm font-semibold">
        Plan a lunch for {state.npc!.name} with{" "}
        <strong>{formatCents(state.roundBudgetCents)}</strong>. Find a base, a
        protein option and fruit or vegetables, then cover their two wants.
      </p>
      <p className="text-sm">
        Inspect the shelves before you begin.{" "}
        {state.mode === "learning"
          ? "No timer. You can revise your basket freely."
          : `Your ${state.roundDurationSeconds}-second clock starts when you are ready. Putting an item back takes three seconds.`}
      </p>
      {state.previousAttempt && (
        <p className="rounded-lg border-2 border-dashed border-ink/25 p-2 text-sm">
          Same shop, fresh plan. Last attempt:{" "}
          {formatCents(state.previousAttempt.spentCents)} spent;{" "}
          {state.previousAttempt.cleared ? "brief met" : "brief not completed"}.
          Prices, stock, budget and starting upgrades are unchanged.
        </p>
      )}
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (valid)
            onBegin(
              estimate === "" ? null : Math.round(Number(estimate) * 100),
              prediction,
            );
        }}
      >
        <label className="block text-sm font-bold">
          My spending estimate (optional, $)
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
            Enter a dollar amount with up to two decimal places.
          </p>
        )}
        <label className="block text-sm font-bold">
          My plan for this shop
          <select
            value={prediction}
            onChange={(e) => setPrediction(e.target.value)}
            className="mt-1 min-h-11 w-full rounded-lg border-2 border-ink/40 bg-paper px-2"
          >
            <option>Start with the lunch components</option>
            <option>Find affordable matches for their wants</option>
            <option>Check kitchen access before choosing</option>
            <option>Try to spend less than last time</option>
          </select>
        </label>
        <button
          disabled={!valid}
          className="btn min-h-12 w-full bg-good text-white"
        >
          {state.mode === "learning" ? "Ready to shop" : "Start the clock"}
        </button>
      </form>
      <p className="text-xs text-faded">
        The brief practises shopping decisions. Pack quantities are simplified;
        it is not a nutrition or portion guide.
      </p>
    </section>
  );
}
