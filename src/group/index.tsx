import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Plus, Users, Search, Filter, UsersIcon } from 'lucide-react'
import '../user/tailwind.css'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs'

// Import modernized components
import GroupList from './list'
import CreateGroupDialog from './create'
import DeleteGroupDialog from './delete'
import GroupDetailsDialog from './show'
import MoveGroupDialog from './move'
import ListMembersDialog from './listmembers'
import RemoveMembersDialog from './removemembers'

// Import hooks
import { useGroups } from './hooks/useGroups'
import type { FilterOptions } from '@/types/samba'

interface GroupManagementPageProps {
    initialView?: 'list' | 'management';
}

function GroupManagementPage ({ initialView = 'list' }: GroupManagementPageProps) {
  const [activeTab, setActiveTab] = useState(initialView)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<FilterOptions>({})

  const {
    groups,
    loading,
    error,
    refresh: refreshGroups
  } = useGroups()

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setFilters(prev => ({ ...prev, search: query }))
  }

  const stats = {
    total: groups.length,
    security: groups.filter(group => group.groupType === 'Security').length,
    distribution: groups.filter(group => group.groupType === 'Distribution').length,
    global: groups.filter(group => group.groupScope === 'Global').length
  }

  return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Group Management</h1>
                        <p className="text-muted-foreground">
                            Manage Active Directory groups, members, and permissions
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <CreateGroupDialog
                            onGroupCreated={refreshGroups}
                            trigger={
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Group
                                </Button>
                            }
                        />
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Groups</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Security Groups</CardTitle>
                            <div className="h-2 w-2 bg-blue-500 rounded-full" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.security}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Distribution Groups</CardTitle>
                            <div className="h-2 w-2 bg-green-500 rounded-full" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.distribution}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Global Scope</CardTitle>
                            <div className="h-2 w-2 bg-purple-500 rounded-full" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.global}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'list' | 'management')} className="space-y-4">
                    <div className="flex items-center justify-between">
                        <TabsList>
                            <TabsTrigger value="list">Group List</TabsTrigger>
                            <TabsTrigger value="management">Management</TabsTrigger>
                        </TabsList>

                        {activeTab === 'list' && (
                            <div className="flex gap-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search groups..."
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
                                <CardTitle>Active Directory Groups</CardTitle>
                                <CardDescription>
                                    View and manage all groups in your Active Directory domain
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <GroupList
                                    groups={groups}
                                    loading={loading}
                                    error={error}
                                    onRefresh={refreshGroups}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="management" className="space-y-4">
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Group Operations</CardTitle>
                                    <CardDescription>
                                        Perform common group management tasks
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <CreateGroupDialog
                                        onGroupCreated={refreshGroups}
                                        trigger={
                                            <Button variant="outline" className="w-full justify-start">
                                                <Plus className="mr-2 h-4 w-4" />
                                                Create New Group
                                            </Button>
                                        }
                                    />
                                    <DeleteGroupDialog
                                        onGroupDeleted={refreshGroups}
                                        trigger={
                                            <Button variant="outline" className="w-full justify-start">
                                                Delete Group
                                            </Button>
                                        }
                                    />
                                    <MoveGroupDialog
                                        onGroupMoved={refreshGroups}
                                        trigger={
                                            <Button variant="outline" className="w-full justify-start">
                                                Move Group to OU
                                            </Button>
                                        }
                                    />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Member Management</CardTitle>
                                    <CardDescription>
                                        Manage group membership and members
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <ListMembersDialog
                                        trigger={
                                            <Button variant="outline" className="w-full justify-start">
                                                View Group Members
                                            </Button>
                                        }
                                    />
                                    <RemoveMembersDialog
                                        onMembersRemoved={refreshGroups}
                                        trigger={
                                            <Button variant="outline" className="w-full justify-start">
                                                Remove Members
                                            </Button>
                                        }
                                    />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Group Information</CardTitle>
                                    <CardDescription>
                                        View detailed group information
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <GroupDetailsDialog
                                        trigger={
                                            <Button variant="outline" className="w-full justify-start">
                                                View Group Details
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
  )
}

export const GroupManagement = GroupManagementPage

// Export individual components for use elsewhere
export {
  GroupList,
  CreateGroupDialog,
  DeleteGroupDialog,
  GroupDetailsDialog,
  MoveGroupDialog,
  ListMembersDialog,
  RemoveMembersDialog
}

// DOM mounting for standalone usage
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('group')
  if (container) {
    const root = createRoot(container)
    root.render(<GroupManagementPage />)
  }
})

export default GroupManagementPage
