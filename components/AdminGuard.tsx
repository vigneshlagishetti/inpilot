'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface AdminGuardProps {
    children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        async function checkAdminStatus() {
            try {
                const response = await fetch('/api/admin/check');
                const data = await response.json();

                if (data.isAdmin) {
                    setIsAdmin(true);
                } else {
                    // Not an admin, redirect to dashboard
                    router.push('/dashboard');
                }
            } catch (error) {
                console.error('Error checking admin status:', error);
                router.push('/dashboard');
            } finally {
                setIsChecking(false);
            }
        }

        checkAdminStatus();
    }, [router]);

    if (isChecking) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Verifying admin access...</p>
                </div>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
                    <p className="text-gray-600">You do not have admin privileges.</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
