import { useSyncExternalStore } from "react";
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

const SERVER_SNAPSHOT: Records = { bestScore: 0, highestRound: 0, tutorialDismissed: false };

let snapshot: Records | null = null;
const listeners = new Set<() => void>();

function getSnapshot(): Records {
  if (snapshot === null) {
    snapshot = {
      bestScore: loadBestScore(),
      highestRound: loadHighestRound(),
      tutorialDismissed: loadTutorialDismissed(),
    };
  }
  return snapshot;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useRecords(): Records {
  return useSyncExternalStore(subscribe, getSnapshot, () => SERVER_SNAPSHOT);
}

export function recordRunProgress(totalScore: number, successfulRounds: number): void {
  const current = getSnapshot();
  const bestScore = Math.max(current.bestScore, totalScore);
  const highestRound = Math.max(current.highestRound, successfulRounds);
  if (bestScore === current.bestScore && highestRound === current.highestRound) return;
  snapshot = { ...current, bestScore, highestRound };
  saveBestScore(bestScore);
  saveHighestRound(highestRound);
  listeners.forEach((l) => l());
}

export function dismissTutorial(): void {
  const current = getSnapshot();
  if (current.tutorialDismissed) return;
  snapshot = { ...current, tutorialDismissed: true };
  saveTutorialDismissed();
  listeners.forEach((l) => l());
}
