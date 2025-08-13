import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertTriangle } from 'lucide-react'
import { useFSMOMutations } from './hooks/useFSMO'
import { toast } from 'sonner'
import type { SeizeFSMORoleInput } from '@/types/samba'

interface SeizeRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRoleSeized?: () => void;
  preselectedRole?: string;
}

const seizeRoleSchema = z.object({
  role: z.enum(['SchemaMaster', 'DomainNamingMaster', 'PDCEmulator', 'RIDMaster', 'InfrastructureMaster'], {
    required_error: 'FSMO role is required'
  }),
  confirmationText: z.string()
    .min(1, 'Confirmation text is required')
})

type SeizeRoleFormData = z.infer<typeof seizeRoleSchema>;

const fsmoRoleOptions = [
  { value: 'SchemaMaster', label: 'Schema Master', scope: 'Forest-wide', risk: 'High' },
  { value: 'DomainNamingMaster', label: 'Domain Naming Master', scope: 'Forest-wide', risk: 'High' },
  { value: 'PDCEmulator', label: 'PDC Emulator', scope: 'Domain-wide', risk: 'Critical' },
  { value: 'RIDMaster', label: 'RID Master', scope: 'Domain-wide', risk: 'Medium' },
  { value: 'InfrastructureMaster', label: 'Infrastructure Master', scope: 'Domain-wide', risk: 'Medium' }
] as const

export function SeizeRoleDialog ({
  isOpen,
  onClose,
  onRoleSeized,
  preselectedRole
}: SeizeRoleDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<SeizeRoleFormData>({
    resolver: zodResolver(seizeRoleSchema),
    defaultValues: {
      role: 'PDCEmulator',
      confirmationText: ''
    }
  })

  const selectedRole = watch('role')
  const confirmationText = watch('confirmationText')

  // Set preselected role when dialog opens
  useEffect(() => {
    if (preselectedRole && isOpen) {
      setValue('role', preselectedRole as SeizeRoleFormData['role'])
    }
  }, [preselectedRole, isOpen, setValue])

  const { seizeRole } = useFSMOMutations(
    () => {
      // Success callback
      const roleOption = fsmoRoleOptions.find(r => r.value === selectedRole)
      toast.success(`${roleOption?.label} role seized successfully`)
      resetForm()
      onRoleSeized?.()
      onClose()
    },
    (errorMessage: string) => {
      // Error callback
      setError(errorMessage)
    }
  )

  const resetForm = () => {
    reset()
    setError(null)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const onSubmit = async (data: SeizeRoleFormData) => {
    const expectedConfirmation = 'SEIZE ROLE'
    if (data.confirmationText.toUpperCase() !== expectedConfirmation) {
      setError(`You must type "${expectedConfirmation}" to confirm this dangerous operation`)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const seizeData: SeizeFSMORoleInput = {
        role: data.role
      }

      await seizeRole(seizeData)
    } catch (err) {
      // Error is already handled by the mutation hook
    } finally {
      setLoading(false)
    }
  }

  const selectedRoleInfo = fsmoRoleOptions.find(r => r.value === selectedRole)
  const isConfirmationValid = confirmationText.toUpperCase() === 'SEIZE ROLE'

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            Seize FSMO Role
          </DialogTitle>
          <DialogDescription>
            <strong>WARNING:</strong> Seizing an FSMO role is a forceful operation that should only be used
            when normal transfer fails or the current role holder is permanently offline.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>DANGER:</strong> Seizing FSMO roles can cause serious problems:
              <ul className="mt-2 list-disc list-inside text-sm space-y-1">
                <li>Replication conflicts and data inconsistency</li>
                <li>Service interruptions and authentication failures</li>
                <li>Permanent damage to Active Directory</li>
                <li>Loss of data or corrupted directory</li>
              </ul>
              <div className="mt-2 font-medium">
                Only proceed if the current role holder is permanently offline and transfer is impossible!
              </div>
            </AlertDescription>
          </Alert>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="role">FSMO Role *</Label>
            <Select
              value={selectedRole}
              onValueChange={(value) => setValue('role', value as SeizeRoleFormData['role'])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select FSMO role" />
              </SelectTrigger>
              <SelectContent>
                {fsmoRoleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col">
                      <span>{option.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {option.scope} • Risk: {option.risk}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-destructive">{errors.role.message}</p>
            )}
          </div>

          {selectedRoleInfo && (
            <Alert variant="destructive">
              <AlertDescription>
                <div className="space-y-1">
                  <div><strong>Role:</strong> {selectedRoleInfo.label}</div>
                  <div><strong>Scope:</strong> {selectedRoleInfo.scope}</div>
                  <div><strong>Risk Level:</strong> {selectedRoleInfo.risk}</div>
                  <div className="text-sm mt-2">
                    This will forcefully seize the role from the current holder without coordination.
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="confirmationText">
              Type "SEIZE ROLE" to confirm this dangerous operation *
            </Label>
            <Input
              id="confirmationText"
              {...register('confirmationText')}
              placeholder="SEIZE ROLE"
              className={`${errors.confirmationText ? 'border-destructive' : ''} ${
                confirmationText && !isConfirmationValid ? 'border-destructive' : ''
              }`}
            />
            {errors.confirmationText && (
              <p className="text-sm text-destructive">{errors.confirmationText.message}</p>
            )}
            <p className="text-sm text-muted-foreground">
              This confirmation helps prevent accidental role seizures
            </p>
          </div>

          <Alert>
            <AlertDescription>
              <strong>Before seizing, ensure:</strong>
              <ul className="mt-1 list-disc list-inside text-sm space-y-1">
                <li>Current role holder is permanently offline</li>
                <li>Normal transfer has been attempted and failed</li>
                <li>You have a complete backup of Active Directory</li>
                <li>This action is approved by senior administrators</li>
                <li>You understand the risks and consequences</li>
              </ul>
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={loading || !isConfirmationValid}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Seizing...' : 'Seize Role'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
