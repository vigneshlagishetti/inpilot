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

        return NextResponse.json(
            {
                enabled,
                message: enabled ? 'Maintenance mode is active' : 'Site is operational',
                timestamp: Date.now(),
            },
            {
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                    'Surrogate-Control': 'no-store',
                    'CDN-Cache-Control': 'no-store',
                    'Vercel-CDN-Cache-Control': 'no-store',
                }
            }
        );
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
