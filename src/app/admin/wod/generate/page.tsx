import type { Metadata } from "next";
import { WodGeneratorForm } from "@/components/admin/WodGeneratorForm";

export const metadata: Metadata = { title: "WOD 생성기" };

export default function WodGeneratePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">WOD 생성기</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          타입, 시간, 종목 카테고리를 설정하면 WOD를 자동으로 생성합니다.
        </p>
      </div>
      <WodGeneratorForm />
    </div>
  );
}
