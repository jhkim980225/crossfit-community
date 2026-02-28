import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { compareScores } from "@/lib/wod-score";
import { WodRankingTable } from "@/components/wod/WodRankingTable";
import { formatDate } from "@/lib/utils";
import type { WodType, RxScaled, UserLevel } from "@/types";

interface PageProps {
  params: Promise<{ date: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { date } = await params;
  return { title: `WOD 랭킹 ${date}` };
}

export default async function WodRankingPage({ params }: PageProps) {
  const { date } = await params;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    notFound();
  }

  const wod = await prisma.wOD.findFirst({
    where: {
      date: {
        gte: new Date(`${date}T00:00:00.000Z`),
        lt:  new Date(`${date}T23:59:59.999Z`),
      },
    },
    include: { _count: { select: { results: true } } },
  });

  if (!wod) notFound();

  const allResults = await prisma.wODResult.findMany({
    where: { wodId: wod.id },
    include: {
      user: { select: { id: true, nickname: true, profileImage: true, box: true, level: true } },
    },
  });

  const sorted = allResults
    .sort((a, b) => compareScores(a.score, b.score, wod.type as WodType))
    .map((r, i) => ({ ...r, rank: i + 1 }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/wod/${date}`} className="text-sm text-muted-foreground hover:text-foreground">
          ← WOD로 돌아가기
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold">{wod.title} — 전체 랭킹</h1>
        <p className="mt-1 text-sm text-muted-foreground">{formatDate(date)}</p>
      </div>

      <WodRankingTable
        results={sorted.map((r) => ({
          ...r,
          rxOrScaled: r.rxOrScaled as RxScaled,
          user: { ...r.user, level: r.user.level as UserLevel },
        }))}
        wodType={wod.type as WodType}
        totalCount={wod._count.results}
        wodDate={date}
      />
    </div>
  );
}
