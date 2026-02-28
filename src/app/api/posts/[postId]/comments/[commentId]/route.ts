import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/utils";

interface RouteParams {
  params: Promise<{ postId: string; commentId: string }>;
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(apiError("UNAUTHORIZED", "로그인이 필요합니다"), {
        status: 401,
      });
    }

    const { commentId } = await params;

    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) {
      return NextResponse.json(apiError("NOT_FOUND", "댓글을 찾을 수 없습니다"), {
        status: 404,
      });
    }

    if (comment.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(apiError("FORBIDDEN", "삭제 권한이 없습니다"), {
        status: 403,
      });
    }

    // parentId가 없는 댓글(원댓글) 삭제 시 대댓글도 cascade 삭제
    await prisma.comment.delete({ where: { id: commentId } });

    return NextResponse.json(apiSuccess(null));
  } catch (error) {
    console.error("댓글 삭제 오류:", error);
    return NextResponse.json(apiError("SERVER_ERROR", "서버 오류가 발생했습니다"), {
      status: 500,
    });
  }
}
