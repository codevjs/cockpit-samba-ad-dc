import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useGPOMutations } from './hooks/useGPO';
import { toast } from 'sonner';
import type { DeleteGPOLinkInput } from '@/types/samba';

const deleteLinkSchema = z.object({
  containerDN: z.string().min(1, 'Container DN is required'),
  gpoName: z.string().min(1, 'GPO name is required'),
});

type DeleteLinkFormData = z.infer<typeof deleteLinkSchema>;

interface DeleteLinkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLinkDeleted: () => void;
}

export function DeleteLinkDialog({
  isOpen,
  onClose,
  onLinkDeleted,
}: DeleteLinkDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DeleteLinkFormData>({
    resolver: zodResolver(deleteLinkSchema),
  });

  const { deleteGPOLink } = useGPOMutations(
    () => {
      toast.success('GPO link deleted successfully');
      onLinkDeleted();
    },
    (error) => {
      toast.error(`Failed to delete GPO link: ${error}`);
    }
  );

  const onSubmit = async (data: DeleteLinkFormData) => {
    setIsSubmitting(true);
    try {
      const input: DeleteGPOLinkInput = {
        containerDN: data.containerDN,
        gpoName: data.gpoName,
      };
      await deleteGPOLink(input);
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
          <DialogTitle>Delete GPO Link</DialogTitle>
          <DialogDescription>
            Remove a Group Policy Object link from a container.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="containerDN">Container DN *</Label>
            <Input
              id="containerDN"
              {...register('containerDN')}
              placeholder="OU=Users,DC=domain,DC=com"
              className={errors.containerDN ? 'border-red-500' : ''}
            />
            {errors.containerDN && (
              <p className="text-sm text-red-500">{errors.containerDN.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gpoName">GPO Name *</Label>
            <Input
              id="gpoName"
              {...register('gpoName')}
              placeholder="GPO-Name"
              className={errors.gpoName ? 'border-red-500' : ''}
            />
            {errors.gpoName && (
              <p className="text-sm text-red-500">{errors.gpoName.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={isSubmitting}>
              {isSubmitting ? 'Deleting Link...' : 'Delete Link'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}