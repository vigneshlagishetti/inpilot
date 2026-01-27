import { Users, MessageSquare, Activity, Shield } from 'lucide-react';
import MaintenanceModeToggle from '@/components/admin/MaintenanceModeToggle';
import Link from 'next/link';

export default function AdminPage() {
    return (
        <div className="space-y-8">
            <div className="animate-fadeIn">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                    Admin Overview
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                    Manage your application, users, and settings from this dashboard.
                </p>
            </div>


            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={<Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
                    title="Total Users"
                    value="View Users"
                    href="/admin/users"
                    bgColor="bg-blue-50 dark:bg-blue-900/20"
                    borderColor="border-blue-200 dark:border-blue-800"
                    delay="0"
                />
                <StatCard
                    icon={<MessageSquare className="w-6 h-6 text-green-600 dark:text-green-400" />}
                    title="Questions Asked"
                    value="Coming Soon"
                    bgColor="bg-green-50 dark:bg-green-900/20"
                    borderColor="border-green-200 dark:border-green-800"
                    delay="100"
                />
                <StatCard
                    icon={<Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />}
                    title="Active Sessions"
                    value="Coming Soon"
                    bgColor="bg-purple-50 dark:bg-purple-900/20"
                    borderColor="border-purple-200 dark:border-purple-800"
                    delay="200"
                />
                <StatCard
                    icon={<Shield className="w-6 h-6 text-orange-600 dark:text-orange-400" />}
                    title="Admin Users"
                    value="View Admins"
                    href="/admin/users"
                    bgColor="bg-orange-50 dark:bg-orange-900/20"
                    borderColor="border-orange-200 dark:border-orange-800"
                    delay="300"
                />
            </div>

            {/* Quick Actions */}
            <div className="space-y-4 animate-fadeIn" style={{ animationDelay: '400ms' }}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Quick Actions</h3>

                <div className="space-y-4">
                    <MaintenanceModeToggle />

                    <div className="group p-6 border rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02] hover:border-blue-200 dark:hover:border-blue-500 border-gray-200 dark:border-gray-700">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                            User Management
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                            View all users, grant or revoke admin access, and manage user permissions.
                        </p>
                        <Link
                            href="/admin/users"
                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 hover:shadow-md hover:scale-105"
                        >
                            <Users className="w-4 h-4 mr-2" />
                            Manage Users
                        </Link>
                    </div>
                </div>
            </div>

            {/* System Information */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 animate-fadeIn" style={{ animationDelay: '500ms' }}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">System Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoRow label="Environment" value={process.env.NODE_ENV || 'development'} />
                    <InfoRow label="Next.js Version" value="14.x" />
                    <InfoRow label="Authentication" value="Clerk" />
                    <InfoRow label="Database" value="Supabase" />
                </div>
            </div>
        </div>
    );
}

function StatCard({
    icon,
    title,
    value,
    href,
    bgColor = 'bg-gray-50 dark:bg-gray-800',
    borderColor = 'border-gray-200 dark:border-gray-700',
    delay = '0',
}: {
    icon: React.ReactNode;
    title: string;
    value: string;
    href?: string;
    bgColor?: string;
    borderColor?: string;
    delay?: string;
}) {
    const content = (
        <div
            className={`${bgColor} p-6 rounded-xl border ${borderColor} shadow-sm ${href ? 'hover:shadow-xl hover:scale-105 hover:-translate-y-1 cursor-pointer' : 'hover:shadow-md'
                } transition-all duration-300 animate-fadeIn`}
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
                </div>
                <div className={`${bgColor} p-3 rounded-lg ${href ? 'group-hover:scale-110 group-hover:rotate-12' : ''} transition-transform duration-300`}>
                    {icon}
                </div>
            </div>
        </div>
    );

    if (href) {
        return <Link href={href} className="group">{content}</Link>;
    }

    return content;
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="group flex justify-between items-center py-3 px-4 border-b border-gray-100 dark:border-gray-700 last:border-0 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200">
            <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors duration-200">{label}</span>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:scale-105 transition-transform duration-200">{value}</span>
        </div>
    );
}
