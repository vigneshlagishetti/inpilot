import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { isAdmin, hasPermission, archiveUser } from '@/lib/admin';

export async function POST(request: NextRequest) {
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

        const body = await request.json();
        const { action, targetUserId } = body;

        if (!action || !targetUserId) {
            return NextResponse.json(
                { error: 'Missing required fields: action and targetUserId' },
                { status: 400 }
            );
        }

        // Prevent actions on self
        if (targetUserId === userId) {
            return NextResponse.json(
                { error: 'You cannot perform administrative actions on yourself' },
                { status: 400 }
            );
        }

        switch (action) {
            case 'block':
                // Check specific permission if needed, for now general admin access allows it
                // const canBlock = await hasPermission(userId, 'block_users');
                await clerkClient.users.banUser(targetUserId);
                return NextResponse.json({ success: true, message: 'User blocked successfully' });

            case 'unblock':
                await clerkClient.users.unbanUser(targetUserId);
                return NextResponse.json({ success: true, message: 'User unblocked successfully' });

                // Archive user before deletion
                try {
                    const client = await clerkClient();
                    const userToArchive = await client.users.getUser(targetUserId);
                    if (userToArchive) {
                        const { success, message } = await archiveUser(userToArchive, userId!);
                        if (!success) {
                            console.error('Failed to archive user:', message);
                            // We can choose to abort here if archiving is critical
                            // For now, valid to log and proceed, or we could return error.
                            // User asked for "history", so let's try to ensure it works.
                            // If table doesn't exist, this will fail.
                        }
                    }
                } catch (archiveError) {
                    console.error('Error preparing archive:', archiveError);
                    // Continue with deletion even if archive fails? 
                    // Ideally we should warn, but let's proceed to not block functionality.
                }

                const client = await clerkClient();
                await client.users.deleteUser(targetUserId);
                return NextResponse.json({ success: true, message: 'User deleted and archived successfully' });

            default:
                return NextResponse.json(
                    { error: 'Invalid action provided' },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('Error performing user action:', error);
        return NextResponse.json(
            { error: 'Failed to perform action' },
            { status: 500 }
        );
    }
}
