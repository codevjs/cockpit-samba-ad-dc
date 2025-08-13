import React, { useState } from 'react';
import {
  Modal,
  ModalVariant,
  Button,
  Form,
  FormGroup,
  TextInput,
  TextArea,
  List,
  ListItem,
  Checkbox,
  EmptyState,
  EmptyStateIcon,
  EmptyStateBody,
  EmptyStateHeader,
  Alert,
  Spinner,
  Flex,
  FlexItem,
  Card,
  CardBody,
  Text,
  TextContent
} from '@patternfly/react-core';
import { UsersIcon, ExclamationTriangleIcon } from '@patternfly/react-icons';
import { useGroupMembers } from './hooks/useGroups';
import { useGroupMutations } from './hooks/useGroupMutations';
import { SuccessToast } from '../common';

interface RemoveMembersDialogProps {
  isOpen?: boolean;
  onClose?: () => void;
  onMembersRemoved?: () => void;
  groupName?: string;
}

export const RemoveMembersDialog: React.FC<RemoveMembersDialogProps> = ({
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  onMembersRemoved,
  groupName: externalGroupName
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [internalGroupName, setInternalGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Use external state if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const onClose = externalOnClose || (() => setInternalIsOpen(false));
  const groupName = externalGroupName || internalGroupName;

  const { members, loading: membersLoading, error: membersError, refresh } = useGroupMembers(groupName);

  const { removeMembers } = useGroupMutations(
    () => {
      // Success callback
      setSuccessMessage(`Successfully removed ${selectedMembers.length} member${selectedMembers.length !== 1 ? 's' : ''} from group "${groupName}"`);
      setSelectedMembers([]);
      setError(null);
      refresh(); // Refresh the members list
      onMembersRemoved?.();
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

    if (selectedMembers.length === 0) {
      setError('Please select at least one member to remove');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await removeMembers(groupName, selectedMembers);
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

  const handleGroupNameChange = (value: string) => {
    setInternalGroupName(value);
    setSelectedMembers([]); // Clear selections when group changes
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleMemberToggle = (memberName: string, checked: boolean) => {
    setSelectedMembers(prev => {
      if (checked) {
        return [...prev, memberName];
      } else {
        return prev.filter(name => name !== memberName);
      }
    });

    if (error) {
      setError(null);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedMembers(filteredMembers);
    } else {
      setSelectedMembers([]);
    }

    if (error) {
      setError(null);
    }
  };

  const resetForm = () => {
    setInternalGroupName('');
    setSelectedMembers([]);
    setSearchTerm('');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleRefresh = async () => {
    await refresh();
  };

  // Filter members based on search term
  const filteredMembers = members.filter(member =>
    member.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const allFilteredSelected = filteredMembers.length > 0 && filteredMembers.every(member => selectedMembers.includes(member));
  const someFilteredSelected = filteredMembers.some(member => selectedMembers.includes(member));

  const renderMembersList = () => {
    if (membersLoading) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '2rem 0' }}>
          <Spinner size="sm" />
          <span>Loading group members...</span>
        </div>
      );
    }

    if (membersError) {
      return (
        <Alert variant="danger" title="Error loading members" isInline style={{ margin: '1rem 0' }}>
          {membersError}
          <div style={{ marginTop: '1rem' }}>
            <Button variant="primary" onClick={handleRefresh}>
              Retry
            </Button>
          </div>
        </Alert>
      );
    }

    if (members.length === 0) {
      return (
        <EmptyState>
          <EmptyStateHeader 
            titleText="No members to remove"
            icon={<EmptyStateIcon icon={UsersIcon} />}
            headingLevel="h4"
          />
          <EmptyStateBody>
            This group currently has no members. There are no members to remove.
          </EmptyStateBody>
        </EmptyState>
      );
    }

    if (filteredMembers.length === 0 && searchTerm) {
      return (
        <EmptyState>
          <EmptyStateHeader 
            titleText="No matching members"
            icon={<EmptyStateIcon icon={UsersIcon} />}
            headingLevel="h4"
          />
          <EmptyStateBody>
            No members match your search term "{searchTerm}". Try adjusting your search criteria.
          </EmptyStateBody>
        </EmptyState>
      );
    }

    return (
      <Card>
        <CardBody>
          {/* Select all checkbox */}
          <div style={{ marginBottom: '1rem', borderBottom: '1px solid var(--pf-v5-global--BorderColor--100)', paddingBottom: '0.5rem' }}>
            <Checkbox
              id="select-all-members"
              label={`Select all visible members (${filteredMembers.length})`}
              isChecked={allFilteredSelected}
              isIndeterminate={someFilteredSelected && !allFilteredSelected}
              onChange={(_event, checked) => handleSelectAll(checked)}
            />
          </div>

          {/* Member list */}
          <List>
            {filteredMembers.map((member, index) => (
              <ListItem key={index}>
                <Flex alignItems={{ default: 'alignItemsCenter' }}>
                  <FlexItem>
                    <Checkbox
                      id={`member-${index}`}
                      label={member}
                      isChecked={selectedMembers.includes(member)}
                      onChange={(_event, checked) => handleMemberToggle(member, checked)}
                    />
                  </FlexItem>
                </Flex>
              </ListItem>
            ))}
          </List>

          {/* Selection summary */}
          {selectedMembers.length > 0 && (
            <div style={{ marginTop: '1rem', padding: '0.5rem', backgroundColor: 'var(--pf-v5-global--BackgroundColor--150)', borderRadius: '4px' }}>
              <Text component="small">
                {selectedMembers.length} member{selectedMembers.length !== 1 ? 's' : ''} selected for removal
              </Text>
            </div>
          )}
        </CardBody>
      </Card>
    );
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
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <TextInput
            type="text"
            placeholder="Enter group name"
            value={internalGroupName}
            onChange={(_event, value) => handleGroupNameChange(value)}
          />
          <Button 
            variant="danger" 
            onClick={handleModalToggle}
            isDisabled={!internalGroupName.trim()}
          >
            Remove Members
          </Button>
        </div>
      )}

      <Modal
        variant={ModalVariant.large}
        title="Remove Group Members"
        isOpen={isOpen}
        onClose={handleClose}
        titleIconVariant={ExclamationTriangleIcon}
        actions={[
          <Button
            key="remove"
            variant="danger"
            onClick={handleSubmit}
            isDisabled={loading || selectedMembers.length === 0}
            isLoading={loading}
            spinner={<Spinner size="sm" />}
          >
            {loading ? 'Removing...' : `Remove ${selectedMembers.length} Member${selectedMembers.length !== 1 ? 's' : ''}`}
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

        <TextContent style={{ marginBottom: '1rem' }}>
          <Text component="p">
            <strong>Warning:</strong> This will remove the selected members from the group "{groupName}". 
            This action cannot be undone. The removed users will lose any permissions granted through this group membership.
          </Text>
        </TextContent>

        {groupName ? (
          <>
            {/* Show group name input only if not provided externally */}
            {!externalGroupName && (
              <Form style={{ marginBottom: '1rem' }}>
                <FormGroup
                  label="Group Name"
                  isRequired
                  fieldId="group-name-input"
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
              </Form>
            )}

            {/* Search input */}
            <div style={{ marginBottom: '1rem' }}>
              <FormGroup label="Search members" fieldId="member-search">
                <TextInput
                  type="search"
                  id="member-search"
                  name="member-search"
                  placeholder="Search members to remove..."
                  value={searchTerm}
                  onChange={(_event, value) => handleSearchChange(value)}
                />
              </FormGroup>
            </div>

            {/* Members list */}
            {renderMembersList()}
          </>
        ) : (
          <Alert variant="info" title="No group specified" isInline>
            Please specify a group name to remove members from.
          </Alert>
        )}
      </Modal>
    </>
  );
};

export default RemoveMembersDialog;