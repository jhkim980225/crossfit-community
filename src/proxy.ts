import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// 로그인이 필요한 경로
const PROTECTED_PATHS = ["/wod", "/pr", "/profile", "/notifications"];
// 로그인이 필요하고 특정 URL 패턴
const PROTECTED_PATTERNS = ["/community/write", "/community/edit"];
// 관리자 전용 경로
const ADMIN_PATHS = ["/admin"];

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const pathname = nextUrl.pathname;

  const isAdmin = session?.user?.role === "ADMIN";
  const isAuthenticated = !!session?.user;

  // 관리자 경로 보호
  if (ADMIN_PATHS.some((path) => pathname.startsWith(path))) {
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  // 인증 필요 경로 보호
  const needsAuth =
    PROTECTED_PATHS.some((path) => pathname.startsWith(path)) ||
    PROTECTED_PATTERNS.some((pattern) => pathname.includes(pattern));

  if (needsAuth && !isAuthenticated) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
