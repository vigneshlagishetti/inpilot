import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { MAINTENANCE_WHITELIST, ADMIN_EMAILS, ADMIN_IDS } from "./lib/maintenance-config";
import { createClient } from '@supabase/supabase-js';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/maintenance',
  '/share/(.*)',
]);

const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
]);

// Routes that should be blocked during maintenance mode
// Landing page (/) is NOT blocked - users can see it even during maintenance
const isProtectedFromMaintenance = createRouteMatcher([
  '/dashboard(.*)',
]);

// Create Supabase client for middleware (with short timeout to avoid blocking requests)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    global: {
      fetch: (url, options) => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 3000); // 3s timeout
        return fetch(url, { ...options, signal: controller.signal })
          .finally(() => clearTimeout(timer));
      }
    }
  }
);

// ── In-memory cache for maintenance mode ──────────────────────────────────────
// Avoids hitting Supabase on every single request (very expensive when DB is down)
let maintenanceModeCache: { value: boolean; expiresAt: number } | null = null;
const CACHE_TTL_MS = 30_000; // Re-check DB every 30 seconds

async function getMaintenanceMode(): Promise<boolean> {
  const now = Date.now();

  // Return cached value if still fresh
  if (maintenanceModeCache && now < maintenanceModeCache.expiresAt) {
    console.log('[Middleware] ✅ Maintenance mode from cache:', maintenanceModeCache.value);
    return maintenanceModeCache.value;
  }

  console.log('[Middleware] 🔍 Checking database for maintenance status...');
  try {
    const { data, error } = await supabase
      .from('maintenance_settings')
      .select('value')
      .eq('key', 'maintenance_mode')
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      maintenanceModeCache = { value: data.value, expiresAt: now + CACHE_TTL_MS };
      console.log('[Middleware] 📊 Database says maintenance mode:', data.value);
      return data.value;
    } else if (error) {
      console.error('[Middleware] ❌ Error checking maintenance mode:', error);
    }
  } catch (error) {
    console.error('[Middleware] ❌ Exception checking maintenance mode:', error);
  }

  // Fallback to env var and cache for a shorter time (5s) so we retry sooner
  const fallback = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';
  maintenanceModeCache = { value: fallback, expiresAt: now + 5_000 };
  console.log('[Middleware] 🔄 Falling back to env var:', fallback);
  return fallback;
}

export default clerkMiddleware(async (auth, request) => {
  const { pathname, searchParams } = request.nextUrl;

  // CRITICAL: Skip ALL processing for maintenance page and its resources
  // This prevents any redirect loops or reload issues
  if (pathname === '/maintenance' || pathname.startsWith('/maintenance/')) {
    return NextResponse.next();
  }

  // Check for recovery bypass cookie (set when leaving maintenance mode)
  const cookies = request.cookies;
  const bypassCookie = cookies.get('maintenance_bypass');

  if (bypassCookie) {
    const bypassTime = parseInt(bypassCookie.value);
    if (Date.now() < bypassTime) {
      console.log('[Middleware] ✅ BYPASS ACTIVE - Allowing request');
      if (!isPublicRoute(request)) {
        auth().protect();
      }
      return NextResponse.next();
    } else {
      // Cookie expired, clear it
      const response = NextResponse.next();
      response.cookies.delete('maintenance_bypass');
    }
  }

  // Allow bypass via query param and SET cookie for subsequent requests
  const recoveryToken = searchParams.get('_recovery');
  const bypassUntil = searchParams.get('_bypass');
  if (recoveryToken === 'true' && bypassUntil) {
    const bypassTime = parseInt(bypassUntil);
    if (Date.now() < bypassTime) {
      console.log('[Middleware] Recovery bypass active - setting cookie and allowing access');
      const response = NextResponse.next();
      response.cookies.set('maintenance_bypass', bypassUntil, {
        maxAge: 30, // 30 seconds
        httpOnly: true,
        sameSite: 'lax',
        path: '/'
      });
      if (!isPublicRoute(request)) {
        auth().protect();
      }
      return response;
    }
  }

  // Check maintenance mode (cached — only hits DB every 30 seconds)
  const maintenanceMode = await getMaintenanceMode();

  if (maintenanceMode) {
    console.log('[Middleware] 🚧 Maintenance mode is ON - Evaluating access...');

    // Check if the current path should be blocked by maintenance mode
    // Landing page (/) is allowed, only dashboard and protected routes are blocked
    const shouldBlockForMaintenance = isProtectedFromMaintenance(request);
    console.log('[Middleware] Should block for maintenance:', shouldBlockForMaintenance);

    // Check if the current path is whitelisted (API routes, static files, etc)
    const isWhitelisted = MAINTENANCE_WHITELIST.some(path => pathname.startsWith(path));
    console.log('[Middleware] Is whitelisted path:', isWhitelisted);
    console.log('[Middleware] Current path is /maintenance:', pathname === '/maintenance');

    if (shouldBlockForMaintenance && !isWhitelisted && pathname !== '/maintenance') {
      console.log('[Middleware] ⛔ Access should be blocked - Checking admin bypass...');
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
      console.log('[Middleware] 🔴 REDIRECTING TO MAINTENANCE PAGE');
      const maintenanceUrl = new URL('/maintenance', request.url);
      return NextResponse.redirect(maintenanceUrl);
    } else {
      console.log('[Middleware] ✅ Access allowed (whitelisted or maintenance page itself)');
    }
  } else {
    console.log('[Middleware] ✅ Maintenance mode OFF - Normal operation');
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
