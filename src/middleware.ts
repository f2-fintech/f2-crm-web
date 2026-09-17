import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = [
  "/login",
  "/forgot-password",
  "/reset-password",
];

const PROTECTED_ROUTES = [
  "/",
  "/users",
  "/roles",
  "/permissions",
  "/departments",
  "/branches",
  "/customers",
  "/leads",
  "/applications",
  "/follow-ups",
  "/settings",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignore Next.js internals & static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon.ico") ||
    /\.(.*)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("accessToken")?.value;

  // Public routes
  if (PUBLIC_ROUTES.includes(pathname)) {
    if (token) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // Protected routes
  const isProtectedRoute =
    pathname === "/" ||
    PROTECTED_ROUTES.some(
      (route) => route !== "/" && pathname.startsWith(route)
    );

  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/users/:path*",
    "/roles/:path*",
    "/permissions/:path*",
    "/departments/:path*",
    "/branches/:path*",
    "/customers/:path*",
    "/leads/:path*",
    "/applications/:path*",
    "/follow-ups/:path*",
    "/settings/:path*",
    "/login",
    "/forgot-password",
    "/reset-password",
  ],
};