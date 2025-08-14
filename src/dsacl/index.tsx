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
  Search,
  Lock,
  Unlock,
  Info
} from 'lucide-react'
import { BackButton } from '../common'
import { useDSACL } from './hooks/useDSACL'
import { SetDSACLDialog } from './set-dsacl'

export default function DSACLManagement () {
  const { dsacl, loading: dsaclLoading, refresh: refreshDSACL } = useDSACL()
  const [searchQuery, setSearchQuery] = useState('')
  const [objectDN, setObjectDN] = useState('')

  // Dialog states
  const [setDSACLDialogOpen, setSetDSACLDialogOpen] = useState(false)

  const handleSetDSACLSuccess = () => {
    refreshDSACL()
    setSetDSACLDialogOpen(false)
  }

  // Filter ACL entries based on search query
  const filteredEntries = dsacl?.entries.filter(entry =>
    entry.trusteeDN.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.objectDN.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.permissions.some(perm => perm.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || []

  const handleSearchObject = () => {
    if (objectDN.trim()) {
      // Refresh with the specific object DN
      refreshDSACL()
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-4">
        <BackButton />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Directory Service ACL Management</h1>
          <p className="text-muted-foreground">
            Manage Access Control Lists for Active Directory objects
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total ACL Entries</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dsacl?.entries.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Access control entries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Allow Entries</CardTitle>
            <Unlock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {dsacl?.entries.filter(entry => entry.accessType === 'Allow').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Permitted access
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deny Entries</CardTitle>
            <Lock className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {dsacl?.entries.filter(entry => entry.accessType === 'Deny').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Denied access
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Object</CardTitle>
            <Info className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold truncate">{dsacl?.objectDN || 'Domain Root'}</div>
            <p className="text-xs text-muted-foreground">
              Protected object
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="acl-entries" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="acl-entries" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Access Control Entries
            </TabsTrigger>
            <TabsTrigger value="raw-output" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              Raw Output
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button onClick={() => setSetDSACLDialogOpen(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Modify Access List
            </Button>
          </div>
        </div>

        <TabsContent value="acl-entries">
          <Card>
            <CardHeader>
              <CardTitle>Access Control Entries</CardTitle>
              <CardDescription>
                Directory Service permissions for the selected object.
              </CardDescription>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search ACL entries..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline" onClick={refreshDSACL}>
                    Refresh
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Object DN (optional)"
                    value={objectDN}
                    onChange={(e) => setObjectDN(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleSearchObject} variant="outline">
                    Search Object
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {dsaclLoading
                ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-20 bg-muted rounded w-full"></div>
                    </div>
                  ))}
                </div>
                  )
                : filteredEntries.length === 0
                  ? (
                <div className="text-center py-8">
                  <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold">
                    {searchQuery ? 'No Matching Entries' : 'No ACL Entries Found'}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {searchQuery
                      ? 'Try adjusting your search terms'
                      : 'No access control entries are currently available'
                    }
                  </p>
                </div>
                    )
                  : (
                <div className="space-y-3">
                  {filteredEntries.map((entry) => (
                    <Card key={entry.id} className="border border-border">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            {entry.accessType === 'Allow'
                              ? (
                              <Unlock className="h-5 w-5 text-green-600 mt-0.5" />
                                )
                              : (
                              <Lock className="h-5 w-5 text-red-600 mt-0.5" />
                                )}
                            <div className="space-y-2">
                              <div>
                                <h4 className="font-medium">Trustee</h4>
                                <p className="text-sm text-muted-foreground font-mono">
                                  {entry.trusteeDN}
                                </p>
                              </div>

                              <div>
                                <h4 className="font-medium text-sm">Permissions</h4>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {entry.permissions.map((permission, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {permission}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              {entry.inheritanceFlags.length > 0 && (
                                <div>
                                  <h4 className="font-medium text-sm">Inheritance</h4>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {entry.inheritanceFlags.map((flag, index) => (
                                      <Badge key={index} variant="secondary" className="text-xs">
                                        {flag}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div>
                                <h4 className="font-medium text-sm">SDDL</h4>
                                <code className="text-xs bg-muted p-2 rounded block mt-1 overflow-x-auto">
                                  {entry.sddl}
                                </code>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge
                              variant={entry.accessType === 'Allow' ? 'default' : 'destructive'}
                              className="text-xs"
                            >
                              {entry.accessType}
                            </Badge>
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

        <TabsContent value="raw-output">
          <Card>
            <CardHeader>
              <CardTitle>Raw DSACL Output</CardTitle>
              <CardDescription>
                Raw output from the samba-tool dsacl command.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dsaclLoading
                ? (
                <div className="animate-pulse">
                  <div className="h-64 bg-muted rounded w-full"></div>
                </div>
                  )
                : dsacl?.rawOutput.length === 0
                  ? (
                <div className="text-center py-8">
                  <Info className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold">No Raw Output</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    No raw DSACL output is available
                  </p>
                </div>
                    )
                  : (
                <div className="space-y-2">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      This is the raw output from the samba-tool dsacl get command.
                      Each line represents an access control entry in SDDL format.
                    </AlertDescription>
                  </Alert>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <pre className="text-sm font-mono overflow-x-auto whitespace-pre-wrap">
                      {dsacl?.rawOutput.join('\n')}
                    </pre>
                  </div>
                </div>
                    )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <SetDSACLDialog
        isOpen={setDSACLDialogOpen}
        onClose={() => setSetDSACLDialogOpen(false)}
        onDSACLSet={handleSetDSACLSuccess}
      />
    </div>
  )
}

// Entry point for standalone DSACL management page
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('dsacl')
  if (container) {
    const root = createRoot(container)
    root.render(
      <Providers>
        <DSACLManagement />
      </Providers>
    )
  }
})
