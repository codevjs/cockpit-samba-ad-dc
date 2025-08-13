import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  FolderTree,
  Plus,
  Trash2,
  Move,
  Edit2,
  Search,
  Users,
  Building,
  ArrowLeft
} from 'lucide-react'
import { BackButton } from '../common'
import { useOUs, useOUObjects } from './hooks/useOU'
import { CreateOUDialog } from './create-ou'
import { DeleteOUDialog } from './delete-ou'
import { MoveOUDialog } from './move-ou'
import { RenameOUDialog } from './rename-ou'
import { ListObjectsDialog } from './list-objects'
import { toast } from 'sonner'

export default function OrganizationUnitManagement () {
  const { ous, loading: ousLoading, refresh: refreshOUs } = useOUs()
  const [searchQuery, setSearchQuery] = useState('')

  // Dialog states
  const [createOUDialogOpen, setCreateOUDialogOpen] = useState(false)
  const [deleteOUDialogOpen, setDeleteOUDialogOpen] = useState(false)
  const [moveOUDialogOpen, setMoveOUDialogOpen] = useState(false)
  const [renameOUDialogOpen, setRenameOUDialogOpen] = useState(false)
  const [listObjectsDialogOpen, setListObjectsDialogOpen] = useState(false)
  const [selectedOU, setSelectedOU] = useState<string | null>(null)

  const handleCreateOUSuccess = () => {
    refreshOUs()
    setCreateOUDialogOpen(false)
  }

  const handleDeleteOUSuccess = () => {
    refreshOUs()
    setDeleteOUDialogOpen(false)
    setSelectedOU(null)
  }

  const handleMoveOUSuccess = () => {
    refreshOUs()
    setMoveOUDialogOpen(false)
    setSelectedOU(null)
  }

  const handleRenameOUSuccess = () => {
    refreshOUs()
    setRenameOUDialogOpen(false)
    setSelectedOU(null)
  }

  const handleDeleteOU = (ouDN: string) => {
    setSelectedOU(ouDN)
    setDeleteOUDialogOpen(true)
  }

  const handleMoveOU = (ouDN: string) => {
    setSelectedOU(ouDN)
    setMoveOUDialogOpen(true)
  }

  const handleRenameOU = (ouDN: string) => {
    setSelectedOU(ouDN)
    setRenameOUDialogOpen(true)
  }

  const handleListObjects = (ouDN: string) => {
    setSelectedOU(ouDN)
    setListObjectsDialogOpen(true)
  }

  // Filter OUs based on search query
  const filteredOUs = ous.filter(ou =>
    ou.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ou.distinguishedName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-4">
        <BackButton />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organization Unit Management</h1>
          <p className="text-muted-foreground">
            Manage Active Directory organizational units and their structure
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total OUs</CardTitle>
            <FolderTree className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ous.length}</div>
            <p className="text-xs text-muted-foreground">
              Organizational units
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Root OUs</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ous.filter(ou => !ou.parentOU).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Top-level units
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nested OUs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ous.filter(ou => ou.parentOU).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Nested units
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="list" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <FolderTree className="h-4 w-4" />
              Organization Units
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button onClick={() => setCreateOUDialogOpen(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create OU
            </Button>
          </div>
        </div>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Organization Units</CardTitle>
              <CardDescription>
                Manage the organizational structure of your Active Directory domain.
              </CardDescription>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search organizational units..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              {ousLoading
                ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-muted rounded w-full"></div>
                    </div>
                  ))}
                </div>
                  )
                : filteredOUs.length === 0
                  ? (
                <div className="text-center py-8">
                  <FolderTree className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold">
                    {searchQuery ? 'No OUs Found' : 'No Organization Units'}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {searchQuery
                      ? 'Try adjusting your search terms'
                      : 'Create your first organizational unit to get started'
                    }
                  </p>
                  {!searchQuery && (
                    <Button onClick={() => setCreateOUDialogOpen(true)} className="mt-4">
                      Create Organization Unit
                    </Button>
                  )}
                </div>
                    )
                  : (
                <div className="space-y-3">
                  {filteredOUs.map((ou) => (
                    <Card key={ou.distinguishedName} className="border border-border">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FolderTree className="h-5 w-5 text-blue-600" />
                            <div>
                              <h4 className="font-medium">{ou.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {ou.distinguishedName}
                              </p>
                              {ou.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {ou.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                {ou.parentOU
                                  ? (
                                  <Badge variant="outline">Nested</Badge>
                                    )
                                  : (
                                  <Badge variant="secondary">Root</Badge>
                                    )}
                                <Badge variant="outline">
                                  {ou.children.length} children
                                </Badge>
                                <Badge variant="outline">
                                  {ou.objects.length} objects
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleListObjects(ou.distinguishedName)}
                              className="flex items-center gap-2"
                            >
                              <Users className="h-4 w-4" />
                              Objects
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRenameOU(ou.distinguishedName)}
                              className="flex items-center gap-2"
                            >
                              <Edit2 className="h-4 w-4" />
                              Rename
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMoveOU(ou.distinguishedName)}
                              className="flex items-center gap-2"
                            >
                              <Move className="h-4 w-4" />
                              Move
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteOU(ou.distinguishedName)}
                              className="text-destructive hover:text-destructive flex items-center gap-2"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                    )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CreateOUDialog
        isOpen={createOUDialogOpen}
        onClose={() => setCreateOUDialogOpen(false)}
        onOUCreated={handleCreateOUSuccess}
        parentOUs={ous}
      />

      <DeleteOUDialog
        isOpen={deleteOUDialogOpen}
        onClose={() => setDeleteOUDialogOpen(false)}
        onOUDeleted={handleDeleteOUSuccess}
        ouDN={selectedOU}
      />

      <MoveOUDialog
        isOpen={moveOUDialogOpen}
        onClose={() => setMoveOUDialogOpen(false)}
        onOUMoved={handleMoveOUSuccess}
        ouDN={selectedOU}
        parentOUs={ous}
      />

      <RenameOUDialog
        isOpen={renameOUDialogOpen}
        onClose={() => setRenameOUDialogOpen(false)}
        onOURenamed={handleRenameOUSuccess}
        ouDN={selectedOU}
      />

      <ListObjectsDialog
        isOpen={listObjectsDialogOpen}
        onClose={() => setListObjectsDialogOpen(false)}
        ouDN={selectedOU}
      />
    </div>
  )
}
