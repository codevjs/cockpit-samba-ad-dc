import React from 'react';

export const Loading: React.FC<{loading: boolean}> = () => <div />;
export const RenderError: React.FC<{error: string, hideAlert: () => void, alertVisible: boolean}> = () => <div />;
export const Success: React.FC<{message: string, hideAlert: () => void, alertVisible: boolean}> = () => <div />;
export const BackButton: React.FC = () => <div />;
export const ErrorToast: React.FC<{errorMessage: string, closeModal: () => void}> = () => <div />;
export const SuccessToast: React.FC<{successMessage: string, closeModal: () => void}> = () => <div />;
