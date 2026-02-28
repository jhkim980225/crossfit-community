"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prCreateSchema, type PrCreateInput } from "@/lib/validations/pr";
import {
  LIFT_MOVEMENTS,
  BENCHMARK_WODS,
  getMovementUnit,
  isLift,
  parseTimeInput,
} from "@/lib/pr-movements";
import { toDateString } from "@/lib/utils";
import type { ApiResponse } from "@/types";

export function PrRecordForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState<string>("");
  // 벤치마크 WOD용 mm:ss 입력 상태
  const [timeInput, setTimeInput] = useState("");

  const isBenchmark = selectedMovement !== "" && !isLift(selectedMovement);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PrCreateInput>({
    resolver: zodResolver(prCreateSchema),
    defaultValues: {
      date: toDateString(new Date()),
    },
  });

  function handleMovementChange(movement: string) {
    setSelectedMovement(movement);
    setValue("movement", movement);
    setValue("unit", getMovementUnit(movement));
    // 종목 변경 시 기록 초기화
    setTimeInput("");
  }

  // mm:ss 입력값이 바뀔 때마다 초로 변환해서 form value에 반영
  function handleTimeInputChange(input: string) {
    setTimeInput(input);
    const seconds = parseTimeInput(input);
    if (!isNaN(seconds) && seconds > 0) {
      setValue("value", seconds, { shouldValidate: false });
    }
  }

  // 벤치마크 시간 검증 → form submit 전 처리
  async function onSubmitWrapper(e: React.FormEvent) {
    e.preventDefault();
    if (isBenchmark) {
      const seconds = parseTimeInput(timeInput);
      if (isNaN(seconds) || seconds <= 0) {
        toast.error("시간 형식이 올바르지 않습니다 (예: 10:30)");
        return;
      }
      setValue("value", seconds);
    }
    handleSubmit(onSubmit)();
  }

  async function onSubmit(data: PrCreateInput) {
    setIsLoading(true);
    try {
      const res = await fetch("/api/pr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result: ApiResponse<{ isPRBroken: boolean }> = await res.json();

      if (!result.success) {
        toast.error(result.error?.message || "기록 저장에 실패했습니다");
        return;
      }

      if (result.data?.isPRBroken) {
        toast.success("🎉 PR 갱신! 새로운 기록을 세웠습니다!");
      } else {
        toast.success("기록이 저장되었습니다");
      }

      reset({ date: toDateString(new Date()) });
      setSelectedMovement("");
      setTimeInput("");
      router.refresh();
    } catch {
      toast.error("오류가 발생했습니다");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>기록 추가</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmitWrapper} className="space-y-4">
          <div className="space-y-2">
            <Label>종목</Label>
            <Select onValueChange={handleMovementChange} value={selectedMovement}>
              <SelectTrigger>
                <SelectValue placeholder="종목 선택" />
              </SelectTrigger>
              <SelectContent>
                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                  리프트
                </div>
                {LIFT_MOVEMENTS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
                <div className="mt-1 px-2 py-1 text-xs font-semibold text-muted-foreground">
                  벤치마크 WOD
                </div>
                {BENCHMARK_WODS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" {...register("movement")} />
            {errors.movement && (
              <p className="text-sm text-destructive">{errors.movement.message}</p>
            )}
          </div>

          <div className="flex gap-2">
            <div className="flex-1 space-y-2">
              <Label htmlFor="value">기록</Label>
              {isBenchmark ? (
                // 벤치마크: mm:ss 텍스트 입력
                <Input
                  id="value"
                  placeholder="mm:ss (예: 10:30)"
                  value={timeInput}
                  onChange={(e) => handleTimeInputChange(e.target.value)}
                />
              ) : (
                // 리프트: 숫자 입력
                <Input
                  id="value"
                  type="number"
                  step="0.5"
                  min="0"
                  placeholder="0"
                  {...register("value", { valueAsNumber: true })}
                />
              )}
              {errors.value && (
                <p className="text-sm text-destructive">{errors.value.message}</p>
              )}
            </div>
            <div className="w-20 space-y-2">
              <Label>단위</Label>
              <Input
                readOnly
                value={selectedMovement ? getMovementUnit(selectedMovement) : "-"}
                className="bg-muted"
              />
              <input type="hidden" {...register("unit")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">날짜</Label>
            <Input id="date" type="date" {...register("date")} />
            {errors.date && (
              <p className="text-sm text-destructive">{errors.date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="memo">메모 (선택)</Label>
            <Textarea id="memo" rows={2} {...register("memo")} />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !selectedMovement}
          >
            {isLoading ? "저장 중..." : "기록 추가"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
