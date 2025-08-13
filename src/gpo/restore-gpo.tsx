import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useGPOMutations } from './hooks/useGPO'
import { toast } from 'sonner'
import type { RestoreGPOInput } from '@/types/samba'

const restoreGPOSchema = z.object({
  name: z.string().min(1, 'GPO name is required'),
  backupPath: z.string().min(1, 'Backup path is required'),
  newName: z.string().optional()
})

type RestoreGPOFormData = z.infer<typeof restoreGPOSchema>;

interface RestoreGPODialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRestoreCompleted: () => void;
}

export function RestoreGPODialog ({
  isOpen,
  onClose,
  onRestoreCompleted
}: RestoreGPODialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<RestoreGPOFormData>({
    resolver: zodResolver(restoreGPOSchema)
  })

  const { restoreGPO } = useGPOMutations(
    () => {
      toast.success('GPO restore completed successfully')
      onRestoreCompleted()
    },
    (error) => {
      toast.error(`Failed to restore GPO: ${error}`)
    }
  )

  const onSubmit = async (data: RestoreGPOFormData) => {
    setIsSubmitting(true)
    try {
      const input: RestoreGPOInput = {
        name: data.name,
        backupPath: data.backupPath,
        newName: data.newName
      }
      await restoreGPO(input)
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Restore GPO</DialogTitle>
          <DialogDescription>
            Restore a Group Policy Object from backup.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Original GPO Name *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="GPO-Name"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="backupPath">Backup Path *</Label>
            <Input
              id="backupPath"
              {...register('backupPath')}
              placeholder="/backup/gpo/"
              className={errors.backupPath ? 'border-red-500' : ''}
            />
            {errors.backupPath && (
              <p className="text-sm text-red-500">{errors.backupPath.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newName">New GPO Name (Optional)</Label>
            <Input
              id="newName"
              {...register('newName')}
              placeholder="Leave empty to use original name"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Restoring...' : 'Restore GPO'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
