import React, { useState } from 'react';
import {
  Modal,
  ModalVariant,
  Button,
  Form,
  FormGroup,
  TextInput,
  Checkbox,
  Alert,
  Text,
  TextContent,
  Spinner,
  Progress,
  ProgressSize,
  ProgressVariant
} from '@patternfly/react-core';
import { ExclamationTriangleIcon, DownloadIcon } from '@patternfly/react-icons';
import { useDomainMutations } from '../hooks/useDomainMutations';
import { useBackupHistory } from '../hooks/useDomain';
import { BackupOfflineInput } from '../../types/samba';
import { SuccessToast } from '../../common';

interface BackupOfflineDialogProps {
  isOpen?: boolean;
  onClose?: () => void;
  onBackupCompleted?: () => void;
}

export const BackupOfflineDialog: React.FC<BackupOfflineDialogProps> = ({
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  onBackupCompleted
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [formData, setFormData] = useState<BackupOfflineInput>({
    targetDir: '',
    compress: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);

  // Use external state if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const onClose = externalOnClose || (() => setInternalIsOpen(false));

  const { addBackup } = useBackupHistory();

  const { backupOffline } = useDomainMutations(
    (message) => {
      // Success callback
      setSuccessMessage(message || 'Offline backup completed successfully');
      
      // Add to backup history
      addBackup({
        type: 'offline',
        path: formData.targetDir,
        timestamp: new Date(),
        size: 0, // Would be populated from actual backup info
        status: 'completed'
      });

      setFormData({ targetDir: '', compress: true });
      setError(null);
      setShowProgress(false);
      setProgress(0);
      onBackupCompleted?.();
      onClose();
    },
    (errorMessage) => {
      // Error callback
      setError(errorMessage);
      setShowProgress(false);
      setProgress(0);
    }
  );

  const handleSubmit = async () => {
    if (!formData.targetDir.trim()) {
      setError('Target directory is required');
      return;
    }

    // Basic validation for directory path
    if (!formData.targetDir.startsWith('/')) {
      setError('Target directory must be an absolute path (starting with /)');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setShowProgress(true);
      setProgress(0);

      // Simulate progress updates (in real implementation, this would come from the backup process)
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 1000);

      await backupOffline(formData);
      
      clearInterval(progressInterval);
      setProgress(100);
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
    setFormData({ targetDir: '', compress: true });
    setError(null);
    setShowProgress(false);
    setProgress(0);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleInputChange = (field: keyof BackupOfflineInput) => (
    value: string | boolean
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (error) {
      setError(null);
    }
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
          <DownloadIcon style={{ marginRight: '0.5rem' }} />
          Backup Offline
        </Button>
      )}

      <Modal
        variant={ModalVariant.medium}
        title="Create Offline Backup"
        description="Backup the local domain directories safely into a tar file"
        isOpen={isOpen}
        onClose={handleClose}
        titleIconVariant={ExclamationTriangleIcon}
        actions={[
          <Button
            key="backup"
            variant="primary"
            onClick={handleSubmit}
            isDisabled={loading || !formData.targetDir.trim()}
            isLoading={loading}
            spinner={<Spinner size="sm" />}
          >
            {loading ? 'Creating Backup...' : 'Create Backup'}
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
            <strong>Important:</strong> This operation will create a backup of the local domain 
            directories. The domain controller should be offline or in a consistent state to 
            ensure backup integrity.
          </Text>
          <Text component="p" style={{ marginTop: '0.5rem' }}>
            The backup will be saved as a tar file in the specified directory. Make sure the 
            target directory has sufficient disk space and appropriate permissions.
          </Text>
        </TextContent>

        {showProgress && (
          <div style={{ marginBottom: '1rem' }}>
            <Text component="p" style={{ marginBottom: '0.5rem' }}>
              Backup in progress...
            </Text>
            <Progress
              value={progress}
              title="Backup Progress"
              size={ProgressSize.lg}
              variant={progress === 100 ? ProgressVariant.success : ProgressVariant.info}
            />
          </div>
        )}

        <Form>
          <FormGroup
            label="Target Directory"
            isRequired
            fieldId="target-dir"
            helperText="Absolute path where the backup tar file will be created (e.g., /var/backups)"
          >
            <TextInput
              isRequired
              type="text"
              id="target-dir"
              name="target-dir"
              value={formData.targetDir}
              onChange={(_event, value) => handleInputChange('targetDir')(value)}
              placeholder="/var/backups/samba"
            />
          </FormGroup>

          <FormGroup fieldId="compress-option">
            <Checkbox
              id="compress-option"
              label="Compress backup"
              isChecked={formData.compress}
              onChange={(_event, checked) => handleInputChange('compress')(checked)}
              description="Enable compression to reduce backup file size (recommended)"
            />
          </FormGroup>
        </Form>

        <Alert variant="warning" title="Backup Considerations" isInline style={{ marginTop: '1rem' }}>
          <ul style={{ marginLeft: '1rem' }}>
            <li>Ensure sufficient disk space is available in the target directory</li>
            <li>The backup process may take considerable time depending on database size</li>
            <li>Consider stopping Samba services for the most consistent backup</li>
            <li>Verify backup integrity after completion</li>
          </ul>
        </Alert>
      </Modal>
    </>
  );
};

export default BackupOfflineDialog;