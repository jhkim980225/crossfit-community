"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUploader } from "./ImageUploader";
import { postCreateSchema, type PostCreateInput } from "@/lib/validations/post";
import type { ApiResponse, PostCategory } from "@/types";

const CATEGORY_OPTIONS: { value: PostCategory; label: string }[] = [
  { value: "FREE", label: "자유게시판" },
  { value: "QUESTION", label: "질문게시판" },
  { value: "CERTIFICATION", label: "운동 인증" },
  { value: "INFO", label: "정보 공유" },
];

export function PostWriteForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PostCreateInput>({
    resolver: zodResolver(postCreateSchema),
    defaultValues: { images: [] as string[] },
  });

  async function onSubmit(data: PostCreateInput) {
    setIsLoading(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, images: uploadedImages }),
      });

      const result: ApiResponse<{ id: string }> = await res.json();

      if (!result.success) {
        toast.error(result.error?.message || "게시글 작성에 실패했습니다");
        return;
      }

      toast.success("게시글이 등록되었습니다");
      router.push(`/community/${result.data!.id}`);
    } catch {
      toast.error("오류가 발생했습니다");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label>카테고리</Label>
        <Select onValueChange={(v) => setValue("category", v as PostCategory)}>
          <SelectTrigger>
            <SelectValue placeholder="카테고리 선택" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-sm text-destructive">{errors.category.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">제목</Label>
        <Input id="title" placeholder="제목을 입력하세요" {...register("title")} />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">내용</Label>
        <Textarea
          id="content"
          placeholder="내용을 입력하세요"
          rows={12}
          {...register("content")}
        />
        {errors.content && (
          <p className="text-sm text-destructive">{errors.content.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>이미지 첨부 (최대 5장)</Label>
        <ImageUploader
          uploadedUrls={uploadedImages}
          onUpload={(urls) => setUploadedImages(urls)}
          folder="posts"
        />
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          취소
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "등록 중..." : "등록"}
        </Button>
      </div>
    </form>
  );
}
