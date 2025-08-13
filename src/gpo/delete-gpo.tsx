import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useGPOMutations } from './hooks/useGPO'
import { toast } from 'sonner'
import type { DeleteGPOInput, SambaGPO } from '@/types/samba'

const deleteGPOSchema = z.object({
  confirmationText: z.string().min(1, 'Please type DELETE to confirm')
})

type DeleteGPOFormData = z.infer<typeof deleteGPOSchema>;

interface DeleteGPODialogProps {
  isOpen: boolean;
  onClose: () => void;
  onGPODeleted: () => void;
  gpo: SambaGPO | null;
}

export function DeleteGPODialog ({
  isOpen,
  onClose,
  onGPODeleted,
  gpo
}: DeleteGPODialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<DeleteGPOFormData>({
    resolver: zodResolver(deleteGPOSchema.refine(
      (data) => data.confirmationText === 'DELETE',
      {
        message: 'Please type DELETE to confirm GPO deletion',
        path: ['confirmationText']
      }
    ))
  })

  const { deleteGPO } = useGPOMutations(
    () => {
      toast.success('GPO deleted successfully')
      onGPODeleted()
    },
    (error) => {
      toast.error(`Failed to delete GPO: ${error}`)
    }
  )

  const confirmationText = watch('confirmationText')
  const isConfirmed = confirmationText === 'DELETE'

  const onSubmit = async (_data: DeleteGPOFormData) => {
    if (!gpo || !isConfirmed) {
      toast.error('Please type DELETE to confirm GPO deletion')
      return
    }

    setIsSubmitting(true)
    try {
      const input: DeleteGPOInput = {
        name: gpo.name
      }
      await deleteGPO(input)
      handleClose()
    } catch (error) {
      // Error handled by mutation
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  if (!gpo) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-red-600">Delete Group Policy Object</DialogTitle>
          <DialogDescription>
            Permanently remove the GPO from Active Directory.
          </DialogDescription>
        </DialogHeader>

        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Warning:</strong> This action cannot be undone. Deleting this GPO will
            permanently remove it from Active Directory and may affect users and computers
            that rely on its policies.
          </AlertDescription>
        </Alert>

        <div className="bg-muted p-3 rounded-lg">
          <h4 className="text-sm font-medium mb-2">GPO to Delete:</h4>
          <div className="space-y-1 text-sm">
            <p><strong>Name:</strong> {gpo.name}</p>
            <p><strong>Display Name:</strong> {gpo.displayName}</p>
            <p><strong>GUID:</strong> <span className="font-mono text-xs">{gpo.guid}</span></p>
            <p><strong>Status:</strong> {gpo.status}</p>
            {gpo.linkedOUs.length > 0 && (
              <p><strong>Linked OUs:</strong> {gpo.linkedOUs.length} containers</p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="bg-red-50 p-3 rounded-lg border border-red-200">
            <h4 className="text-sm font-medium text-red-800 mb-2">What will be deleted:</h4>
            <ul className="text-xs text-red-700 space-y-1">
              <li>• The GPO and all its policy settings</li>
              <li>• All links to organizational units, domains, or sites</li>
              <li>• User and computer configurations within the GPO</li>
              <li>• Security settings and administrative templates</li>
              <li>• All backup copies stored in SYSVOL</li>
            </ul>
          </div>

          {gpo.linkedOUs.length > 0 && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>Active Links:</strong> This GPO is currently linked to {gpo.linkedOUs.length}
                container(s). Deleting it will remove all policies applied through these links.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="confirmationText">Confirmation *</Label>
            <Input
              id="confirmationText"
              {...register('confirmationText')}
              placeholder="Type DELETE to confirm"
              className={errors.confirmationText ? 'border-red-500' : ''}
            />
            {errors.confirmationText && (
              <p className="text-sm text-red-500">{errors.confirmationText.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Type <strong>DELETE</strong> (in uppercase) to confirm this dangerous action
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={isSubmitting || !isConfirmed}
            >
              {isSubmitting ? 'Deleting...' : 'Delete GPO'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
