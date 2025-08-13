import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  TreePine,
  Settings,
  Database,
  Shield,
  Info,
  Cog
} from 'lucide-react'
import { BackButton } from '../common'
import { useForest, useDirectoryService } from './hooks/useForest'
import { DSHeuristicsDialog } from './dsheuristics-dialog'

export default function ForestManagement () {
  const { forest, loading: forestLoading, refresh: refreshForest } = useForest()
  const { settings, loading: settingsLoading, refresh: refreshSettings } = useDirectoryService()

  // Dialog states
  const [dsHeuristicsDialogOpen, setDSHeuristicsDialogOpen] = useState(false)

  const handleDSHeuristicsSuccess = () => {
    refreshForest()
    refreshSettings()
    setDSHeuristicsDialogOpen(false)
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-4">
        <BackButton />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Forest Management</h1>
          <p className="text-muted-foreground">
            Manage Active Directory forest settings and directory service configuration
          </p>
        </div>
      </div>

      {/* Forest Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Forest Name</CardTitle>
            <TreePine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{forest?.name || 'Loading...'}</div>
            <p className="text-xs text-muted-foreground">
              Active Directory forest
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Forest Function Level</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{forest?.forestFunctionLevel || 'Unknown'}</div>
            <p className="text-xs text-muted-foreground">
              Forest-wide functionality
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Domain Function Level</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{forest?.domainFunctionLevel || 'Unknown'}</div>
            <p className="text-xs text-muted-foreground">
              Domain functionality level
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Schema Version</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{forest?.schemaVersion || 'Unknown'}</div>
            <p className="text-xs text-muted-foreground">
              Active Directory schema
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="directory-service" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="directory-service" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Directory Service
            </TabsTrigger>
            <TabsTrigger value="forest-info" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              Forest Info
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setDSHeuristicsDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Cog className="h-4 w-4" />
              Set DSHeuristics
            </Button>
          </div>
        </div>

        <TabsContent value="directory-service">
          <Card>
            <CardHeader>
              <CardTitle>Directory Service Settings</CardTitle>
              <CardDescription>
                Configuration settings for the Directory Service that apply to all domain controllers in the forest.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {settingsLoading
                ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-muted rounded w-full mb-2"></div>
                    </div>
                  ))}
                </div>
                  )
                : settings.length === 0
                  ? (
                <div className="text-center py-8">
                  <Settings className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold">No Settings Found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    No directory service settings are currently configured
                  </p>
                </div>
                    )
                  : (
                <div className="space-y-3">
                  {settings.map((setting, index) => (
                    <Alert key={index}>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        <div className="flex justify-between items-start">
                          <div>
                            <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                              {setting.value}
                            </code>
                            {setting.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {setting.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
                    )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forest-info">
          <Card>
            <CardHeader>
              <CardTitle>Forest Information</CardTitle>
              <CardDescription>
                Detailed information about the Active Directory forest configuration.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {forestLoading
                ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                      <div className="h-6 bg-muted rounded w-2/3 mb-4"></div>
                    </div>
                  ))}
                </div>
                  )
                : forest
                  ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Forest Name</h4>
                      <p className="text-lg font-semibold">{forest.name}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Domain Name</h4>
                      <p className="text-lg font-semibold">{forest.domainName}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Forest Function Level</h4>
                      <Badge variant="outline">{forest.forestFunctionLevel}</Badge>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Domain Function Level</h4>
                      <Badge variant="outline">{forest.domainFunctionLevel}</Badge>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Schema Version</h4>
                      <Badge variant="secondary">{forest.schemaVersion}</Badge>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">DSHeuristics</h4>
                      <Badge variant={forest.dsheuristics ? 'default' : 'secondary'}>
                        {forest.dsheuristics || 'Not Set'}
                      </Badge>
                    </div>
                  </div>
                </div>
                    )
                  : (
                <div className="text-center py-8">
                  <TreePine className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold">No Forest Information</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Unable to retrieve forest information
                  </p>
                </div>
                    )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <DSHeuristicsDialog
        isOpen={dsHeuristicsDialogOpen}
        onClose={() => setDSHeuristicsDialogOpen(false)}
        onHeuristicsSet={handleDSHeuristicsSuccess}
      />
    </div>
  )
}
