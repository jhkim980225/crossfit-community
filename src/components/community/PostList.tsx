"use client";

import { useCallback } from "react";
import Link from "next/link";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import type { PostListItem, CursorPaginationResult, ApiResponse } from "@/types";

const CATEGORY_LABELS: Record<string, string> = {
  FREE: "자유",
  QUESTION: "질문",
  CERTIFICATION: "인증",
  INFO: "정보",
};

interface PostListProps {
  category?: string;
  search?: string;
}

export function PostList({ category, search }: PostListProps) {
  const fetchPosts = useCallback(
    async (cursor: string | null): Promise<CursorPaginationResult<PostListItem>> => {
      const params = new URLSearchParams();
      if (cursor) params.set("cursor", cursor);
      if (category) params.set("category", category);
      if (search) params.set("search", search);

      const res = await fetch(`/api/posts?${params}`);
      const result: ApiResponse<CursorPaginationResult<PostListItem>> = await res.json();

      if (!result.success || !result.data) {
        return { items: [], nextCursor: null, hasMore: false };
      }
      return result.data;
    },
    [category, search]
  );

  const { items: posts, isLoading, isInitialLoading, hasMore, sentinelRef } =
    useInfiniteScroll<PostListItem>({ fetchFn: fetchPosts });

  if (isInitialLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        게시글이 없습니다
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {posts.map((post) => (
        <Link
          key={post.id}
          href={`/community/${post.id}`}
          className="block rounded-lg border bg-card p-4 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-start gap-3">
            <Badge variant="outline" className="shrink-0 text-xs">
              {CATEGORY_LABELS[post.category] || post.category}
            </Badge>
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate">{post.title}</p>
              <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                <span>{post.user.nickname}</span>
                <span>{formatDateTime(post.createdAt)}</span>
                <span>조회 {post.views}</span>
                <span>댓글 {post._count.comments}</span>
                <span>좋아요 {post._count.likes}</span>
              </div>
            </div>
          </div>
        </Link>
      ))}

      {/* 무한 스크롤 sentinel */}
      <div ref={sentinelRef} className="py-2">
        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        )}
        {!hasMore && posts.length > 0 && (
          <p className="text-center text-sm text-muted-foreground">모든 게시글을 불러왔습니다</p>
        )}
      </div>
    </div>
  );
}
