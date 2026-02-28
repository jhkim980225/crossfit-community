import type { Metadata } from "next";
import { PostWriteForm } from "@/components/community/PostWriteForm";

export const metadata: Metadata = {
  title: "글쓰기",
};

export default function CommunityWritePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">글쓰기</h1>
      <PostWriteForm />
    </div>
  );
}
