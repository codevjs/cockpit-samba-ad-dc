import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDomainMutations } from './hooks/useDomainMutations';
import { toast } from 'sonner';
import type { DomainJoinInput } from '@/types/samba';

const domainJoinSchema = z.object({
  domain: z.string().min(1, 'Domain is required'),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  organizationalUnit: z.string().optional(),
  computerName: z.string().optional(),
});

type DomainJoinFormData = z.infer<typeof domainJoinSchema>;

interface DomainJoinDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinCompleted: () => void;
}

export function DomainJoinDialog({
  isOpen,
  onClose,
  onJoinCompleted,
}: DomainJoinDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DomainJoinFormData>({
    resolver: zodResolver(domainJoinSchema),
  });

  const { joinDomain } = useDomainMutations(
    () => {
      toast.success('Successfully joined domain');
      onJoinCompleted();
    },
    (error) => {
      toast.error(`Failed to join domain: ${error}`);
    }
  );

  const onSubmit = async (data: DomainJoinFormData) => {
    setIsSubmitting(true);
    try {
      const input: DomainJoinInput = {
        domain: data.domain,
        username: data.username,
        password: data.password,
        organizationalUnit: data.organizationalUnit,
        computerName: data.computerName,
      };
      await joinDomain(input);
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Join Domain</DialogTitle>
          <DialogDescription>
            Join this server to an existing Active Directory domain.
          </DialogDescription>
        </DialogHeader>

        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Important:</strong> This operation will join the server to the domain 
            as a domain controller. Ensure you have proper credentials and network connectivity.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="domain">Domain *</Label>
            <Input
              id="domain"
              {...register('domain')}
              placeholder="example.com"
              className={errors.domain ? 'border-red-500' : ''}
            />
            {errors.domain && (
              <p className="text-sm text-red-500">{errors.domain.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              The fully qualified domain name to join
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              {...register('username')}
              placeholder="Administrator"
              className={errors.username ? 'border-red-500' : ''}
            />
            {errors.username && (
              <p className="text-sm text-red-500">{errors.username.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Domain administrator username
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              {...register('password')}
              placeholder="Enter password"
              className={errors.password ? 'border-red-500' : ''}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Password for the domain administrator
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="organizationalUnit">Organizational Unit</Label>
            <Input
              id="organizationalUnit"
              {...register('organizationalUnit')}
              placeholder="OU=Domain Controllers,DC=example,DC=com"
            />
            <p className="text-xs text-muted-foreground">
              Optional OU where the computer account will be created
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="computerName">Computer Name</Label>
            <Input
              id="computerName"
              {...register('computerName')}
              placeholder="DC01"
            />
            <p className="text-xs text-muted-foreground">
              Optional computer name for this domain controller
            </p>
          </div>

          <div className="bg-muted/50 p-3 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Join Process:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Server will be promoted to domain controller</li>
              <li>• DNS settings will be configured automatically</li>
              <li>• Computer account will be created in AD</li>
              <li>• Replication will be established with existing DCs</li>
              <li>• Server may require a restart after completion</li>
            </ul>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Joining Domain...' : 'Join Domain'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default DomainJoinDialog;