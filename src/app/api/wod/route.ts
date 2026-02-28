import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { wodCreateSchema } from "@/lib/validations/wod";
import { apiSuccess, apiError } from "@/lib/utils";

// WOD 목록 조회 (최근 날짜순)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 10;
    const skip = (page - 1) * limit;

    const [wods, total] = await Promise.all([
      prisma.wOD.findMany({
        orderBy: { date: "desc" },
        skip,
        take: limit,
        include: {
          creator: { select: { nickname: true } },
          _count: { select: { results: true } },
        },
      }),
      prisma.wOD.count(),
    ]);

    return NextResponse.json(
      apiSuccess({ wods, total, page, totalPages: Math.ceil(total / limit) })
    );
  } catch (error) {
    console.error("WOD 목록 조회 오류:", error);
    return NextResponse.json(apiError("SERVER_ERROR", "서버 오류가 발생했습니다"), {
      status: 500,
    });
  }
}

// WOD 생성 (관리자 전용)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(apiError("FORBIDDEN", "관리자만 WOD를 등록할 수 있습니다"), {
        status: 403,
      });
    }

    const body = await req.json();
    const parsed = wodCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        apiError("VALIDATION_ERROR", parsed.error.issues[0].message),
        { status: 400 }
      );
    }

    const { title, description, type, movements, date } = parsed.data;

    const wod = await prisma.wOD.create({
      data: {
        title,
        description,
        type,
        movements,
        date: new Date(date),
        createdById: session.user.id,
      },
    });

    return NextResponse.json(apiSuccess(wod), { status: 201 });
  } catch (error: unknown) {
    // 날짜 중복 시 (@@unique 제약)
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        apiError("DATE_EXISTS", "해당 날짜에 이미 WOD가 등록되어 있습니다"),
        { status: 409 }
      );
    }
    console.error("WOD 생성 오류:", error);
    return NextResponse.json(apiError("SERVER_ERROR", "서버 오류가 발생했습니다"), {
      status: 500,
    });
  }
}
