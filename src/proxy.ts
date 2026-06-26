// ============================================================
// Next.js Proxy for Route Protection (replaces deprecated middleware.ts)
// ============================================================

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const sessionToken =
    req.cookies.get("next-auth.session-token")?.value ||
    req.cookies.get("__Secure-next-auth.session-token")?.value ||
    req.cookies.get("authjs.session-token")?.value ||
    req.cookies.get("__Secure-authjs.session-token")?.value;

  const { pathname } = req.nextUrl;

  // Protect dashboard and related routes
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/folders") ||
    pathname.startsWith("/resources") ||
    pathname.startsWith("/search") ||
    pathname.startsWith("/storage") ||
    pathname.startsWith("/activity")
  ) {
    if (!sessionToken) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/folders/:path*", "/resources/:path*", "/search/:path*", "/storage/:path*", "/activity/:path*"],
};
