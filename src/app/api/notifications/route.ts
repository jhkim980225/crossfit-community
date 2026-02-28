import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/utils";

// 알림 목록 조회
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(apiError("UNAUTHORIZED", "로그인이 필요합니다"), { status: 401 });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: session.user.id, isRead: false },
    });

    return NextResponse.json(apiSuccess({ notifications, unreadCount }));
  } catch (error) {
    console.error("알림 조회 오류:", error);
    return NextResponse.json(apiError("SERVER_ERROR", "서버 오류가 발생했습니다"), { status: 500 });
  }
}

// 알림 전체 읽음 처리
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(apiError("UNAUTHORIZED", "로그인이 필요합니다"), { status: 401 });
    }

    await prisma.notification.updateMany({
      where: { userId: session.user.id, isRead: false },
      data: { isRead: true },
    });

    return NextResponse.json(apiSuccess({ ok: true }));
  } catch (error) {
    console.error("알림 읽음 처리 오류:", error);
    return NextResponse.json(apiError("SERVER_ERROR", "서버 오류가 발생했습니다"), { status: 500 });
  }
}
