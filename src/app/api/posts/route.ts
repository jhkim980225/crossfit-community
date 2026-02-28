import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { postCreateSchema } from "@/lib/validations/post";
import { apiSuccess, apiError } from "@/lib/utils";
import type { PostCategory } from "@/types";

// 커서 기반 게시글 목록 조회
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const limit = 20;
    const category = searchParams.get("category") as PostCategory | null;
    const search = searchParams.get("search");

    const where: Record<string, unknown> = { isHidden: false };
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    const session = await auth();
    const userId = session?.user?.id;

    const posts = await prisma.post.findMany({
      where,
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        category: true,
        title: true,
        views: true,
        createdAt: true,
        user: { select: { id: true, nickname: true, profileImage: true, box: true, level: true } },
        _count: { select: { comments: true, likes: true } },
      },
    });

    const hasMore = posts.length > limit;
    const items = hasMore ? posts.slice(0, -1) : posts;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return NextResponse.json(
      apiSuccess({ items, nextCursor, hasMore })
    );
  } catch (error) {
    console.error("게시글 목록 조회 오류:", error);
    return NextResponse.json(apiError("SERVER_ERROR", "서버 오류가 발생했습니다"), {
      status: 500,
    });
  }
}

// 게시글 작성
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(apiError("UNAUTHORIZED", "로그인이 필요합니다"), {
        status: 401,
      });
    }

    const body = await req.json();
    const parsed = postCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        apiError("VALIDATION_ERROR", parsed.error.issues[0].message),
        { status: 400 }
      );
    }

    const post = await prisma.post.create({
      data: {
        userId: session.user.id,
        category: parsed.data.category,
        title: parsed.data.title,
        content: parsed.data.content,
        images: parsed.data.images,
      },
    });

    return NextResponse.json(apiSuccess(post), { status: 201 });
  } catch (error) {
    console.error("게시글 작성 오류:", error);
    return NextResponse.json(apiError("SERVER_ERROR", "서버 오류가 발생했습니다"), {
      status: 500,
    });
  }
}
