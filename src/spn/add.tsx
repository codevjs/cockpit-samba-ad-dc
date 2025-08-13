import React, { useState } from 'react'
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Plus, Key } from 'lucide-react'
import { useSPNMutations } from './hooks/useSPNMutations'
import { toast } from 'sonner'
import type { CreateSPNInput } from '@/types/samba'

interface AddSPNDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSPNAdded?: () => void;
}

const addSPNSchema = z.object({
  name: z.string()
    .min(1, 'SPN name is required')
    .max(200, 'SPN name must be less than 200 characters')
    .refine(
      (val) => val.includes('/'),
      'SPN must be in format: service/hostname or service/hostname:port'
    ),
  user: z.string()
    .min(1, 'Username is required')
    .max(100, 'Username must be less than 100 characters')
    .regex(/^[a-zA-Z0-9._-]+$/, 'Username can only contain letters, numbers, dots, underscores, and hyphens')
})

type AddSPNFormData = z.infer<typeof addSPNSchema>;

export function AddSPNDialog ({
  isOpen,
  onClose,
  onSPNAdded
}: AddSPNDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<AddSPNFormData>({
    resolver: zodResolver(addSPNSchema),
    defaultValues: {
      name: '',
      user: ''
    }
  })

  const { addSPN } = useSPNMutations(
    () => {
      // Success callback
      toast.success('SPN added successfully')
      resetForm()
      onSPNAdded?.()
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

  const onSubmit = async (data: AddSPNFormData) => {
    try {
      setLoading(true)
      setError(null)

      const spnData: CreateSPNInput = {
        name: data.name.trim(),
        user: data.user.trim()
      }

      await addSPN(spnData)
    } catch (err) {
      // Error is already handled by the mutation hook
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Service Principal Name
          </DialogTitle>
          <DialogDescription>
            Create a new SPN to map a service to a user account for Kerberos authentication
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">SPN Name *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="HTTP/webserver.domain.com or MSSQLSvc/sqlserver:1433"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Format: service/hostname[:port] (e.g., HTTP/server.com, MSSQLSvc/db.com:1433)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="user">Username *</Label>
            <Input
              id="user"
              {...register('user')}
              placeholder="serviceaccount or user1"
              className={errors.user ? 'border-destructive' : ''}
            />
            {errors.user && (
              <p className="text-sm text-destructive">{errors.user.message}</p>
            )}
            <p className="text-sm text-muted-foreground">
              The user account that will be associated with this SPN
            </p>
          </div>

          {/* SPN Format Examples */}
          <Alert>
            <Key className="h-4 w-4" />
            <AlertDescription>
              <strong>Common SPN Examples:</strong>
              <ul className="mt-2 list-disc list-inside text-sm space-y-1">
                <li><code>HTTP/webserver.domain.com</code> - Web services</li>
                <li><code>MSSQLSvc/sqlserver.domain.com:1433</code> - SQL Server</li>
                <li><code>HOST/fileserver.domain.com</code> - File services</li>
                <li><code>ldap/domaincontroller.domain.com</code> - LDAP services</li>
              </ul>
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Adding...' : 'Add SPN'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
