import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const url = request.nextUrl.clone();
  const { pathname } = url;

  // 1. If accessing subdomains directly:
  if (hostname.startsWith("erp.")) {
    if (pathname === "/") {
      url.pathname = "/admin";
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  if (hostname.startsWith("support.")) {
    if (pathname === "/") {
      url.pathname = "/support";
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  // 2. If someone tries to open the old paths on main domain (aurawatt.in/admin or aurawatt.in/support):
  // Force REDIRECT them to the new subdomains (erp.aurawatt.in and support.aurawatt.in)
  if (pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("https://erp.aurawatt.in", request.url), 301);
  }

  if (pathname.startsWith("/support")) {
    return NextResponse.redirect(new URL("https://support.aurawatt.in", request.url), 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
