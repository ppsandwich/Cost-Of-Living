import type { GameState } from "@/types/game";
import { FOOD_BY_ID } from "@/data/foodItems";
import { DEATH_MESSAGES, LOSS_MESSAGES, RUN_SUMMARY_LINES } from "@/data/flavourText";

export function RunSummary({ state, onReplay }: { state: GameState; onReplay: () => void }) {
  const npc = state.npc!;
  const reasonLine =
    state.endReason === "npc_died" && state.diedFromStat
      ? DEATH_MESSAGES[state.diedFromStat]?.(npc.name) ?? `${npc.name} didn't make it.`
      : LOSS_MESSAGES[state.endReason ?? "timer_expired"];
  const summaryLine = RUN_SUMMARY_LINES[state.successfulRounds % RUN_SUMMARY_LINES.length](
    state.successfulRounds
  );
  const isNewBest = state.totalScore > 0 && state.totalScore >= state.bestScore;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Run over"
      className="fixed inset-0 z-50 grid place-items-center bg-ink/70 p-4"
    >
      <div className="panel max-h-[90vh] w-full max-w-sm overflow-y-auto p-5">
        <div className="text-center">
          <div className="sticker mx-auto inline-block rounded-lg bg-ink px-4 py-1.5 font-display text-xl uppercase tracking-widest text-receipt">
            Sorry, we&apos;re closed
          </div>
          <div aria-hidden className="mt-3 text-5xl grayscale">
            {npc.emoji}
          </div>
          <h2 className="mt-1 font-display text-3xl uppercase tracking-wide text-brand">
            Game over
          </h2>
          <p className="mt-2 text-sm font-semibold">{reasonLine}</p>
          <p className="mt-1 text-sm font-semibold text-faded">{summaryLine}</p>
        </div>

        <div className="mt-4 rounded-xl border-2 border-dashed border-ink/30 bg-receipt p-3 font-pixel text-xl leading-snug">
          <div className="flex justify-between">
            <span className="text-faded">ROUNDS SURVIVED</span>
            <span className="tabular-nums">{state.successfulRounds}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-faded">NPCS HELPED</span>
            <span className="tabular-nums">{state.successfulRounds}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-faded">FINAL NPC</span>
            <span>{npc.name.toUpperCase()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-faded">RUN SCORE</span>
            <span className="tabular-nums">
              {state.totalScore}
              {isNewBest && " ★BEST"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-faded">BEST SCORE</span>
            <span className="tabular-nums">{Math.max(state.bestScore, state.totalScore)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-faded">HIGHEST ROUND</span>
            <span className="tabular-nums">
              {Math.max(state.highestRound, state.successfulRounds)}
            </span>
          </div>
        </div>

        {state.roundHistory.length > 0 && (
          <div className="mt-3">
            <h3 className="text-center font-pixel text-lg uppercase tracking-widest text-faded">
              ··· receipts ···
            </h3>
            <ul className="mt-1 space-y-0.5 font-pixel text-lg leading-snug text-faded">
              {state.roundHistory.map((r) => (
                <li key={r.roundNumber} className="flex justify-between gap-2">
                  <span className="truncate">
                    R{r.roundNumber} {r.npcName.toUpperCase()} — {r.rating.toUpperCase()}
                  </span>
                  <span className="tabular-nums">{r.score}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {state.basket.length > 0 && (
          <p className="mt-2 text-center text-lg" aria-label="Final basket">
            {state.basket
              .map((b) => `${FOOD_BY_ID[b.foodItemId]?.emoji ?? ""}×${b.quantity}`)
              .join(" ")}
          </p>
        )}

        <button
          type="button"
          onClick={onReplay}
          className="btn mt-4 min-h-13 w-full bg-brand py-2.5 text-base uppercase text-white"
        >
          Run it back
        </button>
      </div>
    </div>
  );
}
