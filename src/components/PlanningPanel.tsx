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
      <p className="text-sm font-semibold">
        Plan a lunch for {state.npc!.name} with{" "}
        <strong>{formatCents(state.roundBudgetCents)}</strong>. Find a base, a
        protein food and fruit or vegetables, plus their two food wishes.
      </p>
      <p className="text-sm">
        Check the shelves and prices first.{" "}
        {state.mode === "learning"
          ? "No timer. Change your basket as often as you like."
          : `Your ${state.roundDurationSeconds}-second clock starts when you are ready. Putting an item back takes three seconds.`}
      </p>
      {state.previousAttempt && (
        <p className="rounded-lg border-2 border-dashed border-ink/25 p-2 text-sm">
          Same shop, another go. Last time:{" "}
          {formatCents(state.previousAttempt.spentCents)} spent;{" "}
          {state.previousAttempt.cleared ? "checklist complete" : "checklist unfinished"}.
          You start with the same prices, items, budget and power-ups.
        </p>
      )}
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
      <p className="text-xs text-faded">
        This game is about shopping choices. It does not show how much food a
        person needs to eat.
      </p>
    </section>
  );
}
