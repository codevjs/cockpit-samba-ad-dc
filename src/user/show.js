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
    ErrorToast
} from '../common';

export default function Show() {
    const [userName, setUserName] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState([]);
    const [errorMessage, setErrorMessage] = useState();
    const [errorAlertVisible, setErrorAlertVisible] = useState();
    const [successAlertVisible, setSuccessAlertVisible] = useState();

    const handleModalToggle = () => setIsModalOpen(!isModalOpen);
    const handleUsernameInputChange = (value) => setUserName(value);

    const handleSubmit = () => {
        setLoading(true);
        const command = `samba-tool user show ${userName}`;
        const script = () => cockpit.script(command, { superuser: true, err: 'message' })
                .done((data) => {
                    const splitData = data.split('\n');
                    setSuccessMessage(splitData);
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
        <div>Show User</div>
    );
}
