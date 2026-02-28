"use client";

import { useState } from "react";
import { toast } from "sonner";

interface UseLikeOptions {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
}

export function useLike({ postId, initialLiked, initialCount }: UseLikeOptions) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isPending, setIsPending] = useState(false);

  async function toggle() {
    if (isPending) return;

    // 낙관적 업데이트
    const newLiked = !liked;
    setLiked(newLiked);
    setCount((c) => c + (newLiked ? 1 : -1));
    setIsPending(true);

    try {
      const res = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
      const result = await res.json();

      if (!result.success) {
        // 실패 시 원래 상태로 롤백
        setLiked(liked);
        setCount(initialCount);
        toast.error("좋아요 처리에 실패했습니다");
      }
    } catch {
      setLiked(liked);
      setCount(initialCount);
      toast.error("오류가 발생했습니다");
    } finally {
      setIsPending(false);
    }
  }

  return { liked, count, toggle, isPending };
}
