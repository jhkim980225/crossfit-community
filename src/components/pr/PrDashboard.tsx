"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PrHistoryChart } from "./PrHistoryChart";
import {
  LIFT_MOVEMENTS,
  BENCHMARK_WODS,
  isLift,
  isBetterRecord,
  formatSeconds,
} from "@/lib/pr-movements";
import { formatDate } from "@/lib/utils";

interface PrRecord {
  id: string;
  movement: string;
  value: number;
  unit: string;
  date: string;
  memo: string | null;
}

interface PrDashboardProps {
  prs: PrRecord[];
}

// ──────────────────────────────────────────────
// 유틸 함수
// ──────────────────────────────────────────────

function getBestPerMovement(prs: PrRecord[]): Map<string, PrRecord> {
  const bestMap = new Map<string, PrRecord>();
  for (const pr of prs) {
    const current = bestMap.get(pr.movement);
    if (!current || isBetterRecord(pr.movement, pr.value, current.value)) {
      bestMap.set(pr.movement, pr);
    }
  }
  return bestMap;
}

function getHistoryForMovement(prs: PrRecord[], movement: string): PrRecord[] {
  return prs
    .filter((p) => p.movement === movement)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

function getRecordsForDate(prs: PrRecord[], date: string): PrRecord[] {
  return prs.filter((pr) => pr.date.split("T")[0] === date);
}

function formatValue(movement: string, value: number): string {
  return isLift(movement) ? `${value} kg` : formatSeconds(value);
}

// YYYY-MM-DD 문자열을 로컬 기준으로 하루씩 이동
function shiftDate(dateStr: string, direction: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + direction);
  const ny = date.getFullYear();
  const nm = String(date.getMonth() + 1).padStart(2, "0");
  const nd = String(date.getDate()).padStart(2, "0");
  return `${ny}-${nm}-${nd}`;
}

function todayString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// ──────────────────────────────────────────────
// 종목 카드 (리프트/벤치마크 탭)
// ──────────────────────────────────────────────

interface MovementCardProps {
  movement: string;
  best: PrRecord | undefined;
  allPRs: PrRecord[];
  onDelete: (prId: string) => Promise<void>;
}

function MovementCard({ movement, best, allPRs, onDelete }: MovementCardProps) {
  const [showChart, setShowChart] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const history = getHistoryForMovement(allPRs, movement);

  async function handleDelete(prId: string) {
    setDeletingId(prId);
    try {
      await onDelete(prId);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-1">
          <CardTitle className="text-base">{movement}</CardTitle>
          <div className="flex shrink-0 gap-2">
            {history.length > 0 && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                {showHistory ? "접기" : `${history.length}개`}
              </button>
            )}
            {history.length > 1 && (
              <button
                onClick={() => setShowChart(!showChart)}
                className="text-xs text-primary hover:underline"
              >
                {showChart ? "차트닫기" : "차트"}
              </button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {best ? (
          <>
            <p className="text-2xl font-bold">
              {isLift(movement) ? (
                <>
                  {best.value}
                  <span className="ml-1 text-sm font-normal text-muted-foreground">kg</span>
                </>
              ) : (
                formatSeconds(best.value)
              )}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{formatDate(best.date)}</p>

            {showChart && history.length > 1 && (
              <div className="mt-4">
                <PrHistoryChart history={history} movement={movement} />
              </div>
            )}

            {showHistory && (
              <div className="mt-3 space-y-1 border-t pt-3">
                {[...history].reverse().map((pr) => (
                  <div key={pr.id} className="flex items-center gap-2 text-sm">
                    <span className="shrink-0 text-muted-foreground">{formatDate(pr.date)}</span>
                    <span className="ml-auto font-medium">{formatValue(movement, pr.value)}</span>
                    <button
                      onClick={() => handleDelete(pr.id)}
                      disabled={deletingId === pr.id}
                      className="shrink-0 text-destructive opacity-50 hover:opacity-100 disabled:cursor-not-allowed"
                      aria-label="기록 삭제"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">기록 없음</p>
        )}
      </CardContent>
    </Card>
  );
}

// ──────────────────────────────────────────────
// 날짜별 뷰
// ──────────────────────────────────────────────

interface PrDateViewProps {
  prs: PrRecord[];
  onDelete: (prId: string) => Promise<void>;
}

function PrDateView({ prs, onDelete }: PrDateViewProps) {
  const [selectedDate, setSelectedDate] = useState(todayString);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isToday = selectedDate >= todayString();

  async function handleDelete(prId: string) {
    setDeletingId(prId);
    try {
      await onDelete(prId);
    } finally {
      setDeletingId(null);
    }
  }

  const records = getRecordsForDate(prs, selectedDate);

  return (
    <div className="space-y-6">
      {/* 날짜 네비게이션 */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => setSelectedDate(shiftDate(selectedDate, -1))}>
          <ChevronLeft size={16} />
        </Button>
        <Input
          type="date"
          value={selectedDate}
          max={todayString()}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-40"
        />
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSelectedDate(shiftDate(selectedDate, 1))}
          disabled={isToday}
        >
          <ChevronRight size={16} />
        </Button>
      </div>

      {/* 해당 날짜의 기록 */}
      {records.length === 0 ? (
        <p className="py-10 text-center text-muted-foreground">이 날짜에 기록된 PR이 없습니다</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {records.map((pr) => (
            <Card key={pr.id}>
              <CardContent className="pt-4">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {pr.movement}
                </p>
                <p className="text-2xl font-bold">
                  {isLift(pr.movement) ? (
                    <>
                      {pr.value}
                      <span className="ml-1 text-sm font-normal text-muted-foreground">kg</span>
                    </>
                  ) : (
                    formatSeconds(pr.value)
                  )}
                </p>
                {pr.memo && (
                  <p className="mt-1 text-xs text-muted-foreground">{pr.memo}</p>
                )}
                <button
                  onClick={() => handleDelete(pr.id)}
                  disabled={deletingId === pr.id}
                  className="mt-3 text-destructive opacity-50 hover:opacity-100 disabled:cursor-not-allowed"
                  aria-label="기록 삭제"
                >
                  <Trash2 size={14} />
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// 메인 대시보드
// ──────────────────────────────────────────────

export function PrDashboard({ prs }: PrDashboardProps) {
  const router = useRouter();
  const bestMap = getBestPerMovement(prs);

  async function handleDelete(prId: string) {
    try {
      const res = await fetch(`/api/pr/${prId}`, { method: "DELETE" });
      const result = await res.json();
      if (!result.success) {
        toast.error(result.error?.message || "삭제에 실패했습니다");
        return;
      }
      toast.success("기록이 삭제되었습니다");
      router.refresh();
    } catch {
      toast.error("오류가 발생했습니다");
    }
  }

  return (
    <Tabs defaultValue="lift">
      <TabsList>
        <TabsTrigger value="lift">리프트</TabsTrigger>
        <TabsTrigger value="benchmark">벤치마크 WOD</TabsTrigger>
        <TabsTrigger value="date">날짜별</TabsTrigger>
      </TabsList>

      <TabsContent value="lift" className="mt-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {LIFT_MOVEMENTS.map((movement) => (
            <MovementCard
              key={movement}
              movement={movement}
              best={bestMap.get(movement)}
              allPRs={prs}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="benchmark" className="mt-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {BENCHMARK_WODS.map((movement) => (
            <MovementCard
              key={movement}
              movement={movement}
              best={bestMap.get(movement)}
              allPRs={prs}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="date" className="mt-6">
        <PrDateView prs={prs} onDelete={handleDelete} />
      </TabsContent>
    </Tabs>
  );
}
