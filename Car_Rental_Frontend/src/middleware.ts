import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;
    const userRole = token?.role;

    // Block non-admins from admin routes
    if (pathname.startsWith("/admin") && userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Redirect authenticated users away from auth pages
    const authPages = ["/login", "/register", "/verify-otp"];
    if (authPages.includes(pathname) && token) {
      const redirectUrl = userRole === "ADMIN" ? "/admin/cars" : "/";
      return NextResponse.redirect(new URL(redirectUrl, req.url));
    }

    // Redirect admin users from home to admin dashboard
    if (token && pathname === "/" && userRole === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/cars", req.url));
    }

    const guestOnlyPages = ["/login", "/register", "/verify-otp", "/about"]; 
    if (guestOnlyPages.includes(pathname) && token) {
      const redirectUrl = userRole === "ADMIN" ? "/admin/cars" : "/";
      return NextResponse.redirect(new URL(redirectUrl, req.url));
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

        // Everything else requires authentication
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
    "/booking",
    "/bookingRecords",
    "/dashboard/:path*",
    "/login",
    "/payment/:path*",
    "/profile/:path*",
    "/register",
    "/verification/:path*",
    "/verify-otp",
  ],
};