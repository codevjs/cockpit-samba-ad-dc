import React, { useState } from 'react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useContactMutations } from './hooks/useContactMutations';
import { toast } from 'sonner';

interface DeleteContactDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onContactDeleted?: () => void;
  contactName?: string;
}

export function DeleteContactDialog({
  isOpen,
  onClose,
  onContactDeleted,
  contactName: externalContactName
}: DeleteContactDialogProps) {
  const [internalContactName, setInternalContactName] = useState('');
  const [confirmationText, setConfirmationText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contactName = externalContactName || internalContactName;

  const { deleteContact } = useContactMutations(
    () => {
      // Success callback
      toast.success(`Contact "${contactName}" deleted successfully`);
      resetForm();
      onContactDeleted?.();
      onClose();
    },
    (errorMessage: string) => {
      // Error callback
      setError(errorMessage);
    }
  );

  const resetForm = () => {
    setConfirmationText('');
    setInternalContactName('');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleConfirmationChange = (value: string) => {
    setConfirmationText(value);
    if (error) {
      setError(null);
    }
  };

  const handleContactNameChange = (value: string) => {
    setInternalContactName(value);
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!contactName) {
      setError('Contact name is required');
      return;
    }

    if (confirmationText !== contactName) {
      setError('Confirmation text must match the contact name exactly');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await deleteContact(contactName);
    } catch (err) {
      // Error is already handled by the mutation hook
    } finally {
      setLoading(false);
    }
  };

  const isConfirmationValid = confirmationText === contactName && contactName.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            Delete Contact
          </DialogTitle>
          <DialogDescription>
            <strong>Warning:</strong> This action cannot be undone. Deleting this contact will:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="text-sm text-muted-foreground space-y-2">
            <ul className="list-disc ml-4 space-y-1">
              <li>Permanently remove the contact from Active Directory</li>
              <li>Remove all contact information and attributes</li>
              <li>Remove the contact from any distribution lists</li>
            </ul>
            <p className="font-medium text-destructive mt-3">
              This action is <strong>irreversible</strong>.
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Show contact name input only if not provided externally */}
          {!externalContactName && (
            <div className="space-y-2">
              <Label htmlFor="contact-name">Contact Name *</Label>
              <Input
                id="contact-name"
                value={internalContactName}
                onChange={(e) => handleContactNameChange(e.target.value)}
                placeholder="Enter contact name"
              />
              <p className="text-sm text-muted-foreground">
                Enter the name of the contact you want to delete
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="confirmation">Type "{contactName}" to confirm deletion *</Label>
            <Input
              id="confirmation"
              value={confirmationText}
              onChange={(e) => handleConfirmationChange(e.target.value)}
              placeholder={contactName || 'Enter contact name above first'}
              className={confirmationText && !isConfirmationValid ? 'border-destructive' : ''}
            />
            <p className="text-sm text-muted-foreground">
              This confirmation helps prevent accidental deletions
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={loading || !isConfirmationValid}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Deleting...' : 'Delete Contact'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}