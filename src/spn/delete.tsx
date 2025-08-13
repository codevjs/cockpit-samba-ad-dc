import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react'
import { useSPNMutations } from './hooks/useSPNMutations'
import { toast } from 'sonner'

interface DeleteSPNDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSPNDeleted?: () => void;
  spnName: string;
  userName: string;
}

export function DeleteSPNDialog ({
  isOpen,
  onClose,
  onSPNDeleted,
  spnName,
  userName
}: DeleteSPNDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { deleteSPN } = useSPNMutations(
    () => {
      // Success callback
      toast.success(`SPN "${spnName}" deleted successfully`)
      onSPNDeleted?.()
      onClose()
    },
    (errorMessage: string) => {
      // Error callback
      setError(errorMessage)
    }
  )

  const handleClose = () => {
    setError(null)
    onClose()
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      setError(null)

      await deleteSPN({ name: spnName, user: userName })
    } catch (err) {
      // Error is already handled by the mutation hook
    } finally {
      setLoading(false)
    }
  }

  const parseSPNInfo = (spn: string) => {
    const parts = spn.split('/')
    const service = parts[0] || 'Unknown'
    const hostPart = parts[1] || ''

    let hostname = hostPart
    let port = ''

    if (hostPart.includes(':')) {
      [hostname, port] = hostPart.split(':')
    }

    return { service, hostname, port }
  }

  const { service, hostname, port } = parseSPNInfo(spnName)

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            Delete Service Principal Name
          </DialogTitle>
          <DialogDescription>
            <strong>Warning:</strong> This action cannot be undone. Deleting this SPN will:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="text-sm text-muted-foreground space-y-2">
            <ul className="list-disc ml-4 space-y-1">
              <li>Remove the SPN from the user account</li>
              <li>Disable Kerberos authentication for this service</li>
              <li>Potentially break service authentication</li>
              <li>Affect applications using this SPN</li>
            </ul>
            <p className="font-medium text-destructive mt-3">
              This action is <strong>irreversible</strong>.
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* SPN Details */}
          <Alert>
            <AlertDescription>
              <div className="space-y-2">
                <div><strong>SPN:</strong> <code className="bg-muted px-1 py-0.5 rounded">{spnName}</code></div>
                <div><strong>User:</strong> <code className="bg-muted px-1 py-0.5 rounded">{userName}</code></div>
                <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                  <div><strong>Service:</strong> {service}</div>
                  {hostname && <div><strong>Hostname:</strong> {hostname}</div>}
                  {port && <div><strong>Port:</strong> {port}</div>}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading
              ? 'Deleting...'
              : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete SPN
              </>
                )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
