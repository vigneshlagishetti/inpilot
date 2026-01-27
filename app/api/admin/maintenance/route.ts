import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
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

        return NextResponse.json({
            maintenanceMode,
            message: maintenanceMode ? 'Maintenance mode is enabled' : 'Maintenance mode is disabled',
        });
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
        const { userId } = await auth();

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

        // Update maintenance mode in database (real-time!)
        const result = await setMaintenanceMode(enabled, userId);

        if (!result.success) {
            return NextResponse.json(
                { error: result.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            maintenanceMode: enabled,
            message: `${result.message}. Changes are effective immediately - no restart needed!`,
        });
    } catch (error) {
        console.error('Error toggling maintenance mode:', error);
        return NextResponse.json(
            { error: 'Failed to toggle maintenance mode' },
            { status: 500 }
        );
    }
}
