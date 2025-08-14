import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Providers } from '@/lib/providers'
import '../user/tailwind.css'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  MapPin,
  Network,
  Plus,
  Trash2,
  Server,
  Globe
} from 'lucide-react'
import { BackButton } from '../common'
import { useSites, useSubnets, useSitesMutations } from './hooks/useSites'
import { CreateSiteDialog } from './create-site'
import { CreateSubnetDialog } from './create-subnet'
import { SetSiteDialog } from './set-site'
import { toast } from 'sonner'

export default function SitesManagement () {
  const { sites, loading: sitesLoading, refresh: refreshSites } = useSites()
  const { subnets, loading: subnetsLoading, refresh: refreshSubnets } = useSubnets()

  // Dialog states
  const [createSiteDialogOpen, setCreateSiteDialogOpen] = useState(false)
  const [createSubnetDialogOpen, setCreateSubnetDialogOpen] = useState(false)
  const [setSiteDialogOpen, setSetSiteDialogOpen] = useState(false)

  const { removeSite, removeSubnet } = useSitesMutations(
    () => {
      refreshSites()
      refreshSubnets()
    },
    (error) => toast.error(error)
  )

  const handleCreateSiteSuccess = () => {
    refreshSites()
    setCreateSiteDialogOpen(false)
  }

  const handleCreateSubnetSuccess = () => {
    refreshSubnets()
    setCreateSubnetDialogOpen(false)
  }

  const handleSetSiteSuccess = () => {
    refreshSites()
    setSetSiteDialogOpen(false)
  }

  const handleRemoveSite = async (siteName: string) => {
    if (confirm(`Are you sure you want to remove site "${siteName}"?`)) {
      try {
        await removeSite(siteName)
        toast.success(`Site "${siteName}" removed successfully`)
      } catch (error) {
        // Error already handled by mutation hook
      }
    }
  }

  const handleRemoveSubnet = async (subnetName: string) => {
    if (confirm(`Are you sure you want to remove subnet "${subnetName}"?`)) {
      try {
        await removeSubnet(subnetName)
        toast.success(`Subnet "${subnetName}" removed successfully`)
      } catch (error) {
        // Error already handled by mutation hook
      }
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-4">
        <BackButton />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sites Management</h1>
          <p className="text-muted-foreground">
            Configure Active Directory sites and subnets for replication topology
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sites</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sites.length}</div>
            <p className="text-xs text-muted-foreground">
              Active Directory sites
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subnets</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subnets.length}</div>
            <p className="text-xs text-muted-foreground">
              Configured subnets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Replication</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Optimized</div>
            <p className="text-xs text-muted-foreground">
              Topology management
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sites" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="sites" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Sites
            </TabsTrigger>
            <TabsTrigger value="subnets" className="flex items-center gap-2">
              <Network className="h-4 w-4" />
              Subnets
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button onClick={() => setCreateSiteDialogOpen(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Site
            </Button>
            <Button onClick={() => setCreateSubnetDialogOpen(true)} variant="outline" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Subnet
            </Button>
            <Button onClick={() => setSetSiteDialogOpen(true)} variant="outline" className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              Set Server Site
            </Button>
          </div>
        </div>

        <TabsContent value="sites">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sitesLoading
              ? (
                  Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="animate-pulse">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </CardHeader>
                </Card>
                  ))
                )
              : sites.length === 0
                ? (
              <Card className="col-span-full">
                <CardContent className="text-center py-8">
                  <MapPin className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold">No Sites Found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Create your first site to get started
                  </p>
                  <Button onClick={() => setCreateSiteDialogOpen(true)} className="mt-4">
                    Create Site
                  </Button>
                </CardContent>
              </Card>
                  )
                : (
                    sites.map((site) => (
                <Card key={site.name}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {site.name}
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveSite(site.name)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {site.description && (
                      <CardDescription>{site.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subnets:</span>
                        <Badge variant="secondary">{site.subnets.length}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Servers:</span>
                        <Badge variant="secondary">{site.servers.length}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                    ))
                  )}
          </div>
        </TabsContent>

        <TabsContent value="subnets">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subnetsLoading
              ? (
                  Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="animate-pulse">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </CardHeader>
                </Card>
                  ))
                )
              : subnets.length === 0
                ? (
              <Card className="col-span-full">
                <CardContent className="text-center py-8">
                  <Network className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold">No Subnets Found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Create your first subnet to get started
                  </p>
                  <Button onClick={() => setCreateSubnetDialogOpen(true)} className="mt-4">
                    Create Subnet
                  </Button>
                </CardContent>
              </Card>
                  )
                : (
                    subnets.map((subnet) => (
                <Card key={subnet.name}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Network className="h-4 w-4" />
                        {subnet.name}
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveSubnet(subnet.name)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Site:</span>
                        <Badge variant="outline">{subnet.site}</Badge>
                      </div>
                      {subnet.description && (
                        <div className="text-muted-foreground">{subnet.description}</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                    ))
                  )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CreateSiteDialog
        isOpen={createSiteDialogOpen}
        onClose={() => setCreateSiteDialogOpen(false)}
        onSiteCreated={handleCreateSiteSuccess}
      />

      <CreateSubnetDialog
        isOpen={createSubnetDialogOpen}
        onClose={() => setCreateSubnetDialogOpen(false)}
        onSubnetCreated={handleCreateSubnetSuccess}
        sites={sites}
      />

      <SetSiteDialog
        isOpen={setSiteDialogOpen}
        onClose={() => setSetSiteDialogOpen(false)}
        onSiteSet={handleSetSiteSuccess}
        sites={sites}
      />
    </div>
  )
}

// Entry point for standalone Sites management page
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('sites')
  if (container) {
    const root = createRoot(container)
    root.render(
      <Providers>
        <SitesManagement />
      </Providers>
    )
  }
})
