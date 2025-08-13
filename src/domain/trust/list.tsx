import React, { useState } from 'react';
import {
  Modal,
  ModalVariant,
  Button,
  Card,
  CardBody,
  CardHeader,
  List,
  ListItem,
  EmptyState,
  EmptyStateIcon,
  EmptyStateBody,
  EmptyStateHeader,
  Alert,
  Skeleton,
  Badge,
  Flex,
  FlexItem,
  Text
} from '@patternfly/react-core';
import { 
  ConnectedIcon, 
  DisconnectedIcon, 
  SecurityIcon,
  NetworkIcon 
} from '@patternfly/react-icons';
import { useTrusts } from '../hooks/useDomain';
import { TrustRelationship } from '../../types/samba';

interface TrustListDialogProps {
  isOpen?: boolean;
  onClose?: () => void;
  onTrustSelect?: (trust: TrustRelationship) => void;
}

export const TrustListDialog: React.FC<TrustListDialogProps> = ({
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  onTrustSelect
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  // Use external state if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const onClose = externalOnClose || (() => setInternalIsOpen(false));

  const { trusts, loading, error, refresh } = useTrusts();

  const handleModalToggle = () => {
    if (externalIsOpen === undefined) {
      setInternalIsOpen(!internalIsOpen);
    } else {
      onClose();
    }
  };

  const handleRefresh = async () => {
    await refresh();
  };

  const handleTrustClick = (trust: TrustRelationship) => {
    onTrustSelect?.(trust);
  };

  const getTrustTypeColor = (type: string): 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'cyan' => {
    switch (type.toLowerCase()) {
      case 'forest':
        return 'green';
      case 'external':
        return 'blue';
      case 'realm':
        return 'purple';
      default:
        return 'cyan';
    }
  };

  const getTrustDirectionIcon = (direction: string) => {
    switch (direction.toLowerCase()) {
      case 'inbound':
        return '←';
      case 'outbound':
        return '→';
      case 'bidirectional':
        return '↔';
      default:
        return '?';
    }
  };

  const getTrustStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <ConnectedIcon color="var(--pf-v5-global--success-color--100)" />;
      case 'inactive':
      case 'broken':
        return <DisconnectedIcon color="var(--pf-v5-global--danger-color--100)" />;
      default:
        return <NetworkIcon color="var(--pf-v5-global--warning-color--100)" />;
    }
  };

  const renderTrustsList = () => {
    if (loading) {
      return (
        <Card>
          <CardHeader>Trust Relationships</CardHeader>
          <CardBody>
            <Skeleton height="200px" />
          </CardBody>
        </Card>
      );
    }

    if (error) {
      return (
        <Card>
          <CardHeader>Trust Relationships</CardHeader>
          <CardBody>
            <Alert variant="danger" title="Error loading trust relationships" isInline>
              {error}
              <div style={{ marginTop: '1rem' }}>
                <Button variant="primary" onClick={handleRefresh}>
                  Retry
                </Button>
              </div>
            </Alert>
          </CardBody>
        </Card>
      );
    }

    if (trusts.length === 0) {
      return (
        <Card>
          <CardHeader>Trust Relationships</CardHeader>
          <CardBody>
            <EmptyState>
              <EmptyStateHeader 
                titleText="No trust relationships"
                icon={<EmptyStateIcon icon={SecurityIcon} />}
                headingLevel="h4"
              />
              <EmptyStateBody>
                There are currently no trust relationships configured for this domain. 
                Use the "Create Trust" button to establish new trust relationships with other domains.
              </EmptyStateBody>
            </EmptyState>
          </CardBody>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
            <FlexItem>
              Trust Relationships ({trusts.length})
            </FlexItem>
            <FlexItem>
              <Button variant="secondary" onClick={handleRefresh}>
                Refresh
              </Button>
            </FlexItem>
          </Flex>
        </CardHeader>
        <CardBody>
          <List>
            {trusts.map((trust, index) => (
              <ListItem 
                key={index}
                onClick={() => handleTrustClick(trust)}
                style={{ 
                  cursor: onTrustSelect ? 'pointer' : 'default',
                  padding: '1rem',
                  border: '1px solid var(--pf-v5-global--BorderColor--100)',
                  borderRadius: '4px',
                  marginBottom: '0.5rem'
                }}
              >
                <Flex 
                  justifyContent={{ default: 'justifyContentSpaceBetween' }} 
                  alignItems={{ default: 'alignItemsCenter' }}
                  style={{ width: '100%' }}
                >
                  <FlexItem>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {getTrustStatusIcon(trust.status)}
                      <div>
                        <Text component="h6" style={{ margin: 0 }}>
                          {trust.domain}
                        </Text>
                        <Text component="small" style={{ color: 'var(--pf-v5-global--Color--200)' }}>
                          Created: {trust.createdAt.toLocaleDateString()}
                          {trust.lastValidated && (
                            <span> • Last validated: {trust.lastValidated.toLocaleDateString()}</span>
                          )}
                        </Text>
                      </div>
                    </div>
                  </FlexItem>
                  
                  <FlexItem>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Badge color={getTrustTypeColor(trust.type)}>
                        {trust.type.toUpperCase()}
                      </Badge>
                      <span style={{ 
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        color: 'var(--pf-v5-global--Color--200)',
                        minWidth: '20px',
                        textAlign: 'center'
                      }}>
                        {getTrustDirectionIcon(trust.direction)}
                      </span>
                      <Badge 
                        color={trust.status.toLowerCase() === 'active' ? 'green' : 'red'}
                      >
                        {trust.status.toUpperCase()}
                      </Badge>
                    </div>
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
        <Button variant="secondary" onClick={handleModalToggle}>
          <SecurityIcon style={{ marginRight: '0.5rem' }} />
          List Trusts
        </Button>
      )}

      <Modal
        variant={ModalVariant.large}
        title="Domain Trust Relationships"
        isOpen={isOpen}
        onClose={onClose}
        actions={[
          <Button key="close" variant="primary" onClick={onClose}>
            Close
          </Button>
        ]}
        appendTo={document.body}
      >
        {renderTrustsList()}
        
        <Alert variant="info" title="About Trust Relationships" isInline style={{ marginTop: '1rem' }}>
          <Text component="p">
            Trust relationships allow users from one domain to access resources in another domain. 
            The direction and type of trust determine what access is allowed:
          </Text>
          <ul style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
            <li><strong>External Trust:</strong> Trust with a domain in a different forest</li>
            <li><strong>Forest Trust:</strong> Trust between root domains of different forests</li>
            <li><strong>Inbound (←):</strong> Other domain trusts this domain</li>
            <li><strong>Outbound (→):</strong> This domain trusts the other domain</li>
            <li><strong>Bidirectional (↔):</strong> Mutual trust in both directions</li>
          </ul>
        </Alert>
      </Modal>
    </>
  );
};

export default TrustListDialog;