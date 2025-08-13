import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Clock,
  Server as ServerIcon,
  RefreshCw,
  ArrowLeft,
  Calendar
} from 'lucide-react'
import { BackButton } from '../common'
import { ErrorAlert } from '@/components/ui/error-alert'
import { toast } from 'sonner'

import cockpit from 'cockpit'

interface TimeInfo {
  currentTime: string;
  timezone: string;
  ntpStatus: string;
  ntpServers: string[];
}

export default function TimeManagement () {
  const [serverTime, setServerTime] = useState<string>('')
  const [server, setServer] = useState<string>('127.0.0.1')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const getServerTime = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!server.trim()) {
      setError('Server address is required')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const command = `samba-tool time ${server}`
      const result = await cockpit.script(command, { superuser: true, err: 'message' })

      setServerTime(result)
      toast.success('Server time retrieved successfully')
    } catch (exception: any) {
      const errorMessage = exception?.message || 'Failed to get server time'
      setError(errorMessage)
      toast.error('Failed to retrieve server time')
    } finally {
      setLoading(false)
    }
  }

  const handleServerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setServer(e.target.value)
    if (error) {
      setError(null)
    }
  }

  const clearError = () => setError(null)

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-4">
        <BackButton />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Time Configuration</h1>
          <p className="text-muted-foreground">
            Configure time synchronization and NTP settings for Samba AD DC
          </p>
        </div>
      </div>

      {/* Configuration Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ServerIcon className="h-4 w-4" />
              Server Time Query
            </CardTitle>
            <CardDescription>
              Query the current time from a specific server to check time synchronization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <ErrorAlert
                error={error}
                onDismiss={clearError}
                className="mb-4"
              />
            )}

            <form onSubmit={getServerTime} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="server">Server Address *</Label>
                <Input
                  id="server"
                  type="text"
                  value={server}
                  onChange={handleServerChange}
                  placeholder="127.0.0.1 or server.domain.com"
                  className={error && !server.trim() ? 'border-destructive' : ''}
                />
                <p className="text-sm text-muted-foreground">
                  Enter the IP address or hostname of the server to query
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading || !server.trim()}
                className="w-full sm:w-auto"
              >
                {loading
                  ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Querying...
                  </>
                    )
                  : (
                  <>
                    <Clock className="mr-2 h-4 w-4" />
                    Get Server Time
                  </>
                    )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Current Time Display */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Current Local Time
            </CardTitle>
            <CardDescription>
              Your local system time for reference
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center p-4">
              <div className="text-3xl font-bold">
                {new Date().toLocaleTimeString()}
              </div>
              <div className="text-muted-foreground mt-2">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Server Time Results */}
      {serverTime && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Server Time Result
            </CardTitle>
            <CardDescription>
              Time information from server: {server}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg">
              <pre className="text-sm whitespace-pre-wrap font-mono">
                {serverTime}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Time Synchronization Info */}
      <Card>
        <CardHeader>
          <CardTitle>Time Synchronization Information</CardTitle>
          <CardDescription>
            Important considerations for Active Directory time synchronization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> Accurate time synchronization is critical for Active Directory.
              All domain controllers should be synchronized to prevent authentication issues.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Time Synchronization Requirements:</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Maximum time difference: 5 minutes</li>
                <li>Recommended difference: &lt; 1 minute</li>
                <li>Use reliable NTP sources</li>
                <li>Configure time zones correctly</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Common NTP Servers:</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>pool.ntp.org</li>
                <li>time.nist.gov</li>
                <li>time.google.com</li>
                <li>time.cloudflare.com</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
