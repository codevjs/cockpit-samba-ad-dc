import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useGPOMutations } from './hooks/useGPO';
import { toast } from 'sonner';
import type { CreateGPOInput } from '@/types/samba';

const createGPOSchema = z.object({
  name: z.string()
    .min(1, 'GPO name is required')
    .max(255, 'GPO name must be less than 255 characters')
    .regex(/^[a-zA-Z0-9\-_\s]+$/, 'GPO name can only contain alphanumeric characters, hyphens, underscores, and spaces'),
  displayName: z.string()
    .min(1, 'Display name is required')
    .max(255, 'Display name must be less than 255 characters'),
  description: z.string()
    .max(1024, 'Description must be less than 1024 characters')
    .optional(),
});

type CreateGPOFormData = z.infer<typeof createGPOSchema>;

interface CreateGPODialogProps {
  isOpen: boolean;
  onClose: () => void;
  onGPOCreated: () => void;
}

export function CreateGPODialog({
  isOpen,
  onClose,
  onGPOCreated,
}: CreateGPODialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateGPOFormData>({
    resolver: zodResolver(createGPOSchema),
  });

  const { createGPO } = useGPOMutations(
    () => {
      toast.success('GPO created successfully');
      onGPOCreated();
    },
    (error) => {
      toast.error(`Failed to create GPO: ${error}`);
    }
  );

  const onSubmit = async (data: CreateGPOFormData) => {
    setIsSubmitting(true);
    try {
      const input: CreateGPOInput = {
        name: data.name,
        displayName: data.displayName,
        description: data.description,
      };
      await createGPO(input);
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
          <DialogTitle>Create Group Policy Object</DialogTitle>
          <DialogDescription>
            Create a new GPO that can be used to manage user and computer settings.
          </DialogDescription>
        </DialogHeader>

        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Note:</strong> After creating the GPO, you'll need to link it to 
            organizational units or domains to apply its policies to users and computers.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">GPO Name *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="My-GPO-Policy"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Internal name for the GPO (used for commands and references)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name *</Label>
            <Input
              id="displayName"
              {...register('displayName')}
              placeholder="My Custom Policy"
              className={errors.displayName ? 'border-red-500' : ''}
            />
            {errors.displayName && (
              <p className="text-sm text-red-500">{errors.displayName.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Friendly name displayed in management tools
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Brief description of what this GPO does..."
              rows={3}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Optional description to help identify the purpose of this GPO
            </p>
          </div>

          <div className="bg-muted/50 p-3 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Next Steps:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• GPO will be created with default settings</li>
              <li>• Use Group Policy Management Console to configure policies</li>
              <li>• Link the GPO to OUs, domains, or sites to apply policies</li>
              <li>• Test policies in a non-production environment first</li>
            </ul>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create GPO'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}