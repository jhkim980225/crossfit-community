import type { WodType } from "@/types";

// WOD 타입별 스코어 포맷 변환
export function formatScore(score: string, type: WodType): string {
  switch (type) {
    case "FOR_TIME":
      return formatTime(score);
    case "AMRAP":
      return `${score} rds+reps`;
    case "ONE_RM":
      return `${score} kg`;
    default:
      return score;
  }
}

// "초" 단위 숫자를 mm:ss 형식으로 변환
function formatTime(score: string): string {
  const seconds = parseInt(score, 10);
  if (isNaN(seconds)) return score;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// WOD 타입별 정렬 비교 함수 (양수면 a가 뒤로, 음수면 a가 앞으로)
export function compareScores(a: string, b: string, type: WodType): number {
  const aVal = parseScoreValue(a, type);
  const bVal = parseScoreValue(b, type);

  switch (type) {
    // 시간이 짧을수록 상위 (오름차순)
    case "FOR_TIME":
      return aVal - bVal;
    // 많을수록 상위 (내림차순)
    case "AMRAP":
    case "ONE_RM":
    case "EMOM":
    case "TABATA":
    case "OTHER":
      return bVal - aVal;
  }
}

function parseScoreValue(score: string, type: WodType): number {
  if (type === "AMRAP") {
    // "5+12" 형식 (5라운드 12렙) → 점수화
    const [rounds, reps] = score.split("+").map(Number);
    return (rounds || 0) * 1000 + (reps || 0);
  }
  return parseFloat(score) || 0;
}

// WOD 타입 한글 표시
export function getWodTypeLabel(type: WodType): string {
  const labels: Record<WodType, string> = {
    FOR_TIME: "For Time",
    AMRAP: "AMRAP",
    EMOM: "EMOM",
    ONE_RM: "1RM",
    TABATA: "Tabata",
    OTHER: "기타",
  };
  return labels[type];
}

// WOD 타입별 점수 입력 placeholder
export function getScorePlaceholder(type: WodType): string {
  switch (type) {
    case "FOR_TIME":
      return "완료 시간 (초, 예: 600)";
    case "AMRAP":
      return "라운드+렙 (예: 5+12)";
    case "ONE_RM":
      return "무게 (kg, 예: 100)";
    case "EMOM":
      return "완료 라운드 (예: 20)";
    case "TABATA":
      return "총 렙 수 (예: 80)";
    default:
      return "점수 입력";
  }
}
