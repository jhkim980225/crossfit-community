import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "알림",
};

const TYPE_LABELS: Record<string, string> = {
  COMMENT_ON_POST: "댓글",
  REPLY_ON_COMMENT: "대댓글",
  PR_ACHIEVED: "PR 갱신",
  ADMIN_NOTICE: "공지",
};

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // 페이지 진입 시 모두 읽음 처리
  await prisma.notification.updateMany({
    where: { userId: session.user.id, isRead: false },
    data: { isRead: true },
  });

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">알림</h1>

      {notifications.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">알림이 없습니다</div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="flex items-start gap-3 rounded-lg border p-4"
            >
              <Badge variant="outline" className="shrink-0 text-xs">
                {TYPE_LABELS[n.type] || n.type}
              </Badge>
              <div className="flex-1">
                <p className="text-sm">{n.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(n.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
