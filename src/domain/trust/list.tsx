import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Link,
  Plus,
  Search,
  Shield,
  Clock,
  Info,
  Eye,
  Trash2
} from 'lucide-react'
import { DataTable } from '@/components/ui/data-table'
import { useTrusts } from '../hooks/useDomain'
import { toast } from 'sonner'
import type { TrustRelationship } from '@/types/samba'
import type { DataTableColumn } from '@/components/ui/data-table'

export function TrustListCard () {
  const [searchTerm, setSearchTerm] = useState('')
  const { trusts, loading, error, refresh } = useTrusts()

  const filteredTrusts = trusts.filter(trust =>
    trust.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'Inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'Broken':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'External':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Forest':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'Realm':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getDirectionColor = (direction: string) => {
    switch (direction) {
      case 'Incoming':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'Outgoing':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200'
      case 'Bidirectional':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const trustColumns: DataTableColumn<TrustRelationship>[] = [
    {
      key: 'name',
      header: 'Trust Domain',
      render: (trust) => (
        <div className="font-medium">{trust.name}</div>
      )
    },
    {
      key: 'type',
      header: 'Type',
      render: (trust) => (
        <Badge className={getTypeColor(trust.type)}>
          {trust.type}
        </Badge>
      )
    },
    {
      key: 'direction',
      header: 'Direction',
      render: (trust) => (
        <Badge className={getDirectionColor(trust.direction)}>
          {trust.direction}
        </Badge>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (trust) => (
        <Badge className={getStatusColor(trust.status)}>
          {trust.status}
        </Badge>
      )
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (trust) => (
        <div className="text-sm text-muted-foreground">
          {trust.createdAt.toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (trust) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              toast.info('Trust details functionality not implemented yet')
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              toast.info('Trust deletion functionality not implemented yet')
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Trust Relationships
          </CardTitle>
          <CardDescription>Loading trust relationships...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-12 bg-muted rounded w-full"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Trust Relationships
          </CardTitle>
          <CardDescription>Error loading trust relationships</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="border-red-200 bg-red-50">
            <Info className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Error:</strong> {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="h-5 w-5" />
          Trust Relationships
        </CardTitle>
        <CardDescription>
          Manage trust relationships with other domains and forests
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search trusts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button onClick={() => toast.info('Create trust functionality not implemented yet')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Trust
            </Button>
            <Button variant="outline" onClick={refresh}>
              Refresh
            </Button>
          </div>

          {trusts.length === 0
            ? (
            <div className="text-center py-8">
              <Link className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">No Trust Relationships</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                No trust relationships have been established with other domains.
              </p>
              <Button
                onClick={() => toast.info('Create trust functionality not implemented yet')}
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Trust
              </Button>
            </div>
              )
            : (
            <DataTable
              columns={trustColumns}
              data={filteredTrusts}
              loading={loading}
            />
              )}

          <Alert className="border-blue-200 bg-blue-50">
            <Shield className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Trust Relationships:</strong> Trust relationships allow users from
              trusted domains to access resources in this domain. Manage trust relationships
              carefully as they affect security and authentication.
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  )
}

export default TrustListCard
