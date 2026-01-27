import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { MAINTENANCE_WHITELIST, ADMIN_EMAILS } from "./lib/maintenance-config";
import { createClient } from '@supabase/supabase-js';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/maintenance',
]);

const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
]);

// Create Supabase client for middleware
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl;

  // Check if maintenance mode is enabled (from database for real-time updates)
  let maintenanceMode = false;
  try {
    const { data, error } = await supabase
      .from('maintenance_settings')
      .select('value')
      .eq('key', 'maintenance_mode')
      .single();

    if (!error && data) {
      maintenanceMode = data.value;
    } else {
      // Fallback to environment variable if database check fails
      maintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';
    }
  } catch (error) {
    console.error('Error checking maintenance mode:', error);
    // Fallback to environment variable
    maintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';
  }

  if (maintenanceMode) {

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

  // Check if trying to access admin routes
  if (isAdminRoute(request)) {
    // Require authentication first
    auth().protect();

    // Check if user is admin
    try {
      const session = auth();
      const userId = session?.userId;

      if (!userId) {
        const dashboardUrl = new URL('/dashboard', request.url);
        return NextResponse.redirect(dashboardUrl);
      }

      // Check admin status from database
      const { data: adminUser, error } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', userId)
        .single();

      const isAdminUser = !error && adminUser !== null;

      if (!isAdminUser) {
        // Redirect non-admin users to dashboard
        const dashboardUrl = new URL('/dashboard', request.url);
        return NextResponse.redirect(dashboardUrl);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      const dashboardUrl = new URL('/dashboard', request.url);
      return NextResponse.redirect(dashboardUrl);
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
