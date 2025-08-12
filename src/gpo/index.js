import "../lib/patternfly-4-cockpit.scss";
import React from 'react';
import { createRoot } from 'react-dom/client';
import Backup from './backup';
import Create from './create';
import Delete from './delete';
import DeleteLink from './dellink';
import Fetch from './fetch';
import GetInheritance from './getinheritance';
import GetLink from './getlink';
import List from './list';
import ListAll from './listall';
import ListContainers from './listcontainers';
import Restore from './restore';
import SetInheritance from './setinheritance';
import SetLink from './setlink';
import Show from './show';
import { Toolbar, ToolbarItem, ToolbarGroup, ToolbarContent } from '@patternfly/react-core';
import { BackButton } from '../common';
import "../lib/patternfly-4-overrides.scss";

export default function GPOManagement() {
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
                            <DeleteLink />
                        </ToolbarItem>
                        <ToolbarItem>
                            <Backup />
                        </ToolbarItem>
                        <ToolbarItem>
                            <Fetch />
                        </ToolbarItem>
                    </ToolbarGroup>
                </ToolbarContent>
                <ToolbarContent>
                    <ToolbarGroup>
                        <ToolbarItem>
                            <GetInheritance />
                        </ToolbarItem>
                        <ToolbarItem>
                            <GetLink />
                        </ToolbarItem>
                        <ToolbarItem>
                            <List />
                        </ToolbarItem>
                        <ToolbarItem>
                            <ListContainers />
                        </ToolbarItem>
                    </ToolbarGroup>
                </ToolbarContent>
                <ToolbarContent>
                    <ToolbarGroup>
                        <ToolbarItem>
                            <Restore />
                        </ToolbarItem>
                        <ToolbarItem>
                            <SetInheritance />
                        </ToolbarItem>
                        <ToolbarItem>
                            <SetLink />
                        </ToolbarItem>
                        <ToolbarItem>
                            <Show />
                        </ToolbarItem>
                    </ToolbarGroup>
                </ToolbarContent>
            </Toolbar>
            <ListAll />
        </>
    );
}

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("gpo");
    const root = createRoot(container);
    root.render(<GPOManagement />);
});
