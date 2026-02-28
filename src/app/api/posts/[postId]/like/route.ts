import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/utils";

interface RouteParams {
  params: Promise<{ postId: string }>;
}

// 좋아요 토글
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(apiError("UNAUTHORIZED", "로그인이 필요합니다"), {
        status: 401,
      });
    }

    const { postId } = await params;
    const userId = session.user.id;

    const existing = await prisma.like.findUnique({
      where: { postId_userId: { postId, userId } },
    });

    if (existing) {
      await prisma.like.delete({ where: { postId_userId: { postId, userId } } });
      const count = await prisma.like.count({ where: { postId } });
      return NextResponse.json(apiSuccess({ liked: false, count }));
    } else {
      await prisma.like.create({ data: { postId, userId } });
      const count = await prisma.like.count({ where: { postId } });

      // 게시글 작성자에게 알림 (본인이 좋아요 누른 경우 제외)
      const post = await prisma.post.findUnique({ where: { id: postId }, select: { userId: true } });
      if (post && post.userId !== userId) {
        await prisma.notification.create({
          data: {
            userId: post.userId,
            type: "COMMENT_ON_POST",
            message: `${session.user.nickname}님이 게시글에 좋아요를 눌렀습니다`,
            relatedId: postId,
          },
        });
      }

      return NextResponse.json(apiSuccess({ liked: true, count }));
    }
  } catch (error) {
    console.error("좋아요 오류:", error);
    return NextResponse.json(apiError("SERVER_ERROR", "서버 오류가 발생했습니다"), {
      status: 500,
    });
  }
}
