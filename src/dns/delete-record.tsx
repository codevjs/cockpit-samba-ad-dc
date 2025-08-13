import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDNSMutations } from './hooks/useDNS'
import { toast } from 'sonner'
import type { DeleteDNSRecordInput } from '@/types/samba'

const deleteRecordSchema = z.object({
  server: z.string().min(1, 'Server is required'),
  zone: z.string().min(1, 'Zone is required'),
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['A', 'AAAA', 'CNAME', 'MX', 'NS', 'PTR', 'SOA', 'SRV', 'TXT'], {
    required_error: 'Record type is required'
  }),
  data: z.string().min(1, 'Data is required'),
  password: z.string().optional()
})

type DeleteRecordFormData = z.infer<typeof deleteRecordSchema>;

interface DeleteRecordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRecordDeleted: () => void;
  defaultServer?: string | null;
  defaultPassword?: string;
}

export function DeleteRecordDialog ({
  isOpen,
  onClose,
  onRecordDeleted,
  defaultServer,
  defaultPassword
}: DeleteRecordDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<DeleteRecordFormData>({
    resolver: zodResolver(deleteRecordSchema),
    defaultValues: {
      server: defaultServer || '',
      password: defaultPassword || ''
    }
  })

  const { deleteRecord } = useDNSMutations(
    () => {
      toast.success('DNS record deleted successfully')
      onRecordDeleted()
    },
    (error) => {
      toast.error(`Failed to delete DNS record: ${error}`)
    }
  )

  const recordType = watch('type')

  const onSubmit = async (data: DeleteRecordFormData) => {
    setIsSubmitting(true)
    try {
      const input: DeleteDNSRecordInput = {
        server: data.server,
        zone: data.zone,
        name: data.name,
        type: data.type,
        data: data.data,
        password: data.password
      }
      await deleteRecord(input)
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

  const getDataPlaceholder = () => {
    switch (recordType) {
      case 'A':
        return '192.168.1.100'
      case 'AAAA':
        return '2001:db8::1'
      case 'CNAME':
        return 'alias.example.com'
      case 'MX':
        return '10 mail.example.com'
      case 'NS':
        return 'ns1.example.com'
      case 'PTR':
        return 'host.example.com'
      case 'SRV':
        return '10 5 443 target.example.com'
      case 'TXT':
        return 'v=spf1 include:_spf.example.com ~all'
      default:
        return 'Enter record data'
    }
  }

  const getDataDescription = () => {
    switch (recordType) {
      case 'A':
        return 'IPv4 address to delete (e.g., 192.168.1.100)'
      case 'AAAA':
        return 'IPv6 address to delete (e.g., 2001:db8::1)'
      case 'CNAME':
        return 'Canonical name to delete (e.g., alias.example.com)'
      case 'MX':
        return 'Mail server entry to delete (e.g., 10 mail.example.com)'
      case 'NS':
        return 'Name server to delete (e.g., ns1.example.com)'
      case 'PTR':
        return 'Pointer record to delete (e.g., host.example.com)'
      case 'SRV':
        return 'Service record to delete (e.g., 10 5 443 target.example.com)'
      case 'TXT':
        return 'Text record to delete (exact match required)'
      default:
        return 'Enter the exact data of the record to delete'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete DNS Record</DialogTitle>
          <DialogDescription>
            Remove a DNS record from the specified zone on the DNS server.
          </DialogDescription>
        </DialogHeader>

        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Warning:</strong> This action cannot be undone. The DNS record will be permanently removed.
            Make sure all field values exactly match the existing record.
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="zone">DNS Zone *</Label>
            <Input
              id="zone"
              {...register('zone')}
              placeholder="example.com"
              className={errors.zone ? 'border-red-500' : ''}
            />
            {errors.zone && (
              <p className="text-sm text-red-500">{errors.zone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Record Name *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="www"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Record Type *</Label>
            <Select
              value={watch('type') || ''}
              onValueChange={(value) => setValue('type', value as DeleteRecordFormData['type'])}
            >
              <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select record type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">A - IPv4 Address</SelectItem>
                <SelectItem value="AAAA">AAAA - IPv6 Address</SelectItem>
                <SelectItem value="CNAME">CNAME - Canonical Name</SelectItem>
                <SelectItem value="MX">MX - Mail Exchange</SelectItem>
                <SelectItem value="NS">NS - Name Server</SelectItem>
                <SelectItem value="PTR">PTR - Pointer</SelectItem>
                <SelectItem value="SOA">SOA - Start of Authority</SelectItem>
                <SelectItem value="SRV">SRV - Service</SelectItem>
                <SelectItem value="TXT">TXT - Text</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-red-500">{errors.type.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="data">Record Data *</Label>
            <Input
              id="data"
              {...register('data')}
              placeholder={getDataPlaceholder()}
              className={errors.data ? 'border-red-500' : ''}
            />
            {recordType && (
              <p className="text-xs text-muted-foreground">
                {getDataDescription()}
              </p>
            )}
            {errors.data && (
              <p className="text-sm text-red-500">{errors.data.message}</p>
            )}
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={isSubmitting}>
              {isSubmitting ? 'Deleting...' : 'Delete Record'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
