import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle } from 'lucide-react';
import { useGroupMutations } from './hooks/useGroupMutations';
// import { SuccessToast } from '../common';

interface DeleteGroupDialogProps {
  isOpen?: boolean;
  onClose?: () => void;
  onGroupDeleted?: () => void;
  groupName?: string;
}

export const DeleteGroupDialog: React.FC<DeleteGroupDialogProps> = ({
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  onGroupDeleted,
  groupName: externalGroupName
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [internalGroupName, setInternalGroupName] = useState('');
  const [confirmationText, setConfirmationText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Use external state if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const onClose = externalOnClose || (() => setInternalIsOpen(false));
  const groupName = externalGroupName || internalGroupName;

  const { deleteGroup } = useGroupMutations(
    () => {
      // Success callback
      setSuccessMessage(`Group "${groupName}" deleted successfully`);
      setConfirmationText('');
      setError(null);
      onGroupDeleted?.();
      onClose();
    },
    (errorMessage: string) => {
      // Error callback
      setError(errorMessage);
    }
  );

  const handleSubmit = async () => {
    if (!groupName) {
      setError('Group name is required');
      return;
    }

    if (confirmationText !== groupName) {
      setError('Confirmation text must match the group name exactly');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await deleteGroup(groupName);
    } catch (err) {
      // Error is already handled by the mutation hook
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmationChange = (value: string) => {
    setConfirmationText(value);
    if (error) {
      setError(null);
    }
  };

  const handleGroupNameChange = (value: string) => {
    setInternalGroupName(value);
    if (error) {
      setError(null);
    }
  };

  const resetForm = () => {
    setConfirmationText('');
    setInternalGroupName('');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const isConfirmationValid = confirmationText === groupName && groupName.length > 0;

  return (
    <>
      {successMessage && (
        <SuccessToast 
          successMessage={successMessage} 
          closeModal={() => setSuccessMessage(null)} 
        />
      )}

      {/* Trigger button when using internal state */}
      {externalIsOpen === undefined && (
        <Button variant="danger" onClick={handleModalToggle}>
          Delete Group
        </Button>
      )}

      <Modal
        variant={ModalVariant.medium}
        title="Delete Group"
        isOpen={isOpen}
        onClose={handleClose}
        titleIconVariant={ExclamationTriangleIcon}
        actions={[
          <Button
            key="delete"
            variant="danger"
            onClick={handleSubmit}
            isDisabled={loading || !isConfirmationValid}
            isLoading={loading}
            spinner={<Spinner size="sm" />}
          >
            {loading ? 'Deleting...' : 'Delete Group'}
          </Button>,
          <Button key="cancel" variant="link" onClick={handleClose}>
            Cancel
          </Button>
        ]}
        appendTo={document.body}
      >
        {error && (
          <Alert variant="danger" title="Error" isInline style={{ marginBottom: '1rem' }}>
            {error}
          </Alert>
        )}

        <TextContent style={{ marginBottom: '1.5rem' }}>
          <Text component="p">
            <strong>Warning:</strong> This action cannot be undone. Deleting this group will:
          </Text>
          <Text component="ul" style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
            <Text component="li">Permanently remove the group from Active Directory</Text>
            <Text component="li">Remove all group memberships</Text>
            <Text component="li">Remove any permissions granted to this group</Text>
          </Text>
          <Text component="p" style={{ marginTop: '1rem' }}>
            This action is <strong>irreversible</strong>.
          </Text>
        </TextContent>

        <Form>
          {/* Show group name input only if not provided externally */}
          {!externalGroupName && (
            <FormGroup
              label="Group Name"
              isRequired
              fieldId="group-name-input"
              helperText="Enter the name of the group you want to delete"
            >
              <TextInput
                isRequired
                type="text"
                id="group-name-input"
                name="group-name-input"
                value={internalGroupName}
                onChange={(_event, value) => handleGroupNameChange(value)}
                placeholder="Enter group name"
              />
            </FormGroup>
          )}

          <FormGroup
            label={`Type "${groupName}" to confirm deletion`}
            isRequired
            fieldId="confirmation-text"
            helperText="This confirmation helps prevent accidental deletions"
            validated={confirmationText && !isConfirmationValid ? 'error' : 'default'}
          >
            <TextInput
              isRequired
              type="text"
              id="confirmation-text"
              name="confirmation-text"
              value={confirmationText}
              onChange={(_event, value) => handleConfirmationChange(value)}
              placeholder={groupName || 'Enter group name above first'}
              validated={confirmationText && !isConfirmationValid ? 'error' : 'default'}
            />
          </FormGroup>
        </Form>
      </Modal>
    </>
  );
};

export default DeleteGroupDialog;