import UserManagementTable from '@/components/admin/UserManagementTable';

export default function AdminUsersPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">User Management</h2>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                    View all registered users and manage admin access permissions.
                </p>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
                <UserManagementTable />
            </div>
        </div>
    );
}
