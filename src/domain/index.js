import "../lib/patternfly-4-cockpit.scss";
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Toolbar, ToolbarItem, ToolbarGroup, ToolbarContent } from '@patternfly/react-core';
import DomainInfo from './info';
import BackupOffline from './backup/offline';
import BackupOnline from './backup/online';
import BackupRename from './backup/rename';
import BackupRestore from './backup/restore';
import CreateTrust from './trust/create';
import DeleteTrust from './trust/delete';
import ListTrusts from './trust/list';
import Namespaces from './trust/namespaces';
import ShowTrust from './trust/show';
import Validate from './trust/validate';
import ClassicUpgrade from './classicupgrade';
import DCPromo from './dcpromo';
import Demote from './demote';
import Join from './join';
import './index.css';
import { BackButton } from '../common';
import "../lib/patternfly-4-overrides.scss";

export default function Domain() {
    return (
        <>
            <BackButton />
            <Toolbar>
                <ToolbarContent>
                    <ToolbarGroup>
                        <ToolbarItem>
                            <DomainInfo />
                        </ToolbarItem>
                        <ToolbarItem>
                            <BackupOffline />
                        </ToolbarItem>
                        <ToolbarItem>
                            <BackupOnline />
                        </ToolbarItem>
                        <ToolbarItem>
                            <BackupRename />
                        </ToolbarItem>
                        <ToolbarItem>
                            <BackupRestore />
                        </ToolbarItem>
                    </ToolbarGroup>
                </ToolbarContent>
                <ToolbarContent>
                    <ToolbarGroup>
                        <ToolbarItem>
                            <CreateTrust />
                        </ToolbarItem>
                        <ToolbarItem>
                            <DeleteTrust />
                        </ToolbarItem>
                        <ToolbarItem>
                            <ListTrusts />
                        </ToolbarItem>
                        <ToolbarItem>
                            <Namespaces />
                        </ToolbarItem>
                        <ToolbarItem>
                            <ShowTrust />
                        </ToolbarItem>
                    </ToolbarGroup>
                </ToolbarContent>
                <ToolbarContent>
                    <ToolbarGroup>
                        <ToolbarItem>
                            <Validate />
                        </ToolbarItem>
                        <ToolbarItem>
                            <ClassicUpgrade />
                        </ToolbarItem>
                        <ToolbarItem>
                            <DCPromo />
                        </ToolbarItem>
                        <ToolbarItem>
                            <Demote />
                        </ToolbarItem>
                        <ToolbarItem>
                            <Join />
                        </ToolbarItem>
                    </ToolbarGroup>
                </ToolbarContent>
            </Toolbar>
        </>
    );
}

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("domain");
    const root = createRoot(container);
    root.render(<Domain />);
});
