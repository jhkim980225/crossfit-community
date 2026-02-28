"use client";

import { useEffect, useRef } from "react";
import DOMPurify from "isomorphic-dompurify";

interface PostContentProps {
  content: string;
  images: string[];
}

export function PostContent({ content, images }: PostContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // XSS 방지: DOMPurify로 sanitize 처리
    if (contentRef.current) {
      contentRef.current.innerHTML = DOMPurify.sanitize(content, {
        ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "ol", "ul", "li", "a"],
        ALLOWED_ATTR: ["href", "target", "rel"],
      });
    }
  }, [content]);

  return (
    <div className="space-y-4">
      <div
        ref={contentRef}
        className="prose prose-sm max-w-none whitespace-pre-wrap text-foreground"
      />

      {images.length > 0 && (
        <div className="mt-4 grid gap-2 grid-cols-2 sm:grid-cols-3">
          {images.map((url, i) => (
            <a key={i} href={url} target="_blank" rel="noopener noreferrer">
              <img
                src={url}
                alt={`첨부 이미지 ${i + 1}`}
                className="h-40 w-full rounded-lg object-cover transition-opacity hover:opacity-90"
                loading="lazy"
              />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
