import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDNSMutations } from './hooks/useDNS';
import { toast } from 'sonner';
import type { CreateDNSRecordInput } from '@/types/samba';

const createRecordSchema = z.object({
  server: z.string().min(1, 'Server is required'),
  zone: z.string().min(1, 'Zone is required'),
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['A', 'AAAA', 'CNAME', 'MX', 'NS', 'PTR', 'SOA', 'SRV', 'TXT'], {
    required_error: 'Record type is required',
  }),
  data: z.string().min(1, 'Data is required'),
  password: z.string().optional(),
  ttl: z.number().optional(),
});

type CreateRecordFormData = z.infer<typeof createRecordSchema>;

interface CreateRecordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRecordCreated: () => void;
  defaultServer?: string | null;
  defaultPassword?: string;
}

export function CreateRecordDialog({
  isOpen,
  onClose,
  onRecordCreated,
  defaultServer,
  defaultPassword,
}: CreateRecordDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateRecordFormData>({
    resolver: zodResolver(createRecordSchema),
    defaultValues: {
      server: defaultServer || '',
      password: defaultPassword || '',
    },
  });

  const { createRecord } = useDNSMutations(
    () => {
      toast.success('DNS record created successfully');
      onRecordCreated();
    },
    (error) => {
      toast.error(`Failed to create DNS record: ${error}`);
    }
  );

  const recordType = watch('type');

  const onSubmit = async (data: CreateRecordFormData) => {
    setIsSubmitting(true);
    try {
      const input: CreateDNSRecordInput = {
        server: data.server,
        zone: data.zone,
        name: data.name,
        type: data.type,
        data: data.data,
        password: data.password,
        ttl: data.ttl,
      };
      await createRecord(input);
      handleClose();
    } catch (error) {
      // Error handled by mutation
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const getDataPlaceholder = () => {
    switch (recordType) {
      case 'A':
        return '192.168.1.100';
      case 'AAAA':
        return '2001:db8::1';
      case 'CNAME':
        return 'alias.example.com';
      case 'MX':
        return '10 mail.example.com';
      case 'NS':
        return 'ns1.example.com';
      case 'PTR':
        return 'host.example.com';
      case 'SRV':
        return '10 5 443 target.example.com';
      case 'TXT':
        return 'v=spf1 include:_spf.example.com ~all';
      default:
        return 'Enter record data';
    }
  };

  const getDataDescription = () => {
    switch (recordType) {
      case 'A':
        return 'IPv4 address (e.g., 192.168.1.100)';
      case 'AAAA':
        return 'IPv6 address (e.g., 2001:db8::1)';
      case 'CNAME':
        return 'Canonical name (e.g., alias.example.com)';
      case 'MX':
        return 'Priority and mail server (e.g., 10 mail.example.com)';
      case 'NS':
        return 'Name server (e.g., ns1.example.com)';
      case 'PTR':
        return 'Pointer to hostname (e.g., host.example.com)';
      case 'SRV':
        return 'Priority, weight, port, target (e.g., 10 5 443 target.example.com)';
      case 'TXT':
        return 'Text record (e.g., SPF, DKIM records)';
      default:
        return 'Enter the appropriate data for the record type';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create DNS Record</DialogTitle>
          <DialogDescription>
            Add a new DNS record to the specified zone on the DNS server.
          </DialogDescription>
        </DialogHeader>

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
              onValueChange={(value) => setValue('type', value as CreateRecordFormData['type'])}
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
            <Label htmlFor="ttl">TTL (seconds)</Label>
            <Input
              id="ttl"
              type="number"
              {...register('ttl', { valueAsNumber: true })}
              placeholder="3600"
              min="1"
              max="2147483647"
            />
            <p className="text-xs text-muted-foreground">
              Time to live in seconds (default: 3600)
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Record'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}