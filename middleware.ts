import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const sessionCookie = request.cookies.get("session")?.value;

  let isValidSession = false;
  if (sessionCookie) {
    try {
      const data = JSON.parse(decodeURIComponent(sessionCookie));
      if (data.uid && data.email) {
        isValidSession = true;
      }
    } catch {
      // invalid cookie
    }
  }

  const protectedRoutes = ["/profile", "/register", "/admin"];
  const authRoutes = ["/signin"];

  const isProtected = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtected) {
    if (!isValidSession) {
      return NextResponse.redirect(new URL("/signin", request.url));
    }
    return NextResponse.next();
  }

  if (authRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg).*)",
  ],
};
