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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, UserPlus } from 'lucide-react';
import { useContactMutations } from './hooks/useContactMutations';
import { toast } from 'sonner';
import type { CreateContactInput } from '@/types/samba';

interface CreateContactDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onContactCreated?: () => void;
}

const createContactSchema = z.object({
  givenName: z.string()
    .min(1, 'Given name is required')
    .max(50, 'Given name must be less than 50 characters'),
  initials: z.string()
    .max(10, 'Initials must be less than 10 characters')
    .optional(),
  surname: z.string()
    .min(1, 'Surname is required')
    .max(50, 'Surname must be less than 50 characters'),
  displayName: z.string()
    .max(100, 'Display name must be less than 100 characters')
    .optional(),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  mail: z.string()
    .email('Invalid email address')
    .optional()
    .or(z.literal('')),
  telephoneNumber: z.string()
    .max(50, 'Phone number must be less than 50 characters')
    .optional(),
  organizationalUnit: z.string()
    .max(200, 'Organizational Unit must be less than 200 characters')
    .optional(),
});

type CreateContactFormData = z.infer<typeof createContactSchema>;

export function CreateContactDialog({
  isOpen,
  onClose,
  onContactCreated,
}: CreateContactDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<CreateContactFormData>({
    resolver: zodResolver(createContactSchema),
    defaultValues: {
      givenName: '',
      initials: '',
      surname: '',
      displayName: '',
      description: '',
      mail: '',
      telephoneNumber: '',
      organizationalUnit: '',
    },
  });

  const { createContact } = useContactMutations(
    () => {
      // Success callback
      toast.success('Contact created successfully');
      resetForm();
      onContactCreated?.();
      onClose();
    },
    (errorMessage: string) => {
      // Error callback
      setError(errorMessage);
    }
  );

  const resetForm = () => {
    reset();
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const onSubmit = async (data: CreateContactFormData) => {
    try {
      setLoading(true);
      setError(null);

      // Generate display name if not provided
      const contactData: CreateContactInput = {
        ...data,
        displayName: data.displayName || `${data.givenName} ${data.surname}`.trim(),
        // Convert empty strings to undefined
        mail: data.mail === '' ? undefined : data.mail,
        telephoneNumber: data.telephoneNumber === '' ? undefined : data.telephoneNumber,
        description: data.description === '' ? undefined : data.description,
        organizationalUnit: data.organizationalUnit === '' ? undefined : data.organizationalUnit,
        initials: data.initials === '' ? undefined : data.initials,
      };

      await createContact(contactData);
    } catch (err) {
      // Error is already handled by the mutation hook
    } finally {
      setLoading(false);
    }
  };

  // Watch given name and surname to auto-generate display name
  const givenName = watch('givenName');
  const surname = watch('surname');
  const displayName = watch('displayName');

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Create New Contact
          </DialogTitle>
          <DialogDescription>
            Create a new contact object in Active Directory. This will add a new entry to your organization's address book.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="givenName">Given Name *</Label>
              <Input
                id="givenName"
                {...register('givenName')}
                placeholder="James"
                className={errors.givenName ? 'border-destructive' : ''}
              />
              {errors.givenName && (
                <p className="text-sm text-destructive">{errors.givenName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="surname">Surname *</Label>
              <Input
                id="surname"
                {...register('surname')}
                placeholder="Kirk"
                className={errors.surname ? 'border-destructive' : ''}
              />
              {errors.surname && (
                <p className="text-sm text-destructive">{errors.surname.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="initials">Initials</Label>
            <Input
              id="initials"
              {...register('initials')}
              placeholder="T"
              className={errors.initials ? 'border-destructive' : ''}
            />
            {errors.initials && (
              <p className="text-sm text-destructive">{errors.initials.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              {...register('displayName')}
              placeholder={givenName && surname ? `${givenName} ${surname}` : 'Full Name'}
              className={errors.displayName ? 'border-destructive' : ''}
            />
            {errors.displayName && (
              <p className="text-sm text-destructive">{errors.displayName.message}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Leave empty to auto-generate from given name and surname
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mail">Email Address</Label>
            <Input
              id="mail"
              type="email"
              {...register('mail')}
              placeholder="james.kirk@enterprise.com"
              className={errors.mail ? 'border-destructive' : ''}
            />
            {errors.mail && (
              <p className="text-sm text-destructive">{errors.mail.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="telephoneNumber">Phone Number</Label>
            <Input
              id="telephoneNumber"
              {...register('telephoneNumber')}
              placeholder="+1-555-123-4567"
              className={errors.telephoneNumber ? 'border-destructive' : ''}
            />
            {errors.telephoneNumber && (
              <p className="text-sm text-destructive">{errors.telephoneNumber.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="organizationalUnit">Organizational Unit</Label>
            <Input
              id="organizationalUnit"
              {...register('organizationalUnit')}
              placeholder="OU=Contacts,DC=domain,DC=local"
              className={errors.organizationalUnit ? 'border-destructive' : ''}
            />
            {errors.organizationalUnit && (
              <p className="text-sm text-destructive">{errors.organizationalUnit.message}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Leave empty to use the default container
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Additional information about this contact..."
              rows={3}
              className={errors.description ? 'border-destructive' : ''}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Creating...' : 'Create Contact'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}