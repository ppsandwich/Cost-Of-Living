import { DishPlate } from "./DishPlate";
import type { GameState } from "@/types/game";
import type { PowerUpId } from "@/data/powerups";
import { previewNextBudgetCents } from "@/game/reducer";
import { formatCents } from "@/utils/money";
import { PowerUpChoice } from "./PowerUps";
import { LearningReceipt } from "./LearningReceipt";
import { Dialog } from "./Dialog";
import { NPCAvatar } from "./NPCAvatar";

export function OutcomeModal({
  state, onNextRound, onChoosePowerUp,
}: {
  state: GameState;
  onNextRound: () => void;
  onChoosePowerUp: (id: PowerUpId) => void;
}) {
  const mustChoose = Boolean(state.powerUpChoices?.length);
  return (
    <Dialog compact title="Lunch sorted!" portrait={<NPCAvatar npc={state.npc!} compact happy />}>
      <p className="result-score">
        <span aria-hidden className="star-pop">✨</span> {state.npc!.name} · +{state.score} points · Total {state.totalScore}
      </p>
      <DishPlate state={state} />
      <LearningReceipt state={state} compact />
      {mustChoose ? (
        <PowerUpChoice compact choices={state.powerUpChoices!} onChoose={onChoosePowerUp} />
      ) : (
        <p className="my-2 text-sm font-bold">Next budget: {formatCents(previewNextBudgetCents(state))}</p>
      )}
      <button disabled={mustChoose} onClick={onNextRound} className="btn mt-3 min-h-11 w-full bg-good text-sm text-white">
        Next shop
      </button>
    </Dialog>
  );
}
