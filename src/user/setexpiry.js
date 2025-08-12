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

export default function SetExpiry() {
    const [userName, setUserName] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState();
    const [errorMessage, setErrorMessage] = useState();
    const [errorAlertVisible, setErrorAlertVisible] = useState();
    const [successAlertVisible, setSuccessAlertVisible] = useState();
    const [isChecked, setIsChecked] = useState(true);
    const [days, setDays] = useState("");

    const handleModalToggle = () => setIsModalOpen(!isModalOpen);

    const handleDaysInputChange = (value) => {
        setDays(value);
        if ((days.length + value) > 0) {
            setIsChecked(false);
        }
    };

    const handleUsernameInputChange = (value) => setUserName(value);

    const handleSwitchChange = () => {
        setIsChecked(!isChecked);
        setDays("");
    };

    const handleSubmit = () => {
        setLoading(true);
        if (days.length > 0 && !isChecked) {
            const command = `samba-tool user setexpiry ${userName} ${days}`;
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
        } else {
            const cmd = `samba-tool user setexpiry ${userName} --noexpiry`;
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
        <div>Set Expiry</div>
    );
}
