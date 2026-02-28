"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Trash2, CornerDownRight, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { commentCreateSchema, type CommentCreateInput } from "@/lib/validations/post";
import { formatDateTime } from "@/lib/utils";
import type { UserPublic, ApiResponse } from "@/types";

// ──────────────────────────────────────────────
// 타입
// ──────────────────────────────────────────────

interface CommentUser {
  id: string;
  nickname: string;
  profileImage: string | null;
}

interface Reply {
  id: string;
  content: string;
  isHidden: boolean;
  createdAt: string;
  user: CommentUser;
}

interface CommentData {
  id: string;
  content: string;
  isHidden: boolean;
  createdAt: string;
  user: CommentUser;
  replies: Reply[];
}

interface CommentSectionProps {
  postId: string;
  currentUser: UserPublic | null;
}

// ──────────────────────────────────────────────
// 메인 컴포넌트
// ──────────────────────────────────────────────

export function CommentSection({ postId, currentUser }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [replyTo, setReplyTo] = useState<{ id: string; nickname: string } | null>(null);

  const totalCount = comments.reduce((acc, c) => acc + 1 + c.replies.length, 0);

  async function fetchComments() {
    const res = await fetch(`/api/posts/${postId}/comments`);
    const result: ApiResponse<CommentData[]> = await res.json();
    if (result.success && result.data) {
      setComments(result.data);
    }
  }

  useEffect(() => {
    fetchComments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  async function handleDelete(commentId: string) {
    try {
      const res = await fetch(`/api/posts/${postId}/comments/${commentId}`, {
        method: "DELETE",
      });
      const result: ApiResponse = await res.json();
      if (!result.success) {
        toast.error(result.error?.message || "삭제에 실패했습니다");
        return;
      }
      toast.success("댓글이 삭제되었습니다");
      fetchComments();
    } catch {
      toast.error("오류가 발생했습니다");
    }
  }

  return (
    <div className="space-y-6">
      <h3 className="font-semibold">댓글 {totalCount}개</h3>

      {currentUser && (
        <CommentForm postId={postId} onSuccess={fetchComments} />
      )}

      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id}>
            {/* 원댓글 */}
            <CommentItem
              comment={comment}
              currentUserId={currentUser?.id}
              onDelete={() => handleDelete(comment.id)}
              onReplyClick={() =>
                setReplyTo(
                  replyTo?.id === comment.id
                    ? null
                    : { id: comment.id, nickname: comment.user.nickname }
                )
              }
              isReplying={replyTo?.id === comment.id}
            />

            {/* 대댓글 영역 */}
            {(comment.replies.length > 0 || replyTo?.id === comment.id) && (
              <ReplyThread
                comment={comment}
                currentUserId={currentUser?.id}
                replyTo={replyTo}
                onDelete={handleDelete}
                onReplyClick={(nickname) =>
                  setReplyTo(
                    replyTo?.id === comment.id && replyTo.nickname === nickname
                      ? null
                      : { id: comment.id, nickname }
                  )
                }
                onReplySuccess={() => {
                  setReplyTo(null);
                  fetchComments();
                }}
                postId={postId}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// 대댓글 스레드 (접기/펼치기)
// ──────────────────────────────────────────────

interface ReplyThreadProps {
  comment: CommentData;
  currentUserId: string | undefined;
  replyTo: { id: string; nickname: string } | null;
  onDelete: (commentId: string) => void;
  onReplyClick: (nickname: string) => void;
  onReplySuccess: () => void;
  postId: string;
}

function ReplyThread({
  comment,
  currentUserId,
  replyTo,
  onDelete,
  onReplyClick,
  onReplySuccess,
  postId,
}: ReplyThreadProps) {
  const [expanded, setExpanded] = useState(true);
  const replyCount = comment.replies.length;

  return (
    <div className="ml-10 mt-3 border-l-2 border-border pl-4">
      {/* 답글 N개 접기/펼치기 */}
      {replyCount > 0 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mb-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          답글 {replyCount}개 {expanded ? "접기" : "펼치기"}
        </button>
      )}

      {/* 대댓글 목록 */}
      {expanded && (
        <div className="space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              onDelete={() => onDelete(reply.id)}
              onReplyClick={() => onReplyClick(reply.user.nickname)}
              isReplying={
                replyTo?.id === comment.id &&
                replyTo.nickname === reply.user.nickname
              }
              isReply
            />
          ))}
        </div>
      )}

      {/* 대댓글 입력 폼 */}
      {replyTo?.id === comment.id && currentUserId && (
        <div className="mt-3">
          <p className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
            <CornerDownRight size={12} />
            <span className="font-medium text-foreground">@{replyTo.nickname}</span>
            에게 답글
          </p>
          <CommentForm
            postId={postId}
            parentId={comment.id}
            onSuccess={onReplySuccess}
            placeholder="대댓글을 입력하세요..."
            autoFocus
          />
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// 댓글 / 대댓글 아이템
// ──────────────────────────────────────────────

interface CommentItemProps {
  comment: (CommentData | Reply) & { user: CommentUser };
  currentUserId: string | undefined;
  onDelete: () => void;
  onReplyClick?: () => void;
  isReplying?: boolean;
  isReply?: boolean;
}

function CommentItem({
  comment,
  currentUserId,
  onDelete,
  onReplyClick,
  isReplying,
  isReply,
}: CommentItemProps) {
  const isOwner = currentUserId === comment.user.id;

  return (
    <div className="flex gap-3">
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarImage src={comment.user.profileImage ?? undefined} alt={comment.user.nickname} />
        <AvatarFallback>{comment.user.nickname[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{comment.user.nickname}</span>
          <span className="text-xs text-muted-foreground">{formatDateTime(comment.createdAt)}</span>
        </div>
        <p className="mt-1 text-sm break-words">{comment.content}</p>

        <div className="mt-1 flex items-center gap-3">
          {/* 답글 버튼 — 대댓글에서도 표시 (스레드 내에서 @멘션으로 처리) */}
          {onReplyClick && currentUserId && (
            <button
              onClick={onReplyClick}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              {isReplying ? "취소" : "답글"}
            </button>
          )}
          {/* 삭제 버튼 — 본인 댓글만 */}
          {isOwner && (
            <button
              onClick={onDelete}
              className="flex items-center gap-0.5 text-xs text-muted-foreground hover:text-destructive"
              aria-label="댓글 삭제"
            >
              <Trash2 size={12} />
              삭제
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// 댓글 입력 폼
// ──────────────────────────────────────────────

interface CommentFormProps {
  postId: string;
  parentId?: string;
  onSuccess: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

function CommentForm({
  postId,
  parentId,
  onSuccess,
  placeholder = "댓글을 입력하세요...",
  autoFocus,
}: CommentFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommentCreateInput>({
    resolver: zodResolver(commentCreateSchema),
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
        autoFocus={autoFocus}
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
