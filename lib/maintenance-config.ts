// Real-time maintenance mode configuration using Supabase
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
 */
export async function setMaintenanceMode(
    enabled: boolean,
    updatedBy?: string
): Promise<{ success: boolean; message: string }> {
    try {
        const { error } = await supabase
            .from('maintenance_settings')
            .update({
                value: enabled,
                updated_by: updatedBy || 'system',
            })
            .eq('key', 'maintenance_mode');

        if (error) {
            console.error('Error updating maintenance mode:', error);
            return {
                success: false,
                message: `Failed to update maintenance mode: ${error.message}`,
            };
        }

        return {
            success: true,
            message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'} successfully`,
        };
    } catch (error) {
        console.error('Error in setMaintenanceMode:', error);
        return {
            success: false,
            message: 'An unexpected error occurred',
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
];

// Optional: Whitelist specific email addresses that can bypass maintenance mode
export const ADMIN_EMAILS = [
    'lvigneshbunty789@gmail.com',
    // Add more admin emails here
];
