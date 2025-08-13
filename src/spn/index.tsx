import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Plus,
  List,
  Key,
  Server,
  Shield
} from 'lucide-react'
import { BackButton } from '../common'
import { SPNList } from './list'
import { AddSPNDialog } from './add'
import { DeleteSPNDialog } from './delete'

interface SPNManagementPageProps {
  initialView?: 'list';
}

export default function SPNManagementPage ({ initialView = 'list' }: SPNManagementPageProps) {
  const [activeTab, setActiveTab] = useState(initialView)
  // const [searchQuery, setSearchQuery] = useState('')

  // SPN management dialogs
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedSPN, setSelectedSPN] = useState<{name: string, user: string} | null>(null)

  // const handleSearch = (query: string) => {
  //   setSearchQuery(query)
  // }

  const handleAddSuccess = () => {
    setAddDialogOpen(false)
  }

  const handleDeleteSuccess = () => {
    setDeleteDialogOpen(false)
    setSelectedSPN(null)
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-4">
        <BackButton />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SPN Management</h1>
          <p className="text-muted-foreground">
            Manage Service Principal Names for authentication in Active Directory
          </p>
        </div>
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Service Principal Names</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">SPNs</div>
            <p className="text-xs text-muted-foreground">
              Authentication identifiers for services
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kerberos Authentication</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Security</div>
            <p className="text-xs text-muted-foreground">
              Secure service authentication
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Service Mapping</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Identity</div>
            <p className="text-xs text-muted-foreground">
              Maps services to user accounts
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'list')} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              SPN Operations
            </TabsTrigger>
          </TabsList>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button onClick={() => setAddDialogOpen(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add SPN
            </Button>
          </div>
        </div>

        <TabsContent value="list">
          <SPNList
            onDeleteSPN={(name, user) => {
              setSelectedSPN({ name, user })
              setDeleteDialogOpen(true)
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Information Section */}
      <Card>
        <CardHeader>
          <CardTitle>About Service Principal Names (SPNs)</CardTitle>
          <CardDescription>
            Understanding SPNs and their role in Kerberos authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Key className="h-4 w-4" />
                What are SPNs?
              </h4>
              <p className="text-sm text-muted-foreground mb-2">
                Service Principal Names (SPNs) are unique identifiers for service instances in Active Directory.
                They enable Kerberos authentication by mapping services to user accounts.
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Format: service/hostname:port</li>
                <li>Enable secure authentication</li>
                <li>Required for Kerberos delegation</li>
                <li>Must be unique across the domain</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Server className="h-4 w-4" />
                Common SPN Examples
              </h4>
              <div className="space-y-2 text-sm">
                <div className="bg-muted p-2 rounded font-mono">
                  HTTP/webserver.domain.com
                </div>
                <div className="bg-muted p-2 rounded font-mono">
                  MSSQLSvc/sqlserver.domain.com:1433
                </div>
                <div className="bg-muted p-2 rounded font-mono">
                  HOST/fileserver.domain.com
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddSPNDialog
        isOpen={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSPNAdded={handleAddSuccess}
      />

      {selectedSPN && (
        <DeleteSPNDialog
          isOpen={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onSPNDeleted={handleDeleteSuccess}
          spnName={selectedSPN.name}
          userName={selectedSPN.user}
        />
      )}
    </div>
  )
}
