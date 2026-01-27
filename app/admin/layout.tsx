import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import AdminGuard from '@/components/AdminGuard';
import { Home } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import AdminNav from '@/components/admin/AdminNav';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AdminGuard>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                {/* Header */}
                <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 shadow-sm transition-all duration-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center space-x-3 md:space-x-4">
                                <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate">
                                    Admin Dashboard
                                </h1>
                                <span className="hidden sm:inline-block px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 rounded-full animate-pulse">
                                    ADMIN
                                </span>
                            </div>
                            <div className="flex items-center space-x-4 md:space-x-6">
                                <ThemeToggle />
                                <Link
                                    href="/dashboard"
                                    className="group text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center space-x-2 transition-all duration-200 hover:scale-105"
                                >
                                    <Home className="w-5 h-5 group-hover:rotate-12 transition-transform duration-200" />
                                    <span className="hidden sm:inline-block font-medium">Back to App</span>
                                </Link>
                                <div className="hover:scale-110 transition-transform duration-200 pl-2 border-l border-gray-200 dark:border-gray-700">
                                    <UserButton afterSignOutUrl="/" />
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
                    <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                        {/* Responsive Navigation */}
                        <AdminNav />

                        {/* Main Content */}
                        <main className="flex-1 min-w-0 animate-fadeIn space-y-6">
                            {children}
                        </main>
                    </div>
                </div>
            </div>
        </AdminGuard>
    );
}
