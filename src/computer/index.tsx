import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Providers } from '@/lib/providers'
import { Plus, Monitor, Search, Filter, HardDrive } from 'lucide-react'
import '../user/tailwind.css'
import { PageHeader } from '@/components/layout/PageHeader'

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

// Import computer management components
import ComputerList from './list'
import CreateComputerDialog from './create'
import DeleteComputerDialog from './delete'
import MoveComputerDialog from './move'
import ShowComputerDialog from './show'

// Import hooks
import { useComputers } from './hooks/useComputers'
import type { FilterOptions } from '@/types/samba'

interface ComputerManagementPageProps {
    initialView?: 'list' | 'management';
}

function ComputerManagementPage ({ initialView = 'list' }: ComputerManagementPageProps) {
  const [activeTab, setActiveTab] = useState(initialView)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<FilterOptions>({})

  const {
    computers,
    loading,
    error,
    refreshComputers,
    stats
  } = useComputers({
    initialFilters: filters,
    autoRefresh: true
  })

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setFilters(prev => ({ ...prev, search: query }))
  }

  return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto p-6 space-y-6">
                <PageHeader
                    title="Computer Management"
                    description="Manage Active Directory computer accounts and domain-joined machines"
                >
                    <CreateComputerDialog
                        onComputerCreated={refreshComputers}
                        trigger={
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Computer
                            </Button>
                        }
                    />
                </PageHeader>

                {/* Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Computers</CardTitle>
                            <Monitor className="h-4 w-4 text-muted-foreground" />
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
                            <CardTitle className="text-sm font-medium">OS Types</CardTitle>
                            <HardDrive className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{Object.keys(stats.byOS).length}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'list' | 'management')} className="space-y-4">
                    <div className="flex items-center justify-between">
                        <TabsList>
                            <TabsTrigger value="list">Computer List</TabsTrigger>
                            <TabsTrigger value="management">Management</TabsTrigger>
                        </TabsList>

                        {activeTab === 'list' && (
                            <div className="flex gap-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search computers..."
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
                                <CardTitle>Active Directory Computers</CardTitle>
                                <CardDescription>
                                    View and manage all computer accounts in your Active Directory domain
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ComputerList
                                    computers={computers}
                                    loading={loading}
                                    error={error}
                                    onRefresh={refreshComputers}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="management" className="space-y-4">
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Computer Operations</CardTitle>
                                    <CardDescription>
                                        Perform common computer management tasks
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <CreateComputerDialog
                                        onComputerCreated={refreshComputers}
                                        trigger={
                                            <Button variant="outline" className="w-full justify-start">
                                                <Plus className="mr-2 h-4 w-4" />
                                                Create New Computer
                                            </Button>
                                        }
                                    />
                                    <DeleteComputerDialog
                                        onComputerDeleted={refreshComputers}
                                        trigger={
                                            <Button variant="outline" className="w-full justify-start">
                                                Delete Computer
                                            </Button>
                                        }
                                    />
                                    <MoveComputerDialog
                                        onComputerMoved={refreshComputers}
                                        trigger={
                                            <Button variant="outline" className="w-full justify-start">
                                                Move Computer to OU
                                            </Button>
                                        }
                                    />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Computer Information</CardTitle>
                                    <CardDescription>
                                        View detailed computer information
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <ShowComputerDialog
                                        trigger={
                                            <Button variant="outline" className="w-full justify-start">
                                                View Computer Details
                                            </Button>
                                        }
                                    />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Statistics</CardTitle>
                                    <CardDescription>
                                        Computer account statistics
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="text-sm">
                                        <div className="flex justify-between">
                                            <span>Total Computers:</span>
                                            <span className="font-medium">{stats.total}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Enabled:</span>
                                            <span className="font-medium text-green-600">{stats.enabled}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Disabled:</span>
                                            <span className="font-medium text-red-600">{stats.disabled}</span>
                                        </div>
                                    </div>

                                    {Object.keys(stats.byOS).length > 0 && (
                                        <div className="pt-2 border-t">
                                            <div className="text-sm font-medium mb-2">Operating Systems:</div>
                                            <div className="space-y-1 text-xs">
                                                {Object.entries(stats.byOS).map(([os, count]) => (
                                                    <div key={os} className="flex justify-between">
                                                        <span className="truncate">{os}</span>
                                                        <span className="font-medium">{count}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
  )
}

// Entry point for standalone computer management page
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('computer')
  if (container) {
    const root = createRoot(container)
    root.render(
      <Providers>
        <ComputerManagementPage />
      </Providers>
    )
  }
})

export default ComputerManagementPage
