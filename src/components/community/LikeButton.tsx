"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLike } from "@/hooks/useLike";
import { toast } from "sonner";

interface LikeButtonProps {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
  isLoggedIn: boolean;
}

export function LikeButton({ postId, initialLiked, initialCount, isLoggedIn }: LikeButtonProps) {
  const { liked, count, toggle, isPending } = useLike({
    postId,
    initialLiked,
    initialCount,
  });

  function handleClick() {
    if (!isLoggedIn) {
      toast.error("로그인 후 좋아요를 누를 수 있습니다");
      return;
    }
    toggle();
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={isPending}
      className="flex items-center gap-2"
      aria-label={liked ? "좋아요 취소" : "좋아요"}
    >
      <Heart
        className={`h-5 w-5 transition-colors ${liked ? "fill-red-500 text-red-500" : "text-muted-foreground"}`}
      />
      <span className="text-sm font-medium">{count}</span>
    </Button>
  );
}
