import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "WOD 랭킹",
};

export default function WodRankingPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">WOD 랭킹</h1>
      <p className="text-muted-foreground">전체 랭킹 보드는 준비 중입니다</p>
    </div>
  );
}
