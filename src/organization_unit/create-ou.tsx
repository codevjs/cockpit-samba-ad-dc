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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useOUMutations } from './hooks/useOU';
import { toast } from 'sonner';
import type { CreateOUInput, SambaOU } from '@/types/samba';

const createOUSchema = z.object({
  name: z.string().min(1, 'Organization Unit name is required').regex(
    /^OU=.+/,
    'OU name must start with "OU=" (e.g., OU=Marketing)'
  ),
  description: z.string().optional(),
  parentOU: z.string().optional(),
});

type CreateOUFormData = z.infer<typeof createOUSchema>;

interface CreateOUDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onOUCreated: () => void;
  parentOUs: SambaOU[];
}

export function CreateOUDialog({ isOpen, onClose, onOUCreated, parentOUs }: CreateOUDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<CreateOUFormData>({
    resolver: zodResolver(createOUSchema),
    defaultValues: {
      name: '',
      description: '',
      parentOU: '',
    },
  });

  const { createOU } = useOUMutations(
    () => {
      onOUCreated();
      handleClose();
    },
    (error) => toast.error(error)
  );

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = async (data: CreateOUFormData) => {
    setIsSubmitting(true);
    try {
      const ouData: CreateOUInput = {
        name: data.name,
        description: data.description || undefined,
        parentOU: data.parentOU || undefined,
      };
      
      await createOU(ouData);
      toast.success(`Organization Unit "${data.name}" created successfully`);
    } catch (error) {
      // Error already handled by mutation hook
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Organization Unit</DialogTitle>
          <DialogDescription>
            Create a new organizational unit to organize your Active Directory objects.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Unit Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="OU=Marketing"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    The distinguished name of the OU (must start with "OU=")
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter OU description (optional)"
                      className="resize-none"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional description for the organizational unit
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="parentOU"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent OU (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select parent OU (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">No parent (root level)</SelectItem>
                      {parentOUs.map((ou) => (
                        <SelectItem key={ou.distinguishedName} value={ou.distinguishedName}>
                          {ou.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose a parent OU to create this as a nested unit
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="text-sm font-medium mb-2">Examples:</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div><code>OU=Marketing</code> - Marketing department</div>
                <div><code>OU=Sales</code> - Sales department</div>
                <div><code>OU=IT</code> - IT department</div>
                <div><code>OU=Servers</code> - Server computers</div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create OU'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}