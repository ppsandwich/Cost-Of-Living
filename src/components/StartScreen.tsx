import { useState } from "react";

interface StartScreenProps {
  bestScore: number;
  highestRound: number;
  showTutorial: boolean;
  onDismissTutorial: () => void;
  onStart: () => void;
}

const TUTORIAL_STEPS = [
  "Meet the NPC. They have needs, tastes, and a budget.",
  "Fill the nutrition and happiness meters before time runs out.",
  "Tick off their must-haves: two wants and one hard no.",
  "Greyed-out items are things they can't eat — the till refuses them.",
  "Going over a calorie/fat/sugar/carb/salt limit locks the till — trim the basket before time runs out, or it ends badly.",
  "Check out unlocks once everything is met and the budget balances. Win, and the next budget shrinks.",
  "Clear round 20 and you win the game.",
];

export function StartScreen({
  bestScore,
  highestRound,
  showTutorial,
  onDismissTutorial,
  onStart,
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
            Living
          </h1>
        </div>

        <p className="mx-auto mt-4 max-w-xs text-sm font-bold text-ink/70">
          A supermarket survival game about budgets, trade-offs, and snacks with consequences.
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
            HI-SCORE {bestScore} · BEST ROUND {highestRound}
          </p>
        )}

        <button
          type="button"
          onClick={onStart}
          className="btn mt-5 min-h-14 w-full bg-good text-xl uppercase tracking-wide text-white"
        >
          Start shopping
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
          A satirical game about constrained choices. Not nutrition advice.
        </p>
        <p className="mt-1.5 text-[12.7px] font-bold text-faded">
          This game is a hallucination by{" "}
          <a
            href="https://sandwich.codes"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-dotted underline-offset-2 hover:text-brand"
          >
            sandwich.codes
          </a>
        </p>
      </div>
    </main>
  );
}
