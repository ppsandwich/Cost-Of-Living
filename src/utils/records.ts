import { useSyncExternalStore } from "react";
import type { GameMode } from "@/types/game";
import {
  loadBestScore,
  loadHighestRound,
  loadTutorialDismissed,
  saveBestScore,
  saveHighestRound,
  saveTutorialDismissed,
} from "./localStorage";
export interface Records {
  bestScore: number;
  highestRound: number;
  tutorialDismissed: boolean;
}
const SERVER_SNAPSHOT: Records = {
  bestScore: 0,
  highestRound: 0,
  tutorialDismissed: false,
};
const snapshots: Partial<Record<GameMode, Records>> = {};
const listeners = new Set<() => void>();
function getSnapshot(mode: GameMode): Records {
  return (snapshots[mode] ??= {
    bestScore: loadBestScore(mode),
    highestRound: loadHighestRound(mode),
    tutorialDismissed: loadTutorialDismissed(),
  });
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
export function useRecords(mode: GameMode): Records {
  return useSyncExternalStore(
    subscribe,
    () => getSnapshot(mode),
    () => SERVER_SNAPSHOT,
  );
}
export function recordRunProgress(
  totalScore: number,
  successfulRounds: number,
  mode: GameMode,
): void {
  const current = getSnapshot(mode);
  const bestScore = Math.max(current.bestScore, totalScore);
  const highestRound = Math.max(current.highestRound, successfulRounds);
  if (bestScore === current.bestScore && highestRound === current.highestRound)
    return;
  snapshots[mode] = { ...current, bestScore, highestRound };
  saveBestScore(bestScore, mode);
  saveHighestRound(highestRound, mode);
  listeners.forEach((l) => l());
}
export function dismissTutorial(): void {
  saveTutorialDismissed();
  for (const mode of ["learning", "standard_run"] as const)
    snapshots[mode] = { ...getSnapshot(mode), tutorialDismissed: true };
  listeners.forEach((l) => l());
}
