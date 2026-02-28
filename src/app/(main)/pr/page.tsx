import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PrRecordForm } from "@/components/pr/PrRecordForm";
import { PrDashboard } from "@/components/pr/PrDashboard";

export const metadata: Metadata = {
  title: "PR 관리",
};

export default async function PrPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  // 전체 PR (최근 기록 포함)
  const prs = await prisma.pR.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
  });

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">PR 관리</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <PrDashboard prs={prs.map((p) => ({ ...p, date: p.date.toISOString() }))} />
        <PrRecordForm />
      </div>
    </div>
  );
}
