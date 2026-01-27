// Admin utility functions for managing admin access and permissions

import { createClient } from '@supabase/supabase-js';
import { auth, clerkClient } from '@clerk/nextjs/server';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface AdminUser {
    id: string;
    user_id: string;
    email: string;
    role: string;
    permissions: {
        manage_users?: boolean;
        manage_content?: boolean;
        toggle_maintenance?: boolean;
        grant_admin?: boolean;
        revoke_admin?: boolean;
    };
    granted_by?: string;
    granted_at: string;
    created_at: string;
    updated_at: string;
}

/**
 * Check if a user is an admin
 * @param userId - Clerk user ID
 * @returns boolean indicating admin status
 */
export async function isAdmin(userId: string): Promise<boolean> {
    try {
        const { data, error } = await supabase
            .from('admin_users')
            .select('user_id')
            .eq('user_id', userId);

        if (error) {
            console.error('Error checking admin status:', error);
            return false;
        }

        return data && data.length > 0;
    } catch (error) {
        console.error('Error in isAdmin:', error);
        return false;
    }
}

/**
 * Get admin user details including role and permissions
 * @param userId - Clerk user ID
 * @returns AdminUser object or null
 */
export async function getAdminUser(userId: string): Promise<AdminUser | null> {
    try {
        const { data, error } = await supabase
            .from('admin_users')
            .select('*')
            .eq('user_id', userId);

        if (error) {
            console.error('Error fetching admin user:', error);
            return null;
        }

        return data && data.length > 0 ? (data[0] as AdminUser) : null;
    } catch (error) {
        console.error('Error in getAdminUser:', error);
        return null;
    }
}

/**
 * Check if current authenticated user is an admin
 * @returns boolean indicating admin status
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
    try {
        const { userId } = await auth();
        if (!userId) return false;

        return await isAdmin(userId);
    } catch (error) {
        console.error('Error checking current user admin status:', error);
        return false;
    }
}

/**
 * Grant admin access to a user
 * @param targetUserId - Clerk user ID to grant admin access
 * @param targetUserEmail - Email of the user
 * @param role - Admin role (default: 'admin')
 * @param grantedBy - User ID of the admin granting access
 * @returns Success status and message
 */
export async function grantAdminAccess(
    targetUserId: string,
    targetUserEmail: string,
    role: string = 'admin',
    grantedBy?: string
): Promise<{ success: boolean; message: string; data?: AdminUser }> {
    try {
        // Check if user is already an admin
        const existingAdmin = await getAdminUser(targetUserId);
        if (existingAdmin) {
            return {
                success: false,
                message: 'User is already an admin',
            };
        }

        // Default permissions for regular admin
        const permissions = {
            manage_users: true,
            manage_content: true,
            toggle_maintenance: true,
            grant_admin: role === 'super_admin',
            revoke_admin: role === 'super_admin',
        };

        // Insert into admin_users table
        const { data, error } = await supabase
            .from('admin_users')
            .insert({
                user_id: targetUserId,
                email: targetUserEmail,
                role,
                permissions,
                granted_by: grantedBy || 'system',
            })
            .select()
            .single();

        if (error) {
            console.error('Error granting admin access:', error);
            return {
                success: false,
                message: `Failed to grant admin access: ${error.message}`,
            };
        }

        // Update Clerk user metadata
        try {
            const client = await clerkClient();
            await client.users.updateUserMetadata(targetUserId, {
                publicMetadata: {
                    isAdmin: true,
                    adminRole: role,
                },
            });
        } catch (clerkError) {
            console.error('Error updating Clerk metadata:', clerkError);
            // Continue even if Clerk update fails
        }

        return {
            success: true,
            message: 'Admin access granted successfully',
            data: data as AdminUser,
        };
    } catch (error) {
        console.error('Error in grantAdminAccess:', error);
        return {
            success: false,
            message: 'An unexpected error occurred',
        };
    }
}

/**
 * Revoke admin access from a user
 * @param targetUserId - Clerk user ID to revoke admin access
 * @returns Success status and message
 */
export async function revokeAdminAccess(
    targetUserId: string
): Promise<{ success: boolean; message: string }> {
    try {
        // Delete from admin_users table
        const { error } = await supabase
            .from('admin_users')
            .delete()
            .eq('user_id', targetUserId);

        if (error) {
            console.error('Error revoking admin access:', error);
            return {
                success: false,
                message: `Failed to revoke admin access: ${error.message}`,
            };
        }

        // Update Clerk user metadata
        try {
            const client = await clerkClient();
            await client.users.updateUserMetadata(targetUserId, {
                publicMetadata: {
                    isAdmin: false,
                    adminRole: null,
                },
            });
        } catch (clerkError) {
            console.error('Error updating Clerk metadata:', clerkError);
            // Continue even if Clerk update fails
        }

        return {
            success: true,
            message: 'Admin access revoked successfully',
        };
    } catch (error) {
        console.error('Error in revokeAdminAccess:', error);
        return {
            success: false,
            message: 'An unexpected error occurred',
        };
    }
}

/**
 * Get all admin users
 * @returns Array of admin users
 */
export async function getAllAdmins(): Promise<AdminUser[]> {
    try {
        const { data, error } = await supabase
            .from('admin_users')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching all admins:', error);
            return [];
        }

        return data as AdminUser[];
    } catch (error) {
        console.error('Error in getAllAdmins:', error);
        return [];
    }
}

/**
 * Check if user has specific permission
 * @param userId - Clerk user ID
 * @param permission - Permission to check
 * @returns boolean indicating if user has permission
 */
export async function hasPermission(
    userId: string,
    permission: keyof AdminUser['permissions']
): Promise<boolean> {
    try {
        const adminUser = await getAdminUser(userId);
        if (!adminUser) return false;

        return adminUser.permissions[permission] === true;
    } catch (error) {
        console.error('Error checking permission:', error);
        return false;
    }
}
/**
 * Archive a user before deletion
 * @param userData - User data from Clerk
 * @param archivedBy - Admin ID who performed the deletion
 * @returns Success status
 */
export async function archiveUser(
    userData: any,
    archivedBy: string
): Promise<{ success: boolean; message: string }> {
    try {
        const { error } = await supabase
            .from('archived_users')
            .insert({
                clerk_id: userData.id,
                email: userData.emailAddresses[0]?.emailAddress || 'unknown',
                first_name: userData.firstName,
                last_name: userData.lastName,
                image_url: userData.imageUrl,
                role: userData.publicMetadata?.adminRole || 'user',
                archived_by: archivedBy,
                deletion_reason: 'Admin deletion',
            });

        if (error) {
            console.error('Error archiving user:', error);
            return {
                success: false,
                message: `Failed to archive user: ${error.message}`,
            };
        }

        return { success: true, message: 'User archived successfully' };
    } catch (error) {
        console.error('Error in archiveUser:', error);
        return {
            success: false,
            message: 'An unexpected error occurred during archiving',
        };
    }
}

/**
 * Get all archived users
 * @returns Array of archived users
 */
export async function getArchivedUsers() {
    try {
        const { data, error } = await supabase
            .from('archived_users')
            .select('*')
            .order('archived_at', { ascending: false });

        if (error) {
            console.error('Error fetching archived users:', error);
            return [];
        }

        return data;
    } catch (error) {
        console.error('Error in getArchivedUsers:', error);
        return [];
    }
}
