"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { commentCreateSchema, type CommentCreateInput } from "@/lib/validations/post";
import { formatDateTime } from "@/lib/utils";
import type { Comment, UserPublic, ApiResponse } from "@/types";

interface CommentSectionProps {
  postId: string;
  currentUser: UserPublic | null;
}

interface CommentWithReplies extends Comment {
  user: UserPublic;
  replies: (Comment & { user: UserPublic })[];
}

export function CommentSection({ postId, currentUser }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentWithReplies[]>([]);
  const [replyTo, setReplyTo] = useState<string | null>(null);

  async function fetchComments() {
    const res = await fetch(`/api/posts/${postId}/comments`);
    const result: ApiResponse<CommentWithReplies[]> = await res.json();
    if (result.success && result.data) {
      setComments(result.data);
    }
  }

  useEffect(() => {
    fetchComments();
  }, [postId]);

  return (
    <div className="space-y-6">
      <h3 className="font-semibold">댓글 {comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)}개</h3>

      {currentUser && (
        <CommentForm
          postId={postId}
          onSuccess={fetchComments}
        />
      )}

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id}>
            <CommentItem
              comment={comment}
              currentUser={currentUser}
              onReply={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
              isReplying={replyTo === comment.id}
            />

            {replyTo === comment.id && currentUser && (
              <div className="ml-10 mt-2">
                <CommentForm
                  postId={postId}
                  parentId={comment.id}
                  onSuccess={() => {
                    setReplyTo(null);
                    fetchComments();
                  }}
                  placeholder="대댓글을 입력하세요..."
                />
              </div>
            )}

            {comment.replies?.map((reply) => (
              <div key={reply.id} className="ml-10 mt-2">
                <CommentItem
                  comment={reply}
                  currentUser={currentUser}
                  isReply
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

interface CommentItemProps {
  comment: (Comment | CommentWithReplies) & { user: UserPublic };
  currentUser: UserPublic | null;
  onReply?: () => void;
  isReplying?: boolean;
  isReply?: boolean;
}

function CommentItem({ comment, currentUser, onReply, isReplying, isReply }: CommentItemProps) {
  return (
    <div className="flex gap-3">
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarImage src={comment.user.profileImage ?? undefined} alt={comment.user.nickname} />
        <AvatarFallback>{comment.user.nickname[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{comment.user.nickname}</span>
          <span className="text-xs text-muted-foreground">{formatDateTime(comment.createdAt)}</span>
        </div>
        <p className="mt-1 text-sm">{comment.content}</p>
        {!isReply && onReply && currentUser && (
          <button
            onClick={onReply}
            className="mt-1 text-xs text-muted-foreground hover:text-foreground"
          >
            {isReplying ? "취소" : "답글"}
          </button>
        )}
      </div>
    </div>
  );
}

interface CommentFormProps {
  postId: string;
  parentId?: string;
  onSuccess: () => void;
  placeholder?: string;
}

function CommentForm({ postId, parentId, onSuccess, placeholder = "댓글을 입력하세요..." }: CommentFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CommentCreateInput>({
    resolver: zodResolver(commentCreateSchema),
    defaultValues: { parentId },
  });

  async function onSubmit(data: CommentCreateInput) {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, parentId }),
      });
      const result: ApiResponse = await res.json();

      if (!result.success) {
        toast.error(result.error?.message || "댓글 작성에 실패했습니다");
        return;
      }

      reset();
      onSuccess();
    } catch {
      toast.error("오류가 발생했습니다");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
      <Textarea
        placeholder={placeholder}
        rows={2}
        {...register("content")}
      />
      {errors.content && (
        <p className="text-xs text-destructive">{errors.content.message}</p>
      )}
      <Button type="submit" size="sm" disabled={isLoading}>
        {isLoading ? "등록 중..." : "등록"}
      </Button>
    </form>
  );
}
