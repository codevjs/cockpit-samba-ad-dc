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
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { useNTACLMutations } from './hooks/useNTACL';
import { toast } from 'sonner';
import type { SysvolOperationInput } from '@/types/samba';

const sysvolResetSchema = z.object({
  xattrBackend: z.string().optional(),
  eadbFile: z.string().optional(),
  useNtvfs: z.string().optional(),
  useS3fs: z.string().optional(),
  service: z.string().optional(),
});

type SysvolResetFormData = z.infer<typeof sysvolResetSchema>;

interface SysvolResetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSysvolReset: () => void;
}

export function SysvolResetDialog({ isOpen, onClose, onSysvolReset }: SysvolResetDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  
  const form = useForm<SysvolResetFormData>({
    resolver: zodResolver(sysvolResetSchema),
    defaultValues: {
      xattrBackend: '',
      eadbFile: '',
      useNtvfs: '',
      useS3fs: '',
      service: '',
    },
  });

  const { sysvolReset } = useNTACLMutations(
    () => {
      onSysvolReset();
      handleClose();
    },
    (error) => toast.error(error)
  );

  const handleClose = () => {
    form.reset();
    setConfirmed(false);
    onClose();
  };

  const onSubmit = async (data: SysvolResetFormData) => {
    if (!confirmed) {
      toast.error('Please confirm that you understand the risks');
      return;
    }

    setIsSubmitting(true);
    try {
      const input: SysvolOperationInput = {
        xattrBackend: data.xattrBackend || undefined,
        eadbFile: data.eadbFile || undefined,
        useNtvfs: data.useNtvfs || undefined,
        useS3fs: data.useS3fs || undefined,
        service: data.service || undefined,
      };
      
      await sysvolReset(input);
      toast.success('SYSVOL ACLs reset successfully');
    } catch (error) {
      // Error already handled by mutation hook
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Reset SYSVOL ACLs</DialogTitle>
          <DialogDescription>
            Reset SYSVOL ACLs to their default Windows-compatible settings.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium text-destructive">Destructive Operation</p>
                  <p className="text-sm">
                    This operation will reset all SYSVOL ACLs to their default settings. 
                    This will affect Group Policy access and may impact domain functionality. 
                    Only proceed if you are experiencing SYSVOL permission issues and 
                    understand the consequences.
                  </p>
                  <ul className="text-sm list-disc list-inside space-y-1">
                    <li>All custom SYSVOL ACLs will be lost</li>
                    <li>Group Policy access may be temporarily affected</li>
                    <li>Domain controllers may need to replicate changes</li>
                    <li>Clients may experience temporary access issues</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="xattrBackend"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Xattr Backend</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Optional"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      Extended attribute backend type
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="service"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Optional service name"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      Samba service name
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="text-sm font-medium mb-2">When to use SYSVOL reset:</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div>• Group Policy deployment is failing</div>
                <div>• SYSVOL access errors in event logs</div>
                <div>• After domain migration or restoration</div>
                <div>• When sysvolcheck reports ACL inconsistencies</div>
                <div>• Permission denied errors accessing SYSVOL</div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="confirm-reset"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="confirm-reset" className="text-sm">
                I understand this will reset all SYSVOL ACLs and may impact domain functionality
              </label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !confirmed} 
                variant="destructive"
              >
                {isSubmitting ? 'Resetting SYSVOL...' : 'Reset SYSVOL ACLs'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}