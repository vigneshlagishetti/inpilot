import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { isAdmin, getAdminUser } from '@/lib/admin';

/**
 * POST /api/admin/sync-metadata
 * Sync admin status from database to Clerk metadata
 * Run this once to update your Clerk user with admin status
 */
export async function POST() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        // Check if user is admin in database
        const adminStatus = await isAdmin(userId);
        const adminUser = await getAdminUser(userId);

        if (!adminStatus || !adminUser) {
            return NextResponse.json(
                { error: 'User is not an admin in database' },
                { status: 403 }
            );
        }

        // Update Clerk metadata
        const client = await clerkClient();
        await client.users.updateUserMetadata(userId, {
            publicMetadata: {
                isAdmin: true,
                adminRole: adminUser.role,
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Admin metadata synced successfully',
            user: {
                userId,
                email: adminUser.email,
                role: adminUser.role,
            },
        });
    } catch (error) {
        console.error('Error syncing admin metadata:', error);
        return NextResponse.json(
            { error: 'Failed to sync admin metadata' },
            { status: 500 }
        );
    }
}
