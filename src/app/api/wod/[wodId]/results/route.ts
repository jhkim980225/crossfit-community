import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { wodResultSchema } from "@/lib/validations/wod";
import { apiSuccess, apiError } from "@/lib/utils";
import { compareScores } from "@/lib/wod-score";
import type { WodType } from "@/types";

interface RouteParams {
  params: Promise<{ wodId: string }>;
}

// WOD 랭킹 조회 (오프셋 기반 페이지네이션)
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { wodId } = await params;
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 20;
    const skip = (page - 1) * limit;
    const gender = searchParams.get("gender");
    const rxFilter = searchParams.get("rx");

    const wod = await prisma.wOD.findUnique({ where: { id: wodId } });
    if (!wod) {
      return NextResponse.json(apiError("NOT_FOUND", "WOD를 찾을 수 없습니다"), {
        status: 404,
      });
    }

    const whereClause: Record<string, unknown> = { wodId };
    if (rxFilter) whereClause.rxOrScaled = rxFilter;

    const [results, total] = await Promise.all([
      prisma.wODResult.findMany({
        where: whereClause,
        include: {
          user: {
            select: { id: true, nickname: true, profileImage: true, box: true, level: true },
          },
        },
        skip,
        take: limit,
      }),
      prisma.wODResult.count({ where: whereClause }),
    ]);

    // 서버에서 정렬 (WOD 타입별)
    const sorted = results.sort((a, b) =>
      compareScores(a.score, b.score, wod.type as WodType)
    );

    const ranked = sorted.map((r, index) => ({
      rank: skip + index + 1,
      ...r,
    }));

    return NextResponse.json(
      apiSuccess({
        results: ranked,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        wodType: wod.type,
      })
    );
  } catch (error) {
    console.error("랭킹 조회 오류:", error);
    return NextResponse.json(apiError("SERVER_ERROR", "서버 오류가 발생했습니다"), {
      status: 500,
    });
  }
}

// WOD 결과 기록
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(apiError("UNAUTHORIZED", "로그인이 필요합니다"), {
        status: 401,
      });
    }

    const { wodId } = await params;
    const body = await req.json();
    const parsed = wodResultSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        apiError("VALIDATION_ERROR", parsed.error.issues[0].message),
        { status: 400 }
      );
    }

    const wod = await prisma.wOD.findUnique({ where: { id: wodId } });
    if (!wod) {
      return NextResponse.json(apiError("NOT_FOUND", "WOD를 찾을 수 없습니다"), {
        status: 404,
      });
    }

    const result = await prisma.wODResult.upsert({
      where: {
        wodId_userId: { wodId, userId: session.user.id },
      },
      update: {
        score: parsed.data.score,
        rxOrScaled: parsed.data.rxOrScaled,
        memo: parsed.data.memo || null,
      },
      create: {
        wodId,
        userId: session.user.id,
        score: parsed.data.score,
        rxOrScaled: parsed.data.rxOrScaled,
        memo: parsed.data.memo || null,
      },
    });

    return NextResponse.json(apiSuccess(result), { status: 201 });
  } catch (error) {
    console.error("WOD 결과 기록 오류:", error);
    return NextResponse.json(apiError("SERVER_ERROR", "서버 오류가 발생했습니다"), {
      status: 500,
    });
  }
}
