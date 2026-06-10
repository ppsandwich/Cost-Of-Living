import type { GameState } from "@/types/game";
import { FOOD_BY_ID } from "@/data/foodItems";
import { WIN_MESSAGES } from "@/data/flavourText";
import { budgetMultiplierForRound, budgetPressureLabel } from "@/game/progression";
import { formatCents } from "@/utils/money";

export function OutcomeModal({
  state,
  onNextRound,
}: {
  state: GameState;
  onNextRound: () => void;
}) {
  const npc = state.npc!;
  const winLine = WIN_MESSAGES[state.roundNumber % WIN_MESSAGES.length](npc.name);
  const lastResult = state.roundHistory[state.roundHistory.length - 1];
  const nextMultiplier = budgetMultiplierForRound(state.roundNumber + 1);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Round won"
      className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4"
    >
      <div className="panel sunburst w-full max-w-sm p-5">
        <div className="text-center">
          <div aria-hidden className="text-5xl">
            {npc.emoji}
          </div>
          <h2 className="mt-1 font-display text-3xl uppercase tracking-wide text-good">
            Round clear!
          </h2>
          <p className="mt-2 text-sm font-semibold">{winLine}</p>
          {lastResult && (
            <div className="sticker mx-auto mt-3 inline-block rounded-lg bg-tag px-3 py-1 font-display text-sm uppercase">
              ★ {lastResult.rating} ★
            </div>
          )}
        </div>

        <div className="mt-4 rounded-xl border-2 border-dashed border-ink/30 bg-receipt p-3 font-pixel text-xl leading-snug">
          <div className="flex justify-between">
            <span className="text-faded">ROUND SCORE</span>
            <span className="tabular-nums">{state.score}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-faded">RUN TOTAL</span>
            <span className="tabular-nums">{state.totalScore}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-faded">NUTRITION</span>
            <span className="tabular-nums">
              {Math.round(state.stats.nutrition)}/{npc.nutritionTarget}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-faded">HAPPINESS</span>
            <span className="tabular-nums">
              {Math.round(state.stats.happiness)}/{npc.happinessTarget}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-faded">CHANGE LEFT</span>
            <span className="tabular-nums">{formatCents(state.remainingBudgetCents)}</span>
          </div>
        </div>

        <p className="mt-2 text-center text-lg" aria-label="Final basket">
          {state.basket
            .map((b) => `${FOOD_BY_ID[b.foodItemId]?.emoji ?? ""}×${b.quantity}`)
            .join(" ")}
        </p>

        <button
          type="button"
          onClick={onNextRound}
          className="btn mt-4 min-h-13 w-full bg-brand py-2.5 text-base uppercase text-white"
        >
          Next round → budget gets {budgetPressureLabel(nextMultiplier).toLowerCase()}
        </button>
      </div>
    </div>
  );
}
