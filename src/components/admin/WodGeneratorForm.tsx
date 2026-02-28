"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  generateWod,
  CATEGORY_LABELS,
  type MovementCategory,
  type GeneratedWod,
  type WodGeneratorConfig,
} from "@/lib/wod-generator";

const WOD_TYPES: WodGeneratorConfig["type"][] = ["FOR_TIME", "AMRAP", "EMOM"];
const CATEGORIES = Object.keys(CATEGORY_LABELS) as MovementCategory[];
const MOVEMENT_COUNTS = [2, 3, 4] as const;

function todayString() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function WodGeneratorForm() {
  const router = useRouter();

  // 생성 설정
  const [type, setType] = useState<WodGeneratorConfig["type"]>("FOR_TIME");
  const [duration, setDuration] = useState(20);
  const [categories, setCategories] = useState<MovementCategory[]>(["역도", "체조"]);
  const [movementCount, setMovementCount] = useState<2 | 3 | 4>(3);

  // 생성 결과
  const [result, setResult] = useState<GeneratedWod | null>(null);

  // 저장 설정
  const [saveDate, setSaveDate] = useState(todayString);
  const [saving, setSaving] = useState(false);

  function toggleCategory(cat: MovementCategory) {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  function handleGenerate() {
    if (categories.length === 0) {
      toast.error("카테고리를 하나 이상 선택해주세요");
      return;
    }
    try {
      const wod = generateWod({ type, durationMinutes: duration, categories, movementCount });
      setResult(wod);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "생성 오류가 발생했습니다");
    }
  }

  async function handleSave() {
    if (!result) return;
    setSaving(true);
    try {
      const res = await fetch("/api/wod", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: result.title,
          description: result.description,
          type: result.type,
          movements: result.movements,
          date: saveDate,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error?.message || "저장 실패");
        return;
      }
      toast.success("WOD가 저장되었습니다");
      router.push(`/wod/${saveDate}`);
    } catch {
      toast.error("서버 오류가 발생했습니다");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* ── 설정 ── */}
      <Card>
        <CardHeader>
          <CardTitle>WOD 설정</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* WOD 타입 */}
          <div className="space-y-2">
            <Label>WOD 타입</Label>
            <div className="flex gap-2">
              {WOD_TYPES.map((t) => (
                <Button
                  key={t}
                  variant={type === t ? "default" : "outline"}
                  size="sm"
                  onClick={() => setType(t)}
                >
                  {t}
                </Button>
              ))}
            </div>
          </div>

          {/* 시간 */}
          <div className="space-y-2">
            <Label htmlFor="duration">시간 (분)</Label>
            <Input
              id="duration"
              type="number"
              min={5}
              max={60}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-32"
            />
          </div>

          {/* 카테고리 */}
          <div className="space-y-2">
            <Label>종목 카테고리</Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className="rounded-full px-3 py-1 text-sm font-medium border transition-colors"
                  style={{
                    backgroundColor: categories.includes(cat)
                      ? "hsl(var(--primary))"
                      : "transparent",
                    color: categories.includes(cat)
                      ? "hsl(var(--primary-foreground))"
                      : "inherit",
                    borderColor: "hsl(var(--border))",
                  }}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          {/* 종목 수 */}
          <div className="space-y-2">
            <Label>종목 수</Label>
            <div className="flex gap-2">
              {MOVEMENT_COUNTS.map((n) => (
                <Button
                  key={n}
                  variant={movementCount === n ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMovementCount(n)}
                >
                  {n}개
                </Button>
              ))}
            </div>
          </div>

          <Button onClick={handleGenerate} className="w-full sm:w-auto">
            WOD 생성
          </Button>
        </CardContent>
      </Card>

      {/* ── 결과 미리보기 ── */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>생성된 WOD</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted/40 p-4">
              <p className="font-bold text-lg">{result.title}</p>
              <pre className="mt-2 whitespace-pre-wrap text-sm">{result.description}</pre>
            </div>

            <div className="flex flex-wrap gap-2">
              {result.movements.map((m) => (
                <Badge key={m} variant="secondary">
                  {m}
                </Badge>
              ))}
            </div>

            <div className="flex flex-wrap items-end gap-3 pt-2">
              <Button variant="outline" onClick={handleGenerate}>
                다시 생성
              </Button>

              <div className="flex items-end gap-2">
                <div className="space-y-1">
                  <Label htmlFor="saveDate">저장 날짜</Label>
                  <Input
                    id="saveDate"
                    type="date"
                    value={saveDate}
                    onChange={(e) => setSaveDate(e.target.value)}
                    className="w-44"
                  />
                </div>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "저장 중..." : "WOD 저장"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
