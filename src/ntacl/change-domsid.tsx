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
import type { ChangeDomSIDInput } from '@/types/samba';

const changeDomSIDSchema = z.object({
  oldSid: z.string().min(1, 'Old SID is required').regex(
    /^S-\d+-\d+-\d+/,
    'SID must be in format S-1-5-21-...'
  ),
  newSid: z.string().min(1, 'New SID is required').regex(
    /^S-\d+-\d+-\d+/,
    'SID must be in format S-1-5-21-...'
  ),
  xattrBackend: z.string().optional(),
  eadbFile: z.string().optional(),
  useNtvfs: z.string().optional(),
  useS3fs: z.string().optional(),
  service: z.string().optional(),
});

type ChangeDomSIDFormData = z.infer<typeof changeDomSIDSchema>;

interface ChangeDomSIDDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDomSIDChanged: () => void;
}

export function ChangeDomSIDDialog({ isOpen, onClose, onDomSIDChanged }: ChangeDomSIDDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<ChangeDomSIDFormData>({
    resolver: zodResolver(changeDomSIDSchema),
    defaultValues: {
      oldSid: '',
      newSid: '',
      xattrBackend: '',
      eadbFile: '',
      useNtvfs: '',
      useS3fs: '',
      service: '',
    },
  });

  const { changeDomainSID } = useNTACLMutations(
    () => {
      onDomSIDChanged();
      handleClose();
    },
    (error) => toast.error(error)
  );

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = async (data: ChangeDomSIDFormData) => {
    setIsSubmitting(true);
    try {
      const input: ChangeDomSIDInput = {
        oldSid: data.oldSid,
        newSid: data.newSid,
        xattrBackend: data.xattrBackend || undefined,
        eadbFile: data.eadbFile || undefined,
        useNtvfs: data.useNtvfs || undefined,
        useS3fs: data.useS3fs || undefined,
        service: data.service || undefined,
      };
      
      await changeDomainSID(input);
      toast.success('Domain SID changed successfully in NT ACLs');
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
          <DialogTitle>Change Domain SID</DialogTitle>
          <DialogDescription>
            Update domain SID references in NT ACLs after domain migration or restoration.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Critical Operation</p>
                  <p className="text-sm">
                    This operation will change all references to the old domain SID 
                    with the new domain SID in NT ACLs. This is typically done after 
                    domain migration or backup restoration. Ensure you have the correct 
                    SIDs before proceeding.
                  </p>
                </div>
              </AlertDescription>
            </Alert>

            <FormField
              control={form.control}
              name="oldSid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Old Domain SID</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="S-1-5-21-1234567890-1234567890-1234567890"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    The old domain SID to be replaced
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newSid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Domain SID</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="S-1-5-21-0987654321-0987654321-0987654321"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    The new domain SID to replace with
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
              <h4 className="text-sm font-medium mb-2">How to find Domain SIDs:</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div><code>wbinfo --domain-info DOMAIN</code> - Get current domain SID</div>
                <div><code>net getdomainsid</code> - Get local domain SID</div>
                <div><code>ldbsearch -H sam.ldb objectClass=domain</code> - Query LDAP for domain info</div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} variant="destructive">
                {isSubmitting ? 'Changing SID...' : 'Change Domain SID'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}