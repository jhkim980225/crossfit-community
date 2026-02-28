import type { UserPublic } from "./user";

export type WodType = "FOR_TIME" | "AMRAP" | "EMOM" | "ONE_RM" | "TABATA" | "OTHER";
export type RxScaled = "RX" | "SCALED";

export interface WOD {
  id: string;
  title: string;
  description: string;
  type: WodType;
  movements: string[];
  date: Date;
  createdById: string;
  createdAt: Date;
}

export interface WODResult {
  id: string;
  wodId: string;
  userId: string;
  score: string;
  rxOrScaled: RxScaled;
  memo: string | null;
  createdAt: Date;
  user?: UserPublic;
}

export interface WODWithResults extends WOD {
  results: WODResult[];
}

export interface WODRankingEntry {
  rank: number;
  user: UserPublic;
  score: string;
  rxOrScaled: RxScaled;
  memo: string | null;
  createdAt: Date;
}
