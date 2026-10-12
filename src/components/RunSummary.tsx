import { DishPlate } from "./DishPlate";
import type { GameState } from "@/types/game";
import { LearningReceipt } from "./LearningReceipt";
import { Dialog } from "./Dialog";
import { findSaving } from "@/game/feedback";
import { formatCents } from "@/utils/money";
import { NPCAvatar } from "./NPCAvatar";
export function RunSummary({
  state,
  won = false,
  onReplay,
  onRetry,
}: {
  state: GameState;
  won?: boolean;
  onReplay: () => void;
  onRetry: (challenge?: boolean) => void;
}) {
  const saving = won ? findSaving(state) : null;
  return (
    <Dialog compact title={won ? "Final lunch sorted!" : "Time’s up!"} portrait={<NPCAvatar npc={state.npc!} compact happy={won} />}>
      <p className="mt-2 text-sm">
        {won
          ? "You finished all 20 rounds!"
          : "Time ran out. Check your receipt and have another go."}
      </p>
      {won && <DishPlate state={state} />}
      <LearningReceipt state={state} compact />
      <p className="text-sm font-bold">
        {state.successfulRounds} lunches sorted · {state.totalScore} points ·{" "}
        {state.mode === "learning" ? "Learning" : "Timed"} mode
      </p>
      <button
        onClick={() => onRetry(Boolean(saving))}
        className="btn mt-4 min-h-12 w-full bg-good text-white"
      >
        {saving ? `Try again: save ${formatCents(saving.savings)}` : "Try this shop again"}
      </button>
      <button onClick={onReplay} className="btn mt-2 min-h-11 w-full bg-paper">
        Start a new game
      </button>
    </Dialog>
  );
}
