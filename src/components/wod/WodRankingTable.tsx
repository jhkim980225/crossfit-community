import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatScore } from "@/lib/wod-score";
import type { WodType, RxScaled, UserPublic } from "@/types";

interface RankingEntry {
  id: string;
  userId: string;
  score: string;
  rxOrScaled: RxScaled;
  memo: string | null;
  createdAt: Date;
  user: UserPublic;
}

interface WodRankingTableProps {
  results: RankingEntry[];
  wodType: WodType;
  totalCount: number;
  wodId: string;
}

const LEVEL_LABELS: Record<string, string> = {
  BEGINNER: "초급",
  INTERMEDIATE: "중급",
  RX: "RX",
  RX_PLUS: "RX+",
};

export function WodRankingTable({ results, wodType, totalCount, wodId }: WodRankingTableProps) {
  if (results.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        아직 기록한 사람이 없습니다. 첫 번째 기록을 남겨보세요!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">랭킹 ({totalCount}명)</h2>
        {totalCount > 10 && (
          <Link
            href={`/wod/${wodId}/ranking`}
            className="text-sm text-primary hover:underline"
          >
            전체 보기
          </Link>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">순위</th>
              <th className="px-4 py-3 text-left font-medium">닉네임</th>
              <th className="px-4 py-3 text-left font-medium">박스</th>
              <th className="px-4 py-3 text-left font-medium">등급</th>
              <th className="px-4 py-3 text-right font-medium">점수</th>
              <th className="px-4 py-3 text-center font-medium">구분</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr key={result.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3 font-semibold">
                  {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/profile/${result.userId}`}
                    className="font-medium hover:underline"
                  >
                    {result.user.nickname}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {result.user.box || "-"}
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className="text-xs">
                    {LEVEL_LABELS[result.user.level] || result.user.level}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right font-mono font-semibold">
                  {formatScore(result.score, wodType)}
                </td>
                <td className="px-4 py-3 text-center">
                  <Badge variant={result.rxOrScaled === "RX" ? "default" : "secondary"}>
                    {result.rxOrScaled === "RX" ? "Rx" : "Scaled"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
