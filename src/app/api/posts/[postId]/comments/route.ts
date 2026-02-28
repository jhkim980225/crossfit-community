import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { commentCreateSchema } from "@/lib/validations/post";
import { apiSuccess, apiError } from "@/lib/utils";

interface RouteParams {
  params: Promise<{ postId: string }>;
}

// 댓글 목록 조회
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { postId } = await params;

    const comments = await prisma.comment.findMany({
      where: { postId, parentId: null, isHidden: false },
      include: {
        user: { select: { id: true, nickname: true, profileImage: true, box: true, level: true } },
        replies: {
          where: { isHidden: false },
          include: {
            user: { select: { id: true, nickname: true, profileImage: true, box: true, level: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(apiSuccess(comments));
  } catch (error) {
    console.error("댓글 조회 오류:", error);
    return NextResponse.json(apiError("SERVER_ERROR", "서버 오류가 발생했습니다"), {
      status: 500,
    });
  }
}

// 댓글 작성
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(apiError("UNAUTHORIZED", "로그인이 필요합니다"), {
        status: 401,
      });
    }

    const { postId } = await params;
    const body = await req.json();
    const parsed = commentCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        apiError("VALIDATION_ERROR", parsed.error.issues[0].message),
        { status: 400 }
      );
    }

    const { content, parentId } = parsed.data;

    const comment = await prisma.comment.create({
      data: {
        postId,
        userId: session.user.id,
        content,
        parentId: parentId || null,
      },
      include: {
        user: { select: { id: true, nickname: true, profileImage: true, box: true, level: true } },
      },
    });

    // 게시글 작성자에게 댓글 알림
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true },
    });

    if (post && post.userId !== session.user.id) {
      await prisma.notification.create({
        data: {
          userId: post.userId,
          type: "COMMENT_ON_POST",
          message: `${session.user.nickname}님이 댓글을 남겼습니다: "${content.slice(0, 30)}${content.length > 30 ? "..." : ""}"`,
          relatedId: postId,
        },
      });
    }

    // 대댓글인 경우 원댓글 작성자에게 알림
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
        select: { userId: true },
      });

      if (parentComment && parentComment.userId !== session.user.id) {
        await prisma.notification.create({
          data: {
            userId: parentComment.userId,
            type: "REPLY_ON_COMMENT",
            message: `${session.user.nickname}님이 대댓글을 남겼습니다: "${content.slice(0, 30)}${content.length > 30 ? "..." : ""}"`,
            relatedId: postId,
          },
        });
      }
    }

    return NextResponse.json(apiSuccess(comment), { status: 201 });
  } catch (error) {
    console.error("댓글 작성 오류:", error);
    return NextResponse.json(apiError("SERVER_ERROR", "서버 오류가 발생했습니다"), {
      status: 500,
    });
  }
}
