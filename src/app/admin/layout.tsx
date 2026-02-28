import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-48 border-r bg-muted/30 p-4">
        <h2 className="font-bold mb-4">관리자</h2>
        <nav className="space-y-1 text-sm">
          <Link href="/admin" className="block rounded px-3 py-2 hover:bg-muted">
            대시보드
          </Link>
          <Link href="/admin/wod" className="block rounded px-3 py-2 hover:bg-muted">
            WOD 관리
          </Link>
          <Link href="/admin/wod/generate" className="block rounded px-3 py-2 hover:bg-muted">
            WOD 생성기
          </Link>
          <Link href="/admin/users" className="block rounded px-3 py-2 hover:bg-muted">
            회원 관리
          </Link>
          <Link href="/admin/reports" className="block rounded px-3 py-2 hover:bg-muted">
            신고 처리
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
