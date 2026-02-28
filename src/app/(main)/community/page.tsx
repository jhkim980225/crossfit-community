import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { PostList } from "@/components/community/PostList";

export const metadata: Metadata = {
  title: "커뮤니티",
};

const CATEGORY_LABELS: Record<string, string> = {
  FREE: "자유게시판",
  QUESTION: "질문게시판",
  CERTIFICATION: "운동 인증",
  INFO: "정보 공유",
};

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const { category, search } = await searchParams;
  const session = await auth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">커뮤니티</h1>
        {session?.user && (
          <Button asChild>
            <Link href="/community/write">글쓰기</Link>
          </Button>
        )}
      </div>

      {/* 카테고리 탭 */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <Link
          href="/community"
          className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            !category
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80 text-muted-foreground"
          }`}
        >
          전체
        </Link>
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
          <Link
            key={key}
            href={`/community?category=${key}`}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              category === key
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80 text-muted-foreground"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      <PostList category={category} search={search} />
    </div>
  );
}
