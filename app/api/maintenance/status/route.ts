import { NextResponse } from 'next/server';
import { getMaintenanceMode } from '@/lib/maintenance-config';

/**
 * GET /api/maintenance/status
 * Public endpoint to check maintenance mode status
 * Used by middleware for real-time checks
 */
export async function GET() {
    try {
        const enabled = await getMaintenanceMode();

        return NextResponse.json({
            enabled,
            message: enabled ? 'Maintenance mode is active' : 'Site is operational',
        });
    } catch (error) {
        console.error('Error getting maintenance status:', error);
        return NextResponse.json(
            {
                enabled: false,
                message: 'Error checking maintenance status',
            },
            { status: 500 }
        );
    }
}
