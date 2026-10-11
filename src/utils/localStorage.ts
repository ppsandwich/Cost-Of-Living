import type { GameMode } from "@/types/game";
const KEYS = {
  highScore: "cost-of-living:v2:high-scores",
  highestRound: "cost-of-living:v2:highest-round",
  tutorialDismissed: "cost-of-living:v2:tutorial-dismissed",
} as const;

function readNumber(key: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(key);
    const value = raw ? Number(raw) : 0;
    return Number.isFinite(value) ? value : 0;
  } catch {
    return 0;
  }
}

function write(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage unavailable (private mode, etc.) — scores just won't persist
  }
}

export function loadBestScore(mode: GameMode = "learning"): number {
  return readNumber(`${KEYS.highScore}:${mode}`);
}

export function saveBestScore(
  score: number,
  mode: GameMode = "learning",
): void {
  write(`${KEYS.highScore}:${mode}`, String(score));
}

export function loadHighestRound(mode: GameMode = "learning"): number {
  return readNumber(`${KEYS.highestRound}:${mode}`);
}

export function saveHighestRound(
  round: number,
  mode: GameMode = "learning",
): void {
  write(`${KEYS.highestRound}:${mode}`, String(round));
}

export function loadTutorialDismissed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(KEYS.tutorialDismissed) === "1";
  } catch {
    return false;
  }
}

export function saveTutorialDismissed(): void {
  write(KEYS.tutorialDismissed, "1");
}
