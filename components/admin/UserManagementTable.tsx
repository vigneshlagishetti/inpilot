'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Shield, ShieldOff, Search, MoreVertical, Ban, Trash2, CheckCircle, Unlock, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface User {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string;
    createdAt: number;
    lastSignInAt: number | null;
    banned: boolean;
    isAdmin: boolean;
    adminRole: string | null;
    isArchived?: boolean;
}

export default function UserManagementTable() {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterTab, setFilterTab] = useState('all');
    const [processingUserId, setProcessingUserId] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        fetchUsers();
    }, [filterTab]);

    useEffect(() => {
        let result = users;

        // 1. Filter by Tab (Client-side filtering for active users)
        // Note: 'archived' tab is handled by server-side fetch in the other useEffect
        if (filterTab === 'admins') {
            result = result.filter(user => user.isAdmin);
        } else if (filterTab === 'banned') {
            result = result.filter(user => user.banned && !user.isArchived);
        } else if (filterTab === 'archived') {
            // For archived tab, we expect the users array to ALREADY be archived users based on fetchUsers
            result = result.filter(user => user.isArchived);
        } else {
            // 'all' tab - exclude archived users if any accidentally in state (though fetchUsers handles this)
            result = result.filter(user => !user.isArchived);
        }

        // 2. Filter by Search Query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(user =>
                user.email.toLowerCase().includes(query) ||
                user.firstName?.toLowerCase().includes(query) ||
                user.lastName?.toLowerCase().includes(query)
            );
        }

        setFilteredUsers(result);
    }, [searchQuery, users, filterTab]);

    async function fetchUsers() {
        setLoading(true);
        try {
            const isArchivedTab = filterTab === 'archived';
            const endpoint = isArchivedTab
                ? '/api/admin/users?archived=true'
                : '/api/admin/users';

            const response = await fetch(endpoint);
            const data = await response.json();

            if (data.users) {
                setUsers(data.users);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast({
                title: 'Error',
                description: 'Failed to fetch users',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    }

    async function handleUserAction(user: User, action: 'grant_admin' | 'revoke_admin' | 'block' | 'unblock' | 'delete') {
        setProcessingUserId(user.id);

        try {
            let endpoint = '/api/admin/users/actions';
            let method = 'POST';
            let body: any = { action, targetUserId: user.id };

            // Handle legacy admin endpoints if preferred, or unify everything here.
            // Using the legacy endpoints for admin rights to maintain backward compat if needed,
            // but for cleaner code let's assume we use specific endpoints or the new actions endpoint.
            // Actually, for admin grant/revoke, let's stick to the existing /api/admin/users endpoint
            // OR migrate. Let's stick to the existing ones for admin rights to be safe,
            // and use the new one for block/unblock/delete.

            if (action === 'grant_admin') {
                endpoint = '/api/admin/users';
                method = 'POST';
                body = { targetUserId: user.id, targetUserEmail: user.email, role: 'admin' };
            } else if (action === 'revoke_admin') {
                endpoint = '/api/admin/users';
                method = 'DELETE';
                body = { targetUserId: user.id };
            }

            const response = await fetch(endpoint, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: 'Success',
                    description: data.message || `Action ${action} completed successfully`,
                });
                fetchUsers();
            } else {
                throw new Error(data.error || 'Operation failed');
            }
        } catch (error: any) {
            console.error(`Error performing ${action}:`, error);
            toast({
                title: 'Error',
                description: error.message || `Failed to perform ${action}`,
                variant: 'destructive',
            });
        } finally {
            setProcessingUserId(null);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Search */}
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <Input
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                    />
                </div>

                {/* Tabs */}
                <Tabs defaultValue="all" value={filterTab} onValueChange={setFilterTab} className="w-full md:w-auto">
                    <TabsList className="flex w-full overflow-x-auto md:grid md:w-auto md:grid-cols-4 no-scrollbar">
                        <TabsTrigger value="all" className="flex-1 md:flex-none">All Users</TabsTrigger>
                        <TabsTrigger value="admins" className="flex-1 md:flex-none">Admins</TabsTrigger>
                        <TabsTrigger value="banned" className="flex-1 md:flex-none">Banned</TabsTrigger>
                        <TabsTrigger value="archived" className="flex-1 md:flex-none">Archived</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[250px]">User</TableHead>
                            <TableHead className="w-[200px]">Email</TableHead>
                            <TableHead className="w-[120px]">Status</TableHead>
                            <TableHead className="w-[120px]">Role</TableHead>
                            <TableHead className="w-[120px]">{filterTab === 'archived' ? 'Archived At' : 'Joined'}</TableHead>
                            <TableHead className="text-right w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.map((user) => (
                            <TableRow key={user.id} className="group hover:bg-muted/50 dark:hover:bg-muted/50">
                                <TableCell className="font-medium">
                                    <div className="flex items-center space-x-3">
                                        <img
                                            src={user.imageUrl}
                                            alt={user.email}
                                            className={`w-9 h-9 rounded-full flex-shrink-0 border border-gray-200 dark:border-gray-700 ${user.isArchived ? 'grayscale opacity-70' : ''}`}
                                        />
                                        <div className="min-w-0">
                                            <p className={`text-sm font-medium truncate max-w-[150px] ${user.isArchived ? 'text-gray-500 line-through' : 'text-gray-900 dark:text-gray-100'}`}>
                                                {user.firstName || user.lastName
                                                    ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                                                    : 'No name'}
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm text-gray-600 dark:text-gray-300 truncate block max-w-[180px]">
                                        {user.email}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        {user.isArchived ? (
                                            <Badge variant="outline" className="border-gray-300 text-gray-500 bg-gray-50">
                                                Archived
                                            </Badge>
                                        ) : user.banned ? (
                                            <Badge variant="destructive" className="flex items-center gap-1">
                                                <Ban className="w-3 h-3" /> Banned
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-green-600 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 flex items-center gap-1">
                                                <CheckCircle className="w-3 h-3" /> Active
                                            </Badge>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {user.isAdmin ? (
                                        <Badge className="bg-blue-600 hover:bg-blue-700 flex w-fit items-center gap-1">
                                            <Shield className="w-3 h-3" /> Admin
                                        </Badge>
                                    ) : (
                                        <span className="text-sm text-gray-500 dark:text-gray-400">{user.adminRole || 'User'}</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 p-0" disabled={processingUserId === user.id}>
                                                {processingUserId === user.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <MoreVertical className="w-4 h-4" />
                                                )}
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-[160px]">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuSeparator />

                                            {/* Actions for Archived Users */}
                                            {user.isArchived ? (
                                                <>
                                                    <DropdownMenuItem disabled className="text-gray-400">
                                                        <Ban className="mr-2 h-4 w-4" />
                                                        Restore (N/A)
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                </>
                                            ) : (
                                                /* Actions for Active Users */
                                                <>
                                                    {/* Admin Status Actions */}
                                                    {user.isAdmin ? (
                                                        <DropdownMenuItem
                                                            onClick={() => handleUserAction(user, 'revoke_admin')}
                                                            className="text-red-600 focus:text-red-600"
                                                        >
                                                            <ShieldOff className="mr-2 h-4 w-4" />
                                                            Revoke Admin
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem
                                                            onClick={() => handleUserAction(user, 'grant_admin')}
                                                            className="text-blue-600 focus:text-blue-600"
                                                        >
                                                            <Shield className="mr-2 h-4 w-4" />
                                                            Make Admin
                                                        </DropdownMenuItem>
                                                    )}

                                                    <DropdownMenuSeparator />

                                                    {/* Block/Unblock Actions */}
                                                    {user.banned ? (
                                                        <DropdownMenuItem onClick={() => handleUserAction(user, 'unblock')}>
                                                            <Unlock className="mr-2 h-4 w-4" />
                                                            Unblock User
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem onClick={() => handleUserAction(user, 'block')} className="text-orange-600 focus:text-orange-600">
                                                            <Ban className="mr-2 h-4 w-4" />
                                                            Block User
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                </>
                                            )}

                                            {/* Delete Action (Permanent for both) */}
                                            <DropdownMenuItem
                                                onClick={() => {
                                                    const message = user.isArchived
                                                        ? 'Are you sure you want to permanently delete this record from the archive?'
                                                        : 'Are you sure? This will delete the user and move them to the archive.';
                                                    if (confirm(message)) {
                                                        // For archived users, we might need a specific 'delete_archived' action or just use 'delete' if API handles it?
                                                        // Current API 'delete' calls clerk delete. 
                                                        // If user is archived, they are NOT in Clerk.
                                                        // We need a new action 'delete_archived' or handle it in handleDelete
                                                        if (user.isArchived) {
                                                            alert('Permanent deletion of archived records is not yet implemented.');
                                                        } else {
                                                            handleUserAction(user, 'delete');
                                                        }
                                                    }
                                                }}
                                                className="text-red-600 focus:text-red-600"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                {user.isArchived ? 'Delete Record' : 'Delete User'}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>

                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {filteredUsers.length === 0 && (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                    <UserX className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No users found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        {searchQuery ? `No users matching "${searchQuery}"` : 'No users found in this category'}
                    </p>
                </div>
            )}

            <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 px-2">
                <div>Total Users: {users.length}</div>
                <div>Showing: {filteredUsers.length}</div>
            </div>
        </div>
    );
}
