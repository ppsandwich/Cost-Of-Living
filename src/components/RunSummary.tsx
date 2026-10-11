import type { GameState } from "@/types/game";
import { LearningReceipt } from "./LearningReceipt";
import { Dialog } from "./Dialog";
import { NPCelebration } from "./NPCAvatar";
export function RunSummary({
  state,
  won = false,
  onReplay,
  onRetry,
}: {
  state: GameState;
  won?: boolean;
  onReplay: () => void;
  onRetry: () => void;
}) {
  return (
    <Dialog title={won ? "Final lunch sorted!" : "The shop has closed"}>
      <NPCelebration npc={state.npc!} won={won} />
      <p className="mt-2 text-sm">
        {won
          ? "You reached the end of the shopping challenge."
          : "Time ran out. Your receipt can help you plan another attempt."}
      </p>
      <LearningReceipt state={state} />
      <p className="text-sm font-bold">
        {state.successfulRounds} briefs completed · {state.totalScore} points ·{" "}
        {state.mode === "learning" ? "Learning" : "Timed"} mode
      </p>
      <button
        onClick={onRetry}
        className="btn mt-4 min-h-12 w-full bg-good text-white"
      >
        Try this shop again
      </button>
      <button onClick={onReplay} className="btn mt-2 min-h-11 w-full bg-paper">
        Start a new run
      </button>
    </Dialog>
  );
}
