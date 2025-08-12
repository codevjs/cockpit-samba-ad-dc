import "../lib/patternfly-4-cockpit.scss";
import React from 'react';
import { createRoot } from 'react-dom/client';
import Create from './create';
import Cleanup from './cleanup';
import Delete from './delete';
import ServerInfo from './serverinfo';
import ZoneCreate from './zonecreate';
import ZoneDelete from './zonedelete';
import ZoneInfo from './zoneinfo';
import ZoneList from './zonelist';
import { Toolbar, ToolbarItem, ToolbarGroup, ToolbarContent } from '@patternfly/react-core';
import { BackButton } from '../common';
import "../lib/patternfly-4-overrides.scss";

export default function DNSManagement() {
    return (
        <>
            <BackButton />
            <Toolbar>
                <ToolbarContent>
                    <ToolbarGroup>
                        <ToolbarItem>
                            <Create />
                        </ToolbarItem>
                        <ToolbarItem>
                            <Delete />
                        </ToolbarItem>
                        <ToolbarItem>
                            <Cleanup />
                        </ToolbarItem>
                        <ToolbarItem>
                            <ServerInfo />
                        </ToolbarItem>
                    </ToolbarGroup>
                </ToolbarContent>
                <ToolbarContent>
                    <ToolbarGroup>
                        <ToolbarItem>
                            <ZoneCreate />
                        </ToolbarItem>
                        <ToolbarItem>
                            <ZoneDelete />
                        </ToolbarItem>
                        <ToolbarItem>
                            <ZoneList />
                        </ToolbarItem>
                        <ToolbarItem>
                            <ZoneInfo />
                        </ToolbarItem>
                    </ToolbarGroup>
                </ToolbarContent>
            </Toolbar>
        </>
    );
}

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("dns");
    const root = createRoot(container);
    root.render(<DNSManagement />);
});
