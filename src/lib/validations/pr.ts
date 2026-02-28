import { z } from "zod";

export const prCreateSchema = z.object({
  movement: z.string().min(1, "종목을 선택해주세요"),
  value: z.number().positive("기록 값은 0보다 커야 합니다"),
  unit: z.string(),
  memo: z.string().max(300, "메모는 300자까지 입력 가능합니다").optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "날짜 형식이 올바르지 않습니다"),
});

export type PrCreateInput = z.infer<typeof prCreateSchema>;
