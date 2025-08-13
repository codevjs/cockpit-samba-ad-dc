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
import { AlertTriangle } from 'lucide-react'
import { useOUMutations } from './hooks/useOU'
import { toast } from 'sonner'

interface DeleteOUDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onOUDeleted: () => void;
  ouDN: string | null;
}

export function DeleteOUDialog ({ isOpen, onClose, onOUDeleted, ouDN }: DeleteOUDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { deleteOU } = useOUMutations(
    () => {
      onOUDeleted()
      onClose()
    },
    (error) => toast.error(error)
  )

  const handleDelete = async () => {
    if (!ouDN) return

    setIsSubmitting(true)
    try {
      await deleteOU(ouDN)
      toast.success('Organization Unit deleted successfully')
    } catch (error) {
      // Error already handled by mutation hook
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!ouDN) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Organization Unit</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this organizational unit?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">This action cannot be undone.</p>
                <p className="text-sm">
                  You are about to delete the following organizational unit:
                </p>
                <code className="block text-sm bg-muted p-2 rounded">
                  {ouDN}
                </code>
                <p className="text-sm text-destructive">
                  Warning: This will permanently delete the OU and may affect any objects
                  or child OUs contained within it. Make sure the OU is empty or move
                  its contents first.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Deleting...' : 'Delete OU'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
