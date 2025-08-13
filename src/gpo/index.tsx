import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  FolderOpen,
  Plus,
  Trash2,
  Search,
  Settings,
  Database,
  Shield,
  Info,
  Archive,
  Download,
  Upload,
  Link,
  UnlinkIcon,
  Eye,
  Layers
} from 'lucide-react'
import { BackButton } from '../common'
import { DataTable } from '@/components/ui/data-table'
import { useGPOs, useGPOContainers } from './hooks/useGPO'
import { CreateGPODialog } from './create-gpo'
import { DeleteGPODialog } from './delete-gpo'
import { BackupGPODialog } from './backup-gpo'
import { RestoreGPODialog } from './restore-gpo'
import { FetchGPODialog } from './fetch-gpo'
import { SetLinkDialog } from './set-link'
import { DeleteLinkDialog } from './delete-link'
import { InheritanceDialog } from './inheritance'
import { ShowGPODialog } from './show-gpo'
import type { SambaGPO } from '@/types/samba'
import type { DataTableColumn } from '@/components/ui/data-table'

export default function GPOManagement () {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGPO, setSelectedGPO] = useState<SambaGPO | null>(null)

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [backupDialogOpen, setBackupDialogOpen] = useState(false)
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false)
  const [fetchDialogOpen, setFetchDialogOpen] = useState(false)
  const [setLinkDialogOpen, setSetLinkDialogOpen] = useState(false)
  const [deleteLinkDialogOpen, setDeleteLinkDialogOpen] = useState(false)
  const [inheritanceDialogOpen, setInheritanceDialogOpen] = useState(false)
  const [showGPODialogOpen, setShowGPODialogOpen] = useState(false)

  const { gpos, loading: gposLoading, refresh: refreshGPOs } = useGPOs()
  const { containers, loading: containersLoading } = useGPOContainers()

  const handleOperationSuccess = () => {
    refreshGPOs()
  }

  const filteredGPOs = gpos.filter(gpo =>
    gpo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    gpo.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const gpoColumns: DataTableColumn<SambaGPO>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (gpo) => (
        <div className="font-medium">{gpo.name}</div>
      )
    },
    {
      key: 'displayName',
      header: 'Display Name',
      render: (gpo) => (
        <div>{gpo.displayName}</div>
      )
    },
    {
      key: 'guid',
      header: 'GUID',
      render: (gpo) => (
        <div className="font-mono text-xs">{gpo.guid}</div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (gpo) => (
        <Badge
          variant={gpo.status === 'Enabled' ? 'default' : 'secondary'}
          className={gpo.status === 'Enabled' ? 'bg-green-100 text-green-800' : ''}
        >
          {gpo.status}
        </Badge>
      )
    },
    {
      key: 'version',
      header: 'Version',
      render: (gpo) => (
        <div className="text-center">{gpo.version}</div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (gpo) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedGPO(gpo)
              setShowGPODialogOpen(true)
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedGPO(gpo)
              setDeleteDialogOpen(true)
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-4">
        <BackButton />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">GPO Management</h1>
          <p className="text-muted-foreground">
            Manage Group Policy Objects for Active Directory
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total GPOs</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gpos.length}</div>
            <p className="text-xs text-muted-foreground">
              Group Policy Objects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enabled</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {gpos.filter(g => g.status === 'Enabled').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Active policies
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Containers</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{containers.length}</div>
            <p className="text-xs text-muted-foreground">
              Available containers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Linked</CardTitle>
            <Link className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {gpos.filter(g => g.linkedOUs.length > 0).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Linked GPOs
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="operations" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="operations" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Operations
            </TabsTrigger>
            <TabsTrigger value="gpos" className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              GPO List
            </TabsTrigger>
            <TabsTrigger value="containers" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Containers
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button onClick={refreshGPOs} variant="outline" size="sm">
              Refresh
            </Button>
          </div>
        </div>

        <TabsContent value="operations">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create GPO
                </CardTitle>
                <CardDescription>
                  Create a new Group Policy Object
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setCreateDialogOpen(true)}
                  className="w-full"
                >
                  Create GPO
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Archive className="h-5 w-5" />
                  Backup GPO
                </CardTitle>
                <CardDescription>
                  Backup existing Group Policy Object
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setBackupDialogOpen(true)}
                  className="w-full"
                  variant="outline"
                >
                  Backup GPO
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Restore GPO
                </CardTitle>
                <CardDescription>
                  Restore GPO from backup
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setRestoreDialogOpen(true)}
                  className="w-full"
                  variant="outline"
                >
                  Restore GPO
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Fetch GPO
                </CardTitle>
                <CardDescription>
                  Download GPO to local directory
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setFetchDialogOpen(true)}
                  className="w-full"
                  variant="outline"
                >
                  Fetch GPO
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="h-5 w-5" />
                  Set Link
                </CardTitle>
                <CardDescription>
                  Link GPO to container
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setSetLinkDialogOpen(true)}
                  className="w-full"
                  variant="outline"
                >
                  Set Link
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UnlinkIcon className="h-5 w-5" />
                  Delete Link
                </CardTitle>
                <CardDescription>
                  Remove GPO link from container
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setDeleteLinkDialogOpen(true)}
                  className="w-full"
                  variant="outline"
                >
                  Delete Link
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Inheritance
                </CardTitle>
                <CardDescription>
                  Manage GPO inheritance settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setInheritanceDialogOpen(true)}
                  className="w-full"
                  variant="outline"
                >
                  Set Inheritance
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="gpos">
          <Card>
            <CardHeader>
              <CardTitle>Group Policy Objects</CardTitle>
              <CardDescription>
                All GPOs configured in the domain
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search GPOs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create GPO
                  </Button>
                </div>

                <DataTable
                  columns={gpoColumns}
                  data={filteredGPOs}
                  loading={gposLoading}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="containers">
          <Card>
            <CardHeader>
              <CardTitle>Available Containers</CardTitle>
              <CardDescription>
                Containers that can be linked to GPOs
              </CardDescription>
            </CardHeader>
            <CardContent>
              {containersLoading
                ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-12 bg-muted rounded w-full"></div>
                    </div>
                  ))}
                </div>
                  )
                : containers.length === 0
                  ? (
                <div className="text-center py-8">
                  <Database className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold">No Containers</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    No containers available for GPO linking
                  </p>
                </div>
                    )
                  : (
                <div className="space-y-2">
                  {containers.map((container, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Database className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">{container.name}</p>
                          <p className="text-sm text-muted-foreground">{container.distinguishedName}</p>
                        </div>
                      </div>
                      <Badge variant="outline">{container.type}</Badge>
                    </div>
                  ))}
                </div>
                    )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Information Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">Group Policy Object Management</p>
            <p className="text-sm">
              This module provides comprehensive tools for managing GPOs in your
              Active Directory environment. Use these operations carefully as GPO
              changes can affect user and computer configurations domain-wide.
            </p>
          </div>
        </AlertDescription>
      </Alert>

      {/* Dialogs */}
      <CreateGPODialog
        isOpen={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onGPOCreated={handleOperationSuccess}
      />

      <DeleteGPODialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onGPODeleted={handleOperationSuccess}
        gpo={selectedGPO}
      />

      <BackupGPODialog
        isOpen={backupDialogOpen}
        onClose={() => setBackupDialogOpen(false)}
        onBackupCompleted={handleOperationSuccess}
      />

      <RestoreGPODialog
        isOpen={restoreDialogOpen}
        onClose={() => setRestoreDialogOpen(false)}
        onRestoreCompleted={handleOperationSuccess}
      />

      <FetchGPODialog
        isOpen={fetchDialogOpen}
        onClose={() => setFetchDialogOpen(false)}
        onFetchCompleted={handleOperationSuccess}
      />

      <SetLinkDialog
        isOpen={setLinkDialogOpen}
        onClose={() => setSetLinkDialogOpen(false)}
        onLinkSet={handleOperationSuccess}
      />

      <DeleteLinkDialog
        isOpen={deleteLinkDialogOpen}
        onClose={() => setDeleteLinkDialogOpen(false)}
        onLinkDeleted={handleOperationSuccess}
      />

      <InheritanceDialog
        isOpen={inheritanceDialogOpen}
        onClose={() => setInheritanceDialogOpen(false)}
        onInheritanceSet={handleOperationSuccess}
      />

      <ShowGPODialog
        isOpen={showGPODialogOpen}
        onClose={() => setShowGPODialogOpen(false)}
        gpo={selectedGPO}
      />
    </div>
  )
}
