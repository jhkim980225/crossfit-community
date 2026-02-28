import type { WodType } from "@/types";

// ──────────────────────────────────────────────
// 종목 라이브러리
// ──────────────────────────────────────────────

export type MovementCategory = "역도" | "체조" | "컨디셔닝" | "케틀벨" | "덤벨";

export const CATEGORY_LABELS: Record<MovementCategory, string> = {
  역도: "역도 (Weightlifting)",
  체조: "체조 (Gymnastics)",
  컨디셔닝: "컨디셔닝",
  케틀벨: "케틀벨",
  덤벨: "덤벨",
};

interface MovementDef {
  name: string;
  /** AMRAP / 고반복 기준 렙 수 */
  repsLight: number;
  /** FOR_TIME / 저반복 기준 렙 수 */
  repsHeavy: number;
  isCardio: boolean;
  cardioUnit?: string;
}

const LIBRARY: Record<MovementCategory, MovementDef[]> = {
  역도: [
    { name: "Deadlift",               repsLight: 15, repsHeavy: 10, isCardio: false },
    { name: "Back Squat",             repsLight: 15, repsHeavy: 10, isCardio: false },
    { name: "Front Squat",            repsLight: 10, repsHeavy: 5,  isCardio: false },
    { name: "Power Clean",            repsLight: 10, repsHeavy: 5,  isCardio: false },
    { name: "Hang Power Clean",       repsLight: 10, repsHeavy: 5,  isCardio: false },
    { name: "Power Snatch",           repsLight: 10, repsHeavy: 5,  isCardio: false },
    { name: "Hang Power Snatch",      repsLight: 10, repsHeavy: 5,  isCardio: false },
    { name: "Clean & Jerk",           repsLight: 10, repsHeavy: 5,  isCardio: false },
    { name: "Thruster",               repsLight: 15, repsHeavy: 9,  isCardio: false },
    { name: "Shoulder Press",         repsLight: 10, repsHeavy: 5,  isCardio: false },
    { name: "Push Press",             repsLight: 15, repsHeavy: 10, isCardio: false },
    { name: "Push Jerk",              repsLight: 10, repsHeavy: 5,  isCardio: false },
    { name: "Sumo Deadlift High Pull",repsLight: 15, repsHeavy: 10, isCardio: false },
  ],
  체조: [
    { name: "Pull-ups",              repsLight: 10, repsHeavy: 5,  isCardio: false },
    { name: "Chest-to-bar Pull-ups", repsLight: 7,  repsHeavy: 3,  isCardio: false },
    { name: "Muscle-ups",            repsLight: 5,  repsHeavy: 3,  isCardio: false },
    { name: "Ring Dips",             repsLight: 15, repsHeavy: 10, isCardio: false },
    { name: "Push-ups",              repsLight: 20, repsHeavy: 10, isCardio: false },
    { name: "Handstand Push-ups",    repsLight: 10, repsHeavy: 5,  isCardio: false },
    { name: "Handstand Walk",        repsLight: 25, repsHeavy: 25, isCardio: true, cardioUnit: "m" },
    { name: "Toes-to-Bar",           repsLight: 15, repsHeavy: 10, isCardio: false },
    { name: "Knees-to-Elbow",        repsLight: 15, repsHeavy: 10, isCardio: false },
    { name: "Box Jump",              repsLight: 20, repsHeavy: 10, isCardio: false },
    { name: "Box Step-up",           repsLight: 20, repsHeavy: 15, isCardio: false },
    { name: "Burpees",               repsLight: 15, repsHeavy: 10, isCardio: false },
    { name: "Air Squat",             repsLight: 30, repsHeavy: 20, isCardio: false },
    { name: "Lunges",                repsLight: 20, repsHeavy: 15, isCardio: false },
  ],
  컨디셔닝: [
    { name: "Run",           repsLight: 400, repsHeavy: 400, isCardio: true,  cardioUnit: "m" },
    { name: "Row",           repsLight: 500, repsHeavy: 500, isCardio: true,  cardioUnit: "m" },
    { name: "Ski Erg",       repsLight: 500, repsHeavy: 500, isCardio: true,  cardioUnit: "m" },
    { name: "Bike",          repsLight: 1000, repsHeavy: 1000, isCardio: true, cardioUnit: "m" },
    { name: "Double Unders", repsLight: 50,  repsHeavy: 50,  isCardio: false },
    { name: "Single Unders", repsLight: 100, repsHeavy: 100, isCardio: false },
  ],
  케틀벨: [
    { name: "KB Swing",        repsLight: 20, repsHeavy: 15, isCardio: false },
    { name: "KB Clean",        repsLight: 10, repsHeavy: 7,  isCardio: false },
    { name: "KB Snatch",       repsLight: 10, repsHeavy: 7,  isCardio: false },
    { name: "KB Press",        repsLight: 10, repsHeavy: 7,  isCardio: false },
    { name: "KB Goblet Squat", repsLight: 15, repsHeavy: 10, isCardio: false },
    { name: "KB Deadlift",     repsLight: 15, repsHeavy: 10, isCardio: false },
  ],
  덤벨: [
    { name: "DB Snatch",   repsLight: 10, repsHeavy: 7,  isCardio: false },
    { name: "DB Thruster", repsLight: 15, repsHeavy: 10, isCardio: false },
    { name: "DB Clean",    repsLight: 10, repsHeavy: 7,  isCardio: false },
    { name: "DB Deadlift", repsLight: 15, repsHeavy: 10, isCardio: false },
    { name: "DB Squat",    repsLight: 15, repsHeavy: 10, isCardio: false },
    { name: "DB Lunge",    repsLight: 12, repsHeavy: 8,  isCardio: false },
  ],
};

