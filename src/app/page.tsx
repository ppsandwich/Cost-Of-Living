"use client";

import { useEffect, useReducer } from "react";
import { gameReducer, INITIAL_STATE } from "@/game/reducer";
import { dismissTutorial, recordRunProgress, useRecords } from "@/utils/records";
import { StatusBar } from "@/components/StatusBar";
import { StatsPanel } from "@/components/StatsPanel";
import { NPCPanel } from "@/components/NPCPanel";
import { StoreList } from "@/components/StoreList";
import { BasketDrawer } from "@/components/BasketDrawer";
import { OutcomeModal } from "@/components/OutcomeModal";
import { RunSummary } from "@/components/RunSummary";
import { StartScreen } from "@/components/StartScreen";

export default function Home() {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);
  const records = useRecords();

  // Round countdown
  useEffect(() => {
    if (state.status !== "playing") return;
    const interval = setInterval(() => dispatch({ type: "TICK" }), 1000);
    return () => clearInterval(interval);
  }, [state.status, state.roundNumber]);

  // Persist records (external system) whenever a round resolves
  useEffect(() => {
    if (state.status !== "round_won" && state.status !== "lost") return;
    recordRunProgress(state.totalScore, state.successfulRounds);
  }, [state.status, state.totalScore, state.successfulRounds]);

  const startRun = () =>
    dispatch({
      type: "START_RUN",
      seed: Date.now() % 2147483647,
      bestScore: records.bestScore,
      highestRound: records.highestRound,
    });

  if (state.status === "idle" || !state.npc) {
    return (
      <StartScreen
        bestScore={records.bestScore}
        highestRound={records.highestRound}
        showTutorial={!records.tutorialDismissed}
        onDismissTutorial={dismissTutorial}
        onStart={startRun}
      />
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <StatusBar
        npc={state.npc}
        roundNumber={state.roundNumber}
        budgetMultiplier={state.budgetMultiplier}
        remainingBudgetCents={state.remainingBudgetCents}
        timeRemainingSeconds={state.timeRemainingSeconds}
      />

      <main className="mx-auto w-full max-w-md flex-1 px-3 pb-3 pt-2 lg:grid lg:max-w-6xl lg:grid-cols-[320px_1fr_340px] lg:items-start lg:gap-4">
        <div className="space-y-2 lg:sticky lg:top-16">
          <NPCPanel npc={state.npc} roundBudgetCents={state.roundBudgetCents} />
          <StatsPanel stats={state.stats} npc={state.npc} />
          <p
            aria-live="polite"
            className="min-h-5 px-1 text-xs italic text-faded"
          >
            {state.lastFeedback}
          </p>
        </div>

        {/* pb-28 keeps the last food card clear of the fixed mobile drawer */}
        <div className="mt-2 pb-28 lg:mt-0 lg:pb-0">
          <StoreList
            inventory={state.inventory}
            basket={state.basket}
            npc={state.npc}
            remainingBudgetCents={state.remainingBudgetCents}
            onAdd={(foodItemId) => dispatch({ type: "ADD_ITEM", foodItemId })}
          />
        </div>

        <div className="fixed inset-x-0 bottom-0 z-30 lg:sticky lg:top-16">
          <BasketDrawer
            basket={state.basket}
            stats={state.stats}
            npc={state.npc}
            roundBudgetCents={state.roundBudgetCents}
            remainingBudgetCents={state.remainingBudgetCents}
            onRemove={(foodItemId) => dispatch({ type: "REMOVE_ITEM", foodItemId })}
            onAdd={(foodItemId) => dispatch({ type: "ADD_ITEM", foodItemId })}
            onSubmit={() => dispatch({ type: "SUBMIT" })}
          />
        </div>
      </main>

      {state.status === "round_won" && (
        <OutcomeModal state={state} onNextRound={() => dispatch({ type: "NEXT_ROUND" })} />
      )}
      {state.status === "lost" && <RunSummary state={state} onReplay={startRun} />}
    </div>
  );
}
