import React, { useState, useMemo } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  InputGroup,
  Button,
  TextInput,
  List,
  ListItem,
  EmptyState,
  EmptyStateIcon,
  EmptyStateBody,
  EmptyStateHeader,
  Skeleton
} from '@patternfly/react-core';
import { SearchIcon, UsersIcon } from '@patternfly/react-icons';
import { useGroups } from './hooks/useGroups';
import { Loading, RenderError } from '../common';

export const GroupList: React.FC = () => {
  const { groups, loading, error, refresh } = useGroups();
  const [searchValue, setSearchValue] = useState<string>("");

  const filteredGroups = useMemo(() => {
    if (!searchValue.trim()) {
      return groups;
    }
    
    return groups.filter(group => 
      group.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      (group.description && group.description.toLowerCase().includes(searchValue.toLowerCase()))
    );
  }, [groups, searchValue]);

  const handleSearchChange = (_event: React.FormEvent<HTMLInputElement>, value: string) => {
    setSearchValue(value);
  };

  const handleRefresh = async () => {
    await refresh();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>Group List</CardHeader>
        <CardBody>
          <Skeleton height="200px" />
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>Group List</CardHeader>
        <CardBody>
          <RenderError 
            hideAlert={() => {}} 
            error={error} 
            alertVisible={true} 
          />
          <Button variant="primary" onClick={handleRefresh}>
            Retry
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <div>
      <InputGroup>
        <TextInput
          name="groupSearchInput"
          id="groupSearchInput"
          type="search"
          aria-label="Search groups"
          placeholder="Search groups..."
          value={searchValue}
          onChange={handleSearchChange}
        />
        <Button
          variant="control"
          aria-label="Search button for group search"
          icon={<SearchIcon />}
        />
      </InputGroup>
      
      <Card style={{ marginTop: '1rem' }}>
        <CardHeader>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Group List ({filteredGroups.length})
            <Button variant="secondary" onClick={handleRefresh}>
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          {filteredGroups.length === 0 ? (
            <EmptyState>
              <EmptyStateHeader 
                titleText={groups.length === 0 ? "No groups found" : "No matching groups"}
                icon={<EmptyStateIcon icon={UsersIcon} />}
                headingLevel="h4"
              />
              <EmptyStateBody>
                {groups.length === 0 
                  ? "There are no groups in the system yet. Create your first group to get started."
                  : `No groups match your search term "${searchValue}". Try adjusting your search criteria.`
                }
              </EmptyStateBody>
            </EmptyState>
          ) : (
            <List>
              {filteredGroups.map((group) => (
                <ListItem key={group.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <div>
                      <strong>{group.name}</strong>
                      {group.description && (
                        <div style={{ color: 'var(--pf-v5-global--Color--200)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                          {group.description}
                        </div>
                      )}
                      <div style={{ color: 'var(--pf-v5-global--Color--200)', fontSize: '0.75rem', marginTop: '0.125rem' }}>
                        Type: {group.groupType} | Members: {group.members.length}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Button variant="link" size="sm">
                        View Details
                      </Button>
                      <Button variant="link" size="sm">
                        Manage Members
                      </Button>
                    </div>
                  </div>
                </ListItem>
              ))}
            </List>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default GroupList;