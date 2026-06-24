import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Admin-only routes
const ADMIN_ROUTES = ["/admin"];
// Manager + Admin routes  
const MANAGER_ROUTES = ["/settings"];

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // Allow auth API routes and public assets
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  // If not logged in and trying to access protected routes, redirect to login
  if (!token && pathname !== "/") {
    const loginUrl = new URL("/", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If logged in and on the login page, redirect to dashboard
  if (token && pathname === "/") {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Role-based route guard
  if (token) {
    const role = token.role as string;

    if (ADMIN_ROUTES.some(r => pathname.startsWith(r)) && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard?error=unauthorized", request.url));
    }

    if (MANAGER_ROUTES.some(r => pathname.startsWith(r)) && !["ADMIN", "MANAGER"].includes(role)) {
      return NextResponse.redirect(new URL("/dashboard?error=unauthorized", request.url));
    } }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/tasks/:path*", "/settings/:path*", "/admin/:path*", "/projects/:path*"],
};
