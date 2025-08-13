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
import { Info, AlertTriangle } from 'lucide-react';
import { useOUMutations } from './hooks/useOU';
import { toast } from 'sonner';
import type { RenameOUInput } from '@/types/samba';

const renameOUSchema = z.object({
  newName: z.string().min(1, 'New name is required').regex(
    /^OU=.+/,
    'OU name must start with "OU=" (e.g., OU=NewName)'
  ),
});

type RenameOUFormData = z.infer<typeof renameOUSchema>;

interface RenameOUDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onOURenamed: () => void;
  ouDN: string | null;
}

export function RenameOUDialog({ isOpen, onClose, onOURenamed, ouDN }: RenameOUDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<RenameOUFormData>({
    resolver: zodResolver(renameOUSchema),
    defaultValues: {
      newName: '',
    },
  });

  const { renameOU } = useOUMutations(
    () => {
      onOURenamed();
      handleClose();
    },
    (error) => toast.error(error)
  );

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = async (data: RenameOUFormData) => {
    if (!ouDN) return;
    
    setIsSubmitting(true);
    try {
      const renameData: RenameOUInput = {
        ouDN,
        newName: data.newName,
      };
      
      await renameOU(renameData);
      toast.success('Organization Unit renamed successfully');
    } catch (error) {
      // Error already handled by mutation hook
    } finally {
      setIsSubmitting(false);
    }
  };

  // Extract current OU name from DN
  const currentOUName = ouDN ? ouDN.match(/^OU=([^,]+)/)?.[1] || '' : '';

  if (!ouDN) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Rename Organization Unit</DialogTitle>
          <DialogDescription>
            Change the name of this organizational unit.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Current OU:</p>
                  <code className="block text-sm bg-muted p-2 rounded">
                    {ouDN}
                  </code>
                  <p className="text-sm">
                    Current name: <strong>OU={currentOUName}</strong>
                  </p>
                </div>
              </AlertDescription>
            </Alert>

            <FormField
              control={form.control}
              name="newName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={`OU=${currentOUName}_New`}
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the new name for the OU (must start with "OU=")
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Important Considerations:</p>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    <li>Renaming will change the distinguished name of this OU</li>
                    <li>All child objects will have updated distinguished names</li>
                    <li>Group Policy links may need to be updated</li>
                    <li>Applications referencing the old name will need updates</li>
                    <li>Active Directory replication will propagate this change</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>

            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="text-sm font-medium mb-2">Example Names:</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div><code>OU=Marketing_Department</code></div>
                <div><code>OU=Sales_Team</code></div>
                <div><code>OU=IT_Support</code></div>
                <div><code>OU=Regional_Offices</code></div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Renaming...' : 'Rename OU'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}