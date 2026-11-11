const STEPS_MS = [500, 2000, 8000];

export function backoffMs(attempt) {
  return STEPS_MS[Math.min(attempt, STEPS_MS.length) - 1];
}
