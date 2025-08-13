import React, { useState } from 'react';
import {
  Modal,
  ModalVariant,
  Button,
  Form,
  FormGroup,
  TextInput,
  List,
  ListItem,
  EmptyState,
  EmptyStateIcon,
  EmptyStateBody,
  EmptyStateHeader,
  Alert,
  Spinner,
  Flex,
  FlexItem,
  Card,
  CardBody
} from '@patternfly/react-core';
import { UsersIcon, SearchIcon } from '@patternfly/react-icons';
import { useGroupMembers } from './hooks/useGroups';

interface ListMembersDialogProps {
  isOpen?: boolean;
  onClose?: () => void;
  groupName?: string;
}

export const ListMembersDialog: React.FC<ListMembersDialogProps> = ({
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  groupName: externalGroupName
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [internalGroupName, setInternalGroupName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Use external state if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const onClose = externalOnClose || (() => setInternalIsOpen(false));
  const groupName = externalGroupName || internalGroupName;

  const { members, loading, error, refresh } = useGroupMembers(groupName);

  const handleModalToggle = () => {
    if (externalIsOpen === undefined) {
      setInternalIsOpen(!internalIsOpen);
    } else {
      onClose();
    }
  };

  const handleGroupNameChange = (value: string) => {
    setInternalGroupName(value);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleClose = () => {
    setSearchTerm('');
    onClose();
  };

  const handleRefresh = async () => {
    await refresh();
  };

  // Filter members based on search term
  const filteredMembers = members.filter(member =>
    member.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderMembersList = () => {
    if (loading) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '2rem 0' }}>
          <Spinner size="sm" />
          <span>Loading group members...</span>
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="danger" title="Error loading members" isInline style={{ margin: '1rem 0' }}>
          {error}
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
            titleText="No members"
            icon={<EmptyStateIcon icon={UsersIcon} />}
            headingLevel="h4"
          />
          <EmptyStateBody>
            This group currently has no members. Use the group management tools to add users or other groups as members.
          </EmptyStateBody>
        </EmptyState>
      );
    }

    if (filteredMembers.length === 0 && searchTerm) {
      return (
        <EmptyState>
          <EmptyStateHeader 
            titleText="No matching members"
            icon={<EmptyStateIcon icon={SearchIcon} />}
            headingLevel="h4"
          />
          <EmptyStateBody>
            No members match your search term "{searchTerm}". Try adjusting your search criteria or clear the search to see all members.
          </EmptyStateBody>
        </EmptyState>
      );
    }

    return (
      <Card>
        <CardBody>
          <div style={{ marginBottom: '1rem', color: 'var(--pf-v5-global--Color--200)' }}>
            {searchTerm 
              ? `${filteredMembers.length} of ${members.length} members match your search`
              : `${members.length} total member${members.length !== 1 ? 's' : ''}`
            }
          </div>
          <List>
            {filteredMembers.map((member, index) => (
              <ListItem key={index}>
                <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
                  <FlexItem>
                    <div>
                      <strong>{member}</strong>
                      <div style={{ color: 'var(--pf-v5-global--Color--200)', fontSize: '0.875rem' }}>
                        Member of {groupName}
                      </div>
                    </div>
                  </FlexItem>
                  <FlexItem>
                    <Button variant="link" size="sm">
                      View Details
                    </Button>
                  </FlexItem>
                </Flex>
              </ListItem>
            ))}
          </List>
        </CardBody>
      </Card>
    );
  };

  return (
    <>
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
            variant="primary" 
            onClick={handleModalToggle}
            isDisabled={!internalGroupName.trim()}
          >
            List Members
          </Button>
        </div>
      )}

      <Modal
        variant={ModalVariant.large}
        title={`Group Members: ${groupName || 'No group selected'}`}
        isOpen={isOpen}
        onClose={handleClose}
        actions={[
          <Button key="refresh" variant="secondary" onClick={handleRefresh} isDisabled={!groupName}>
            <Spinner size="sm" style={{ display: loading ? 'inline-block' : 'none', marginRight: '0.5rem' }} />
            Refresh
          </Button>,
          <Button key="close" variant="primary" onClick={handleClose}>
            Close
          </Button>
        ]}
        appendTo={document.body}
      >
        {groupName ? (
          <>
            {/* Search input */}
            <div style={{ marginBottom: '1rem' }}>
              <FormGroup label="Search members" fieldId="member-search">
                <TextInput
                  type="search"
                  id="member-search"
                  name="member-search"
                  placeholder="Search members..."
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
            Please specify a group name to view its members.
          </Alert>
        )}
      </Modal>
    </>
  );
};

export default ListMembersDialog;