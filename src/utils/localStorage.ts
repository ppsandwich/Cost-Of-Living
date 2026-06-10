const KEYS = {
  highScore: "cost-of-living:high-scores",
  highestRound: "cost-of-living:highest-round",
  tutorialDismissed: "cost-of-living:tutorial-dismissed",
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

export function loadBestScore(): number {
  return readNumber(KEYS.highScore);
}

export function saveBestScore(score: number): void {
  write(KEYS.highScore, String(score));
}

export function loadHighestRound(): number {
  return readNumber(KEYS.highestRound);
}

export function saveHighestRound(round: number): void {
  write(KEYS.highestRound, String(round));
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
