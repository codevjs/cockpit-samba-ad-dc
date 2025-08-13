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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { useOUMutations } from './hooks/useOU';
import { toast } from 'sonner';
import type { MoveOUInput, SambaOU } from '@/types/samba';

const moveOUSchema = z.object({
  targetParentDN: z.string().min(1, 'Target parent is required'),
});

type MoveOUFormData = z.infer<typeof moveOUSchema>;

interface MoveOUDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onOUMoved: () => void;
  ouDN: string | null;
  parentOUs: SambaOU[];
}

export function MoveOUDialog({ isOpen, onClose, onOUMoved, ouDN, parentOUs }: MoveOUDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<MoveOUFormData>({
    resolver: zodResolver(moveOUSchema),
    defaultValues: {
      targetParentDN: '',
    },
  });

  const { moveOU } = useOUMutations(
    () => {
      onOUMoved();
      handleClose();
    },
    (error) => toast.error(error)
  );

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = async (data: MoveOUFormData) => {
    if (!ouDN) return;
    
    setIsSubmitting(true);
    try {
      const moveData: MoveOUInput = {
        ouDN,
        targetParentDN: data.targetParentDN,
      };
      
      await moveOU(moveData);
      toast.success('Organization Unit moved successfully');
    } catch (error) {
      // Error already handled by mutation hook
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter out the current OU and its children to prevent circular moves
  const availableParents = parentOUs.filter(ou => 
    ou.distinguishedName !== ouDN && 
    !ou.distinguishedName.includes(ouDN || '')
  );

  if (!ouDN) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Move Organization Unit</DialogTitle>
          <DialogDescription>
            Move this organizational unit to a different parent container.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Moving OU:</p>
                  <code className="block text-sm bg-muted p-2 rounded">
                    {ouDN}
                  </code>
                </div>
              </AlertDescription>
            </Alert>

            <FormField
              control={form.control}
              name="targetParentDN"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Parent</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select target parent OU" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="root">Domain Root</SelectItem>
                      {availableParents.map((ou) => (
                        <SelectItem key={ou.distinguishedName} value={ou.distinguishedName}>
                          {ou.name}
                          <span className="text-muted-foreground ml-2">
                            ({ou.distinguishedName})
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the new parent container for this OU
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Important Notes:</p>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    <li>Moving an OU will change its distinguished name</li>
                    <li>All child objects and OUs will move with this OU</li>
                    <li>Group Policy links and permissions may be affected</li>
                    <li>Applications referencing the old DN will need updates</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Moving...' : 'Move OU'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}