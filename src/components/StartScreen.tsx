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
  "Tick all three of their shopping list: two wants, one hard no.",
  "Red items are things they can't eat — the till refuses them.",
  "Don't overload calories, fat, sugar, carbs or salt — that's fatal.",
  "Meters full and list ticked? The basket checks out on its own.",
];

export function StartScreen({
  bestScore,
  highestRound,
  showTutorial,
  onDismissTutorial,
  onStart,
}: StartScreenProps) {
  return (
    <main className="sunburst mx-auto grid min-h-dvh max-w-md place-items-center px-4 py-8">
      <div className="w-full text-center">
        {/* Shop sign */}
        <div className="panel relative mx-auto max-w-xs bg-brand px-4 pb-5 pt-6">
          <div className="absolute inset-x-0 -top-0.5">
            <div className="awning-scallops h-2.5" />
          </div>
          <p aria-hidden className="text-5xl drop-shadow-[2px_2px_0_rgba(51,36,28,0.4)]">
            🛒
          </p>
          <h1 className="mt-1 font-display text-4xl uppercase leading-none tracking-wide text-receipt [text-shadow:3px_3px_0_var(--color-ink)]">
            Cost of
            <br />
            Living
          </h1>
          <div className="sticker mx-auto mt-3 inline-block rounded-lg bg-good px-3 py-1 font-display text-sm uppercase tracking-widest text-white">
            Open 90 sec
          </div>
        </div>

        <p className="mx-auto mt-4 max-w-xs text-sm font-bold text-ink/70">
          A supermarket survival game about budgets, trade-offs, and snacks with consequences.
        </p>

        {showTutorial && (
          <div className="panel mt-5 p-4 text-left">
            <h2 className="font-display text-sm uppercase tracking-wider text-brand">
              How to play
            </h2>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm font-semibold">
              {TUTORIAL_STEPS.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <p className="mt-3 border-t-2 border-dashed border-ink/20 pt-2 text-xs font-semibold italic text-faded">
              {TUTORIAL_COPY}
            </p>
            <button
              type="button"
              onClick={onDismissTutorial}
              className="btn mt-3 min-h-11 w-full bg-paper text-sm"
            >
              Got it, don&apos;t show again
            </button>
          </div>
        )}

        {(bestScore > 0 || highestRound > 0) && (
          <p className="mt-4 font-pixel text-xl text-faded">
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
        <p className="mt-3 text-[11px] font-bold text-faded">
          A satirical game about constrained choices. Not nutrition advice.
        </p>
      </div>
    </main>
  );
}
