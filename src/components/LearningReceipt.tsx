import type { GameState } from "@/types/game";
import { missingRequirements, improvementTip } from "@/game/feedback";
import { formatCents } from "@/utils/money";
export function LearningReceipt({ state }: { state: GameState }) {
  const spent = state.roundBudgetCents - state.remainingBudgetCents;
  const missing = missingRequirements(state);
  const previous = state.previousAttempt;
  const delta = previous ? previous.spentCents - spent : 0;
  const estimateDelta =
    state.estimateCents === null ? null : spent - state.estimateCents;
  return (
    <section
      aria-label="Your learning receipt"
      className="my-4 space-y-3 rounded-xl border-2 border-dashed border-ink/30 bg-receipt p-3 text-sm"
    >
      <h3 className="font-display text-lg">Your learning receipt</h3>
      <dl className="space-y-1 font-bold">
        <div className="flex justify-between">
          <dt>Budget</dt>
          <dd>{formatCents(state.roundBudgetCents)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Spent</dt>
          <dd>{formatCents(spent)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>{state.remainingBudgetCents < 0 ? "Over budget" : "Change"}</dt>
          <dd>{formatCents(Math.abs(state.remainingBudgetCents))}</dd>
        </div>
      </dl>
      <p>
        {missing.length
          ? `Still needed: ${missing.join("; ")}.`
          : state.endReason === "goals_met"
            ? "Lunch components, tastes, kitchen access and budget: all covered."
            : "Your basket met the brief, but the clock ran out before checkout. Next time, check out as soon as you are ready."}
      </p>
      {estimateDelta !== null && (
        <p>
          Your estimate was {formatCents(state.estimateCents!)}.{" "}
          {estimateDelta === 0
            ? "Spot on."
            : `You spent ${formatCents(Math.abs(estimateDelta))} ${estimateDelta > 0 ? "more" : "less"} than expected.`}
        </p>
      )}
      {state.prediction && (
        <p>
          <strong>Your plan:</strong> {state.prediction}. How did it affect your
          choices?
        </p>
      )}
      {previous && (
        <p>
          <strong>Compared with last attempt:</strong>{" "}
          {previous.cleared && state.endReason === "goals_met"
            ? delta === 0
              ? "Both baskets met the brief for the same cost."
              : `Both baskets met the brief. You spent ${formatCents(Math.abs(delta))} ${delta > 0 ? "less" : "more"} this time.`
            : `Previous spend ${formatCents(previous.spentCents)}; this spend ${formatCents(spent)}. ${!previous.cleared && state.endReason === "goals_met" ? "This time you completed the brief." : "Compare the requirements met as well as the price."}`}
        </p>
      )}
      <p className="border-t border-dashed border-ink/25 pt-2">
        <strong>Try next:</strong> {improvementTip(state)}
      </p>
    </section>
  );
}
