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
  Spinner,
  PasswordInput
} from '@patternfly/react-core';
import { ExclamationTriangleIcon, ConnectedIcon } from '@patternfly/react-icons';
import { useDomainMutations } from './hooks/useDomainMutations';
import { DomainJoinInput } from '../types/samba';
import { SuccessToast } from '../common';

interface JoinDomainDialogProps {
  isOpen?: boolean;
  onClose?: () => void;
  onDomainJoined?: () => void;
}

const DOMAIN_ROLES = [
  { value: 'DC', label: 'Domain Controller (DC)', description: 'Join as an additional domain controller' },
  { value: 'RODC', label: 'Read-Only Domain Controller (RODC)', description: 'Join as a read-only domain controller' },
  { value: 'MEMBER', label: 'Member Server', description: 'Join as a domain member server' }
];

export const JoinDomainDialog: React.FC<JoinDomainDialogProps> = ({
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  onDomainJoined
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [formData, setFormData] = useState<DomainJoinInput>({
    domain: '',
    role: 'MEMBER',
    username: '',
    password: '',
    server: '',
    site: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Use external state if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const onClose = externalOnClose || (() => setInternalIsOpen(false));

  const { joinDomain } = useDomainMutations(
    (message) => {
      // Success callback
      setSuccessMessage(message || 'Successfully joined domain');
      setFormData({
        domain: '',
        role: 'MEMBER',
        username: '',
        password: '',
        server: '',
        site: ''
      });
      setError(null);
      onDomainJoined?.();
      onClose();
    },
    (errorMessage) => {
      // Error callback
      setError(errorMessage);
    }
  );

  const handleSubmit = async () => {
    // Validation
    if (!formData.domain.trim()) {
      setError('Domain name is required');
      return;
    }

    if (!formData.username.trim()) {
      setError('Username is required');
      return;
    }

    if (!formData.password) {
      setError('Password is required');
      return;
    }

    // Basic domain name validation
    if (!/^[a-zA-Z0-9.-]+$/.test(formData.domain)) {
      setError('Invalid domain name format');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await joinDomain(formData);
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

  const resetForm = () => {
    setFormData({
      domain: '',
      role: 'MEMBER',
      username: '',
      password: '',
      server: '',
      site: ''
    });
    setError(null);
    setShowAdvanced(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleInputChange = (field: keyof DomainJoinInput) => (
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (error) {
      setError(null);
    }
  };

  const getSelectedRoleDescription = () => {
    const selectedRole = DOMAIN_ROLES.find(role => role.value === formData.role);
    return selectedRole?.description || '';
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
        <Button variant="primary" onClick={handleModalToggle}>
          <ConnectedIcon style={{ marginRight: '0.5rem' }} />
          Join Domain
        </Button>
      )}

      <Modal
        variant={ModalVariant.large}
        title="Join Active Directory Domain"
        isOpen={isOpen}
        onClose={handleClose}
        titleIconVariant={ExclamationTriangleIcon}
        actions={[
          <Button
            key="join"
            variant="primary"
            onClick={handleSubmit}
            isDisabled={loading || !formData.domain.trim() || !formData.username.trim() || !formData.password}
            isLoading={loading}
            spinner={<Spinner size="sm" />}
          >
            {loading ? 'Joining Domain...' : 'Join Domain'}
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
            <strong>Warning:</strong> Joining a domain will reconfigure this server's authentication 
            and directory services. This operation requires domain administrator privileges and may 
            require a system restart.
          </Text>
        </TextContent>

        <Form>
          <FormGroup
            label="Domain Name"
            isRequired
            fieldId="domain-name"
            helperText="The FQDN of the domain to join (e.g., corp.example.com)"
          >
            <TextInput
              isRequired
              type="text"
              id="domain-name"
              name="domain-name"
              value={formData.domain}
              onChange={(_event, value) => handleInputChange('domain')(value)}
              placeholder="corp.example.com"
            />
          </FormGroup>

          <FormGroup
            label="Join Role"
            isRequired
            fieldId="join-role"
            helperText={getSelectedRoleDescription()}
          >
            <FormSelect
              value={formData.role}
              onChange={(_event, value) => handleInputChange('role')(value)}
              id="join-role"
              name="join-role"
            >
              {DOMAIN_ROLES.map((role, index) => (
                <FormSelectOption
                  key={index}
                  value={role.value}
                  label={role.label}
                />
              ))}
            </FormSelect>
          </FormGroup>

          <FormGroup
            label="Domain Administrator Username"
            isRequired
            fieldId="admin-username"
            helperText="Domain administrator account with rights to join computers to the domain"
          >
            <TextInput
              isRequired
              type="text"
              id="admin-username"
              name="admin-username"
              value={formData.username}
              onChange={(_event, value) => handleInputChange('username')(value)}
              placeholder="administrator"
            />
          </FormGroup>

          <FormGroup
            label="Domain Administrator Password"
            isRequired
            fieldId="admin-password"
            helperText="Password for the domain administrator account"
          >
            <PasswordInput
              id="admin-password"
              name="admin-password"
              value={formData.password}
              onChange={(_event, value) => handleInputChange('password')(value)}
              placeholder="Enter password"
            />
          </FormGroup>

          {/* Advanced Options */}
          <div style={{ marginTop: '1rem' }}>
            <Button 
              variant="link" 
              isInline 
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced Options
            </Button>
          </div>

          {showAdvanced && (
            <>
              <FormGroup
                label="Specific Domain Controller"
                fieldId="domain-server"
                helperText="Optionally specify a particular domain controller to use (leave blank for automatic)"
              >
                <TextInput
                  type="text"
                  id="domain-server"
                  name="domain-server"
                  value={formData.server}
                  onChange={(_event, value) => handleInputChange('server')(value)}
                  placeholder="dc01.corp.example.com"
                />
              </FormGroup>

              <FormGroup
                label="Active Directory Site"
                fieldId="ad-site"
                helperText="Optionally specify the AD site for this server (leave blank for automatic)"
              >
                <TextInput
                  type="text"
                  id="ad-site"
                  name="ad-site"
                  value={formData.site}
                  onChange={(_event, value) => handleInputChange('site')(value)}
                  placeholder="Default-First-Site-Name"
                />
              </FormGroup>
            </>
          )}
        </Form>

        <Alert variant="warning" title="Important Considerations" isInline style={{ marginTop: '1rem' }}>
          <ul style={{ marginLeft: '1rem' }}>
            <li>Ensure proper DNS configuration pointing to domain controllers</li>
            <li>Verify network connectivity to the target domain</li>
            <li>The join operation may take several minutes to complete</li>
            <li>A system restart may be required after successful join</li>
            <li>Existing local accounts may be affected by domain integration</li>
          </ul>
        </Alert>
      </Modal>
    </>
  );
};

export default JoinDomainDialog;