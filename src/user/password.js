import React, { useState } from 'react';
// import {
//     Form,
//     FormGroup,
//     TextInput,
//     Modal,
//     Button
// } from '@patternfly/react-core';
import cockpit from 'cockpit';
import {
    Loading,
    SuccessToast,
    ErrorToast
} from '../common';

export default function Password() {
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState();
    const [errorMessage, setErrorMessage] = useState();
    const [errorAlertVisible, setErrorAlertVisible] = useState();
    const [successAlertVisible, setSuccessAlertVisible] = useState();

    const handleModalToggle = () => setIsModalOpen(!isModalOpen);

    const handlePasswordInputChange = (value) => setPassword(value);

    const handleNewPasswordInputChange = (value) => setNewPassword(value);

    const handleSubmit = () => {
        setLoading(true);
        const command = `samba-tool user password --password=${password} --newpassword=${newPassword}`;
        const script = () => cockpit.script(command, { superuser: true, err: 'message' })
                .done((data) => {
                    setSuccessMessage(data);
                    setSuccessAlertVisible(true);
                    setLoading(false);
                    setIsModalOpen(false);
                })
                .catch((exception) => {
                    setErrorMessage(exception.message);
                    setErrorAlertVisible(true);
                    setLoading(false);
                    setIsModalOpen(false);
                });
        script();
    };
    return (
        <div>Change Password</div>
    );
}
