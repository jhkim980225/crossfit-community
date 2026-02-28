import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/utils";
import { z } from "zod";

const moderateSchema = z.object({
  postId: z.string().optional(),
  commentId: z.string().optional(),
  action: z.enum(["hide", "unhide", "delete"]),
});

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json(apiError("FORBIDDEN", "권한이 없습니다"), { status: 403 });
    }

    const body = await req.json();
    const parsed = moderateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(apiError("VALIDATION_ERROR", parsed.error.issues[0].message), { status: 400 });
    }

    const { postId, commentId, action } = parsed.data;

    if (postId) {
      if (action === "delete") {
        await prisma.post.delete({ where: { id: postId } });
      } else {
        await prisma.post.update({
          where: { id: postId },
          data: { isHidden: action === "hide" },
        });
      }
    } else if (commentId) {
      if (action === "delete") {
        await prisma.comment.delete({ where: { id: commentId } });
      } else {
        await prisma.comment.update({
          where: { id: commentId },
          data: { isHidden: action === "hide" },
        });
      }
    }

    return NextResponse.json(apiSuccess({ ok: true }));
  } catch (error) {
    console.error("게시글 관리 오류:", error);
    return NextResponse.json(apiError("SERVER_ERROR", "서버 오류가 발생했습니다"), { status: 500 });
  }
}
