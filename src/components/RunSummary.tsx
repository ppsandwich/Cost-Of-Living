import type { GameState } from "@/types/game";
import { PowerUpCard } from "./PowerUps";

export function RunSummary({ state, onReplay }: { state: GameState; onReplay: () => void }) {
  const npc = state.npc!;
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
            Time&apos;s Up
          </h2>
        </div>

        <div className="mt-4 rounded-xl border-2 border-dashed border-ink/30 bg-receipt p-3 text-sm font-bold leading-relaxed">
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

        <button
          type="button"
          onClick={onReplay}
          className="btn mt-4 min-h-13 w-full bg-brand py-2.5 text-base uppercase text-white"
        >
          Play again
        </button>

        {state.powerUps.length > 0 && (
          <div className="mt-4">
            <h3 className="text-center text-sm font-bold uppercase tracking-widest text-faded">
              Power-ups collected
            </h3>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {state.powerUps.map((id) => (
                <PowerUpCard key={id} powerUpId={id} size="medium" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
