import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Providers } from '@/lib/providers'
import '../user/tailwind.css'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Globe,
  Plus,
  Trash2,
  Settings,
  Database,
  Shield,
  Info,
  Archive,
  Download,
  Upload,
  Link,
  Server,
  Users,
  Key,
  CheckCircle
} from 'lucide-react'
import { BackButton } from '../common'
import { DomainInfoCard } from './info'
import { DomainJoinDialog } from './join'
import { BackupOfflineDialog } from './backup/offline'
import { TrustListCard } from './trust/list'
import { toast } from 'sonner'

export default function DomainManagement () {
  const [,] = useState('')

  // Dialog states
  const [joinDialogOpen, setJoinDialogOpen] = useState(false)
  const [backupOfflineDialogOpen, setBackupOfflineDialogOpen] = useState(false)

  const handleOperationSuccess = () => {
    toast.success('Operation completed successfully')
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-4">
        <BackButton />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Domain Management</h1>
          <p className="text-muted-foreground">
            Manage Active Directory domain configuration and operations
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Domain Status</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-lg font-bold">Active</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Domain controller
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trusts</CardTitle>
            <Link className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Trust relationships
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Backups</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              Recent backups
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-lg font-bold">Healthy</span>
            </div>
            <p className="text-xs text-muted-foreground">
              System status
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="operations" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Operations
            </TabsTrigger>
            <TabsTrigger value="trusts" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              Trusts
            </TabsTrigger>
            <TabsTrigger value="backup" className="flex items-center gap-2">
              <Archive className="h-4 w-4" />
              Backup
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Refresh
            </Button>
          </div>
        </div>

        <TabsContent value="overview">
          <div className="space-y-6">
            <DomainInfoCard />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    Domain Controllers
                  </CardTitle>
                  <CardDescription>
                    Active domain controllers in the domain
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Server className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">Primary DC</p>
                          <p className="text-sm text-muted-foreground">dc1.domain.local</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Online</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Quick Stats
                  </CardTitle>
                  <CardDescription>
                    Domain object statistics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Users</span>
                      <span className="font-medium">-</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Computers</span>
                      <span className="font-medium">-</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Groups</span>
                      <span className="font-medium">-</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">GPOs</span>
                      <span className="font-medium">-</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="operations">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Join Domain
                </CardTitle>
                <CardDescription>
                  Join this server to an existing domain
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setJoinDialogOpen(true)}
                  className="w-full"
                >
                  Join Domain
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Promote DC
                </CardTitle>
                <CardDescription>
                  Promote server to domain controller
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  variant="outline"
                  disabled
                >
                  DC Promotion
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5" />
                  Demote DC
                </CardTitle>
                <CardDescription>
                  Demote domain controller to member server
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  variant="outline"
                  disabled
                >
                  DC Demotion
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Classic Upgrade
                </CardTitle>
                <CardDescription>
                  Upgrade from classic NT4 domain
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  variant="outline"
                  disabled
                >
                  Classic Upgrade
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Validate Trust
                </CardTitle>
                <CardDescription>
                  Validate trust relationships
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  variant="outline"
                  disabled
                >
                  Validate Trusts
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Namespaces
                </CardTitle>
                <CardDescription>
                  Manage trust namespaces
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  variant="outline"
                  disabled
                >
                  Manage Namespaces
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trusts">
          <TrustListCard />
        </TabsContent>

        <TabsContent value="backup">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Archive className="h-5 w-5" />
                  Offline Backup
                </CardTitle>
                <CardDescription>
                  Create an offline backup of the domain
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setBackupOfflineDialogOpen(true)}
                  className="w-full"
                >
                  Create Offline Backup
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Online Backup
                </CardTitle>
                <CardDescription>
                  Create an online backup of the domain
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  variant="outline"
                  disabled
                >
                  Create Online Backup
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Restore Backup
                </CardTitle>
                <CardDescription>
                  Restore domain from backup
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  variant="outline"
                  disabled
                >
                  Restore Backup
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Rename Backup
                </CardTitle>
                <CardDescription>
                  Rename existing backup files
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  variant="outline"
                  disabled
                >
                  Rename Backup
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Information Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">Domain Management</p>
            <p className="text-sm">
              This module provides tools for managing Active Directory domain operations
              including domain joining, trust relationships, and backup operations. Use
              these tools carefully as they can significantly impact domain functionality.
            </p>
          </div>
        </AlertDescription>
      </Alert>

      {/* Dialogs */}
      <DomainJoinDialog
        isOpen={joinDialogOpen}
        onClose={() => setJoinDialogOpen(false)}
        onJoinCompleted={handleOperationSuccess}
      />

      <BackupOfflineDialog
        isOpen={backupOfflineDialogOpen}
        onClose={() => setBackupOfflineDialogOpen(false)}
        onBackupCompleted={handleOperationSuccess}
      />
    </div>
  )
}

// Entry point for standalone Domain management page
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('domain')
  if (container) {
    const root = createRoot(container)
    root.render(
      <Providers>
        <DomainManagement />
      </Providers>
    )
  }
})
