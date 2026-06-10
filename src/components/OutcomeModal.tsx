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
      className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4"
    >
      <div className="w-full max-w-sm rounded-2xl border-2 border-ink/10 bg-receipt p-5 shadow-xl">
        <div className="text-center">
          <div aria-hidden className="text-4xl">
            {npc.emoji}
          </div>
          <h2 className="mt-1 text-xl font-bold">Round {state.roundNumber} survived</h2>
          <p className="mt-2 text-sm">{winLine}</p>
        </div>

        <div className="mt-4 rounded-xl border border-dashed border-ink/20 p-3 font-mono text-sm">
          <div className="flex justify-between">
            <span className="text-faded">Rating</span>
            <span className="font-bold">{lastResult?.rating}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-faded">Round score</span>
            <span className="font-bold tabular-nums">{state.score}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-faded">Run total</span>
            <span className="font-bold tabular-nums">{state.totalScore}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-faded">Nutrition</span>
            <span className="tabular-nums">
              {Math.round(state.stats.nutrition)} / {npc.nutritionTarget}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-faded">Happiness</span>
            <span className="tabular-nums">
              {Math.round(state.stats.happiness)} / {npc.happinessTarget}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-faded">Budget left</span>
            <span className="tabular-nums">{formatCents(state.remainingBudgetCents)}</span>
          </div>
        </div>

        <p className="mt-2 text-center text-xs text-faded">
          Final basket:{" "}
          {state.basket
            .map((b) => `${FOOD_BY_ID[b.foodItemId]?.emoji ?? ""}×${b.quantity}`)
            .join(" ")}
        </p>

        <button
          type="button"
          onClick={onNextRound}
          className="mt-4 min-h-12 w-full rounded-xl bg-brand text-base font-bold text-white hover:bg-brand-dark"
        >
          Next round — budget gets {budgetPressureLabel(nextMultiplier).toLowerCase()}
        </button>
      </div>
    </div>
  );
}
