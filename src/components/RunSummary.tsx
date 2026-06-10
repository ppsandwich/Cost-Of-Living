import type { GameState } from "@/types/game";
import { FOOD_BY_ID } from "@/data/foodItems";
import { DEATH_MESSAGES, LOSS_MESSAGES, RUN_SUMMARY_LINES } from "@/data/flavourText";

export function RunSummary({ state, onReplay }: { state: GameState; onReplay: () => void }) {
  const npc = state.npc!;
  const reasonLine =
    state.endReason === "npc_died" && state.diedFromStat
      ? DEATH_MESSAGES[state.diedFromStat]?.(npc.name) ?? `${npc.name} didn't make it.`
      : LOSS_MESSAGES[state.endReason ?? "submitted_failed"];
  const summaryLine = RUN_SUMMARY_LINES[state.successfulRounds % RUN_SUMMARY_LINES.length](
    state.successfulRounds
  );
  const isNewBest = state.totalScore > 0 && state.totalScore >= state.bestScore;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Run over"
      className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4"
    >
      <div className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-2xl border-2 border-ink/10 bg-receipt p-5 shadow-xl">
        <div className="text-center">
          <div aria-hidden className="text-4xl grayscale">
            {npc.emoji}
          </div>
          <h2 className="mt-1 text-xl font-bold">Game over</h2>
          <p className="mt-2 text-sm">{reasonLine}</p>
          <p className="mt-1 text-sm text-faded">{summaryLine}</p>
        </div>

        <div className="mt-4 rounded-xl border border-dashed border-ink/20 p-3 font-mono text-sm">
          <div className="flex justify-between">
            <span className="text-faded">Rounds survived</span>
            <span className="font-bold tabular-nums">{state.successfulRounds}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-faded">NPCs helped</span>
            <span className="tabular-nums">{state.successfulRounds}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-faded">Final NPC</span>
            <span>{npc.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-faded">Run score</span>
            <span className="font-bold tabular-nums">
              {state.totalScore}
              {isNewBest && " ★ best"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-faded">Best score</span>
            <span className="tabular-nums">{Math.max(state.bestScore, state.totalScore)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-faded">Highest round</span>
            <span className="tabular-nums">
              {Math.max(state.highestRound, state.successfulRounds)}
            </span>
          </div>
        </div>

        {state.roundHistory.length > 0 && (
          <div className="mt-3">
            <h3 className="text-xs font-bold uppercase tracking-wide text-faded">Receipts</h3>
            <ul className="mt-1 space-y-0.5 font-mono text-xs text-faded">
              {state.roundHistory.map((r) => (
                <li key={r.roundNumber} className="flex justify-between">
                  <span>
                    R{r.roundNumber} {r.npcName} — {r.rating}
                  </span>
                  <span className="tabular-nums">{r.score}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {state.basket.length > 0 && (
          <p className="mt-2 text-center text-xs text-faded">
            Final basket:{" "}
            {state.basket
              .map((b) => `${FOOD_BY_ID[b.foodItemId]?.emoji ?? ""}×${b.quantity}`)
              .join(" ")}
          </p>
        )}

        <button
          type="button"
          onClick={onReplay}
          className="mt-4 min-h-12 w-full rounded-xl bg-brand text-base font-bold text-white hover:bg-brand-dark"
        >
          Run it back
        </button>
      </div>
    </div>
  );
}
