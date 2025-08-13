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
import type { SetAnyServiceInput } from '@/types/samba';

const setAnyServiceSchema = z.object({
  accountName: z.string().min(1, 'Account name is required'),
  action: z.enum(['enable', 'disable']),
});

type SetAnyServiceFormData = z.infer<typeof setAnyServiceSchema>;

interface SetAnyServiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAnyServiceSet: () => void;
}

export function SetAnyServiceDialog({ isOpen, onClose, onAnyServiceSet }: SetAnyServiceDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<SetAnyServiceFormData>({
    resolver: zodResolver(setAnyServiceSchema),
    defaultValues: {
      accountName: '',
      action: 'disable',
    },
  });

  const { setAnyService } = useDelegationMutations(
    () => {
      onAnyServiceSet();
      handleClose();
    },
    (error) => toast.error(error)
  );

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = async (data: SetAnyServiceFormData) => {
    setIsSubmitting(true);
    try {
      const input: SetAnyServiceInput = {
        accountName: data.accountName,
        enable: data.action === 'enable',
      };
      
      await setAnyService(input);
      toast.success(`Any service delegation ${data.action}d for "${data.accountName}"`);
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
          <DialogTitle>Set Any Service Delegation</DialogTitle>
          <DialogDescription>
            Configure whether the account can delegate to any service.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Security Warning</p>
                  <p className="text-sm">
                    Enabling "any service" delegation allows the account to delegate 
                    to any service in the domain. This poses significant security risks 
                    and should only be used when absolutely necessary.
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
                      <SelectItem value="enable">Enable any service delegation</SelectItem>
                      <SelectItem value="disable">Disable any service delegation</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Whether to enable or disable delegation to any service
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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