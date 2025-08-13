import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  User,
  Key,
  Server,
  Trash2,
  Loader2,
  Eye
} from 'lucide-react'
import { SPNAPI } from '@/services/spn-api'
import { toast } from 'sonner'
import type { SambaSPN } from '@/types/samba'

interface SPNListProps {
  onDeleteSPN: (spnName: string, userName: string) => void;
}

export function SPNList ({ onDeleteSPN }: SPNListProps) {
  const [username, setUsername] = useState('')
  const [spns, setSPNs] = useState<SambaSPN[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [resultsDialogOpen, setResultsDialogOpen] = useState(false)

  const handleSearch = async () => {
    if (!username.trim()) {
      setError('Username is required')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const result = await SPNAPI.list(username)
      setSPNs(result)
      setDialogOpen(false)
      setResultsDialogOpen(true)

      if (result.length === 0) {
        toast.info(`No SPNs found for user: ${username}`)
      } else {
        toast.success(`Found ${result.length} SPNs for user: ${username}`)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to list SPNs'
      setError(errorMessage)
      toast.error('Failed to retrieve SPNs')
    } finally {
      setLoading(false)
    }
  }

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value)
    if (error) {
      setError(null)
    }
  }

  const clearError = () => setError(null)

  const parseSPNInfo = (spnName: string) => {
    const parts = spnName.split('/')
    const service = parts[0] || 'Unknown'
    const hostPart = parts[1] || ''

    let hostname = hostPart
    let port = ''

    if (hostPart.includes(':')) {
      [hostname, port] = hostPart.split(':')
    }

    return { service, hostname, port }
  }

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            List User SPNs
          </CardTitle>
          <CardDescription>
            Enter a username to list all Service Principal Names associated with that user account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setDialogOpen(true)} className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            List SPNs for User
          </Button>
        </CardContent>
      </Card>

      {/* Search Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Search User SPNs
            </DialogTitle>
            <DialogDescription>
              Enter the username to list all SPNs associated with that account
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                value={username}
                onChange={handleUsernameChange}
                placeholder="Enter username (e.g., user1, serviceaccount)"
                className={error && !username.trim() ? 'border-destructive' : ''}
              />
              <p className="text-sm text-muted-foreground">
                Enter the username to search for associated SPNs
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSearch} disabled={loading || !username.trim()}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Searching...' : 'List SPNs'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Results Dialog */}
      <Dialog open={resultsDialogOpen} onOpenChange={setResultsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              SPNs for User: {username}
            </DialogTitle>
            <DialogDescription>
              Service Principal Names associated with this user account
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {spns.length === 0
              ? (
              <div className="text-center py-8">
                <Key className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold">No SPNs Found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  No Service Principal Names are associated with user: {username}
                </p>
              </div>
                )
              : (
              <div className="space-y-3">
                {spns.map((spn, index) => {
                  const { service, hostname, port } = parseSPNInfo(spn.name)

                  return (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <div className="font-mono text-sm font-medium">
                              {spn.name}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Server className="h-3 w-3" />
                                Service: <Badge variant="secondary">{service}</Badge>
                              </div>
                              {hostname && (
                                <div className="flex items-center gap-1">
                                  Host: <span className="font-mono">{hostname}</span>
                                </div>
                              )}
                              {port && (
                                <div className="flex items-center gap-1">
                                  Port: <span className="font-mono">{port}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDeleteSPN(spn.name, spn.user)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
                )}
          </div>

          <DialogFooter>
            <Button onClick={() => setResultsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
