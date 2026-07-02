import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;
    const userRole = token?.role;
    const isAdminUser = userRole === "ADMIN";
    const isAdminRoute = pathname.startsWith("/admin");
    const isUserOnlyRoute =
      pathname.startsWith("/booking") ||
      pathname.startsWith("/bookingRecords") ||
      pathname.startsWith("/profile");

    // Block non-admins from admin routes
    if (isAdminRoute && !isAdminUser) {
      return NextResponse.redirect(new URL(token ? "/cars" : "/login", req.url));
    }

    // Admin accounts should stay in the admin workspace, not user booking flows
    if (token && isAdminUser && isUserOnlyRoute) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }

    // Redirect authenticated users away from auth pages
    const authPages = ["/login", "/register", "/verify-otp"];
    if (authPages.includes(pathname) && token) {
      const redirectUrl = isAdminUser ? "/admin/dashboard" : "/cars";
      return NextResponse.redirect(new URL(redirectUrl, req.url));
    }

    // Redirect admin users from home to admin dashboard
    if (token && pathname === "/" && isAdminUser) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Public routes — always accessible
        if (
          pathname === "/" ||
          pathname === "/about" ||
          pathname === "/waiting-for-approval" ||
          pathname.startsWith("/cars") ||
          pathname.startsWith("/viewDetails") ||
          pathname.startsWith("/verification/")
        ) {
          return true;
        }

        // Auth pages — accessible without token (login/register/verify-otp)
        if (
          pathname === "/login" ||
          pathname === "/register" ||
          pathname === "/verify-otp"
        ) {
          return true;
        }

        if (pathname.startsWith("/admin")) {
          return token?.role === "ADMIN";
        }

        if (
          pathname.startsWith("/booking") ||
          pathname.startsWith("/bookingRecords") ||
          pathname.startsWith("/profile")
        ) {
          return !!token && token.role !== "ADMIN";
        }

        // Everything else covered by this middleware requires authentication
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/",
    "/about",
    "/admin/:path*",
    "/booking/:path*",
    "/bookingRecords",
    "/login",
    "/profile/:path*",
    "/register",
    "/verification/:path*",
    "/verify-otp",
  ],
};
