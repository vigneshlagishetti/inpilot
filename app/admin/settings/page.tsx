import MaintenanceModeToggle from '@/components/admin/MaintenanceModeToggle';
import { Settings as SettingsIcon } from 'lucide-react';

export default function AdminSettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Settings</h2>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                    Configure application settings and preferences.
                </p>
            </div>

            <div className="space-y-6">
                {/* Maintenance Mode Section */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center space-x-2 mb-4">
                        <SettingsIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Site Maintenance</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        Enable maintenance mode to temporarily restrict access to the site.
                        Admin users will still be able to access all features.
                    </p>
                    <MaintenanceModeToggle />
                </div>

                {/* Future Settings Sections */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">General Settings</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Additional settings will be available here in future updates.
                    </p>
                </div>
            </div>
        </div>
    );
}
