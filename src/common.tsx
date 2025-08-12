import React from 'react';
import {
    Alert,
    AlertActionCloseButton,
    Spinner,
    Button,
    AlertGroup,
    AlertVariant
} from '@patternfly/react-core';
import { AngleLeftIcon } from '@patternfly/react-icons';
import './css/common.css';

interface RenderErrorProps {
    hideAlert: () => void;
    alertVisible: boolean;
    error: string;
}

export const RenderError: React.FC<RenderErrorProps> = ({ hideAlert, alertVisible, error }) => {
    if (alertVisible) {
        return (
            <Alert
                variant="danger"
                title="An Error Occurred"
                actionClose={<AlertActionCloseButton onClose={hideAlert} />}
            >
                {error}
            </Alert>
        );
    }
    return <div />;
};

interface SuccessProps {
    hideAlert: () => void;
    alertVisible: boolean;
    message: string;
}

export const Success: React.FC<SuccessProps> = ({ hideAlert, alertVisible, message }) => {
    if (alertVisible) {
        return (
            <Alert
                variant="success"
                title="Success"
                actionClose={<AlertActionCloseButton onClose={hideAlert} />}
            >
                {message}
            </Alert>
        );
    }
    return <div />;
};

interface LoadingProps {
    loading: boolean;
}

export const Loading: React.FC<LoadingProps> = ({ loading }) => {
    if (loading) {
        return (
            <div>
                <Spinner />
            </div>
        );
    }
    return <div />;
};

export const BackButton: React.FC = () => {
    return (
        <div className="back-button">
            <Button variant="tertiary" onClick={() => history.back()}>
                <AngleLeftIcon />
                Back
            </Button>
        </div>
    );
};

interface ErrorToastProps {
    errorMessage: string;
    closeModal: () => void;
}

export const ErrorToast: React.FC<ErrorToastProps> = ({ errorMessage, closeModal }) => {
    return (
        <AlertGroup isToast>
            <Alert
                isLiveRegion
                variant={AlertVariant.danger}
                title="An Error Occurred"
                actionClose={
                    <AlertActionCloseButton
                        title="Close Error Alert Toast"
                        variantLabel="Danger Alert"
                        onClose={closeModal}
                    />
                }
            >
                <p>{errorMessage}</p>
            </Alert>
        </AlertGroup>
    );
};

interface SuccessToastProps {
    successMessage: string;
    closeModal: () => void;
}

export const SuccessToast: React.FC<SuccessToastProps> = ({ successMessage, closeModal }) => {
    return (
        <AlertGroup isToast>
            <Alert
                isLiveRegion
                variant={AlertVariant.success}
                title="Success"
                actionClose={
                    <AlertActionCloseButton
                        title="Close Success Alert Toast"
                        variantLabel="Success Alert"
                        onClose={closeModal}
                    />
                }
            >
                <p>{successMessage}</p>
            </Alert>
        </AlertGroup>
    );
};
