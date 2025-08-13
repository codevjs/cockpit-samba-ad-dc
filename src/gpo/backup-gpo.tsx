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
import type { BackupGPOInput } from '@/types/samba'

const backupGPOSchema = z.object({
  name: z.string().min(1, 'GPO name is required'),
  backupPath: z.string().min(1, 'Backup path is required')
})

type BackupGPOFormData = z.infer<typeof backupGPOSchema>;

interface BackupGPODialogProps {
  isOpen: boolean;
  onClose: () => void;
  onBackupCompleted: () => void;
}

export function BackupGPODialog ({
  isOpen,
  onClose,
  onBackupCompleted
}: BackupGPODialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<BackupGPOFormData>({
    resolver: zodResolver(backupGPOSchema)
  })

  const { backupGPO } = useGPOMutations(
    () => {
      toast.success('GPO backup completed successfully')
      onBackupCompleted()
    },
    (error) => {
      toast.error(`Failed to backup GPO: ${error}`)
    }
  )

  const onSubmit = async (data: BackupGPOFormData) => {
    setIsSubmitting(true)
    try {
      const input: BackupGPOInput = {
        name: data.name,
        backupPath: data.backupPath
      }
      await backupGPO(input)
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
          <DialogTitle>Backup GPO</DialogTitle>
          <DialogDescription>
            Create a backup of a Group Policy Object.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">GPO Name *</Label>
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Backing up...' : 'Backup GPO'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
