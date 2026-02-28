import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PostContent } from "@/components/community/PostContent";
import { CommentSection } from "@/components/community/CommentSection";
import { LikeButton } from "@/components/community/LikeButton";
import { formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { UserLevel } from "@/types";

interface PageProps {
  params: Promise<{ postId: string }>;
}

const CATEGORY_LABELS: Record<string, string> = {
  FREE: "자유게시판",
  QUESTION: "질문게시판",
  CERTIFICATION: "운동 인증",
  INFO: "정보 공유",
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { postId } = await params;
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { title: true },
  });
  return { title: post?.title || "게시글" };
}

export default async function PostDetailPage({ params }: PageProps) {
  const { postId } = await params;
  const session = await auth();

  const post = await prisma.post.findUnique({
    where: { id: postId, isHidden: false },
    include: {
      user: { select: { id: true, nickname: true, profileImage: true, box: true, level: true } },
      _count: { select: { likes: true, comments: true } },
    },
  });

  if (!post) notFound();

  // 조회수 증가 (비동기, await 하지 않음)
  prisma.post.update({ where: { id: postId }, data: { views: { increment: 1 } } }).catch(() => {});

  // 좋아요 여부 확인
  const isLiked = session?.user
    ? !!(await prisma.like.findUnique({
        where: { postId_userId: { postId, userId: session.user.id } },
      }))
    : false;

  const currentUser = session?.user
    ? {
        id: session.user.id,
        nickname: session.user.nickname,
        profileImage: session.user.profileImage,
        box: null,
        level: session.user.level as UserLevel,
      }
    : null;

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      {/* 게시글 헤더 */}
      <header className="space-y-4 border-b pb-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline">{CATEGORY_LABELS[post.category] || post.category}</Badge>
        </div>
        <h1 className="text-2xl font-bold">{post.title}</h1>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={post.user.profileImage ?? undefined} alt={post.user.nickname} />
            <AvatarFallback>{post.user.nickname[0]}</AvatarFallback>
          </Avatar>
          <div className="text-sm">
            <p className="font-medium">{post.user.nickname}</p>
            <p className="text-muted-foreground">{formatDateTime(post.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>조회 {post.views}</span>
          <span>댓글 {post._count.comments}</span>
        </div>
      </header>

      {/* 게시글 본문 */}
      <PostContent content={post.content} images={post.images} />

      {/* 좋아요 */}
      <div className="flex justify-center border-t border-b py-4">
        <LikeButton
          postId={postId}
          initialLiked={isLiked}
          initialCount={post._count.likes}
          isLoggedIn={!!session?.user}
        />
      </div>

      {/* 댓글 */}
      <CommentSection postId={postId} currentUser={currentUser} />
    </article>
  );
}
