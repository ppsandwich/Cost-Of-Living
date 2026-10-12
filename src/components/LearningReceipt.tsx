import type { GameState } from "@/types/game";
import { missingRequirements, improvementTip, challengeAchieved } from "@/game/feedback";
import { formatCents } from "@/utils/money";

export function LearningReceipt({ state, compact = false }: { state: GameState; compact?: boolean }) {
  const spent = state.roundBudgetCents - state.remainingBudgetCents;
  const missing = missingRequirements(state);
  const previous = state.previousAttempt;
  const delta = previous ? previous.spentCents - spent : 0;
  const estimateDelta = state.estimateCents === null ? null : spent - state.estimateCents;
  return (
    <section
      aria-label="Your receipt"
      className={compact ? "compact-receipt" : "my-4 space-y-3 rounded-xl border-2 border-dashed border-ink/30 bg-receipt p-3 text-sm"}
    >
      {!compact && <h3 className="font-display text-lg">Your receipt</h3>}
      <dl className={compact ? "receipt-totals" : "space-y-1 font-bold"}>
        <div className={compact ? "" : "flex justify-between"}>
          <dt>Budget</dt><dd>{formatCents(state.roundBudgetCents)}</dd>
        </div>
        <div className={compact ? "" : "flex justify-between"}>
          <dt>Spent</dt><dd>{formatCents(spent)}</dd>
        </div>
        <div className={compact ? "" : "flex justify-between"}>
          <dt>{state.remainingBudgetCents < 0 ? "Over budget" : "Left over"}</dt>
          <dd>{formatCents(Math.abs(state.remainingBudgetCents))}</dd>
        </div>
      </dl>
      {!(compact && state.endReason === "goals_met") && <p className={state.endReason === "goals_met" ? "font-bold text-good" : ""}>
        {missing.length
          ? `Still needed: ${missing.join("; ")}.`
          : state.endReason === "goals_met"
            ? "✓ Checklist complete. Within budget!"
            : "Your checklist was complete, but time ran out. Next time, check out sooner."}
      </p>}
      {estimateDelta !== null && (
        <p>
          Estimate: {formatCents(state.estimateCents!)}. {estimateDelta === 0
            ? "Spot on!"
            : `${formatCents(Math.abs(estimateDelta))} ${estimateDelta > 0 ? "more" : "less"}.`}
        </p>
      )}
      {state.retryChallenge && <p className={challengeAchieved(state) ? "saving-badge" : ""}>{challengeAchieved(state) ? `🏅 Smart swap! ${formatCents(state.retryChallenge.baselineSpendCents - spent)} saved.` : `🎯 Target: ${formatCents(state.retryChallenge.targetSpendCents)} or less, with the checklist complete.`}</p>}
      {previous && !state.retryChallenge && (
        <p>
          {previous.cleared && state.endReason === "goals_met"
            ? delta === 0
              ? "Same cost as before; both checklists complete."
              : `${formatCents(Math.abs(delta))} ${delta > 0 ? "less" : "more"} than last time. Both checklists complete.`
            : `Last time: ${formatCents(previous.spentCents)}. ${!previous.cleared && state.endReason === "goals_met" ? "This time you finished the checklist!" : "Compare your checklist as well as the cost."}`}
        </p>
      )}
      {compact ? <details className="receipt-tip"><summary>Spending tip</summary><p>{improvementTip(state)}</p></details> : <p className="border-t border-dashed border-ink/25 pt-2"><strong>Try next:</strong> {improvementTip(state)}</p>}
      {state.recipe && <p className="recipe-note">Your points include the recipe bonus.</p>}
    </section>
  );
}
