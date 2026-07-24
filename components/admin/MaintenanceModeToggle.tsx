'use client';

import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, AlertTriangle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function MaintenanceModeToggle() {
    const [enabled, setEnabled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        fetchMaintenanceStatus();

        // Subscribe to real-time changes
        const channel = supabase
            .channel('maintenance-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'maintenance_settings',
                    filter: 'key=eq.maintenance_mode'
                },
                (payload) => {
                    console.log('Maintenance mode changed:', payload);
                    if (payload.new && 'value' in payload.new) {
                        setEnabled(payload.new.value as boolean);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    async function fetchMaintenanceStatus() {
        try {
            // Add cache-busting parameter
            const response = await fetch(`/api/admin/maintenance?t=${Date.now()}`, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                }
            });
            const data = await response.json();
            setEnabled(data.maintenanceMode);
        } catch (error) {
            console.error('Error fetching maintenance status:', error);
            toast({
                title: 'Error',
                description: 'Failed to fetch maintenance mode status',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    }

    async function handleToggle(checked: boolean) {
        setUpdating(true);
        try {
            const response = await fetch(`/api/admin/maintenance?t=${Date.now()}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                },
                body: JSON.stringify({ enabled: checked }),
                cache: 'no-store',
            });

            const data = await response.json();

            if (data.success) {
                setEnabled(checked);
                toast({
                    title: 'Success',
                    description: data.message,
                });
                
                // Broadcast change via realtime channel (realtime will auto-update other clients)
                // The database trigger will handle this, but we can also manually trigger a refresh
                await fetch(`/api/maintenance/status?t=${Date.now()}`, {
                    cache: 'no-store',
                    headers: {
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                    }
                });
            } else {
                toast({
                    title: 'Error',
                    description: data.error || 'Failed to update maintenance mode',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Error toggling maintenance mode:', error);
            toast({
                title: 'Error',
                description: 'Failed to toggle maintenance mode',
                variant: 'destructive',
            });
        } finally {
            setUpdating(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center space-x-2 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-gray-600 dark:text-gray-300">Loading maintenance status...</span>
            </div>
        );
    }

    return (
        <div className={`group relative overflow-hidden rounded-xl border-2 shadow-md transition-all duration-300 hover:shadow-xl ${enabled
            ? 'bg-gradient-to-br from-orange-50 via-red-50 to-orange-50 dark:from-orange-950/30 dark:via-red-950/30 dark:to-orange-950/30 border-orange-300 dark:border-orange-700'
            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}>
            {/* Animated background effect when enabled */}
            {enabled && (
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400/10 to-red-400/10 dark:from-orange-600/20 dark:to-red-600/20 animate-pulse" />
            )}

            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 gap-6 sm:gap-4">
                <div className="flex items-center space-x-4 flex-1 w-full sm:w-auto">
                    <div className={`p-3 rounded-xl transition-all duration-300 flex-shrink-0 ${enabled
                        ? 'bg-orange-100 dark:bg-orange-900/50 shadow-lg scale-110'
                        : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'
                        }`}>
                        <AlertTriangle className={`w-6 h-6 transition-all duration-300 ${enabled
                            ? 'text-orange-600 dark:text-orange-400 animate-bounce'
                            : 'text-gray-400 dark:text-gray-500'
                            }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <Label
                            htmlFor="maintenance-mode"
                            className="text-lg font-bold cursor-pointer text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 block mb-1 truncate"
                        >
                            Maintenance Mode
                        </Label>
                        <p className={`text-sm font-medium transition-colors duration-300 break-words ${enabled
                            ? 'text-orange-700 dark:text-orange-400'
                            : 'text-gray-600 dark:text-gray-400'
                            }`}>
                            {enabled
                                ? '🚧 Site is currently in maintenance mode'
                                : '✅ Site is accessible to all users'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-4 sm:ml-4 pl-14 sm:pl-0">
                    {updating && (
                        <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 animate-fadeIn bg-blue-50 dark:bg-blue-900/30 px-3 py-2 rounded-lg">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm font-medium">Updating...</span>
                        </div>
                    )}
                    <div className="flex flex-col items-center space-y-1 ml-auto sm:ml-0">
                        <Switch
                            id="maintenance-mode"
                            checked={enabled}
                            onCheckedChange={handleToggle}
                            disabled={updating}
                            className="transition-transform duration-200 hover:scale-110 data-[state=checked]:shadow-lg data-[state=checked]:shadow-orange-500/50"
                        />
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            {enabled ? 'ON' : 'OFF'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
