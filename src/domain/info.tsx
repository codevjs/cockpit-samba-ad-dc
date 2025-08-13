import React, { useState } from 'react';
import {
  Modal,
  ModalVariant,
  Button,
  Form,
  FormGroup,
  TextInput,
  Alert,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  Spinner,
  Card,
  CardBody,
  CardHeader
} from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';
import { useDomainInfo } from './hooks/useDomain';

interface DomainInfoDialogProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const DomainInfoDialog: React.FC<DomainInfoDialogProps> = ({
  isOpen: externalIsOpen,
  onClose: externalOnClose
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [ipAddress, setIpAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Use external state if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const onClose = externalOnClose || (() => setInternalIsOpen(false));

  const { domainInfo, fetchDomainInfo } = useDomainInfo();

  const handleSubmit = async () => {
    if (!ipAddress.trim()) {
      setError('Computer Name/IP Address is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await fetchDomainInfo(ipAddress);
      setShowResults(true);
    } catch (err) {
      setError('Failed to fetch domain information');
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

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setIpAddress('');
    setError(null);
    setShowResults(false);
  };

  const handleIpAddressChange = (value: string) => {
    setIpAddress(value);
    if (error) {
      setError(null);
    }
  };

  const handleBackToForm = () => {
    setShowResults(false);
    setError(null);
  };

  const renderForm = () => (
    <>
      {error && (
        <Alert variant="danger" title="Error" isInline style={{ marginBottom: '1rem' }}>
          {error}
        </Alert>
      )}

      <Form>
        <FormGroup
          label="Computer Name / IP Address"
          isRequired
          fieldId="ip-address"
          helperText="Enter the computer name or IP address of the domain controller to query"
        >
          <TextInput
            isRequired
            type="text"
            id="ip-address"
            name="ip-address"
            value={ipAddress}
            onChange={(_event, value) => handleIpAddressChange(value)}
            placeholder="e.g., 192.168.1.10 or DC01.domain.local"
          />
        </FormGroup>
      </Form>
    </>
  );

  const renderResults = () => {
    if (!domainInfo) {
      return (
        <Alert variant="warning" title="No data available" isInline>
          No domain information was retrieved.
        </Alert>
      );
    }

    return (
      <Card>
        <CardHeader>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <InfoCircleIcon />
            Domain Information for {ipAddress}
          </div>
        </CardHeader>
        <CardBody>
          <DescriptionList isHorizontal>
            <DescriptionListGroup>
              <DescriptionListTerm>Domain Name</DescriptionListTerm>
              <DescriptionListDescription>
                {domainInfo.domain || <em>Not specified</em>}
              </DescriptionListDescription>
            </DescriptionListGroup>

            <DescriptionListGroup>
              <DescriptionListTerm>NetBIOS Domain</DescriptionListTerm>
              <DescriptionListDescription>
                {domainInfo.netbios || <em>Not specified</em>}
              </DescriptionListDescription>
            </DescriptionListGroup>

            <DescriptionListGroup>
              <DescriptionListTerm>Domain Controller</DescriptionListTerm>
              <DescriptionListDescription>
                {domainInfo.server || <em>Not specified</em>}
              </DescriptionListDescription>
            </DescriptionListGroup>

            <DescriptionListGroup>
              <DescriptionListTerm>DC Site</DescriptionListTerm>
              <DescriptionListDescription>
                {domainInfo.site || <em>Not specified</em>}
              </DescriptionListDescription>
            </DescriptionListGroup>

            <DescriptionListGroup>
              <DescriptionListTerm>Forest Function Level</DescriptionListTerm>
              <DescriptionListDescription>
                {domainInfo.forestLevel || <em>Not specified</em>}
              </DescriptionListDescription>
            </DescriptionListGroup>

            <DescriptionListGroup>
              <DescriptionListTerm>Domain Function Level</DescriptionListTerm>
              <DescriptionListDescription>
                {domainInfo.domainLevel || <em>Not specified</em>}
              </DescriptionListDescription>
            </DescriptionListGroup>

            <DescriptionListGroup>
              <DescriptionListTerm>Schema Version</DescriptionListTerm>
              <DescriptionListDescription>
                {domainInfo.schema || <em>Not specified</em>}
              </DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </CardBody>
      </Card>
    );
  };

  const getModalActions = () => {
    if (showResults) {
      return [
        <Button key="back" variant="secondary" onClick={handleBackToForm}>
          Query Another
        </Button>,
        <Button key="close" variant="primary" onClick={handleClose}>
          Close
        </Button>
      ];
    }

    return [
      <Button
        key="submit"
        variant="primary"
        onClick={handleSubmit}
        isDisabled={loading || !ipAddress.trim()}
        isLoading={loading}
        spinner={<Spinner size="sm" />}
      >
        {loading ? 'Querying...' : 'Get Domain Info'}
      </Button>,
      <Button key="cancel" variant="link" onClick={handleClose}>
        Cancel
      </Button>
    ];
  };

  return (
    <>
      {/* Trigger button when using internal state */}
      {externalIsOpen === undefined && (
        <Button variant="secondary" onClick={handleModalToggle}>
          Domain Info
        </Button>
      )}

      <Modal
        variant={ModalVariant.large}
        title={showResults ? "Domain Information Results" : "Get Domain Information"}
        description={showResults ? undefined : "Basic information about a domain and the DC passed as parameter"}
        isOpen={isOpen}
        onClose={handleClose}
        actions={getModalActions()}
        appendTo={document.body}
      >
        {showResults ? renderResults() : renderForm()}
      </Modal>
    </>
  );
};

export default DomainInfoDialog;