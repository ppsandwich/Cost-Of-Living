import { useEffect, useState } from "react";
import type { GameState } from "@/types/game";
import { FOOD_BY_ID } from "@/data/foodItems";
import { WIN_MESSAGES } from "@/data/flavourText";
import { previewNextBudgetCents } from "@/game/reducer";
import { formatCents } from "@/utils/money";

const STRIKE_MS = 450; // strike draws across the old budget
const PAUSE_MS = 150; // strike lifts
const COUNT_MS = 900; // number falls to the new budget — 1.5s all told

/** Old budget gets struck through, then counts down to the new one. */
function BudgetCountdown({ fromCents, toCents }: { fromCents: number; toCents: number }) {
  // Reduced-motion users get the final number straight away
  const [reducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const [phase, setPhase] = useState<"strike" | "count">(reducedMotion ? "count" : "strike");
  const [displayCents, setDisplayCents] = useState(reducedMotion ? toCents : fromCents);

  useEffect(() => {
    if (reducedMotion) return;
    const unstrike = setTimeout(() => setPhase("count"), STRIKE_MS + PAUSE_MS);
    return () => clearTimeout(unstrike);
  }, [reducedMotion]);

  useEffect(() => {
    if (phase !== "count" || displayCents === toCents) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / COUNT_MS);
      const eased = 1 - (1 - t) * (1 - t);
      setDisplayCents(Math.round(fromCents + (toCents - fromCents) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  return (
    <span className="relative inline-block tabular-nums">
      {formatCents(displayCents)}
      {phase === "strike" && (
        <span
          aria-hidden
          className="strike-line absolute left-0 top-1/2 h-[3px] -translate-y-1/2 rounded bg-current"
        />
      )}
    </span>
  );
}

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
  const nextBudgetCents = previewNextBudgetCents(state);

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

        <div className="mt-4 rounded-xl border-2 border-dashed border-ink/30 bg-receipt p-3 text-sm font-bold leading-relaxed">
          <div className="flex justify-between">
            <span className="text-faded">ROUND SCORE</span>
            <span className="tabular-nums">{state.score}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-faded">RUN TOTAL</span>
            <span className="tabular-nums">{state.totalScore}</span>
          </div>
        </div>

        <p className="mt-2 text-center text-2xl" aria-label="Final basket">
          {state.basket
            .map((b) => (FOOD_BY_ID[b.foodItemId]?.emoji ?? "").repeat(b.quantity))
            .join(" ")}
        </p>

        <button
          type="button"
          onClick={onNextRound}
          className="btn mt-4 min-h-13 w-full bg-brand py-2.5 text-base uppercase text-white"
        >
          Next round:{" "}
          <BudgetCountdown fromCents={state.roundBudgetCents} toCents={nextBudgetCents} /> budget
        </button>
      </div>
    </div>
  );
}
