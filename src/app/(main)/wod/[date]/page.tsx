import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { WodCard } from "@/components/wod/WodCard";
import { WodResultForm } from "@/components/wod/WodResultForm";
import { WodRankingTable } from "@/components/wod/WodRankingTable";
import { compareScores } from "@/lib/wod-score";
import { formatDate } from "@/lib/utils";
import type { WodType, RxScaled } from "@/types";

interface PageProps {
  params: Promise<{ date: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { date } = await params;
  return { title: `WOD ${date}` };
}

export default async function WodDatePage({ params }: PageProps) {
  const { date } = await params;
  const session = await auth();

  // YYYY-MM-DD 형식 검증
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    notFound();
  }

  const wod = await prisma.wOD.findFirst({
    where: {
      date: {
        gte: new Date(`${date}T00:00:00.000Z`),
        lt: new Date(`${date}T23:59:59.999Z`),
      },
    },
    include: {
      _count: { select: { results: true } },
    },
  });

  if (!wod) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">
          {formatDate(date)}에 등록된 WOD가 없습니다
        </p>
      </div>
    );
  }

  // 내 결과 조회
  const myResult = session?.user
    ? await prisma.wODResult.findUnique({
        where: { wodId_userId: { wodId: wod.id, userId: session.user.id } },
      })
    : null;

  // 상위 10개 랭킹 미리 보기 (WOD 타입에 맞게 정렬 후 상위 10개 추출)
  const allResults = await prisma.wODResult.findMany({
    where: { wodId: wod.id },
    include: {
      user: { select: { id: true, nickname: true, profileImage: true, box: true, level: true } },
    },
  });

  const topResults = allResults
    .sort((a, b) => compareScores(a.score, b.score, wod.type as WodType))
    .slice(0, 10);

  return (
    <div className="space-y-8">
      <WodCard wod={{ ...wod, type: wod.type as WodType }} />

      {session?.user && (
        <WodResultForm
          wodId={wod.id}
          wodType={wod.type as WodType}
          existingResult={
            myResult
              ? {
                  score: myResult.score,
                  rxOrScaled: myResult.rxOrScaled as RxScaled,
                  memo: myResult.memo ?? undefined,
                }
              : undefined
          }
        />
      )}

      <WodRankingTable
        results={topResults.map((r) => ({
          ...r,
          rxOrScaled: r.rxOrScaled as RxScaled,
          user: {
            ...r.user,
            level: r.user.level as import("@/types").UserLevel,
          },
        }))}
        wodType={wod.type as WodType}
        totalCount={wod._count.results}
        wodDate={date}
      />
    </div>
  );
}
