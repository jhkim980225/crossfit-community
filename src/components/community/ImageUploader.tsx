"use client";

import { useRef } from "react";
import { X, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useImageUpload } from "@/hooks/useImageUpload";

interface ImageUploaderProps {
  uploadedUrls: string[];
  onUpload: (urls: string[]) => void;
  folder: "posts" | "profiles";
}

export function ImageUploader({ uploadedUrls, onUpload, folder }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { isUploading, handleFileChange, removeImage } = useImageUpload({ folder });

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const prevCount = uploadedUrls.length;
    await handleFileChange(e);
    // 부모로 업데이트된 URL 목록 전달 (간단히 re-render 유도)
    onUpload(uploadedUrls);
  }

  function handleRemove(url: string) {
    removeImage(url);
    onUpload(uploadedUrls.filter((u) => u !== url));
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {uploadedUrls.map((url, i) => (
          <div key={i} className="relative h-24 w-24">
            <img
              src={url}
              alt={`업로드 이미지 ${i + 1}`}
              className="h-full w-full rounded-lg object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemove(url)}
              className="absolute -right-1.5 -top-1.5 rounded-full bg-destructive p-0.5 text-destructive-foreground"
              aria-label="이미지 삭제"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {uploadedUrls.length < 5 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="flex h-24 w-24 flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 text-muted-foreground hover:border-muted-foreground/60 transition-colors disabled:opacity-50"
            aria-label="이미지 추가"
          >
            <ImagePlus className="h-6 w-6" />
            <span className="mt-1 text-xs">{isUploading ? "업로드 중..." : "추가"}</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={handleChange}
      />
      <p className="text-xs text-muted-foreground">JPG, PNG, WebP, GIF · 최대 10MB · 5장까지</p>
    </div>
  );
}
