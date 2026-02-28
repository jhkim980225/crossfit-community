export const LIFT_MOVEMENTS = [
  "Back Squat",
  "Front Squat",
  "Overhead Squat",
  "Deadlift",
  "Clean & Jerk",
  "Snatch",
  "Bench Press",
  "Overhead Press",
  "Clean",
  "Push Jerk",
  "Thruster",
] as const;

export const BENCHMARK_WODS = [
  "Fran",
  "Murph",
  "Grace",
  "Diane",
  "Helen",
  "Jackie",
  "Annie",
  "Isabel",
  "Karen",
  "Fight Gone Bad",
] as const;

export type LiftMovement = (typeof LIFT_MOVEMENTS)[number];
export type BenchmarkWod = (typeof BENCHMARK_WODS)[number];

export const ALL_MOVEMENTS = [...LIFT_MOVEMENTS, ...BENCHMARK_WODS];

export function isLift(movement: string): boolean {
  return LIFT_MOVEMENTS.includes(movement as LiftMovement);
}

// 리프트는 kg, 벤치마크 WOD는 시간(초) 기준
export function getMovementUnit(movement: string): string {
  return isLift(movement) ? "kg" : "초";
}

// 리프트는 높을수록, 벤치마크는 낮을수록(시간이 짧을수록) 좋음
export function isBetterRecord(
  movement: string,
  newValue: number,
  existingValue: number
): boolean {
  return isLift(movement) ? newValue > existingValue : newValue < existingValue;
}

// 초 → mm:ss 변환 (예: 630 → "10:30")
export function formatSeconds(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.round(totalSeconds % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

// mm:ss → 초 변환 (예: "10:30" → 630), 실패 시 NaN 반환
export function parseTimeInput(input: string): number {
  const parts = input.split(":");
  if (parts.length !== 2) return NaN;
  const minutes = parseInt(parts[0], 10);
  const seconds = parseInt(parts[1], 10);
  if (isNaN(minutes) || isNaN(seconds) || seconds >= 60 || minutes < 0) return NaN;
  return minutes * 60 + seconds;
}
