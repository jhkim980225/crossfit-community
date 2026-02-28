import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
          크로스핏 커뮤니티
        </h1>
        <p className="mt-6 text-lg text-muted-foreground">
          WOD 기록, 개인 PR 관리, 크로스핏 정보 공유를 한 곳에서
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <Link href="/wod">오늘의 WOD 보기</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/register">회원가입</Link>
          </Button>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-lg border bg-card p-6 text-left">
            <h2 className="font-semibold text-card-foreground">WOD 기록</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              매일의 WOD 결과를 기록하고 랭킹을 확인하세요
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6 text-left">
            <h2 className="font-semibold text-card-foreground">개인 PR 관리</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              주요 리프트와 벤치마크 WOD 기록을 관리하세요
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6 text-left">
            <h2 className="font-semibold text-card-foreground">커뮤니티</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              운동 팁, 질문, 인증 게시글을 공유하세요
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
