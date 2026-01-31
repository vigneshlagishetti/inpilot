import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { isAdmin, hasPermission } from '@/lib/admin';
import { getMaintenanceMode, setMaintenanceMode } from '@/lib/maintenance-config';

/**
 * GET /api/admin/maintenance
 * Get current maintenance mode status
 */
export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        // Check if user is admin
        const adminStatus = await isAdmin(userId);
        if (!adminStatus) {
            return NextResponse.json(
                { error: 'Unauthorized - Admin access required' },
                { status: 403 }
            );
        }

        const maintenanceMode = await getMaintenanceMode();

        return NextResponse.json(
            {
                maintenanceMode,
                message: maintenanceMode ? 'Maintenance mode is enabled' : 'Maintenance mode is disabled',
            },
            {
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                    'CDN-Cache-Control': 'no-store',
                    'Vercel-CDN-Cache-Control': 'no-store',
                }
            }
        );
    } catch (error) {
        console.error('Error getting maintenance status:', error);
        return NextResponse.json(
            { error: 'Failed to get maintenance status' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/admin/maintenance
 * Toggle maintenance mode (real-time, no restart needed!)
 */
export async function POST(request: NextRequest) {
    try {
        const { userId, getToken } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        // Check if user is admin with toggle permission
        const adminStatus = await isAdmin(userId);
        if (!adminStatus) {
            return NextResponse.json(
                { error: 'Unauthorized - Admin access required' },
                { status: 403 }
            );
        }

        const canToggle = await hasPermission(userId, 'toggle_maintenance');
        if (!canToggle) {
            return NextResponse.json(
                { error: 'Unauthorized - You do not have permission to toggle maintenance mode' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { enabled } = body;

        if (typeof enabled !== 'boolean') {
            return NextResponse.json(
                { error: 'Invalid request - enabled must be a boolean' },
                { status: 400 }
            );
        }

        // Create authenticated Supabase client
        let supabaseClient = undefined;
        try {
            console.log('[API] Attempting to get Supabase token...');
            const token = await getToken({ template: 'supabase' });

            if (token) {
                console.log('[API] Token found, length:', token.length);
                supabaseClient = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                    {
                        global: { headers: { Authorization: `Bearer ${token}` } },
                    }
                );
            } else {
                console.warn('[API] No Supabase token found. Ensure Clerk-Supabase integration is set up.');
                // Return explicit error to help user debug
                return NextResponse.json(
                    { error: 'Missing Clerk-Supabase Token. Please enable Supabase Integration in Clerk Dashboard.' },
                    { status: 500 }
                );
            }
        } catch (tokenError) {
            console.error('[API] Error getting Supabase token:', tokenError);
            return NextResponse.json(
                { error: 'Error retrieving authentication token' },
                { status: 500 }
            );
        }

        // Update maintenance mode in database (real-time!)
        // Pass the authenticated client if available, otherwise it falls back to anon (and might fail RLS)
        const result = await setMaintenanceMode(enabled, userId, supabaseClient);

        if (!result.success) {
            return NextResponse.json(
                { error: result.message },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                maintenanceMode: enabled,
                message: `${result.message}. Changes are effective immediately - no restart needed!`,
            },
            {
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0, s-maxage=0',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                    'CDN-Cache-Control': 'no-store',
                    'Vercel-CDN-Cache-Control': 'no-store',
                }
            }
        );
    } catch (error) {
        console.error('Error toggling maintenance mode:', error);
        return NextResponse.json(
            { error: 'Failed to toggle maintenance mode' },
            { status: 500 }
        );
    }
}
