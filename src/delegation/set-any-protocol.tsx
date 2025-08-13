import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { useDelegationMutations } from './hooks/useDelegation';
import { toast } from 'sonner';
import type { SetAnyProtocolInput } from '@/types/samba';

const setAnyProtocolSchema = z.object({
  accountName: z.string().min(1, 'Account name is required'),
  action: z.enum(['enable', 'disable']),
});

type SetAnyProtocolFormData = z.infer<typeof setAnyProtocolSchema>;

interface SetAnyProtocolDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAnyProtocolSet: () => void;
}

export function SetAnyProtocolDialog({ isOpen, onClose, onAnyProtocolSet }: SetAnyProtocolDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<SetAnyProtocolFormData>({
    resolver: zodResolver(setAnyProtocolSchema),
    defaultValues: {
      accountName: '',
      action: 'disable',
    },
  });

  const { setAnyProtocol } = useDelegationMutations(
    () => {
      onAnyProtocolSet();
      handleClose();
    },
    (error) => toast.error(error)
  );

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = async (data: SetAnyProtocolFormData) => {
    setIsSubmitting(true);
    try {
      const input: SetAnyProtocolInput = {
        accountName: data.accountName,
        enable: data.action === 'enable',
      };
      
      await setAnyProtocol(input);
      toast.success(`Any protocol delegation ${data.action}d for "${data.accountName}"`);
    } catch (error) {
      // Error already handled by mutation hook
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Set Any Protocol Delegation</DialogTitle>
          <DialogDescription>
            Configure whether the account can use any authentication protocol for delegation.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Security Consideration</p>
                  <p className="text-sm">
                    Enabling "any protocol" delegation allows the account to use any 
                    authentication protocol (including less secure ones) for delegation. 
                    Consider the security implications before enabling this setting.
                  </p>
                </div>
              </AlertDescription>
            </Alert>

            <FormField
              control={form.control}
              name="accountName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="serviceaccount1"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Name of the service account
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="action"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Action</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select action" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="enable">Enable any protocol delegation</SelectItem>
                      <SelectItem value="disable">Disable any protocol delegation</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Whether to enable or disable delegation with any protocol
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="text-sm font-medium mb-2">Protocol Information:</h4>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div><strong>Kerberos Only:</strong> More secure, recommended for most scenarios</div>
                <div><strong>Any Protocol:</strong> Includes NTLM and other protocols, less secure</div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update Setting'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}