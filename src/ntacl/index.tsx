import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Shield,
  FileText,
  Settings,
  CheckCircle,
  AlertTriangle,
  HardDrive,
  Info
} from 'lucide-react'
import { BackButton } from '../common'
import { useSysvolCheck } from './hooks/useNTACL'
import { GetNTACLDialog } from './get-ntacl'
import { SetNTACLDialog } from './set-ntacl'
import { ChangeDomSIDDialog } from './change-domsid'
import { GetDOSInfoDialog } from './get-dosinfo'
import { SysvolResetDialog } from './sysvol-reset'

export default function NTACLManagement () {
  const { sysvolStatus, loading: sysvolLoading, refresh: refreshSysvol } = useSysvolCheck()

  // Dialog states
  const [getNTACLDialogOpen, setGetNTACLDialogOpen] = useState(false)
  const [setNTACLDialogOpen, setSetNTACLDialogOpen] = useState(false)
  const [changeDomSIDDialogOpen, setChangeDomSIDDialogOpen] = useState(false)
  const [getDOSInfoDialogOpen, setGetDOSInfoDialogOpen] = useState(false)
  const [sysvolResetDialogOpen, setSysvolResetDialogOpen] = useState(false)

  const handleOperationSuccess = () => {
    refreshSysvol()
  }

  // Check if SYSVOL has issues
  const hasSysvolIssues = sysvolStatus.some(line =>
    line.toLowerCase().includes('error') ||
    line.toLowerCase().includes('failed') ||
    line.toLowerCase().includes('mismatch')
  )

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-4">
        <BackButton />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">NT ACL Management</h1>
          <p className="text-muted-foreground">
            Manage Windows NT Access Control Lists for files and SYSVOL
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SYSVOL Status</CardTitle>
            {hasSysvolIssues
              ? (
              <AlertTriangle className="h-4 w-4 text-red-600" />
                )
              : (
              <CheckCircle className="h-4 w-4 text-green-600" />
                )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${hasSysvolIssues ? 'text-red-600' : 'text-green-600'}`}>
              {hasSysvolIssues ? 'Issues Found' : 'Healthy'}
            </div>
            <p className="text-xs text-muted-foreground">
              SYSVOL ACL status
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">File ACLs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Managed</div>
            <p className="text-xs text-muted-foreground">
              NT file system ACLs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">DOS Attributes</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Available</div>
            <p className="text-xs text-muted-foreground">
              File system attributes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Model</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Windows NT</div>
            <p className="text-xs text-muted-foreground">
              Native Windows ACLs
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="operations" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="operations" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Operations
            </TabsTrigger>
            <TabsTrigger value="sysvol-status" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              SYSVOL Status
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button onClick={refreshSysvol} variant="outline">
              Refresh SYSVOL
            </Button>
          </div>
        </div>

        <TabsContent value="operations">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Get File ACLs
                </CardTitle>
                <CardDescription>
                  Retrieve NT ACLs for a specific file or directory
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setGetNTACLDialogOpen(true)}
                  className="w-full"
                >
                  Get ACLs
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Set File ACLs
                </CardTitle>
                <CardDescription>
                  Set NT ACLs for a specific file or directory
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setSetNTACLDialogOpen(true)}
                  className="w-full"
                >
                  Set ACLs
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Change Domain SID
                </CardTitle>
                <CardDescription>
                  Update domain SID references in ACLs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setChangeDomSIDDialogOpen(true)}
                  className="w-full"
                  variant="outline"
                >
                  Change SID
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5" />
                  Get DOS Info
                </CardTitle>
                <CardDescription>
                  Retrieve DOS file attributes and information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setGetDOSInfoDialogOpen(true)}
                  className="w-full"
                  variant="outline"
                >
                  Get DOS Info
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Reset SYSVOL
                </CardTitle>
                <CardDescription>
                  Reset SYSVOL ACLs to default settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setSysvolResetDialogOpen(true)}
                  className="w-full"
                  variant="destructive"
                >
                  Reset SYSVOL
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Check SYSVOL
                </CardTitle>
                <CardDescription>
                  Verify SYSVOL ACL consistency and health
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={refreshSysvol}
                  className="w-full"
                  variant="outline"
                >
                  Check SYSVOL
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sysvol-status">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                SYSVOL ACL Status
              </CardTitle>
              <CardDescription>
                Current status of SYSVOL ACLs and any detected issues.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sysvolLoading
                ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-muted rounded w-full"></div>
                    </div>
                  ))}
                </div>
                  )
                : sysvolStatus.length === 0
                  ? (
                <div className="text-center py-8">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
                  <h3 className="mt-2 text-sm font-semibold">SYSVOL Healthy</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    No SYSVOL ACL issues detected
                  </p>
                </div>
                    )
                  : (
                <div className="space-y-4">
                  {hasSysvolIssues && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Issues detected with SYSVOL ACLs. Review the status below and consider running SYSVOL reset if needed.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <h4 className="font-medium">SYSVOL Check Results:</h4>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <pre className="text-sm font-mono overflow-x-auto whitespace-pre-wrap">
                        {sysvolStatus.join('\n')}
                      </pre>
                    </div>
                  </div>

                  {hasSysvolIssues && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setSysvolResetDialogOpen(true)}
                        variant="destructive"
                        size="sm"
                      >
                        Reset SYSVOL ACLs
                      </Button>
                      <Button
                        onClick={refreshSysvol}
                        variant="outline"
                        size="sm"
                      >
                        Recheck
                      </Button>
                    </div>
                  )}
                </div>
                    )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Information Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">NT ACL Management</p>
            <p className="text-sm">
              This module provides tools for managing Windows NT Access Control Lists (ACLs)
              on files and directories. NT ACLs control file system permissions and are critical
              for proper Samba integration with Windows clients.
            </p>
          </div>
        </AlertDescription>
      </Alert>

      {/* Dialogs */}
      <GetNTACLDialog
        isOpen={getNTACLDialogOpen}
        onClose={() => setGetNTACLDialogOpen(false)}
      />

      <SetNTACLDialog
        isOpen={setNTACLDialogOpen}
        onClose={() => setSetNTACLDialogOpen(false)}
        onNTACLSet={handleOperationSuccess}
      />

      <ChangeDomSIDDialog
        isOpen={changeDomSIDDialogOpen}
        onClose={() => setChangeDomSIDDialogOpen(false)}
        onDomSIDChanged={handleOperationSuccess}
      />

      <GetDOSInfoDialog
        isOpen={getDOSInfoDialogOpen}
        onClose={() => setGetDOSInfoDialogOpen(false)}
      />

      <SysvolResetDialog
        isOpen={sysvolResetDialogOpen}
        onClose={() => setSysvolResetDialogOpen(false)}
        onSysvolReset={handleOperationSuccess}
      />
    </div>
  )
}
