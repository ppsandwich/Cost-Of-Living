import { useEffect, useState } from "react";
import type { GameState } from "@/types/game";
import { FOOD_BY_ID } from "@/data/foodItems";
import { WIN_MESSAGES } from "@/data/flavourText";
import { previewNextBudgetCents } from "@/game/reducer";
import { ratingStars, roundScoreBreakdown } from "@/game/scoring";
import type { PowerUpId } from "@/data/powerups";
import { POWER_UPS } from "@/data/powerups";
import { PowerUpChoice } from "./PowerUps";
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
  onChoosePowerUp,
}: {
  state: GameState;
  onNextRound: () => void;
  onChoosePowerUp: (id: PowerUpId) => void;
}) {
  const mustChoose = state.powerUpChoices !== null && state.powerUpChoices.length > 0;
  const [scoreOpen, setScoreOpen] = useState(false);
  // JS-driven star reveal so the one-by-one entry works even where CSS
  // animations are disabled (e.g. reduced-motion systems)
  const totalStars = state.roundHistory.length
    ? ratingStars(state.roundHistory[state.roundHistory.length - 1].rating)
    : 0;
  const [shownStars, setShownStars] = useState(0);
  useEffect(() => {
    if (shownStars >= totalStars) return;
    const timer = setTimeout(() => setShownStars((n) => n + 1), shownStars === 0 ? 350 : 380);
    return () => clearTimeout(timer);
  }, [shownStars, totalStars]);
  const breakdown = roundScoreBreakdown({
    stats: state.stats,
    npc: state.npc!,
    basket: state.basket,
    remainingBudgetCents: state.remainingBudgetCents,
    timeRemainingSeconds: state.timeRemainingSeconds,
    roundNumber: state.roundNumber,
  });
  const poolExhausted = POWER_UPS.every((p) => state.powerUps.includes(p.id));
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
      <div className="panel relative w-full max-w-sm overflow-hidden p-5">
        <div aria-hidden className="sunburst-spin round-clear-burst absolute" />
        <div className="relative">
        <div className="text-center">
          <div aria-hidden className="text-5xl">
            {npc.emoji}
          </div>
          <h2 className="wobble mt-1 font-title text-3xl tracking-wide text-good">
            Round clear!
          </h2>
          <p className="mt-2 text-sm font-semibold">{winLine}</p>
          {lastResult && (
            <div className="sticker mx-auto mt-3 inline-block rounded-lg bg-tag px-3 py-1 text-center font-display text-sm uppercase">
              <div
                aria-label={`${ratingStars(lastResult.rating)} of 3 stars`}
                className="text-base leading-none"
              >
                {Array.from({ length: ratingStars(lastResult.rating) }, (_, i) => (
                  <span
                    key={i}
                    aria-hidden
                    className={i < shownStars ? "star-pop" : "invisible"}
                  >
                    ★
                  </span>
                ))}
                <span aria-hidden className="text-ink/40">
                  {"☆".repeat(3 - ratingStars(lastResult.rating))}
                </span>
              </div>
              {lastResult.rating}
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
          <button
            type="button"
            onClick={() => setScoreOpen((o) => !o)}
            aria-expanded={scoreOpen}
            className="mt-1 flex w-full items-center justify-between text-xs font-bold uppercase tracking-wide text-faded hover:text-ink"
          >
            How was this scored?
            <span aria-hidden>{scoreOpen ? "▲" : "▼"}</span>
          </button>
          {scoreOpen && (
            <div className="mt-2 space-y-0.5 border-t border-dashed border-ink/25 pt-2 text-xs font-semibold">
              <div className="flex justify-between gap-2">
                <span>
                  Nutrition <span className="text-faded">(capped at 1.5× target)</span>
                </span>
                <span className="tabular-nums">+{breakdown.nutritionScore}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span>
                  Happiness <span className="text-faded">(capped at 1.5× target)</span>
                </span>
                <span className="tabular-nums">+{breakdown.happinessScore}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span>
                  Change left <span className="text-faded">($1 = 5 pts)</span>
                </span>
                <span className="tabular-nums">+{breakdown.remainingBudgetBonus}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span>
                  Time left <span className="text-faded">(1 per second)</span>
                </span>
                <span className="tabular-nums">+{breakdown.timeBonus}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span>
                  Variety <span className="text-faded">(8 × {breakdown.categoryCount} aisles)</span>
                </span>
                <span className="tabular-nums">+{breakdown.varietyBonus}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span>
                  Round bonus <span className="text-faded">(25 × round {state.roundNumber})</span>
                </span>
                <span className="tabular-nums">+{breakdown.roundBonus}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span>
                  Danger penalty{" "}
                  <span className="text-faded">(−15 × {breakdown.warningCount} warnings)</span>
                </span>
                <span className={`tabular-nums ${breakdown.dangerPenalty > 0 ? "text-danger" : ""}`}>
                  −{breakdown.dangerPenalty}
                </span>
              </div>
              <div className="flex justify-between gap-2 border-t border-dashed border-ink/25 pt-1 font-bold">
                <span>Total</span>
                <span className="tabular-nums">{breakdown.total}</span>
              </div>
            </div>
          )}
        </div>

        <p className="mt-2 text-center text-2xl" aria-label="Final basket">
          {state.basket
            .map((b) => (FOOD_BY_ID[b.foodItemId]?.emoji ?? "").repeat(b.quantity))
            .join(" ")}
        </p>

        {mustChoose && (
          <PowerUpChoice choices={state.powerUpChoices!} onChoose={onChoosePowerUp} />
        )}
        {poolExhausted && (
          <div className="mt-4 text-center">
            <h3 className="font-display text-sm uppercase tracking-wider text-brand">
              Pick a power-up
            </h3>
            <p className="sticker mx-auto mt-2 inline-block rounded-lg bg-faded px-3 py-1 font-display text-sm uppercase text-white">
              Out of stock
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={onNextRound}
          disabled={mustChoose}
          className="btn font-knewave mt-4 min-h-13 w-full bg-brand py-2.5 text-base uppercase text-white"
        >
          {mustChoose ? (
            "Pick a power-up first"
          ) : (
            <>
              Next round:{" "}
              <BudgetCountdown
                key={nextBudgetCents}
                fromCents={state.roundBudgetCents}
                toCents={nextBudgetCents}
              />{" "}
              budget
            </>
          )}
        </button>
        </div>
      </div>
    </div>
  );
}
