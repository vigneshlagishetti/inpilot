import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { isAdmin, grantAdminAccess, revokeAdminAccess, getAllAdmins, hasPermission, getArchivedUsers } from '@/lib/admin';

/**
 * GET /api/admin/users
 * Get all users (admin only)
 */
export async function GET(request: NextRequest) {
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

        const url = new URL(request.url);
        const fetchArchived = url.searchParams.get('archived') === 'true';

        if (fetchArchived) {
            const archivedData = await getArchivedUsers();
            const archivedUsers = archivedData.map((user: any) => ({
                id: user.clerk_id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                imageUrl: user.image_url,
                createdAt: new Date(user.archived_at).getTime(), // Using archived_at as createdAt for sorting
                lastSignInAt: null,
                banned: true, // Archived users are effectively banned/gone
                isAdmin: false,
                adminRole: user.role,
                isArchived: true, // Flag to identify archived users in frontend
            }));

            return NextResponse.json({
                users: archivedUsers,
                totalCount: archivedUsers.length,
            });
        }

        // Get all users from Clerk
        const users = await clerkClient.users.getUserList();

        // Get all admin users
        const admins = await getAllAdmins();
        const adminUserIds = new Set(admins.map(admin => admin.user_id));

        // Combine data
        const usersWithAdminStatus = users.data.map(user => ({
            id: user.id,
            email: user.emailAddresses[0]?.emailAddress || '',
            firstName: user.firstName,
            lastName: user.lastName,
            imageUrl: user.imageUrl,
            createdAt: user.createdAt,
            lastSignInAt: user.lastSignInAt,
            banned: user.banned,
            isAdmin: adminUserIds.has(user.id),
            adminRole: admins.find(admin => admin.user_id === user.id)?.role || null,
        }));

        return NextResponse.json({
            users: usersWithAdminStatus,
            totalCount: users.totalCount,
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/admin/users
 * Grant admin access to a user
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

        // Check if user is admin with grant permission
        const adminStatus = await isAdmin(userId);
        if (!adminStatus) {
            return NextResponse.json(
                { error: 'Unauthorized - Admin access required' },
                { status: 403 }
            );
        }

        const canGrant = await hasPermission(userId, 'grant_admin');
        if (!canGrant) {
            return NextResponse.json(
                { error: 'Unauthorized - You do not have permission to grant admin access' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { targetUserId, targetUserEmail, role = 'admin' } = body;

        if (!targetUserId || !targetUserEmail) {
            return NextResponse.json(
                { error: 'Missing required fields: targetUserId and targetUserEmail' },
                { status: 400 }
            );
        }

        const result = await grantAdminAccess(targetUserId, targetUserEmail, role, userId);

        if (!result.success) {
            return NextResponse.json(
                { error: result.message },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: result.message,
            adminUser: result.data,
        });
    } catch (error) {
        console.error('Error granting admin access:', error);
        return NextResponse.json(
            { error: 'Failed to grant admin access' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/admin/users
 * Revoke admin access from a user
 */
export async function DELETE(request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        // Check if user is admin with revoke permission
        const adminStatus = await isAdmin(userId);
        if (!adminStatus) {
            return NextResponse.json(
                { error: 'Unauthorized - Admin access required' },
                { status: 403 }
            );
        }

        const canRevoke = await hasPermission(userId, 'revoke_admin');
        if (!canRevoke) {
            return NextResponse.json(
                { error: 'Unauthorized - You do not have permission to revoke admin access' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { targetUserId } = body;

        if (!targetUserId) {
            return NextResponse.json(
                { error: 'Missing required field: targetUserId' },
                { status: 400 }
            );
        }

        // Prevent self-revocation
        if (targetUserId === userId) {
            return NextResponse.json(
                { error: 'You cannot revoke your own admin access' },
                { status: 400 }
            );
        }

        const result = await revokeAdminAccess(targetUserId);

        if (!result.success) {
            return NextResponse.json(
                { error: result.message },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: result.message,
        });
    } catch (error) {
        console.error('Error revoking admin access:', error);
        return NextResponse.json(
            { error: 'Failed to revoke admin access' },
            { status: 500 }
        );
    }
}
