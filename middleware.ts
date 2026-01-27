import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { MAINTENANCE_WHITELIST, ADMIN_EMAILS, ADMIN_IDS } from "./lib/maintenance-config";
import { createClient } from '@supabase/supabase-js';

// Force recompile: 2026-01-27T13:58:35+05:30

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
        const userId = session?.userId;
        const claims = session?.sessionClaims;

        console.log(`[Middleware] Checking admin bypass for user: ${userId}`);

        // Try multiple ways to get email
        const userEmail = (claims?.email as string) ||
          (claims?.user_email as string) ||
          (claims?.email_address as string);

        const isAdminMetadata = (claims?.publicMetadata as any)?.isAdmin === true;

        console.log(`[Middleware] Claims:`, JSON.stringify(claims));
        console.log(`[Middleware] Email found: ${userEmail}`);
        console.log(`[Middleware] Is Admin Metadata: ${isAdminMetadata}`);
        console.log(`[Middleware] Whitelisted Emails:`, ADMIN_EMAILS);

        // Allow admin users to bypass maintenance mode
        // Check:
        // 1. Email whitelist
        // 2. User ID whitelist (Robust fallback)
        // 3. isAdmin metadata

        const isEmailWhitelisted = userEmail && ADMIN_EMAILS.includes(userEmail);
        const isIdWhitelisted = userId && ADMIN_IDS.includes(userId);

        if (isEmailWhitelisted || isIdWhitelisted || isAdminMetadata) {
          console.log('[Middleware] Admin bypass GRANTED');
          // Admin user - allow access
          if (!isPublicRoute(request)) {
            auth().protect();
          }
          return;
        } else {
          console.log('[Middleware] Admin bypass DENIED');
          console.log(`[Middleware] Debug: Email=${userEmail}, ID=${userId}`);
        }
      } catch (error) {
        console.error('[Middleware] Error checking admin status:', error);
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
