import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { prCreateSchema } from "@/lib/validations/pr";
import { apiSuccess, apiError } from "@/lib/utils";
import { isLift, isBetterRecord, formatSeconds } from "@/lib/pr-movements";

// 내 PR 목록 조회 (종목별 최고 기록 + 히스토리)
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(apiError("UNAUTHORIZED", "로그인이 필요합니다"), {
        status: 401,
      });
    }

    const { searchParams } = new URL(req.url);
    const movement = searchParams.get("movement");

    if (movement) {
      // 특정 종목 히스토리
      const history = await prisma.pR.findMany({
        where: { userId: session.user.id, movement },
        orderBy: { date: "asc" },
      });
      return NextResponse.json(apiSuccess(history));
    }

    // 전체 종목별 최고 기록
    const allPRs = await prisma.pR.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "desc" },
    });

    // 종목별 최고 기록 집계 (리프트: 높을수록, 벤치마크: 낮을수록 좋음)
    const bestByMovement = new Map<string, (typeof allPRs)[0]>();
    for (const pr of allPRs) {
      if (!bestByMovement.has(pr.movement)) {
        bestByMovement.set(pr.movement, pr);
      } else {
        const current = bestByMovement.get(pr.movement)!;
        if (isBetterRecord(pr.movement, pr.value, current.value)) {
          bestByMovement.set(pr.movement, pr);
        }
      }
    }

    return NextResponse.json(apiSuccess(Array.from(bestByMovement.values())));
  } catch (error) {
    console.error("PR 조회 오류:", error);
    return NextResponse.json(apiError("SERVER_ERROR", "서버 오류가 발생했습니다"), {
      status: 500,
    });
  }
}

// PR 기록
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(apiError("UNAUTHORIZED", "로그인이 필요합니다"), {
        status: 401,
      });
    }

    const body = await req.json();
    const parsed = prCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        apiError("VALIDATION_ERROR", parsed.error.issues[0].message),
        { status: 400 }
      );
    }

    const { movement, value, unit, memo, date } = parsed.data;

    // 이전 최고 기록 확인 — 리프트: 내림차순(최대값), 벤치마크: 오름차순(최소값)
    const previousBest = await prisma.pR.findFirst({
      where: { userId: session.user.id, movement },
      orderBy: { value: isLift(movement) ? "desc" : "asc" },
    });

    const newPR = await prisma.pR.create({
      data: {
        userId: session.user.id,
        movement,
        value,
        unit,
        memo: memo || null,
        date: new Date(date),
      },
    });

    const isPRBroken = !previousBest || isBetterRecord(movement, value, previousBest.value);

    // PR 갱신 시 알림 생성
    if (isPRBroken) {
      const displayValue = isLift(movement) ? `${value}${unit}` : formatSeconds(value);
      await prisma.notification.create({
        data: {
          userId: session.user.id,
          type: "PR_ACHIEVED",
          message: `${movement} PR 갱신! ${displayValue}`,
          relatedId: newPR.id,
        },
      });
    }

    return NextResponse.json(apiSuccess({ pr: newPR, isPRBroken }), { status: 201 });
  } catch (error) {
    console.error("PR 기록 오류:", error);
    return NextResponse.json(apiError("SERVER_ERROR", "서버 오류가 발생했습니다"), {
      status: 500,
    });
  }
}
