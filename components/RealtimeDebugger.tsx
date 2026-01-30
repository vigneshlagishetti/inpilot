'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2, Wifi, WifiOff } from 'lucide-react';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * RealtimeDebugger - Test component to verify realtime is working
 * Add this to any page temporarily to check realtime connection
 */
export default function RealtimeDebugger() {
    const [connectionStatus, setConnectionStatus] = useState<string>('CONNECTING');
    const [lastUpdate, setLastUpdate] = useState<string>('Waiting for changes...');
    const [updateCount, setUpdateCount] = useState(0);
    const [maintenanceMode, setMaintenanceMode] = useState<boolean | null>(null);

    useEffect(() => {
        // Initial check
        checkStatus();

        // Subscribe to realtime changes
        const channel = supabase
            .channel('realtime-debug-test')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'maintenance_settings',
                    filter: 'key=eq.maintenance_mode'
                },
                (payload) => {
                    console.log('🎉 Realtime update received!', payload);
                    setLastUpdate(new Date().toLocaleTimeString());
                    setUpdateCount(prev => prev + 1);
                    if (payload.new && 'value' in payload.new) {
                        setMaintenanceMode(payload.new.value as boolean);
                    }
                }
            )
            .subscribe((status) => {
                console.log('Realtime subscription status:', status);
                setConnectionStatus(status);
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    async function checkStatus() {
        try {
            const response = await fetch(`/api/maintenance/status?t=${Date.now()}`, {
                cache: 'no-store'
            });
            const data = await response.json();
            setMaintenanceMode(data.enabled);
        } catch (error) {
            console.error('Error checking status:', error);
        }
    }

    const getStatusColor = () => {
        switch (connectionStatus) {
            case 'SUBSCRIBED': return 'bg-green-500';
            case 'CHANNEL_ERROR': return 'bg-red-500';
            case 'TIMED_OUT': return 'bg-orange-500';
            default: return 'bg-yellow-500';
        }
    };

    const getStatusIcon = () => {
        switch (connectionStatus) {
            case 'SUBSCRIBED': return <Wifi className="w-4 h-4" />;
            case 'CHANNEL_ERROR': return <WifiOff className="w-4 h-4" />;
            case 'TIMED_OUT': return <XCircle className="w-4 h-4" />;
            default: return <Loader2 className="w-4 h-4 animate-spin" />;
        }
    };

    return (
        <Card className="fixed bottom-4 right-4 w-80 shadow-2xl z-50 border-2">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                    <span>Realtime Debugger</span>
                    <Badge className={`${getStatusColor()} text-white flex items-center gap-1`}>
                        {getStatusIcon()}
                        {connectionStatus}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="text-gray-600 dark:text-gray-400">Maintenance Mode:</span>
                    {maintenanceMode === null ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Badge variant={maintenanceMode ? "destructive" : "default"}>
                            {maintenanceMode ? 'ON' : 'OFF'}
                        </Badge>
                    )}
                </div>
                
                <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="text-gray-600 dark:text-gray-400">Updates Received:</span>
                    <Badge variant="outline">{updateCount}</Badge>
                </div>

                <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="text-gray-600 dark:text-gray-400">Last Update:</span>
                    <span className="text-gray-900 dark:text-gray-100 font-mono text-xs">
                        {lastUpdate}
                    </span>
                </div>

                <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-950 rounded text-xs">
                    <p className="text-blue-900 dark:text-blue-100 font-medium mb-1">
                        ℹ️ Testing Instructions:
                    </p>
                    <ol className="list-decimal list-inside text-blue-800 dark:text-blue-200 space-y-1">
                        <li>Open admin panel in another tab</li>
                        <li>Toggle maintenance mode ON/OFF</li>
                        <li>Watch "Updates Received" counter</li>
                        <li>Should update instantly without reload</li>
                    </ol>
                </div>

                {connectionStatus === 'SUBSCRIBED' && (
                    <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950 rounded">
                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="text-green-800 dark:text-green-200">
                            ✓ Realtime is working!
                        </span>
                    </div>
                )}

                {connectionStatus === 'CHANNEL_ERROR' && (
                    <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-950 rounded">
                        <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                        <span className="text-red-800 dark:text-red-200">
                            ✗ Realtime connection failed
                        </span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
