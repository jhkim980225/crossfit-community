"use client";

import { useState } from "react";
import { toast } from "sonner";
import { getS3PublicUrl } from "@/lib/s3";

const MAX_FILES = 5;
const MAX_SIZE_MB = 10;

interface UseImageUploadOptions {
  folder: "posts" | "profiles";
}

export function useImageUpload({ folder }: UseImageUploadOptions) {
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  async function uploadFile(file: File): Promise<string | null> {
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`파일 크기는 ${MAX_SIZE_MB}MB 이하여야 합니다`);
      return null;
    }

    // Presigned URL 발급
    const res = await fetch("/api/upload/presigned-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type,
        folder,
      }),
    });

    const result = await res.json();
    if (!result.success) {
      toast.error(result.error?.message || "업로드 URL 발급에 실패했습니다");
      return null;
    }

    const { presignedUrl, key } = result.data;

    // S3 직접 업로드
    const uploadRes = await fetch(presignedUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });

    if (!uploadRes.ok) {
      toast.error("파일 업로드에 실패했습니다");
      return null;
    }

    return getS3PublicUrl(key);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (uploadedUrls.length + files.length > MAX_FILES) {
      toast.error(`이미지는 최대 ${MAX_FILES}장까지 업로드 가능합니다`);
      return;
    }

    setIsUploading(true);
    try {
      const urls = await Promise.all(files.map(uploadFile));
      const validUrls = urls.filter((url): url is string => url !== null);
      setUploadedUrls((prev) => [...prev, ...validUrls]);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  }

  function removeImage(url: string) {
    setUploadedUrls((prev) => prev.filter((u) => u !== url));
  }

  return { uploadedUrls, isUploading, handleFileChange, removeImage };
}
