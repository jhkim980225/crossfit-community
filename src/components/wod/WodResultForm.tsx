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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { wodResultSchema, type WodResultInput } from "@/lib/validations/wod";
import { getScorePlaceholder } from "@/lib/wod-score";
import type { WodType, RxScaled, ApiResponse } from "@/types";

interface WodResultFormProps {
  wodId: string;
  wodType: WodType;
  existingResult?: {
    score: string;
    rxOrScaled: RxScaled;
    memo?: string;
  };
}

export function WodResultForm({ wodId, wodType, existingResult }: WodResultFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const isEdit = !!existingResult;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<WodResultInput>({
    resolver: zodResolver(wodResultSchema),
    defaultValues: {
      score: existingResult?.score || "",
      rxOrScaled: existingResult?.rxOrScaled || "RX",
      memo: existingResult?.memo || "",
    },
  });

  async function onSubmit(data: WodResultInput) {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/wod/${wodId}/results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result: ApiResponse = await res.json();

      if (!result.success) {
        toast.error(result.error?.message || "기록 저장에 실패했습니다");
        return;
      }

      toast.success(isEdit ? "기록이 수정되었습니다" : "기록이 저장되었습니다");
      router.refresh();
    } catch {
      toast.error("오류가 발생했습니다");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? "기록 수정" : "결과 기록"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="score">점수</Label>
            <Input
              id="score"
              placeholder={getScorePlaceholder(wodType)}
              {...register("score")}
            />
            {errors.score && (
              <p className="text-sm text-destructive">{errors.score.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="rxOrScaled">Rx / Scaled</Label>
            <Select
              defaultValue={existingResult?.rxOrScaled || "RX"}
              onValueChange={(v) => setValue("rxOrScaled", v as RxScaled)}
            >
              <SelectTrigger id="rxOrScaled">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RX">Rx</SelectItem>
                <SelectItem value="SCALED">Scaled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="memo">메모 (선택)</Label>
            <Textarea
              id="memo"
              placeholder="오늘 운동 소감을 남겨보세요"
              rows={3}
              {...register("memo")}
            />
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "저장 중..." : isEdit ? "수정하기" : "기록하기"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
