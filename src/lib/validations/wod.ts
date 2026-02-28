import { z } from "zod";

const wodTypes = ["FOR_TIME", "AMRAP", "EMOM", "ONE_RM", "TABATA", "OTHER"] as const;

export const wodCreateSchema = z.object({
  title: z.string().min(1, "WOD 이름을 입력해주세요").max(100),
  description: z.string().min(1, "설명을 입력해주세요"),
  type: z.enum(wodTypes, { error: "WOD 타입을 선택해주세요" }),
  movements: z.array(z.string().min(1)).min(1, "운동 종목을 하나 이상 입력해주세요"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "날짜 형식이 올바르지 않습니다"),
});

export const wodResultSchema = z.object({
  score: z.string().min(1, "점수를 입력해주세요"),
  rxOrScaled: z.enum(["RX", "SCALED"]),
  memo: z.string().max(500, "메모는 500자까지 입력 가능합니다").optional(),
});

export type WodCreateInput = z.infer<typeof wodCreateSchema>;
export type WodResultInput = z.infer<typeof wodResultSchema>;
