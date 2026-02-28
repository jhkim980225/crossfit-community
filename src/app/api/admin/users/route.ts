import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/utils";
import { z } from "zod";

const updateUserSchema = z.object({
  userId: z.string(),
  action: z.enum(["setLevel", "setRole", "block", "unblock"]),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "RX", "RX_PLUS"]).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json(apiError("FORBIDDEN", "권한이 없습니다"), { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 20;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          email: true,
          nickname: true,
          level: true,
          role: true,
          isBlocked: true,
          createdAt: true,
          _count: { select: { posts: true, wodResults: true } },
        },
      }),
      prisma.user.count(),
    ]);

    return NextResponse.json(
      apiSuccess({ users, total, page, totalPages: Math.ceil(total / limit) })
    );
  } catch (error) {
    console.error("회원 목록 조회 오류:", error);
    return NextResponse.json(apiError("SERVER_ERROR", "서버 오류가 발생했습니다"), { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json(apiError("FORBIDDEN", "권한이 없습니다"), { status: 403 });
    }

    const body = await req.json();
    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(apiError("VALIDATION_ERROR", parsed.error.issues[0].message), { status: 400 });
    }

    const { userId, action, level } = parsed.data;

    let updateData: Record<string, unknown> = {};
    if (action === "setLevel" && level) updateData = { level };
    if (action === "block") updateData = { isBlocked: true };
    if (action === "unblock") updateData = { isBlocked: false };

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, nickname: true, level: true, isBlocked: true },
    });

    return NextResponse.json(apiSuccess(user));
  } catch (error) {
    console.error("회원 수정 오류:", error);
    return NextResponse.json(apiError("SERVER_ERROR", "서버 오류가 발생했습니다"), { status: 500 });
  }
}
