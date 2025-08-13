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
import { useDNSMutations } from './hooks/useDNS'
import { toast } from 'sonner'
import type { DeleteDNSZoneInput } from '@/types/samba'

const deleteZoneSchema = z.object({
  server: z.string().min(1, 'Server is required'),
  zoneName: z.string().min(1, 'Zone name is required'),
  password: z.string().optional(),
  confirmationText: z.string().min(1, 'Please type DELETE to confirm')
})

type DeleteZoneFormData = z.infer<typeof deleteZoneSchema>;

interface DeleteZoneDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onZoneDeleted: () => void;
  defaultServer?: string | null;
  defaultPassword?: string;
}

export function DeleteZoneDialog ({
  isOpen,
  onClose,
  onZoneDeleted,
  defaultServer,
  defaultPassword
}: DeleteZoneDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<DeleteZoneFormData>({
    resolver: zodResolver(deleteZoneSchema.refine(
      (data) => data.confirmationText === 'DELETE',
      {
        message: 'Please type DELETE to confirm zone deletion',
        path: ['confirmationText']
      }
    )),
    defaultValues: {
      server: defaultServer || '',
      password: defaultPassword || ''
    }
  })

  const { deleteZone } = useDNSMutations(
    () => {
      toast.success('DNS zone deleted successfully')
      onZoneDeleted()
    },
    (error) => {
      toast.error(`Failed to delete DNS zone: ${error}`)
    }
  )

  const confirmationText = watch('confirmationText')
  const isConfirmed = confirmationText === 'DELETE'

  const onSubmit = async (data: DeleteZoneFormData) => {
    if (!isConfirmed) {
      toast.error('Please type DELETE to confirm zone deletion')
      return
    }

    setIsSubmitting(true)
    try {
      const input: DeleteDNSZoneInput = {
        server: data.server,
        zoneName: data.zoneName,
        password: data.password
      }
      await deleteZone(input)
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
          <DialogTitle className="text-red-600">Delete DNS Zone</DialogTitle>
          <DialogDescription>
            Permanently remove a DNS zone and all its records from the DNS server.
          </DialogDescription>
        </DialogHeader>

        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Warning:</strong> This action cannot be undone. Deleting a DNS zone will
            permanently remove the zone and all DNS records within it. This may cause service
            disruptions for domains that rely on this zone.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="server">DNS Server *</Label>
            <Input
              id="server"
              {...register('server')}
              placeholder="dns.domain.com"
              className={errors.server ? 'border-red-500' : ''}
            />
            {errors.server && (
              <p className="text-sm text-red-500">{errors.server.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              The DNS server where the zone will be deleted
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="zoneName">Zone Name *</Label>
            <Input
              id="zoneName"
              {...register('zoneName')}
              placeholder="example.com"
              className={errors.zoneName ? 'border-red-500' : ''}
            />
            {errors.zoneName && (
              <p className="text-sm text-red-500">{errors.zoneName.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              The exact name of the DNS zone to delete
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              {...register('password')}
              placeholder="Enter password if required"
            />
            <p className="text-xs text-muted-foreground">
              Optional password for authentication
            </p>
          </div>

          <div className="bg-red-50 p-3 rounded-lg border border-red-200">
            <h4 className="text-sm font-medium text-red-800 mb-2">What will be deleted:</h4>
            <ul className="text-xs text-red-700 space-y-1">
              <li>• The entire DNS zone and all its configuration</li>
              <li>• All DNS records within the zone (A, AAAA, CNAME, MX, NS, PTR, SOA, SRV, TXT)</li>
              <li>• Zone delegation information</li>
              <li>• Zone transfer settings</li>
            </ul>
          </div>

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
              {isSubmitting ? 'Deleting...' : 'Delete Zone'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
