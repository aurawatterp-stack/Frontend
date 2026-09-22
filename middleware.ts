import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const hostname = (request.headers.get("host") || "").toLowerCase();
  const url = request.nextUrl.clone();
  const { pathname } = url;

  // Check if request is running locally (localhost, 127.0.0.1, or local IP)
  const isLocal =
    hostname.includes("localhost") ||
    hostname.includes("127.0.0.1") ||
    hostname.endsWith(".local");

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

  // 2. Production Domain Redirects (ONLY for main domain aurawatt.in / www.aurawatt.in, NOT localhost):
  if (!isLocal && (hostname.includes("aurawatt.in") || hostname.includes("www.aurawatt.in"))) {
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("https://erp.aurawatt.in", request.url), 307);
    }

    if (pathname.startsWith("/support")) {
      return NextResponse.redirect(new URL("https://support.aurawatt.in", request.url), 307);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