// ──────────────────────────────────────────────
// 설정 / 결과 타입
// ──────────────────────────────────────────────

export interface WodGeneratorConfig {
  type: "FOR_TIME" | "AMRAP" | "EMOM";
  durationMinutes: number;
  categories: MovementCategory[];
  movementCount: number;
}

export interface GeneratedWod {
  title: string;
  description: string;
  type: WodType;
  movements: string[];
}

// ──────────────────────────────────────────────
// 내부 유틸
// ──────────────────────────────────────────────

function pickRandom<T>(arr: T[], count: number): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, Math.min(count, arr.length));
}

function pickOne<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function fmt(m: MovementDef, reps: number): string {
  return m.isCardio ? `${m.name} ${reps}${m.cardioUnit}` : `${reps} ${m.name}`;
}

// ──────────────────────────────────────────────
// 타입별 생성 함수
// ──────────────────────────────────────────────

function buildForTime(movements: MovementDef[], timeCap: number): GeneratedWod {
  const names = movements.map((m) => m.name);

  if (movements.length === 2) {
    // 클래식 21-15-9
    const desc = [
      `For Time (Time cap: ${timeCap}min)`,
      `21-15-9`,
      ...names,
    ].join("\n");
    return { title: "For Time", description: desc, type: "FOR_TIME", movements: names };
  }

  // N rounds for time
  const rounds = pickOne([3, 4, 5]);
  const movLines = movements.map((m) => `  ${fmt(m, m.repsHeavy)}`);
  const desc = [
    `${rounds} Rounds For Time (Time cap: ${timeCap}min)`,
    ...movLines,
  ].join("\n");
  return {
    title: `${rounds} Rounds For Time`,
    description: desc,
    type: "FOR_TIME",
    movements: names,
  };
}

function buildAmrap(movements: MovementDef[], minutes: number): GeneratedWod {
  const movLines = movements.map((m) => `  ${fmt(m, m.repsLight)}`);
  const desc = [`AMRAP ${minutes}min`, ...movLines].join("\n");
  return {
    title: `AMRAP ${minutes}`,
    description: desc,
    type: "AMRAP",
    movements: movements.map((m) => m.name),
  };
}

function buildEmom(movements: MovementDef[], totalMinutes: number): GeneratedWod {
  const stations = movements.length;
  // 총 시간을 스테이션 수의 배수로 맞춤
  const rounds = Math.max(1, Math.floor(totalMinutes / stations));
  const actual = rounds * stations;

  let desc: string;

  if (stations === 2) {
    desc = [
      `EMOM ${actual}min`,
      `홀수 분: ${fmt(movements[0], movements[0].repsLight)}`,
      `짝수 분: ${fmt(movements[1], movements[1].repsLight)}`,
    ].join("\n");
  } else {
    const stationLines = movements.map(
      (m, i) => `  ${i + 1}분: ${fmt(m, m.repsLight)}`
    );
    desc = [
      `EMOM ${actual}min (${stations}분 구성 × ${rounds}라운드)`,
      ...stationLines,
    ].join("\n");
  }

  return {
    title: `EMOM ${actual}`,
    description: desc,
    type: "EMOM",
    movements: movements.map((m) => m.name),
  };
}

// ──────────────────────────────────────────────
// 메인 생성 함수
// ──────────────────────────────────────────────

export function generateWod(config: WodGeneratorConfig): GeneratedWod {
  const { type, durationMinutes, categories, movementCount } = config;

  // 선택된 카테고리에서 풀 합치기
  const pool = categories.flatMap((cat) => LIBRARY[cat]);
  if (pool.length === 0) {
    throw new Error("카테고리에서 종목을 찾을 수 없습니다");
  }

  const picked = pickRandom(pool, movementCount);

  switch (type) {
    case "FOR_TIME": return buildForTime(picked, durationMinutes);
    case "AMRAP":    return buildAmrap(picked, durationMinutes);
    case "EMOM":     return buildEmom(picked, durationMinutes);
  }
}

/** 카테고리별 사용 가능한 종목 이름 목록 (UI 미리보기용) */
export function getMovementNames(categories: MovementCategory[]): string[] {
  return [...new Set(categories.flatMap((c) => LIBRARY[c].map((m) => m.name)))];
}
