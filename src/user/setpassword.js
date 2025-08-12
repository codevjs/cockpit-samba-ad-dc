import React, { useState } from 'react';
// import {
//     Form,
//     FormGroup,
//     TextInput,
//     Modal,
//     Button,
//     Switch,
// } from '@patternfly/react-core';
import cockpit from 'cockpit';
import {
    Loading,
    SuccessToast,
    ErrorToast
} from '../common';

export default function SetPassword() {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState();
    const [errorMessage, setErrorMessage] = useState();
    const [errorAlertVisible, setErrorAlertVisible] = useState();
    const [successAlertVisible, setSuccessAlertVisible] = useState();
    const [mustChangeNextLogin, setMustChangeNextLogin] = useState(true);

    const handleModalToggle = () => setIsModalOpen(!isModalOpen);

    const handleUsernameInputChange = (value) => setUserName(value);

    const handlePasswordInputChange = (value) => setPassword(value);

    const handleNextLoginSwitchChange = () => setMustChangeNextLogin(!mustChangeNextLogin);

    const handleSubmit = () => {
        setLoading(true);
        if (mustChangeNextLogin) {
            const cmd = `samba-tool user ${userName} ${password} --must-change-next-login`;
            const script = () => cockpit.script(cmd, { superuser: true, err: 'message' })
                    .done((data) => {
                        console.log(data);
                        setSuccessMessage(data);
                        setSuccessAlertVisible(true);
                        setLoading(false);
                        setIsModalOpen(false);
                    })
                    .catch((exception) => {
                        console.log(exception);
                        setErrorMessage(exception.message);
                        setErrorAlertVisible(true);
                        setLoading(false);
                        setIsModalOpen(false);
                    });
            script();
        } else {
            const cmd = `samba-tool user ${userName} ${password}`;
            const script = () => cockpit.script(cmd, { superuser: true, err: 'message' })
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
        }
    };
    return (
        <div>Reset Password</div>
    );
}
