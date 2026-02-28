import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboard() {
  const [userCount, wodCount, postCount, pendingReports] = await Promise.all([
    prisma.user.count(),
    prisma.wOD.count(),
    prisma.post.count({ where: { isHidden: false } }),
    prisma.report.count({ where: { status: "PENDING" } }),
  ]);

  const stats = [
    { label: "전체 회원", value: userCount },
    { label: "전체 WOD", value: wodCount },
    { label: "게시글", value: postCount },
    { label: "미처리 신고", value: pendingReports },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">관리자 대시보드</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
