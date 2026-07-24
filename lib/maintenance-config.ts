import { supabase } from '@/lib/supabase';
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Get maintenance mode status from database
 * This allows real-time updates without server restart
 */
export async function getMaintenanceMode(): Promise<boolean> {
    try {
        const { data, error } = await supabase
            .from('maintenance_settings')
            .select('value')
            .eq('key', 'maintenance_mode')
            .single();

        if (error) {
            console.error('Error fetching maintenance mode:', error);
            // Fallback to environment variable
            return process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';
        }

        return data?.value || false;
    } catch (error) {
        console.error('Error in getMaintenanceMode:', error);
        // Fallback to environment variable
        return process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';
    }
}

/**
 * Update maintenance mode status in database
 * @param enabled - Whether maintenance mode should be enabled
 * @param updatedBy - User ID of the admin making the change
 * @param client - Optional authenticated Supabase client
 */
export async function setMaintenanceMode(
    enabled: boolean,
    updatedBy?: string,
    client: SupabaseClient = supabase
): Promise<{ success: boolean; message: string }> {
    try {
        console.log(`[setMaintenanceMode] 🔄 Updating maintenance mode to: ${enabled}`);
        console.log(`[setMaintenanceMode] Updated by: ${updatedBy || 'system'}`);
        
        const { error } = await client
            .from('maintenance_settings')
            .upsert({
                key: 'maintenance_mode',
                value: enabled,
                updated_by: updatedBy || 'system',
                updated_at: new Date().toISOString(),
            }, { onConflict: 'key' });

        if (error) {
            console.error('[setMaintenanceMode] ❌ Error updating maintenance mode:', error);
            // Throwing error to be caught by the caller or the catch block below
            // Return formatted error
            return {
                success: false,
                message: `Failed to update maintenance mode: ${error.message}`,
            };
        }

        console.log(`[setMaintenanceMode] ✅ Successfully updated to: ${enabled}`);
        
        // Verify the update by reading it back
        const { data: verifyData, error: verifyError } = await client
            .from('maintenance_settings')
            .select('value')
            .eq('key', 'maintenance_mode')
            .single();
            
        if (!verifyError && verifyData) {
            console.log(`[setMaintenanceMode] 🔍 Verification - Database now shows: ${verifyData.value}`);
        }

        return {
            success: true,
            message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'} successfully`,
        };
    } catch (error: any) {
        console.error('[setMaintenanceMode] ❌ Exception in setMaintenanceMode:', error);
        return {
            success: false,
            message: `An unexpected error occurred: ${error.message || error}`,
        };
    }
}

// Fallback: Keep the old configuration for backwards compatibility
export const MAINTENANCE_MODE = false;

// Optional: Whitelist specific paths that should bypass maintenance mode
export const MAINTENANCE_WHITELIST = [
    '/maintenance',
    '/api',
    '/_next',
    '/favicon.ico',
    '/sign-in',
    '/sign-up',
];

// Optional: Whitelist specific email addresses that can bypass maintenance mode
export const ADMIN_EMAILS = [
    'lvigneshbunty789@gmail.com',
    // Add more admin emails here
];

// Optional: Whitelist specific User IDs (Clerk) that can bypass maintenance mode
export const ADMIN_IDS = [
    'user_38eCGWlRm5M7BDNSVvobCLfhS36', // Vignesh (Admin)
];
