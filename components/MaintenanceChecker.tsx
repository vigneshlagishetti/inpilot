'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * MaintenanceChecker - Monitors maintenance mode in real-time
 * Automatically redirects NON-ADMIN users to maintenance page when mode is enabled
 * Admins can bypass maintenance mode
 */
export default function MaintenanceChecker() {
    const router = useRouter();
    const { user } = useUser();
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [currentPath, setCurrentPath] = useState('');

    // Track current path to prevent redirect loops
    useEffect(() => {
        setCurrentPath(window.location.pathname);
    }, []);

    // Check if user is admin
    useEffect(() => {
        if (user) {
            checkAdminStatus();
        }
    }, [user]);

    async function checkAdminStatus() {
        try {
            const response = await fetch('/api/admin/check');
            const data = await response.json();
            setIsAdmin(data.isAdmin || false);
            console.log('[MaintenanceChecker] Admin status:', data.isAdmin);
        } catch (error) {
            console.error('[MaintenanceChecker] Error checking admin status:', error);
            setIsAdmin(false);
        }
    }

    useEffect(() => {
        // Don't check maintenance mode until we know admin status
        if (isAdmin === null) return;

        // Initial check
        checkMaintenanceMode();

        // Subscribe to real-time changes
        const channel = supabase
            .channel('maintenance-status-checker')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'maintenance_settings',
                    filter: 'key=eq.maintenance_mode'
                },
                (payload) => {
                    console.log('[MaintenanceChecker] Maintenance mode changed:', payload);
                    if (payload.new && 'value' in payload.new) {
                        const isEnabled = payload.new.value as boolean;
                        // Only redirect if NOT already on maintenance page
                        if (isEnabled && !isAdmin && currentPath !== '/maintenance') {
                            // Maintenance mode turned ON and user is NOT admin - redirect
                            console.log('[MaintenanceChecker] Redirecting to maintenance page (non-admin user)');
                            window.location.href = '/maintenance';
                        } else if (isEnabled && isAdmin) {
                            console.log('[MaintenanceChecker] Maintenance mode ON but admin bypass active');
                        }
                    }
                }
            )
            .subscribe((status) => {
                console.log('[MaintenanceChecker] Subscription status:', status);
            });

        // Fallback polling every 10 seconds (in case realtime fails)
        const pollInterval = setInterval(checkMaintenanceMode, 10000);

        return () => {
            supabase.removeChannel(channel);
            clearInterval(pollInterval);
        };
    }, [router, isAdmin]);

    async function checkMaintenanceMode() {
        try {
            // Skip check for admins
            if (isAdmin) {
                console.log('[MaintenanceChecker] Admin user - skipping maintenance check');
                return;
            }

            // Skip check if already on maintenance page (prevent redirect loop)
            if (currentPath === '/maintenance') {
                console.log('[MaintenanceChecker] Already on maintenance page - skipping check');
                return;
            }

            const response = await fetch(`/api/maintenance/status?t=${Date.now()}`, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
                    'Pragma': 'no-cache',
                }
            });
            const data = await response.json();
            
            if (data.enabled) {
                console.log('[MaintenanceChecker] Maintenance mode detected via polling (non-admin user)');
                window.location.href = '/maintenance';
            }
        } catch (error) {
            console.error('[MaintenanceChecker] Error checking maintenance mode:', error);
        }
    }

    return null; // This component doesn't render anything
}
