import React, { useState, useEffect } from 'react';
import cockpit from 'cockpit';
import {
    Card,
    CardBody,
    Button,
    ButtonVariant,
    InputGroup,
    TextInput
} from '@patternfly/react-core';
import { Loading, RenderError } from '../common';
import { SearchIcon } from '@patternfly/react-icons';

const List: React.FC = () => {
    const [users, setUsers] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | undefined>();
    const [alertVisible, setAlertVisible] = useState<boolean>(false);
    const [searchValue, setSearchValue] = useState<string>("");

    const onSearchInputChange = (newValue: string) => {
        setSearchValue(newValue);
    };

    const filteredList = users.filter((name) => name.includes(searchValue)).map(filteredName =>
        <li key={filteredName.toString()}>
            {filteredName}
        </li>
    );

    const hideAlert = () => setAlertVisible(false);

    useEffect(() => {
        setLoading(true);
        const command = `samba-tool user list`;
        const script = () => (cockpit as any).script(command, { superuser: true, err: 'message' })
                .done((data: string) => {
                    const splitData = data.split('\n');
                    const sortedData = splitData.sort();
                    setUsers(sortedData);
                    setLoading(false);
                })
                .catch((exception: { message: string }) => {
                    setError(exception.message);
                    setLoading(false);
                });
        script();
    }, []);
    return (
        <>
            <InputGroup>
                <TextInput
                    name="textInput2"
                    id="textInput2" type="search"
                    aria-label="search users"
                    onChange={onSearchInputChange}
                    value={searchValue}
                />
                <Button
                    variant={ButtonVariant.control}
                    aria-label="search button for search users"
                >
                    <SearchIcon />
                </Button>
            </InputGroup>
            <Card>
                <CardBody>
                    <Loading loading={loading} />
                    <RenderError
                        error={error || ""}
                        hideAlert={hideAlert}
                        alertVisible={alertVisible}
                    />
                    {filteredList}
                </CardBody>
            </Card>
        </>
    );
}

export default List;
