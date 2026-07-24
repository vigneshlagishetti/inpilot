import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { isAdmin, getAdminUser } from '@/lib/admin';

/**
 * GET /api/admin/check
 * Check if the current user is an admin
 */
export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { isAdmin: false, message: 'Not authenticated' },
                { status: 401 }
            );
        }

        const adminStatus = await isAdmin(userId);

        if (!adminStatus) {
            return NextResponse.json(
                { isAdmin: false, message: 'Not an admin' },
                { status: 200 }
            );
        }

        const adminUser = await getAdminUser(userId);

        return NextResponse.json({
            isAdmin: true,
            adminUser: adminUser,
            message: 'Admin access confirmed',
        });
    } catch (error) {
        console.error('Error checking admin status:', error);
        return NextResponse.json(
            { isAdmin: false, message: 'Error checking admin status' },
            { status: 500 }
        );
    }
}
