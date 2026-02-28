import type { UserPublic } from "./user";

export type PostCategory = "FREE" | "QUESTION" | "CERTIFICATION" | "INFO";

export interface Post {
  id: string;
  userId: string;
  category: PostCategory;
  title: string;
  content: string;
  images: string[];
  views: number;
  isHidden: boolean;
  createdAt: Date;
  updatedAt: Date;
  user?: UserPublic;
  _count?: {
    comments: number;
    likes: number;
  };
  isLiked?: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  parentId: string | null;
  content: string;
  isHidden: boolean;
  createdAt: Date;
  updatedAt: Date;
  user?: UserPublic;
  replies?: Comment[];
}

export interface PostListItem
  extends Pick<Post, "id" | "category" | "title" | "views" | "createdAt"> {
  user: UserPublic;
  _count: { comments: number; likes: number };
}

export interface CursorPaginationResult<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}
