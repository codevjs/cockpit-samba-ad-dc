import React, { useState } from 'react';
import {
  Modal,
  ModalVariant,
  Button,
  Form,
  FormGroup,
  TextInput,
  TextArea,
  FormSelect,
  FormSelectOption,
  Alert,
  Spinner
} from '@patternfly/react-core';
import { useGroupMutations } from './hooks/useGroupMutations';
import { CreateGroupInput } from '../types/samba';
import { SuccessToast, ErrorToast } from '../common';

interface CreateGroupDialogProps {
  isOpen?: boolean;
  onClose?: () => void;
  onGroupCreated?: () => void;
}

export const CreateGroupDialog: React.FC<CreateGroupDialogProps> = ({
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  onGroupCreated
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [formData, setFormData] = useState<CreateGroupInput>({
    name: '',
    description: '',
    groupType: 'Security'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Use external state if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const onClose = externalOnClose || (() => setInternalIsOpen(false));

  const { createGroup } = useGroupMutations(
    () => {
      // Success callback
      setSuccessMessage(`Group "${formData.name}" created successfully`);
      setFormData({ name: '', description: '', groupType: 'Security' });
      setError(null);
      onGroupCreated?.();
      onClose();
    },
    (errorMessage: string) => {
      // Error callback
      setError(errorMessage);
    }
  );

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError('Group name is required');
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(formData.name)) {
      setError('Group name can only contain letters, numbers, underscores, and hyphens');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await createGroup(formData);
    } catch (err) {
      // Error is already handled by the mutation hook
    } finally {
      setLoading(false);
    }
  };

  const handleModalToggle = () => {
    if (externalIsOpen === undefined) {
      setInternalIsOpen(!internalIsOpen);
    } else {
      onClose();
    }
  };

  const handleInputChange = (field: keyof CreateGroupInput) => (
    value: string,
    event?: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', groupType: 'Security' });
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const groupTypeOptions = [
    { value: 'Security', label: 'Security Group', disabled: false },
    { value: 'Distribution', label: 'Distribution Group', disabled: false }
  ];

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
        <Button variant="primary" onClick={handleModalToggle}>
          Create Group
        </Button>
      )}

      <Modal
        variant={ModalVariant.medium}
        title="Create New Group"
        isOpen={isOpen}
        onClose={handleClose}
        actions={[
          <Button
            key="create"
            variant="primary"
            onClick={handleSubmit}
            isDisabled={loading || !formData.name.trim()}
            isLoading={loading}
            spinner={<Spinner size="sm" />}
          >
            {loading ? 'Creating...' : 'Create Group'}
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

        <Form>
          <FormGroup
            label="Group Name"
            isRequired
            fieldId="group-name"
            helperText="Group name can only contain letters, numbers, underscores, and hyphens"
          >
            <TextInput
              isRequired
              type="text"
              id="group-name"
              name="group-name"
              value={formData.name}
              onChange={handleInputChange('name')}
              placeholder="e.g., developers, administrators"
              validated={error && !formData.name.trim() ? 'error' : 'default'}
            />
          </FormGroup>

          <FormGroup
            label="Description"
            fieldId="group-description"
            helperText="Optional description for the group"
          >
            <TextArea
              type="text"
              id="group-description"
              name="group-description"
              value={formData.description}
              onChange={handleInputChange('description')}
              placeholder="Describe the purpose of this group"
              rows={3}
            />
          </FormGroup>

          <FormGroup
            label="Group Type"
            fieldId="group-type"
            helperText="Security groups can be used for permissions, distribution groups for email"
          >
            <FormSelect
              value={formData.groupType}
              onChange={handleInputChange('groupType')}
              id="group-type"
              name="group-type"
            >
              {groupTypeOptions.map((option, index) => (
                <FormSelectOption
                  key={index}
                  value={option.value}
                  label={option.label}
                  isDisabled={option.disabled}
                />
              ))}
            </FormSelect>
          </FormGroup>
        </Form>
      </Modal>
    </>
  );
};

export default CreateGroupDialog;