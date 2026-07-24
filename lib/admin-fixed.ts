// Admin utility functions for managing admin access and permissions

import { createClient } from '@supabase/supabase-js';
import { auth, clerkClient } from '@clerk/nextjs/server';

/**
 * Create Supabase client with service role key for admin operations
 * This bypasses RLS and allows admin operations
 */
function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

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
        const supabase = getSupabaseAdmin();
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
        const supabase = getSupabaseAdmin();
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
