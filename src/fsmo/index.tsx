import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Crown,
  Server,
  Database,
  Key,
  Network,
  Settings,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react'
import { BackButton } from '../common'
import { ErrorAlert } from '@/components/ui/error-alert'
import { useFSMO } from './hooks/useFSMO'
import { TransferRoleDialog } from './transfer'
import { SeizeRoleDialog } from './seize'

export default function FSMOManagement () {
  const { roles, loading, error, refresh } = useFSMO()

  // Dialog states
  const [transferDialogOpen, setTransferDialogOpen] = useState(false)
  const [seizeDialogOpen, setSeizeDialogOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<string>('')

  const handleTransferSuccess = () => {
    refresh()
    setTransferDialogOpen(false)
    setSelectedRole('')
  }

  const handleSeizeSuccess = () => {
    refresh()
    setSeizeDialogOpen(false)
    setSelectedRole('')
  }

  const fsmoRoleInfo = [
    {
      key: 'schemaMaster' as const,
      title: 'Schema Master',
      icon: Database,
      description: 'Controls schema modifications for the entire forest',
      scope: 'Forest-wide',
      criticality: 'High',
      variant: 'destructive' as const
    },
    {
      key: 'domainNamingMaster' as const,
      title: 'Domain Naming Master',
      icon: Network,
      description: 'Controls addition and removal of domains in the forest',
      scope: 'Forest-wide',
      criticality: 'High',
      variant: 'destructive' as const
    },
    {
      key: 'pdcEmulator' as const,
      title: 'PDC Emulator',
      icon: Crown,
      description: 'Handles password changes, time synchronization, and account lockouts',
      scope: 'Domain-wide',
      criticality: 'Critical',
      variant: 'default' as const
    },
    {
      key: 'ridMaster' as const,
      title: 'RID Master',
      icon: Key,
      description: 'Allocates pools of relative identifiers to domain controllers',
      scope: 'Domain-wide',
      criticality: 'Medium',
      variant: 'secondary' as const
    },
    {
      key: 'infrastructureMaster' as const,
      title: 'Infrastructure Master',
      icon: Settings,
      description: 'Updates cross-domain object references',
      scope: 'Domain-wide',
      criticality: 'Medium',
      variant: 'secondary' as const
    }
  ]

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-4">
        <BackButton />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">FSMO Role Management</h1>
          <p className="text-muted-foreground">
            Manage Flexible Single Master Operations roles in Active Directory
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button onClick={refresh} variant="outline" className="flex items-center gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Roles
        </Button>
        <Button onClick={() => setTransferDialogOpen(true)} className="flex items-center gap-2">
          <ArrowRight className="h-4 w-4" />
          Transfer Role
        </Button>
        <Button
          onClick={() => setSeizeDialogOpen(true)}
          variant="destructive"
          className="flex items-center gap-2"
        >
          <AlertTriangle className="h-4 w-4" />
          Seize Role
        </Button>
      </div>

      {error && (
        <ErrorAlert
          error={error}
          onRetry={refresh}
          className="mb-4"
        />
      )}

      {/* FSMO Roles Display */}
      {loading
        ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="animate-pulse">
                  <div className="h-3 bg-muted rounded w-full mb-2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
          )
        : roles
          ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fsmoRoleInfo.map((roleInfo) => {
            const IconComponent = roleInfo.icon
            const holder = roles[roleInfo.key]

            return (
              <Card key={roleInfo.key} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">{roleInfo.title}</CardTitle>
                    </div>
                    <Badge variant={roleInfo.variant}>{roleInfo.criticality}</Badge>
                  </div>
                  <CardDescription>{roleInfo.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Scope:</span>
                    <Badge variant="outline">{roleInfo.scope}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Current Holder:</span>
                    <div className="flex items-center gap-1">
                      <Server className="h-3 w-3" />
                      <span className="font-mono text-xs">{holder}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedRole(roleInfo.key)
                        setTransferDialogOpen(true)
                      }}
                      className="flex-1"
                    >
                      Transfer
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setSelectedRole(roleInfo.key)
                        setSeizeDialogOpen(true)
                      }}
                      className="flex-1"
                    >
                      Seize
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
            )
          : (
        <Card>
          <CardContent className="text-center py-8">
            <Server className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold">No FSMO Data</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Unable to load FSMO role information
            </p>
            <Button onClick={refresh} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
            )}

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>About FSMO Roles</CardTitle>
          <CardDescription>
            Understanding Flexible Single Master Operations in Active Directory
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Transfer vs Seize</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li><strong>Transfer:</strong> Graceful handover to another DC</li>
                <li><strong>Seize:</strong> Forceful takeover (use only when transfer fails)</li>
                <li>Always try transfer first</li>
                <li>Seizing can cause replication issues</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Best Practices</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>Monitor role holders regularly</li>
                <li>Plan role placement strategically</li>
                <li>Document role changes</li>
                <li>Test after role transfers</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <TransferRoleDialog
        isOpen={transferDialogOpen}
        onClose={() => setTransferDialogOpen(false)}
        onRoleTransferred={handleTransferSuccess}
        preselectedRole={selectedRole}
      />

      <SeizeRoleDialog
        isOpen={seizeDialogOpen}
        onClose={() => setSeizeDialogOpen(false)}
        onRoleSeized={handleSeizeSuccess}
        preselectedRole={selectedRole}
      />
    </div>
  )
}
