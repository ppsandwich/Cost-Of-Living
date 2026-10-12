import { RoundSolution } from "./RoundSolution";
import { DishPlate } from "./DishPlate";
import type { GameState } from "@/types/game";
import { LearningReceipt } from "./LearningReceipt";
import { Dialog } from "./Dialog";
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
  return (
    <Dialog compact title={won ? "Final lunch sorted!" : "Time’s up!"} portrait={<NPCAvatar npc={state.npc!} compact happy={won} />}>
      <p className="mt-2 text-sm">
        {won
          ? "You finished all 20 rounds!"
          : state.allowRetries ? "Time ran out. See one way to meet every need, then try again." : "Time ran out. Here’s one way to meet every need within budget."}
      </p>
      {won && <DishPlate state={state} />}
      {won ? <LearningReceipt state={state} compact /> : <RoundSolution state={state} />}
      <p className="text-sm font-bold">
        {state.successfulRounds} lunches sorted · {state.totalScore} points ·{" "}
        {state.mode === "learning" ? "Learning" : "Timed"} mode
      </p>
      {!won && state.allowRetries && <button
        onClick={() => onRetry()}
        className="btn mt-4 min-h-12 w-full bg-good text-white"
      >
        Try this shop again
      </button>}
      <button onClick={onReplay} className="btn mt-2 min-h-11 w-full bg-paper">
        Start a new game
      </button>
    </Dialog>
  );
}
