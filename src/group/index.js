import "../lib/patternfly-4-cockpit.scss";
import React from 'react';
import { createRoot } from 'react-dom/client';
import List from './listgroups';
import Show from './show';
import Create from './create';
import Delete from './delete';
import { Toolbar, ToolbarItem, ToolbarGroup, ToolbarContent } from '@patternfly/react-core';
import { BackButton } from '../common';
import RemoveMembers from './removemembers';
import MoveGroup from './move';
import ListMembers from './listmembers';
import "../lib/patternfly-4-overrides.scss";

export default function Group() {
    return (
        <div>
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
                            <Show />
                        </ToolbarItem>
                    </ToolbarGroup>
                    <ToolbarGroup>
                        <ToolbarItem>
                            <MoveGroup />
                        </ToolbarItem>
                        <ToolbarItem>
                            <ListMembers />
                        </ToolbarItem>
                        <ToolbarItem>
                            <RemoveMembers />
                        </ToolbarItem>
                    </ToolbarGroup>
                </ToolbarContent>
            </Toolbar>
            <List />
        </div>
    );
}

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("group");
    const root = createRoot(container);
    root.render(<Group />);
});
