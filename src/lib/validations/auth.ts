import { z } from "zod";

export const registerSchema = z.object({
  email: z.email("올바른 이메일 형식이 아닙니다"),
  password: z
    .string()
    .min(8, "비밀번호는 최소 8자 이상이어야 합니다")
    .regex(
      /^(?=.*[a-zA-Z])(?=.*\d)/,
      "비밀번호는 영문자와 숫자를 포함해야 합니다"
    ),
  name: z.string().min(2, "이름은 최소 2자 이상이어야 합니다"),
  nickname: z
    .string()
    .min(2, "닉네임은 최소 2자 이상이어야 합니다")
    .max(20, "닉네임은 최대 20자까지 가능합니다")
    .regex(/^[a-zA-Z0-9가-힣_]+$/, "닉네임은 한글, 영문, 숫자, 밑줄만 사용 가능합니다"),
  box: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.email("올바른 이메일 형식이 아닙니다"),
  password: z.string().min(1, "비밀번호를 입력해주세요"),
});

export const profileUpdateSchema = z.object({
  nickname: z
    .string()
    .min(2, "닉네임은 최소 2자 이상이어야 합니다")
    .max(20, "닉네임은 최대 20자까지 가능합니다")
    .regex(/^[a-zA-Z0-9가-힣_]+$/, "닉네임은 한글, 영문, 숫자, 밑줄만 사용 가능합니다")
    .optional(),
  box: z.string().optional(),
  experience: z.number().int().min(0).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
