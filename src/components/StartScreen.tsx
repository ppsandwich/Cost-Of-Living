import { TUTORIAL_COPY } from "@/data/flavourText";

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
  "Don't overload calories, fat, sugar, carbs or salt — that's fatal.",
  "Stay within budget. Running out of money ends the round.",
  "Submit when both goals are met.",
  "Win, and the next round's budget shrinks. Forever.",
];

export function StartScreen({
  bestScore,
  highestRound,
  showTutorial,
  onDismissTutorial,
  onStart,
}: StartScreenProps) {
  return (
    <main className="mx-auto grid min-h-dvh max-w-md place-items-center px-4 py-8">
      <div className="w-full text-center">
        <p aria-hidden className="text-5xl">
          🛒
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">
          Cost of <span className="text-brand">Living</span>
        </h1>
        <p className="mt-2 text-sm text-faded">
          A supermarket survival game about budgets, trade-offs, and snacks with consequences.
        </p>

        {showTutorial && (
          <div className="mt-5 rounded-2xl border-2 border-ink/10 bg-receipt p-4 text-left">
            <h2 className="text-xs font-bold uppercase tracking-wide text-faded">How to play</h2>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
              {TUTORIAL_STEPS.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <p className="mt-3 border-t border-dashed border-ink/15 pt-2 text-xs italic text-faded">
              {TUTORIAL_COPY}
            </p>
            <button
              type="button"
              onClick={onDismissTutorial}
              className="mt-2 min-h-11 w-full rounded-lg border-2 border-ink/15 text-sm font-medium hover:bg-ink/5"
            >
              Got it, don&apos;t show again
            </button>
          </div>
        )}

        {(bestScore > 0 || highestRound > 0) && (
          <p className="mt-4 font-mono text-sm text-faded">
            Best score {bestScore} · Highest round {highestRound}
          </p>
        )}

        <button
          type="button"
          onClick={onStart}
          className="mt-5 min-h-14 w-full rounded-2xl bg-brand text-lg font-bold text-white shadow-md hover:bg-brand-dark"
        >
          Start shopping
        </button>
        <p className="mt-3 text-[11px] text-faded">
          A satirical game about constrained choices. Not nutrition advice.
        </p>
      </div>
    </main>
  );
}
