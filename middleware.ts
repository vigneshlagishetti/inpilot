import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { MAINTENANCE_MODE, MAINTENANCE_WHITELIST, ADMIN_EMAILS } from "./lib/maintenance-config";

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/maintenance',
]);

export default clerkMiddleware((auth, request) => {
  const { pathname } = request.nextUrl;

  // Check if maintenance mode is enabled
  if (MAINTENANCE_MODE) {
    // Check if the current path is whitelisted
    const isWhitelisted = MAINTENANCE_WHITELIST.some(path => pathname.startsWith(path));

    if (!isWhitelisted && pathname !== '/maintenance') {
      // Check if user is an admin (if authenticated)
      try {
        const session = auth();
        const userEmail = session?.sessionClaims?.email as string | undefined;

        // Allow admin users to bypass maintenance mode
        if (userEmail && ADMIN_EMAILS.includes(userEmail)) {
          // Admin user - allow access
          if (!isPublicRoute(request)) {
            auth().protect();
          }
          return;
        }
      } catch (error) {
        // User not authenticated, continue to redirect
      }

      // Redirect to maintenance page
      const maintenanceUrl = new URL('/maintenance', request.url);
      return NextResponse.redirect(maintenanceUrl);
    }
  }

  // Normal authentication flow
  if (!isPublicRoute(request)) {
    auth().protect();
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
