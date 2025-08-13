import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info, Archive } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDomainMutations } from '../hooks/useDomainMutations'
import { toast } from 'sonner'
import type { BackupOfflineInput } from '@/types/samba'

const backupOfflineSchema = z.object({
  targetdir: z.string().min(1, 'Target directory is required'),
  server: z.string().optional(),
  realm: z.string().optional()
})

type BackupOfflineFormData = z.infer<typeof backupOfflineSchema>;

interface BackupOfflineDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onBackupCompleted: () => void;
}

export function BackupOfflineDialog ({
  isOpen,
  onClose,
  onBackupCompleted
}: BackupOfflineDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<BackupOfflineFormData>({
    resolver: zodResolver(backupOfflineSchema)
  })

  const { backupOffline } = useDomainMutations(
    () => {
      toast.success('Offline backup completed successfully')
      onBackupCompleted()
    },
    (error) => {
      toast.error(`Failed to create offline backup: ${error}`)
    }
  )

  const onSubmit = async (data: BackupOfflineFormData) => {
    setIsSubmitting(true)
    try {
      const input: BackupOfflineInput = {
        targetdir: data.targetdir,
        server: data.server,
        realm: data.realm
      }
      await backupOffline(input)
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
          <DialogTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Create Offline Backup
          </DialogTitle>
          <DialogDescription>
            Create an offline backup of the Active Directory domain.
          </DialogDescription>
        </DialogHeader>

        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Offline Backup:</strong> This creates a complete backup of the domain
            data including the ntds.dit database, SYSVOL, and registry settings. The backup
            can be used for disaster recovery.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="targetdir">Target Directory *</Label>
            <Input
              id="targetdir"
              {...register('targetdir')}
              placeholder="/backup/domain/"
              className={errors.targetdir ? 'border-red-500' : ''}
            />
            {errors.targetdir && (
              <p className="text-sm text-red-500">{errors.targetdir.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Directory where the backup will be stored
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="server">Server</Label>
            <Input
              id="server"
              {...register('server')}
              placeholder="dc1.domain.com"
            />
            <p className="text-xs text-muted-foreground">
              Optional: Specific domain controller to backup from
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="realm">Realm</Label>
            <Input
              id="realm"
              {...register('realm')}
              placeholder="DOMAIN.COM"
            />
            <p className="text-xs text-muted-foreground">
              Optional: Kerberos realm for the domain
            </p>
          </div>

          <div className="bg-muted/50 p-3 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Backup Contents:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Active Directory database (ntds.dit)</li>
              <li>• SYSVOL folder with Group Policy Objects</li>
              <li>• Registry settings and configuration</li>
              <li>• Domain security policies</li>
              <li>• Certificate store data</li>
            </ul>
          </div>

          <Alert className="border-orange-200 bg-orange-50">
            <Info className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Note:</strong> The backup process may take a significant amount of time
              depending on the size of your domain data. Ensure adequate disk space is available
              in the target directory.
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating Backup...' : 'Create Backup'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default BackupOfflineDialog
