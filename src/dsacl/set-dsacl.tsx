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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExternalLink, AlertTriangle } from 'lucide-react';
import { useDSACLMutations } from './hooks/useDSACL';
import { toast } from 'sonner';
import type { SetDSACLInput } from '@/types/samba';

const setDSACLSchema = z.object({
  url: z.string().optional(),
  car: z.string().optional(),
  action: z.string().optional(),
  objectDN: z.string().optional(),
  trusteeDN: z.string().optional(),
  sddl: z.string().optional(),
}).refine(
  (data) => Object.values(data).some(value => value && value.length > 0),
  {
    message: "At least one field must be provided",
  }
);

type SetDSACLFormData = z.infer<typeof setDSACLSchema>;

interface SetDSACLDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDSACLSet: () => void;
}

export function SetDSACLDialog({ isOpen, onClose, onDSACLSet }: SetDSACLDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<SetDSACLFormData>({
    resolver: zodResolver(setDSACLSchema),
    defaultValues: {
      url: '',
      car: '',
      action: '',
      objectDN: '',
      trusteeDN: '',
      sddl: '',
    },
  });

  const { setDSACL } = useDSACLMutations(
    () => {
      onDSACLSet();
      handleClose();
    },
    (error) => toast.error(error)
  );

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = async (data: SetDSACLFormData) => {
    setIsSubmitting(true);
    try {
      const dsaclData: SetDSACLInput = {
        url: data.url || undefined,
        car: data.car || undefined,
        action: data.action || undefined,
        objectDN: data.objectDN || undefined,
        trusteeDN: data.trusteeDN || undefined,
        sddl: data.sddl || undefined,
      };
      
      await setDSACL(dsaclData);
      toast.success('DSACL modified successfully');
    } catch (error) {
      // Error already handled by mutation hook
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modify Access List</DialogTitle>
          <DialogDescription>
            Modify Directory Service Access Control List entries using samba-tool dsacl set.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Advanced Feature</p>
                  <p className="text-sm">
                    Modifying ACLs requires careful consideration and understanding of 
                    Active Directory security. Incorrect modifications can impact system security.
                  </p>
                </div>
              </AlertDescription>
            </Alert>

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="LDAP URL (optional)"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    LDAP URL for the directory service connection
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="car"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CAR</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Control Access Right (optional)"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Control Access Right identifier
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
                  <FormControl>
                    <Input
                      placeholder="Action to perform (optional)"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Action to perform on the ACL (e.g., grant, revoke)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="objectDN"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Object DN</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="CN=Object,DC=domain,DC=com (optional)"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Distinguished name of the object to modify
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="trusteeDN"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trustee DN</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="CN=User,CN=Users,DC=domain,DC=com (optional)"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Distinguished name of the trustee (user/group)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sddl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SDDL</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Security Descriptor Definition Language (optional)"
                      className="resize-none min-h-[100px]"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    SDDL format security descriptor
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="text-sm font-medium mb-2">Common Examples:</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>
                  <strong>Grant full control:</strong><br />
                  <code className="text-xs">--action=grant --trusteeDN="CN=User,CN=Users,DC=domain,DC=com" --sddl="(A;;GA;;;SID)"</code>
                </div>
                <div>
                  <strong>Revoke access:</strong><br />
                  <code className="text-xs">--action=revoke --trusteeDN="CN=User,CN=Users,DC=domain,DC=com"</code>
                </div>
              </div>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Documentation</p>
                  <p className="text-sm">
                    For detailed information about SDDL format and ACL management, refer to:
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <a 
                      href="https://docs.microsoft.com/en-us/windows/win32/secauthz/security-descriptor-definition-language" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                    >
                      Microsoft SDDL Documentation
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Modifying...' : 'Modify ACL'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}