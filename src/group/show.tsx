import React, { useState } from 'react';
import {
  Modal,
  ModalVariant,
  Button,
  Form,
  FormGroup,
  TextInput,
  Alert,
  Tabs,
  Tab,
  TabTitleText,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  List,
  ListItem,
  EmptyState,
  EmptyStateIcon,
  EmptyStateBody,
  EmptyStateHeader,
  Skeleton,
  Spinner
} from '@patternfly/react-core';
import { UsersIcon, InfoCircleIcon } from '@patternfly/react-icons';
import { useGroupDetails, useGroupMembers } from './hooks/useGroups';

interface GroupDetailsDialogProps {
  isOpen?: boolean;
  onClose?: () => void;
  groupName?: string;
}

export const GroupDetailsDialog: React.FC<GroupDetailsDialogProps> = ({
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  groupName: externalGroupName
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [internalGroupName, setInternalGroupName] = useState('');
  const [activeTabKey, setActiveTabKey] = useState<string | number>('details');

  // Use external state if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const onClose = externalOnClose || (() => setInternalIsOpen(false));
  const groupName = externalGroupName || internalGroupName;

  const { group, loading: groupLoading, error: groupError } = useGroupDetails(groupName);
  const { members, loading: membersLoading, error: membersError } = useGroupMembers(groupName);

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

  const handleTabClick = (_event: React.MouseEvent<any> | React.KeyboardEvent | MouseEvent, tabIndex: string | number) => {
    setActiveTabKey(tabIndex);
  };

  const handleClose = () => {
    setActiveTabKey('details');
    onClose();
  };

  const renderDetailsTab = () => {
    if (groupLoading) {
      return <Skeleton height="200px" />;
    }

    if (groupError) {
      return (
        <Alert variant="danger" title="Error loading group details" isInline>
          {groupError}
        </Alert>
      );
    }

    if (!group) {
      return (
        <Alert variant="warning" title="Group not found" isInline>
          No group found with the name "{groupName}"
        </Alert>
      );
    }

    return (
      <DescriptionList isHorizontal>
        <DescriptionListGroup>
          <DescriptionListTerm>Group Name</DescriptionListTerm>
          <DescriptionListDescription>{group.name}</DescriptionListDescription>
        </DescriptionListGroup>
        
        <DescriptionListGroup>
          <DescriptionListTerm>Description</DescriptionListTerm>
          <DescriptionListDescription>
            {group.description || <em>No description provided</em>}
          </DescriptionListDescription>
        </DescriptionListGroup>
        
        <DescriptionListGroup>
          <DescriptionListTerm>Group Type</DescriptionListTerm>
          <DescriptionListDescription>{group.groupType}</DescriptionListDescription>
        </DescriptionListGroup>
        
        <DescriptionListGroup>
          <DescriptionListTerm>Distinguished Name</DescriptionListTerm>
          <DescriptionListDescription>
            <code style={{ wordBreak: 'break-all' }}>{group.distinguishedName}</code>
          </DescriptionListDescription>
        </DescriptionListGroup>
        
        <DescriptionListGroup>
          <DescriptionListTerm>Created</DescriptionListTerm>
          <DescriptionListDescription>
            {group.createdAt.toLocaleString()}
          </DescriptionListDescription>
        </DescriptionListGroup>
        
        <DescriptionListGroup>
          <DescriptionListTerm>Last Modified</DescriptionListTerm>
          <DescriptionListDescription>
            {group.updatedAt.toLocaleString()}
          </DescriptionListDescription>
        </DescriptionListGroup>
      </DescriptionList>
    );
  };

  const renderMembersTab = () => {
    if (membersLoading) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Spinner size="sm" />
          <span>Loading group members...</span>
        </div>
      );
    }

    if (membersError) {
      return (
        <Alert variant="danger" title="Error loading group members" isInline>
          {membersError}
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
            This group currently has no members. Use the "Manage Members" functionality to add users or other groups.
          </EmptyStateBody>
        </EmptyState>
      );
    }

    return (
      <div>
        <p style={{ marginBottom: '1rem', color: 'var(--pf-v5-global--Color--200)' }}>
          {members.length} member{members.length !== 1 ? 's' : ''}
        </p>
        <List>
          {members.map((member, index) => (
            <ListItem key={index}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <span>{member}</span>
                <Button variant="link" size="sm">
                  View Details
                </Button>
              </div>
            </ListItem>
          ))}
        </List>
      </div>
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
            Show Group Details
          </Button>
        </div>
      )}

      <Modal
        variant={ModalVariant.large}
        title={`Group Details: ${groupName}`}
        isOpen={isOpen}
        onClose={handleClose}
        actions={[
          <Button key="close" variant="primary" onClick={handleClose}>
            Close
          </Button>
        ]}
        appendTo={document.body}
      >
        {groupName ? (
          <Tabs activeKey={activeTabKey} onSelect={handleTabClick}>
            <Tab 
              eventKey="details" 
              title={
                <TabTitleText>
                  <InfoCircleIcon style={{ marginRight: '0.5rem' }} />
                  Group Information
                </TabTitleText>
              }
            >
              <div style={{ padding: '1rem 0' }}>
                {renderDetailsTab()}
              </div>
            </Tab>
            <Tab 
              eventKey="members" 
              title={
                <TabTitleText>
                  <UsersIcon style={{ marginRight: '0.5rem' }} />
                  Members ({membersLoading ? '...' : members.length})
                </TabTitleText>
              }
            >
              <div style={{ padding: '1rem 0' }}>
                {renderMembersTab()}
              </div>
            </Tab>
          </Tabs>
        ) : (
          <Alert variant="info" title="No group specified" isInline>
            Please specify a group name to view its details.
          </Alert>
        )}
      </Modal>
    </>
  );
};

export default GroupDetailsDialog;