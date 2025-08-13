import React, { useState } from 'react';
import {
  Modal,
  ModalVariant,
  Button,
  Form,
  FormGroup,
  TextInput,
  FormSelect,
  FormSelectOption,
  Alert,
  Text,
  TextContent,
  Spinner
} from '@patternfly/react-core';
import { useGroupMutations } from './hooks/useGroupMutations';
import { SuccessToast } from '../common';

interface MoveGroupDialogProps {
  isOpen?: boolean;
  onClose?: () => void;
  onGroupMoved?: () => void;
  groupName?: string;
}

// Common organizational units in Active Directory
const COMMON_OUS = [
  { value: 'CN=Users,DC=domain,DC=local', label: 'Users (Default)' },
  { value: 'OU=Groups,DC=domain,DC=local', label: 'Groups' },
  { value: 'OU=Security Groups,DC=domain,DC=local', label: 'Security Groups' },
  { value: 'OU=Distribution Groups,DC=domain,DC=local', label: 'Distribution Groups' },
  { value: 'OU=IT,DC=domain,DC=local', label: 'IT Department' },
  { value: 'OU=HR,DC=domain,DC=local', label: 'HR Department' },
  { value: 'OU=Finance,DC=domain,DC=local', label: 'Finance Department' },
  { value: 'OU=Custom', label: 'Custom OU (specify below)' }
];

export const MoveGroupDialog: React.FC<MoveGroupDialogProps> = ({
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  onGroupMoved,
  groupName: externalGroupName
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [internalGroupName, setInternalGroupName] = useState('');
  const [selectedOU, setSelectedOU] = useState('CN=Users,DC=domain,DC=local');
  const [customOU, setCustomOU] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Use external state if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const onClose = externalOnClose || (() => setInternalIsOpen(false));
  const groupName = externalGroupName || internalGroupName;

  const { moveGroup } = useGroupMutations(
    () => {
      // Success callback
      const targetOU = selectedOU === 'OU=Custom' ? customOU : selectedOU;
      setSuccessMessage(`Group "${groupName}" moved to ${targetOU} successfully`);
      setSelectedOU('CN=Users,DC=domain,DC=local');
      setCustomOU('');
      setError(null);
      onGroupMoved?.();
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

    const targetOU = selectedOU === 'OU=Custom' ? customOU : selectedOU;

    if (!targetOU.trim()) {
      setError('Target Organizational Unit is required');
      return;
    }

    // Basic OU format validation
    if (!targetOU.includes('DC=') || (!targetOU.includes('OU=') && !targetOU.includes('CN='))) {
      setError('Invalid OU format. Expected format: OU=Name,DC=domain,DC=local or CN=Name,DC=domain,DC=local');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await moveGroup(groupName, targetOU);
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

  const handleOUChange = (value: string) => {
    setSelectedOU(value);
    if (error) {
      setError(null);
    }
  };

  const handleCustomOUChange = (value: string) => {
    setCustomOU(value);
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
    setInternalGroupName('');
    setSelectedOU('CN=Users,DC=domain,DC=local');
    setCustomOU('');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const getTargetOU = () => {
    return selectedOU === 'OU=Custom' ? customOU : selectedOU;
  };

  const isFormValid = () => {
    const targetOU = getTargetOU();
    return groupName.trim() && targetOU.trim();
  };

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
        <Button variant="secondary" onClick={handleModalToggle}>
          Move Group
        </Button>
      )}

      <Modal
        variant={ModalVariant.medium}
        title="Move Group to Different OU"
        isOpen={isOpen}
        onClose={handleClose}
        actions={[
          <Button
            key="move"
            variant="primary"
            onClick={handleSubmit}
            isDisabled={loading || !isFormValid()}
            isLoading={loading}
            spinner={<Spinner size="sm" />}
          >
            {loading ? 'Moving...' : 'Move Group'}
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
            Move this group to a different Organizational Unit (OU). This will change the group's 
            location in the Active Directory hierarchy.
          </Text>
        </TextContent>

        <Form>
          {/* Show group name input only if not provided externally */}
          {!externalGroupName && (
            <FormGroup
              label="Group Name"
              isRequired
              fieldId="group-name-input"
              helperText="Enter the name of the group you want to move"
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
            label="Target Organizational Unit"
            isRequired
            fieldId="target-ou"
            helperText="Select the OU where you want to move this group"
          >
            <FormSelect
              value={selectedOU}
              onChange={(_event, value) => handleOUChange(value)}
              id="target-ou"
              name="target-ou"
            >
              {COMMON_OUS.map((option, index) => (
                <FormSelectOption
                  key={index}
                  value={option.value}
                  label={option.label}
                />
              ))}
            </FormSelect>
          </FormGroup>

          {selectedOU === 'OU=Custom' && (
            <FormGroup
              label="Custom OU Path"
              isRequired
              fieldId="custom-ou"
              helperText="Enter the full Distinguished Name (DN) of the target OU"
            >
              <TextInput
                isRequired
                type="text"
                id="custom-ou"
                name="custom-ou"
                value={customOU}
                onChange={(_event, value) => handleCustomOUChange(value)}
                placeholder="OU=YourOU,DC=domain,DC=local"
              />
            </FormGroup>
          )}

          {groupName && (
            <Alert variant="info" title="Current Operation" isInline style={{ marginTop: '1rem' }}>
              Moving group <strong>{groupName}</strong> to: <br />
              <code>{getTargetOU()}</code>
            </Alert>
          )}
        </Form>
      </Modal>
    </>
  );
};

export default MoveGroupDialog;