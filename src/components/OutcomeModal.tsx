import type { GameState } from "@/types/game";
import type { PowerUpId } from "@/data/powerups";
import { previewNextBudgetCents } from "@/game/reducer";
import { roundScoreBreakdown } from "@/game/scoring";
import { formatCents } from "@/utils/money";
import { PowerUpChoice } from "./PowerUps";
import { LearningReceipt } from "./LearningReceipt";
import { Dialog } from "./Dialog";
import { NPCelebration } from "./NPCAvatar";
export function OutcomeModal({
  state,
  onNextRound,
  onChoosePowerUp,
  onRetry,
}: {
  state: GameState;
  onNextRound: () => void;
  onChoosePowerUp: (id: PowerUpId) => void;
  onRetry: () => void;
}) {
  const score = roundScoreBreakdown(state);
  const mustChoose = Boolean(state.powerUpChoices?.length);
  return (
    <Dialog title="Lunch sorted!">
      <NPCelebration npc={state.npc!} />
      <p className="mt-2 text-sm">
        {state.npc!.name}&apos;s brief is covered. The trolley can relax.
      </p>
      <LearningReceipt state={state} />
      <details className="text-sm">
        <summary className="min-h-11 cursor-pointer font-bold">
          Round score: {state.score} · run total: {state.totalScore}
        </summary>
        <p>
          Brief met: {score.briefScore} · change kept:{" "}
          {score.remainingBudgetBonus} · round: {score.roundBonus}
          {state.mode === "standard_run"
            ? ` · time left: ${score.timeBonus}`
            : ". No speed bonus in learning mode."}
        </p>
      </details>
      <button className="btn min-h-11 w-full bg-paper" onClick={onRetry}>
        Try this shop again
      </button>
      <p className="mt-1 text-xs text-faded">
        Retry replaces this round’s result and returns any upgrade just chosen.
      </p>
      {mustChoose && (
        <PowerUpChoice
          choices={state.powerUpChoices!}
          onChoose={onChoosePowerUp}
        />
      )}
      {!mustChoose && (
        <p className="mt-3 text-sm">
          Next shop&apos;s budget:{" "}
          <strong>{formatCents(previewNextBudgetCents(state))}</strong>
        </p>
      )}
      <button
        disabled={mustChoose}
        onClick={onNextRound}
        className="btn mt-3 min-h-12 w-full bg-good text-white"
      >
        {mustChoose ? "Choose an upgrade to continue" : "Plan the next shop"}
      </button>
    </Dialog>
  );
}
