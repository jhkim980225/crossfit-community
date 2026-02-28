import { z } from "zod";

const postCategories = ["FREE", "QUESTION", "CERTIFICATION", "INFO"] as const;

export const postCreateSchema = z.object({
  category: z.enum(postCategories, { error: "카테고리를 선택해주세요" }),
  title: z
    .string()
    .min(1, "제목을 입력해주세요")
    .max(200, "제목은 200자까지 입력 가능합니다"),
  content: z
    .string()
    .min(1, "내용을 입력해주세요")
    .max(10000, "내용은 10000자까지 입력 가능합니다"),
  images: z
    .array(z.string())
    .max(5, "이미지는 최대 5장까지 업로드 가능합니다"),
});

export const commentCreateSchema = z.object({
  content: z
    .string()
    .min(1, "내용을 입력해주세요")
    .max(1000, "댓글은 1000자까지 입력 가능합니다"),
  parentId: z.string().optional(),
});

export const reportSchema = z.object({
  reason: z
    .string()
    .min(1, "신고 사유를 입력해주세요")
    .max(500, "신고 사유는 500자까지 입력 가능합니다"),
});

export type PostCreateInput = z.infer<typeof postCreateSchema>;
export type CommentCreateInput = z.infer<typeof commentCreateSchema>;
export type ReportInput = z.infer<typeof reportSchema>;
