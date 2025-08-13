import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Plus, Users, Search, Filter } from 'lucide-react';
import './tailwind.css';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';

// Import user management components
import UserList from './list';
import CreateUserDialog from './create';
import DeleteUserDialog from './delete';
import MoveUserDialog from './move';
import ShowUserDialog from './show';
import ChangePasswordDialog from './password';
import SetExpiryDialog from './setexpiry';
import UserStatusToggle from './status-toggle';

// Import hooks
import { useUsers } from './hooks/useUsers';
import type { FilterOptions } from '@/types/samba';

interface UserManagementPageProps {
    initialView?: 'list' | 'management';
}

function UserManagementPage({ initialView = 'list' }: UserManagementPageProps) {
    const [activeTab, setActiveTab] = useState(initialView);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<FilterOptions>({});
    
    const { 
        users, 
        loading, 
        error, 
        refresh: refreshUsers 
    } = useUsers({
        filters: filters,
        autoFetch: true,
    });

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        setFilters(prev => ({ ...prev, search: query }));
    };

    const stats = {
        total: users.length,
        enabled: users.filter(user => user.enabled).length,
        disabled: users.filter(user => !user.enabled).length,
        expiringSoon: users.filter(user => 
            user.accountExpires && 
            user.accountExpires.getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000 // 30 days
        ).length,
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                        <p className="text-muted-foreground">
                            Manage Active Directory users, groups, and permissions
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <CreateUserDialog 
                            onUserCreated={refreshUsers}
                            trigger={
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create User
                                </Button>
                            }
                        />
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Enabled</CardTitle>
                            <div className="h-2 w-2 bg-green-500 rounded-full" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.enabled}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Disabled</CardTitle>
                            <div className="h-2 w-2 bg-red-500 rounded-full" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.disabled}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
                            <div className="h-2 w-2 bg-yellow-500 rounded-full" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.expiringSoon}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'list' | 'management')} className="space-y-4">
                    <div className="flex items-center justify-between">
                        <TabsList>
                            <TabsTrigger value="list">User List</TabsTrigger>
                            <TabsTrigger value="management">Management</TabsTrigger>
                        </TabsList>
                        
                        {activeTab === 'list' && (
                            <div className="flex gap-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search users..."
                                        value={searchQuery}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        className="pl-10 w-[300px]"
                                    />
                                </div>
                                <Button variant="outline" size="icon">
                                    <Filter className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>

                    <TabsContent value="list" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Active Directory Users</CardTitle>
                                <CardDescription>
                                    View and manage all users in your Active Directory domain
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <UserList 
                                    users={users}
                                    loading={loading}
                                    error={error}
                                    onRefresh={refreshUsers}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="management" className="space-y-4">
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <Card>
                                <CardHeader>
                                    <CardTitle>User Operations</CardTitle>
                                    <CardDescription>
                                        Perform common user management tasks
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <CreateUserDialog 
                                        onUserCreated={refreshUsers}
                                        trigger={
                                            <Button variant="outline" className="w-full justify-start">
                                                <Plus className="mr-2 h-4 w-4" />
                                                Create New User
                                            </Button>
                                        }
                                    />
                                    <DeleteUserDialog 
                                        onUserDeleted={refreshUsers}
                                        trigger={
                                            <Button variant="outline" className="w-full justify-start">
                                                Delete User
                                            </Button>
                                        }
                                    />
                                    <MoveUserDialog 
                                        onUserMoved={refreshUsers}
                                        trigger={
                                            <Button variant="outline" className="w-full justify-start">
                                                Move User to OU
                                            </Button>
                                        }
                                    />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Account Management</CardTitle>
                                    <CardDescription>
                                        Manage user accounts and permissions
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <ChangePasswordDialog 
                                        mode="admin"
                                        trigger={
                                            <Button variant="outline" className="w-full justify-start">
                                                Change Password
                                            </Button>
                                        }
                                    />
                                    <SetExpiryDialog 
                                        trigger={
                                            <Button variant="outline" className="w-full justify-start">
                                                Set Account Expiry
                                            </Button>
                                        }
                                    />
                                    <UserStatusToggle 
                                        variant="button"
                                    />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>User Information</CardTitle>
                                    <CardDescription>
                                        View detailed user information
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <ShowUserDialog 
                                        trigger={
                                            <Button variant="outline" className="w-full justify-start">
                                                View User Details
                                            </Button>
                                        }
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

// Entry point for standalone user management page
document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("user");
    if (container) {
        const root = createRoot(container);
        root.render(<UserManagementPage />);
    }
});

export default UserManagementPage;