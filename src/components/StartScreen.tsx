import { useState } from "react";
import type { GameMode } from "@/types/game";
import { GAME_VERSION_LABEL } from "@/game/version";

interface StartScreenProps {
  bestScore: number;
  highestRound: number;
  showTutorial: boolean;
  onDismissTutorial: () => void;
  onStart: () => void;
  mode: GameMode;
  onModeChange: (mode: GameMode) => void;
}

const TUTORIAL_STEPS = [
  "Check the lunch list: a base (like bread or rice), a protein food (like beans or eggs), fruit or veg, and two food wishes.",
  "Check which foods to avoid and what kitchen equipment they have.",
  "Look at prices before you shop. Guess your total if you like.",
  "Tick off the whole checklist without going over budget, then check out.",
  "Check your receipt for a money-saving tip. Try again or pick a power-up.",
  "Finish round 20 to win the challenge.",
];

export function StartScreen({
  bestScore,
  highestRound,
  showTutorial,
  onDismissTutorial,
  onStart,
  mode,
  onModeChange,
}: StartScreenProps) {
  // null = follow the saved preference; true/false = user toggled this visit
  const [tutorialOpen, setTutorialOpen] = useState<boolean | null>(null);
  const open = tutorialOpen ?? showTutorial;

  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden px-4 py-8">
      <div aria-hidden className="sunburst-spin absolute inset-[-75%]" />
      <div className="relative w-full max-w-md text-center">
        {/* Shop sign */}
        <div className="panel relative mx-auto max-w-xs bg-brand px-4 pb-5 pt-6">
          <div className="absolute inset-x-0 -top-0.5">
            <div className="awning-scallops h-2.5" />
          </div>
          <div aria-hidden className="title-cart-fire">
            <span className="cart-flame cart-flame-back">🔥</span>
            <span className="cart-flame cart-flame-main">🔥</span>
            <span className="cart-flame cart-flame-side">🔥</span>
            <span className="cart-spark cart-spark-one">✦</span>
            <span className="cart-spark cart-spark-two">✦</span>
            <span className="cart-spark cart-spark-three">✦</span>
            <span className="title-cart-icon">🛒</span>
          </div>
          <h1 className="mt-1 font-title text-5xl font-bold leading-none text-brand [text-shadow:2px_2px_0_rgba(51,36,28,0.35)]">
            Cost of
            <br />
            <span className="font-knewave">Living</span>
          </h1>
        </div>

        <p className="mx-auto mt-4 max-w-xs text-sm font-bold text-ink/70">
          Plan a lunch. Make the budget work. Keep the person in mind.
        </p>

        {open && (
          <div className="panel mt-5 p-4 text-left">
            <h2 className="font-display text-sm uppercase tracking-wider text-brand">
              How to play
            </h2>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm font-semibold">
              {TUTORIAL_STEPS.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <button
              type="button"
              onClick={() => {
                onDismissTutorial();
                setTutorialOpen(false);
              }}
              className="btn mt-3 min-h-11 w-full bg-paper text-sm"
            >
              {showTutorial ? "Got it, don't show again" : "Close"}
            </button>
          </div>
        )}

        {(bestScore > 0 || highestRound > 0) && (
          <p className="mt-4 text-sm font-bold text-faded">
            {mode === "learning" ? "LEARNING" : "TIMED"} BEST {bestScore} · LUNCHES
            SORTED {highestRound}
          </p>
        )}

        <fieldset className="panel mt-5 space-y-2 p-3 text-left">
          <legend className="px-2 font-display">Choose your shop</legend>
          {(["learning", "standard_run"] as const).map((option) => (
            <label
              key={option}
              className="flex min-h-12 cursor-pointer items-start gap-3 rounded-lg p-2"
            >
              <input
                type="radio"
                name="mode"
                value={option}
                checked={mode === option}
                onChange={() => onModeChange(option)}
                className="mt-1 size-5 shrink-0"
              />
              <span className="text-sm">
                <strong>
                  {option === "learning" ? "Learning mode" : "Timed challenge"}
                </strong>
                <span className="block text-xs text-faded">
                  {option === "learning"
                    ? "No timer. Take your time and change your basket freely."
                    : "Look first, then shop in 90 seconds. Putting an item back costs three seconds."}
                </span>
              </span>
            </label>
          ))}
        </fieldset>
        <button
          type="button"
          onClick={onStart}
          className="btn font-knewave mt-5 min-h-14 w-full bg-good text-xl uppercase tracking-wide text-white"
        >
          Plan my first shop
        </button>

        {!open && (
          <button
            type="button"
            onClick={() => setTutorialOpen(true)}
            className="btn mt-3 min-h-11 w-full bg-paper text-sm uppercase"
          >
            How to play
          </button>
        )}

        <p className="mt-3 text-[12.7px] font-bold text-faded">
          Practise spending, saving and comparing prices. The prices are made up,
          and this game does not show how much you need to eat.
        </p>
        <p className="mt-1.5 text-[12.7px] font-bold text-faded">
          A game by{" "}
          <a
            href="https://sandwich.codes"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-dotted underline-offset-2 hover:text-brand"
          >
            sandwich.codes
          </a>
        </p>
        <p className="mt-1 text-[11.5px] font-bold text-faded">
          {GAME_VERSION_LABEL}
        </p>
      </div>
    </main>
  );
}
