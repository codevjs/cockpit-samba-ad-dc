import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Providers } from '@/lib/providers'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Shield,
  Plus,
  Trash2,
  Search,
  Settings,
  Lock,
  Unlock,
  Info
} from 'lucide-react'
import { BackButton } from '../common'
import { useDelegation } from './hooks/useDelegation'
import { ShowDelegationDialog } from './show-delegation'
import { AddServiceDialog } from './add-service'
import { DeleteServiceDialog } from './delete-service'
import { SetAnyServiceDialog } from './set-any-service'
import { SetAnyProtocolDialog } from './set-any-protocol'
import { toast } from 'sonner'

export default function DelegationManagement () {
  const [searchAccountName, setSearchAccountName] = useState('')
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null)

  // Dialog states
  const [showDelegationDialogOpen, setShowDelegationDialogOpen] = useState(false)
  const [addServiceDialogOpen, setAddServiceDialogOpen] = useState(false)
  const [deleteServiceDialogOpen, setDeleteServiceDialogOpen] = useState(false)
  const [setAnyServiceDialogOpen, setSetAnyServiceDialogOpen] = useState(false)
  const [setAnyProtocolDialogOpen, setSetAnyProtocolDialogOpen] = useState(false)

  const { delegation, refresh: refreshDelegation } = useDelegation(selectedAccount)

  const handleOperationSuccess = () => {
    refreshDelegation()
  }

  const handleSearchAccount = () => {
    if (searchAccountName.trim()) {
      setSelectedAccount(searchAccountName.trim())
    }
  }

  const handleShowDelegation = () => {
    if (searchAccountName.trim()) {
      setSelectedAccount(searchAccountName.trim())
      setShowDelegationDialogOpen(true)
    } else {
      toast.error('Please enter an account name first')
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-4">
        <BackButton />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Delegation Management</h1>
          <p className="text-muted-foreground">
            Manage Kerberos delegation settings for service accounts
          </p>
        </div>
      </div>

      {/* Account Search */}
      <Card>
        <CardHeader>
          <CardTitle>Account Lookup</CardTitle>
          <CardDescription>
            Enter an account name to view and manage its delegation settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Enter account name (e.g., serviceaccount1)"
                value={searchAccountName}
                onChange={(e) => setSearchAccountName(e.target.value)}
                className="pl-10"
                onKeyPress={(e) => e.key === 'Enter' && handleSearchAccount()}
              />
            </div>
            <Button onClick={handleSearchAccount}>
              Search
            </Button>
            <Button onClick={handleShowDelegation} variant="outline">
              Show Delegation
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      {delegation && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Account</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold truncate">{delegation.accountName}</div>
              <p className="text-xs text-muted-foreground">
                Service account
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delegation Type</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{delegation.delegationType}</div>
              <p className="text-xs text-muted-foreground">
                Current delegation mode
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Allowed Services</CardTitle>
              <Lock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{delegation.allowedServices.length}</div>
              <p className="text-xs text-muted-foreground">
                Configured services
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Any Service</CardTitle>
              {delegation.anyService
                ? (
                <Unlock className="h-4 w-4 text-orange-600" />
                  )
                : (
                <Lock className="h-4 w-4 text-green-600" />
                  )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${delegation.anyService ? 'text-orange-600' : 'text-green-600'}`}>
                {delegation.anyService ? 'Enabled' : 'Disabled'}
              </div>
              <p className="text-xs text-muted-foreground">
                Any service delegation
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="operations" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="operations" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Operations
            </TabsTrigger>
            {delegation && (
              <TabsTrigger value="details" className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                Delegation Details
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        <TabsContent value="operations">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add Service
                </CardTitle>
                <CardDescription>
                  Add a service principal for constrained delegation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setAddServiceDialogOpen(true)}
                  className="w-full"
                >
                  Add Service
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5" />
                  Delete Service
                </CardTitle>
                <CardDescription>
                  Remove a service principal from delegation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setDeleteServiceDialogOpen(true)}
                  className="w-full"
                  variant="outline"
                >
                  Delete Service
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Unlock className="h-5 w-5" />
                  Any Service
                </CardTitle>
                <CardDescription>
                  Configure delegation for any service
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setSetAnyServiceDialogOpen(true)}
                  className="w-full"
                  variant="outline"
                >
                  Configure
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Any Protocol
                </CardTitle>
                <CardDescription>
                  Configure delegation for any protocol
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setSetAnyProtocolDialogOpen(true)}
                  className="w-full"
                  variant="outline"
                >
                  Configure
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Show Settings
                </CardTitle>
                <CardDescription>
                  View current delegation configuration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setShowDelegationDialogOpen(true)}
                  className="w-full"
                  variant="outline"
                >
                  Show Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {delegation && (
          <TabsContent value="details">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Delegation Configuration</CardTitle>
                  <CardDescription>
                    Current delegation settings for {delegation.accountName}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Account Name</h4>
                        <p className="text-sm bg-muted p-2 rounded font-mono">
                          {delegation.accountName}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Delegation Type</h4>
                        <Badge variant="outline" className="text-sm">
                          {delegation.delegationType}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Any Service</h4>
                        <Badge variant={delegation.anyService ? 'destructive' : 'default'}>
                          {delegation.anyService ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Any Protocol</h4>
                        <Badge variant={delegation.anyProtocol ? 'destructive' : 'default'}>
                          {delegation.anyProtocol ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Allowed Services</h4>
                      {delegation.allowedServices.length === 0
                        ? (
                        <p className="text-sm text-muted-foreground">No specific services configured</p>
                          )
                        : (
                        <div className="space-y-2">
                          {delegation.allowedServices.map((service, index) => (
                            <div key={index} className="bg-muted p-2 rounded">
                              <code className="text-sm">{service}</code>
                            </div>
                          ))}
                        </div>
                          )}
                    </div>

                    {delegation.protocols.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Protocols</h4>
                        <div className="flex flex-wrap gap-2">
                          {delegation.protocols.map((protocol, index) => (
                            <Badge key={index} variant="secondary">
                              {protocol}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="font-medium mb-2">Raw Output</h4>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <pre className="text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                          {delegation.rawOutput.join('\n')}
                        </pre>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* Information Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">Kerberos Delegation</p>
            <p className="text-sm">
              Delegation allows a service to impersonate users when accessing other services.
              Use constrained delegation for security, and avoid "any service" delegation
              unless absolutely necessary as it poses security risks.
            </p>
          </div>
        </AlertDescription>
      </Alert>

      {/* Dialogs */}
      <ShowDelegationDialog
        isOpen={showDelegationDialogOpen}
        onClose={() => setShowDelegationDialogOpen(false)}
      />

      <AddServiceDialog
        isOpen={addServiceDialogOpen}
        onClose={() => setAddServiceDialogOpen(false)}
        onServiceAdded={handleOperationSuccess}
      />

      <DeleteServiceDialog
        isOpen={deleteServiceDialogOpen}
        onClose={() => setDeleteServiceDialogOpen(false)}
        onServiceDeleted={handleOperationSuccess}
      />

      <SetAnyServiceDialog
        isOpen={setAnyServiceDialogOpen}
        onClose={() => setSetAnyServiceDialogOpen(false)}
        onAnyServiceSet={handleOperationSuccess}
      />

      <SetAnyProtocolDialog
        isOpen={setAnyProtocolDialogOpen}
        onClose={() => setSetAnyProtocolDialogOpen(false)}
        onAnyProtocolSet={handleOperationSuccess}
      />
    </div>
  )
}

// Entry point for standalone Delegation management page
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('delegation')
  if (container) {
    const root = createRoot(container)
    root.render(
      <Providers>
        <DelegationManagement />
      </Providers>
    )
  }
})
