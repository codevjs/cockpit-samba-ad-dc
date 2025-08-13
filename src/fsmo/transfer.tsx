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
import { Loader2, ArrowRight, Info } from 'lucide-react'
import { useFSMOMutations } from './hooks/useFSMO'
import { toast } from 'sonner'
import type { TransferFSMORoleInput } from '@/types/samba'

interface TransferRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRoleTransferred?: () => void;
  preselectedRole?: string;
}

const transferRoleSchema = z.object({
  role: z.enum(['SchemaMaster', 'DomainNamingMaster', 'PDCEmulator', 'RIDMaster', 'InfrastructureMaster'], {
    required_error: 'FSMO role is required'
  }),
  targetServer: z.string()
    .min(1, 'Target server is required')
    .max(100, 'Server name must be less than 100 characters')
})

type TransferRoleFormData = z.infer<typeof transferRoleSchema>;

const fsmoRoleOptions = [
  { value: 'SchemaMaster', label: 'Schema Master', scope: 'Forest-wide' },
  { value: 'DomainNamingMaster', label: 'Domain Naming Master', scope: 'Forest-wide' },
  { value: 'PDCEmulator', label: 'PDC Emulator', scope: 'Domain-wide' },
  { value: 'RIDMaster', label: 'RID Master', scope: 'Domain-wide' },
  { value: 'InfrastructureMaster', label: 'Infrastructure Master', scope: 'Domain-wide' }
] as const

export function TransferRoleDialog ({
  isOpen,
  onClose,
  onRoleTransferred,
  preselectedRole
}: TransferRoleDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<TransferRoleFormData>({
    resolver: zodResolver(transferRoleSchema),
    defaultValues: {
      role: 'PDCEmulator',
      targetServer: ''
    }
  })

  const selectedRole = watch('role')

  // Set preselected role when dialog opens
  useEffect(() => {
    if (preselectedRole && isOpen) {
      setValue('role', preselectedRole as TransferRoleFormData['role'])
    }
  }, [preselectedRole, isOpen, setValue])

  const { transferRole } = useFSMOMutations(
    () => {
      // Success callback
      const roleOption = fsmoRoleOptions.find(r => r.value === selectedRole)
      toast.success(`${roleOption?.label} role transferred successfully`)
      resetForm()
      onRoleTransferred?.()
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

  const onSubmit = async (data: TransferRoleFormData) => {
    try {
      setLoading(true)
      setError(null)

      const transferData: TransferFSMORoleInput = {
        role: data.role,
        targetServer: data.targetServer.trim()
      }

      await transferRole(transferData)
    } catch (err) {
      // Error is already handled by the mutation hook
    } finally {
      setLoading(false)
    }
  }

  const selectedRoleInfo = fsmoRoleOptions.find(r => r.value === selectedRole)

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4" />
            Transfer FSMO Role
          </DialogTitle>
          <DialogDescription>
            Transfer an FSMO role to another domain controller. This is a graceful operation that
            coordinates with the target server.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="role">FSMO Role *</Label>
            <Select
              value={selectedRole}
              onValueChange={(value) => setValue('role', value as TransferRoleFormData['role'])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select FSMO role" />
              </SelectTrigger>
              <SelectContent>
                {fsmoRoleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col">
                      <span>{option.label}</span>
                      <span className="text-xs text-muted-foreground">{option.scope}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-destructive">{errors.role.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetServer">Target Server *</Label>
            <Input
              id="targetServer"
              {...register('targetServer')}
              placeholder="dc2.domain.com or DC2"
              className={errors.targetServer ? 'border-destructive' : ''}
            />
            {errors.targetServer && (
              <p className="text-sm text-destructive">{errors.targetServer.message}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Enter the hostname or FQDN of the target domain controller
            </p>
          </div>

          {selectedRoleInfo && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <div><strong>Role:</strong> {selectedRoleInfo.label}</div>
                  <div><strong>Scope:</strong> {selectedRoleInfo.scope}</div>
                  <div className="text-sm">
                    This operation will gracefully transfer the role to the target server.
                    Both servers must be online and reachable.
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <Alert>
            <AlertDescription>
              <strong>Important:</strong> Ensure the target domain controller is:
              <ul className="mt-1 list-disc list-inside text-sm space-y-1">
                <li>Online and reachable</li>
                <li>A member of the same domain/forest</li>
                <li>Running Active Directory Domain Services</li>
                <li>Has sufficient resources and connectivity</li>
              </ul>
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Transferring...' : 'Transfer Role'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
