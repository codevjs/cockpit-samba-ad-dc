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
import type { FetchGPOInput } from '@/types/samba';

const fetchGPOSchema = z.object({
  name: z.string().min(1, 'GPO name is required'),
  targetPath: z.string().min(1, 'Target path is required'),
});

type FetchGPOFormData = z.infer<typeof fetchGPOSchema>;

interface FetchGPODialogProps {
  isOpen: boolean;
  onClose: () => void;
  onFetchCompleted: () => void;
}

export function FetchGPODialog({
  isOpen,
  onClose,
  onFetchCompleted,
}: FetchGPODialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FetchGPOFormData>({
    resolver: zodResolver(fetchGPOSchema),
  });

  const { fetchGPO } = useGPOMutations(
    () => {
      toast.success('GPO fetch completed successfully');
      onFetchCompleted();
    },
    (error) => {
      toast.error(`Failed to fetch GPO: ${error}`);
    }
  );

  const onSubmit = async (data: FetchGPOFormData) => {
    setIsSubmitting(true);
    try {
      const input: FetchGPOInput = {
        name: data.name,
        targetPath: data.targetPath,
      };
      await fetchGPO(input);
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
          <DialogTitle>Fetch GPO</DialogTitle>
          <DialogDescription>
            Download a Group Policy Object to a local directory.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">GPO Name *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="GPO-Name"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetPath">Target Directory *</Label>
            <Input
              id="targetPath"
              {...register('targetPath')}
              placeholder="/local/gpo/directory/"
              className={errors.targetPath ? 'border-red-500' : ''}
            />
            {errors.targetPath && (
              <p className="text-sm text-red-500">{errors.targetPath.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Fetching...' : 'Fetch GPO'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}