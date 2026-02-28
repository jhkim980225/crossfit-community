import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/utils";
import { z } from "zod";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json(apiError("FORBIDDEN", "권한이 없습니다"), { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "PENDING";

    const reports = await prisma.report.findMany({
      where: { status: status as "PENDING" | "RESOLVED" | "DISMISSED" },
      include: {
        reporter: { select: { nickname: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(apiSuccess(reports));
  } catch (error) {
    console.error("신고 목록 조회 오류:", error);
    return NextResponse.json(apiError("SERVER_ERROR", "서버 오류가 발생했습니다"), { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json(apiError("FORBIDDEN", "권한이 없습니다"), { status: 403 });
    }

    const schema = z.object({
      reportId: z.string(),
      status: z.enum(["RESOLVED", "DISMISSED"]),
    });

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(apiError("VALIDATION_ERROR", parsed.error.issues[0].message), { status: 400 });
    }

    const report = await prisma.report.update({
      where: { id: parsed.data.reportId },
      data: { status: parsed.data.status },
    });

    return NextResponse.json(apiSuccess(report));
  } catch (error) {
    console.error("신고 처리 오류:", error);
    return NextResponse.json(apiError("SERVER_ERROR", "서버 오류가 발생했습니다"), { status: 500 });
  }
}
