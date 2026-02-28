import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/utils";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ prId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(apiError("UNAUTHORIZED", "로그인이 필요합니다"), {
        status: 401,
      });
    }

    const { prId } = await params;

    const pr = await prisma.pR.findUnique({ where: { id: prId } });
    if (!pr) {
      return NextResponse.json(apiError("NOT_FOUND", "기록을 찾을 수 없습니다"), {
        status: 404,
      });
    }

    // 본인 기록 또는 관리자만 삭제 가능
    if (pr.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(apiError("FORBIDDEN", "삭제 권한이 없습니다"), {
        status: 403,
      });
    }

    await prisma.pR.delete({ where: { id: prId } });

    return NextResponse.json(apiSuccess(null));
  } catch (error) {
    console.error("PR 삭제 오류:", error);
    return NextResponse.json(apiError("SERVER_ERROR", "서버 오류가 발생했습니다"), {
      status: 500,
    });
  }
}
