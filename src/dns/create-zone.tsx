import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDNSMutations } from './hooks/useDNS'
import { toast } from 'sonner'
import type { CreateDNSZoneInput } from '@/types/samba'

const createZoneSchema = z.object({
  server: z.string().min(1, 'Server is required'),
  zoneName: z.string()
    .min(1, 'Zone name is required')
    .regex(/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
      'Invalid zone name format'),
  password: z.string().optional()
})

type CreateZoneFormData = z.infer<typeof createZoneSchema>;

interface CreateZoneDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onZoneCreated: () => void;
  defaultServer?: string | null;
  defaultPassword?: string;
}

export function CreateZoneDialog ({
  isOpen,
  onClose,
  onZoneCreated,
  defaultServer,
  defaultPassword
}: CreateZoneDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<CreateZoneFormData>({
    resolver: zodResolver(createZoneSchema),
    defaultValues: {
      server: defaultServer || '',
      password: defaultPassword || ''
    }
  })

  const { createZone } = useDNSMutations(
    () => {
      toast.success('DNS zone created successfully')
      onZoneCreated()
    },
    (error) => {
      toast.error(`Failed to create DNS zone: ${error}`)
    }
  )

  const onSubmit = async (data: CreateZoneFormData) => {
    setIsSubmitting(true)
    try {
      const input: CreateDNSZoneInput = {
        server: data.server,
        zoneName: data.zoneName,
        password: data.password
      }
      await createZone(input)
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
          <DialogTitle>Create DNS Zone</DialogTitle>
          <DialogDescription>
            Create a new DNS zone on the specified DNS server.
          </DialogDescription>
        </DialogHeader>

        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Note:</strong> DNS zones manage domain names and their associated records.
            Creating a zone allows you to add DNS records for that domain.
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
              The DNS server where the zone will be created
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
              The domain name for the new DNS zone (e.g., example.com, subdomain.example.com)
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

          <div className="bg-muted/50 p-3 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Zone Creation Details:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• A new primary DNS zone will be created</li>
              <li>• Default SOA record will be automatically generated</li>
              <li>• NS records will be created for the DNS server</li>
              <li>• You can add additional records after creation</li>
            </ul>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Zone'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
