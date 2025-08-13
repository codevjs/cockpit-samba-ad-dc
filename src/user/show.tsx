import React, { useState } from 'react'
import { Eye, User, Mail, Calendar, Shield, Users, MapPin, FileText, Clock } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

import { useUser } from './hooks/useUsers'
import { RenderError } from '@/common'
import type { SambaUser } from '@/types/samba'

interface UserDetailsDialogProps {
    user?: SambaUser;
    username?: string;
    trigger?: React.ReactNode;
}

interface UserDetailsViewProps {
    user: SambaUser;
}

const UserDetailsView: React.FC<UserDetailsViewProps> = ({ user }) => {
  const formatDate = (date?: Date) => {
    if (!date) return 'Never'
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return (
        <div className="space-y-6">
            {/* Header Card */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <User className="h-6 w-6 text-primary" />
                        </div>
                        <div className="space-y-1">
                            <CardTitle className="text-xl">
                                {user.displayName || user.username}
                            </CardTitle>
                            {user.displayName && (
                                <p className="text-sm text-muted-foreground">@{user.username}</p>
                            )}
                        </div>
                        <div className="ml-auto">
                            <Badge variant={user.enabled ? 'default' : 'destructive'}>
                                {user.enabled ? 'Enabled' : 'Disabled'}
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Personal Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <User className="h-4 w-4" />
                            Personal Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {user.firstName && (
                            <div>
                                <Label className="text-xs font-medium text-muted-foreground">FIRST NAME</Label>
                                <p className="text-sm">{user.firstName}</p>
                            </div>
                        )}
                        {user.lastName && (
                            <div>
                                <Label className="text-xs font-medium text-muted-foreground">LAST NAME</Label>
                                <p className="text-sm">{user.lastName}</p>
                            </div>
                        )}
                        {user.email && (
                            <div>
                                <Label className="text-xs font-medium text-muted-foreground">EMAIL</Label>
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <p className="text-sm">{user.email}</p>
                                </div>
                            </div>
                        )}
                        {user.description && (
                            <div>
                                <Label className="text-xs font-medium text-muted-foreground">DESCRIPTION</Label>
                                <p className="text-sm">{user.description}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Account Status */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Shield className="h-4 w-4" />
                            Account Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <Label className="text-xs font-medium text-muted-foreground">STATUS</Label>
                            <p className="text-sm font-medium">
                                {user.enabled
                                  ? (
                                    <span className="text-green-600">Active</span>
                                    )
                                  : (
                                    <span className="text-red-600">Disabled</span>
                                    )}
                            </p>
                        </div>
                        <div>
                            <Label className="text-xs font-medium text-muted-foreground">CREATED</Label>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <p className="text-sm">{formatDate(user.createdAt)}</p>
                            </div>
                        </div>
                        {user.lastLogin && (
                            <div>
                                <Label className="text-xs font-medium text-muted-foreground">LAST LOGIN</Label>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <p className="text-sm">{formatDate(user.lastLogin)}</p>
                                </div>
                            </div>
                        )}
                        {user.accountExpires && (
                            <div>
                                <Label className="text-xs font-medium text-muted-foreground">EXPIRES</Label>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <p className="text-sm">{formatDate(user.accountExpires)}</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Groups */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Users className="h-4 w-4" />
                            Group Memberships ({user.groups.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {user.groups.length > 0
                          ? (
                            <div className="flex flex-wrap gap-1">
                                {user.groups.map((group) => (
                                    <Badge key={group} variant="secondary" className="text-xs">
                                        {group}
                                    </Badge>
                                ))}
                            </div>
                            )
                          : (
                            <p className="text-sm text-muted-foreground">No group memberships</p>
                            )}
                    </CardContent>
                </Card>

                {/* Location */}
                {user.organizationalUnit && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <MapPin className="h-4 w-4" />
                                Location
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div>
                                <Label className="text-xs font-medium text-muted-foreground">ORGANIZATIONAL UNIT</Label>
                                <p className="text-sm font-mono text-muted-foreground break-all">
                                    {user.organizationalUnit}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
  )
}

export default function UserDetailsDialog ({ user, username: propUsername, trigger }: UserDetailsDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchUsername, setSearchUsername] = useState(propUsername || '')
  const [selectedUsername, setSelectedUsername] = useState<string | null>(
    user?.username || propUsername || null
  )

  // Use the user hook when we have a selected username
  const {
    user: fetchedUser,
    loading,
    error,
    refresh,
    clearError
  } = useUser({
    username: selectedUsername || '',
    autoFetch: !!selectedUsername
  })

  const displayUser = user || fetchedUser

  const handleSearch = () => {
    if (searchUsername.trim()) {
      setSelectedUsername(searchUsername.trim())
      clearError()
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      setSearchUsername(propUsername || '')
      setSelectedUsername(user?.username || propUsername || null)
      clearError()
    }
  }

  const renderContent = () => {
    if (loading) {
      return (
                <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-[200px]" />
                            <Skeleton className="h-4 w-[100px]" />
                        </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Skeleton className="h-[200px]" />
                        <Skeleton className="h-[200px]" />
                        <Skeleton className="h-[150px]" />
                        <Skeleton className="h-[150px]" />
                    </div>
                </div>
      )
    }

    if (error) {
      return (
                <RenderError
                    error={error}
                    hideAlert={clearError}
                    alertVisible={!!error}
                    title="Failed to Load User"
                />
      )
    }

    if (!displayUser && selectedUsername) {
      return (
                <div className="text-center py-8">
                    <User className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-medium text-muted-foreground">User not found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        No user found with username "{selectedUsername}"
                    </p>
                </div>
      )
    }

    if (!displayUser) {
      return (
                <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-medium text-muted-foreground">No user selected</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Enter a username above to view user details
                    </p>
                </div>
      )
    }

    return <UserDetailsView user={displayUser} />
  }

  return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>User Details</DialogTitle>
                </DialogHeader>

                {/* Search Section (only show if no specific user provided) */}
                {!user && (
                    <div className="flex gap-2 pb-4 border-b">
                        <div className="flex-1">
                            <Label htmlFor="search-username" className="sr-only">
                                Username
                            </Label>
                            <Input
                                id="search-username"
                                placeholder="Enter username to view details..."
                                value={searchUsername}
                                onChange={(e) => setSearchUsername(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <Button onClick={handleSearch} disabled={!searchUsername.trim() || loading}>
                            <Eye className="h-4 w-4" />
                        </Button>
                        {selectedUsername && (
                            <Button variant="outline" onClick={refresh} disabled={loading}>
                                Refresh
                            </Button>
                        )}
                    </div>
                )}

                {renderContent()}
            </DialogContent>
        </Dialog>
  )
}
