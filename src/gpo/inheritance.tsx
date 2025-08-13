import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useGPOMutations } from './hooks/useGPO';
import { toast } from 'sonner';
import type { SetGPOInheritanceInput } from '@/types/samba';

const inheritanceSchema = z.object({
  containerDN: z.string().min(1, 'Container DN is required'),
  inheritance: z.enum(['Enabled', 'Disabled'], {
    required_error: 'Inheritance setting is required',
  }),
});

type InheritanceFormData = z.infer<typeof inheritanceSchema>;

interface InheritanceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInheritanceSet: () => void;
}

export function InheritanceDialog({
  isOpen,
  onClose,
  onInheritanceSet,
}: InheritanceDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<InheritanceFormData>({
    resolver: zodResolver(inheritanceSchema),
  });

  const { setGPOInheritance } = useGPOMutations(
    () => {
      toast.success('GPO inheritance set successfully');
      onInheritanceSet();
    },
    (error) => {
      toast.error(`Failed to set GPO inheritance: ${error}`);
    }
  );

  const onSubmit = async (data: InheritanceFormData) => {
    setIsSubmitting(true);
    try {
      const input: SetGPOInheritanceInput = {
        containerDN: data.containerDN,
        inheritance: data.inheritance,
      };
      await setGPOInheritance(input);
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
          <DialogTitle>Set GPO Inheritance</DialogTitle>
          <DialogDescription>
            Configure Group Policy inheritance for a container.
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
            <Label htmlFor="inheritance">Inheritance *</Label>
            <Select
              value={watch('inheritance') || ''}
              onValueChange={(value) => setValue('inheritance', value as InheritanceFormData['inheritance'])}
            >
              <SelectTrigger className={errors.inheritance ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select inheritance setting" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Enabled">Enabled</SelectItem>
                <SelectItem value="Disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
            {errors.inheritance && (
              <p className="text-sm text-red-500">{errors.inheritance.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Setting Inheritance...' : 'Set Inheritance'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}