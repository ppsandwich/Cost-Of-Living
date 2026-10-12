import type { GameState } from "@/types/game";
import { FINAL_ROUND } from "@/game/progression";
import { POWER_UP_STOPS, shopForRound } from "@/game/shops";

export function Journey({ state }: { state: GameState }) {
  const start = Math.floor((state.roundNumber - 1) / 5) * 5 + 1;
  const stops = Array.from({ length: 5 }, (_, i) => start + i);
  const nextGift = state.powerUpsEnabled ? POWER_UP_STOPS.find((n) => n >= state.roundNumber) : undefined;
  return (
    <section className="journey" aria-label="Your neighbourhood journey">
      <div className="flex items-center justify-between gap-2 text-xs font-bold">
        <span>Lunch trail · {state.successfulRounds} sorted</span>
        <span>{nextGift ? `🎁 Stop ${nextGift}` : "🏁 Stop 20"}</span>
      </div>
      <ol className="journey-stops">
        {stops.map((round) => {
          const done = state.roundHistory.some((r) => r.roundNumber === round);
          const skipped = round < state.roundNumber && !done;
          return <li key={round} className={done ? "stop-done" : round === state.roundNumber ? "stop-current" : ""} aria-current={round === state.roundNumber ? "step" : undefined}>
            <span className="stop-icon" aria-hidden>{done ? "✓" : skipped ? "↷" : round === FINAL_ROUND ? "🏁" : shopForRound(round).icon}</span>
            <span>{round}{(state.powerUpsEnabled && POWER_UP_STOPS.includes(round)) && <span aria-hidden> ✦</span>}</span>
            <span className="sr-only">{done ? ": lunch completed" : skipped ? ": skipped" : `: ${shopForRound(round).name}`}{(state.powerUpsEnabled && POWER_UP_STOPS.includes(round)) ? ", power-up stop" : ""}</span>
          </li>;
        })}
      </ol>
      <progress className="journey-progress" value={state.successfulRounds} max={FINAL_ROUND} aria-label={`${state.successfulRounds} lunches sorted out of ${FINAL_ROUND}`} />
    </section>
  );
}
